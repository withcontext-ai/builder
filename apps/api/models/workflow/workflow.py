import asyncio
import logging
import re
from typing import Any, Dict, List, Optional, cast

from langchain.memory import (
    ConversationSummaryMemory,
    ChatMessageHistory,
    ConversationBufferMemory,
)
from langchain.callbacks import AsyncIteratorCallbackHandler
from langchain.callbacks.base import BaseCallbackHandler
from langchain.chains import ConversationalRetrievalChain, LLMChain, SequentialChain
from langchain.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.schema import BaseMessage
from langchain.schema.messages import get_buffer_string
from langchain.schema.output import LLMResult
from models.base import Model, model_manager
from models.retrieval import Retriever
from pydantic import BaseModel, Field
from utils import CONVERSION_CHAIN, CONVERSIONAL_RETRIEVAL_QA_CHAIN

logger = logging.getLogger(__name__)


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
            chain.output_key = f"{_chain.key}-output"
            chains.append(chain)
        self.context = SequentialChain(
            chains=chains,
            verbose=True,
            input_variables=["question"],
            memory=ConversationBufferMemory(memory_key="chat_history"),
        )

    async def agenerate(self, messages: List[BaseMessage]) -> str:
        # TODO buffer size limit
        # 1k now
        prompt = messages[-1].content
        # chat_history = get_buffer_string(messages[:-1])
        await self.context.arun({"question": prompt, "chat_history": messages})
