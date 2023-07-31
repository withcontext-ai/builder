import asyncio
import io
import re
from typing import Any, Dict, List, Optional, cast
from uuid import UUID

from langchain.callbacks import AsyncIteratorCallbackHandler
from langchain.callbacks.base import BaseCallbackHandler
from langchain.chains import (
    ConversationalRetrievalChain,
    LLMChain,
    SequentialChain,
    ConversationChain,
)
from langchain.chat_models import ChatOpenAI
from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate
from models.base import Model, model_manager
from models.retrieval import Retriever
from pydantic import BaseModel, Field

from langchain.schema.output import LLMResult
from utils import CONVERSIONAL_RETRIEVAL_QA_CHAIN, CONVERSION_CHAIN


class LLMAsyncIteratorCallbackHandler(AsyncIteratorCallbackHandler):
    def __init__(self) -> None:
        super().__init__()

    async def on_llm_start(
        self, serialized: Dict[str, Any], prompts: List[str], **kwargs: Any
    ):
        await super().on_llm_start(serialized, prompts, **kwargs)

    async def on_llm_end(self, response: LLMResult, **kwargs: Any):
        await super().on_llm_end(response, **kwargs)

    async def on_llm_new_token(self, token: str, **kwargs: Any):
        return await super().on_llm_new_token(token, **kwargs)


class ChainBaseCallbackHandler(BaseCallbackHandler):
    index: int = Field(default=0)
    chain_type: str = Field(default="")

    def __init__(self, index, chain_type) -> None:
        self.index = index
        self.chain_type = chain_type

    def on_chain_start(
        self, serialized: Dict[str, Any], prompts: List[str], **kwargs: Any
    ):
        # if (
        #     self.chain_type == CONVERSIONAL_RETRIEVAL_QA_CHAIN
        #     and "question" not in prompts
        #     and f"tool-{self.index-1}-output" in prompts
        # ):
        #     prompts["question"] = prompts[f"tool-{self.index-1}-output"]
        pass


class ChainAsyncIteratorCallbackHandler(AsyncIteratorCallbackHandler):
    index: int = Field(default=0)
    chain_type: str = Field(default="")

    def __init__(self, index, chain_type) -> None:
        self.index = index
        self.chain_type = chain_type
        super().__init__()

    async def on_chain_start(
        self, serialized: Dict[str, Any], prompts: List[str], **kwargs: Any
    ):
        #
        # if (
        #     self.chain_type == CONVERSIONAL_RETRIEVAL_QA_CHAIN
        #     and "question" not in prompts
        #     and f"tool-{self.index-1}-output" in prompts
        # ):
        #     prompts["question"] = prompts[f"tool-{self.index-1}-output"]
        await super().on_llm_start(serialized, prompts, **kwargs)

    async def on_chain_end(self, response: LLMResult, **kwargs: Any):
        await super().on_llm_end(response, **kwargs)


def parse_input_variables_from_template(template: str) -> List[str]:
    return re.findall(r"\{(.+?)\}", template)


def replace_dot_with_dash_in_brackets(text):
    matches = re.findall(r"\{[^}]*\}", text)

    for match in matches:
        replaced = match.replace(".", "-")
        text = text.replace(match, replaced)

    return text


class PatchedConversationalRetrievalChain(ConversationalRetrievalChain):
    is_input_keys: List[str] = Field(default_factory=list)

    @classmethod
    def from_llm(cls, input_keys, *args, **kwargs):
        instance = super().from_llm(*args, **kwargs)
        instance = cast(cls, instance)
        instance.is_input_keys = input_keys
        return instance

    @property
    def input_keys(self) -> List[str]:
        return self.is_input_keys

    @property
    def output_keys(self) -> List[str]:
        return [self.output_key]


class Workflow:
    model: Model
    session_id: str
    context: Optional[SequentialChain] = None
    sequential_chain_callback: Optional[AsyncIteratorCallbackHandler] = None

    def __init__(self, model: Model, session_id: str) -> None:
        chains = []
        self.session_id = session_id
        self.model = model
        for index, _chain in enumerate(model.chains):
            llm = _chain.llm.dict()
            llm_model = llm.pop("name")
            max_tokens = llm.pop("max_tokens")
            temperature = llm.pop("temperature")
            llm = ChatOpenAI(
                model=llm_model,
                model_kwargs=llm,
                streaming=True,
                max_tokens=max_tokens,
                temperature=temperature,
            )
            if index == len(model.chains) - 1:
                llm.callbacks = [LLMAsyncIteratorCallbackHandler()]
                self.sequential_chain_callback = llm.callbacks[0]
            template = replace_dot_with_dash_in_brackets(_chain.prompt.template)
            template += "\n {question}" if index == 0 else ""

            match _chain.chain_type:
                case "conversational_retrieval_qa_chain":
                    prompt_template = PromptTemplate(
                        template=template,
                        input_variables=parse_input_variables_from_template(template),
                    )
                    retriever = Retriever(dataset_ids=_chain.datasets).get_retriever()
                    chain = PatchedConversationalRetrievalChain.from_llm(
                        input_keys=prompt_template.input_variables,
                        llm=llm,
                        retriever=retriever,
                        condense_question_prompt=prompt_template,
                    )

                case "conversation_chain":
                    # ConversationChain has toooo many constraint
                    # currently ConversationChain can only support prompt template that takes in "history" and "input" as the input variables
                    prompt_template = PromptTemplate(
                        template=template,
                        input_variables=parse_input_variables_from_template(template),
                    )
                    chain = LLMChain(
                        llm=llm,
                        prompt=prompt_template,
                    )
                case _:
                    raise Exception("Chain type not supported")
            chain.callbacks = [
                ChainAsyncIteratorCallbackHandler(
                    index=index, chain_type=_chain.chain_type
                ),
            ]
            chain.output_key = f"tool-{index}-output"
            chains.append(chain)
        self.context = SequentialChain(
            chains=chains,
            verbose=True,
            input_variables=["question", "chat_history"],
        )

    async def agenerate(self, prompt: str) -> str:
        # TODO Determine if this structure will meet the needs of the API
        await self.context.arun({"question": prompt, "chat_history": {}})


class SessionState:
    state: dict = {}
    state_lock = asyncio.Lock()

    async def create_state(self, session_id: str, model_id: str):
        async with self.state_lock:
            # TODO
            self.state[session_id] = model_id

    async def get_state(self, session_id: str) -> Workflow:
        async with self.state_lock:
            value = self.state.get(session_id)
            if value is None:
                raise Exception("Session not found")
            return value

    async def delete_state(self, session_id: str):
        async with self.state_lock:
            del self.state[session_id]


session_state = SessionState()
