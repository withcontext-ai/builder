import asyncio
import logging
import re
from typing import Any, Dict, List, Optional, cast

from langchain.callbacks import AsyncIteratorCallbackHandler
from langchain.chains import (
    ConversationalRetrievalChain,
    LLMChain,
    SequentialChain,
    ConversationChain,
)
from langchain.memory import ConversationSummaryMemory, ChatMessageHistory
from langchain.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.schema import BaseMessage, SystemMessage
from langchain.schema.output import LLMResult
from models.base import Model, model_manager
from models.retrieval import Retriever
from pydantic import Field

logger = logging.getLogger(__name__)
CHAT_HISTORY_KEY = "chat_history"
QUESTION_KEY = "question"

HISTORY_PREFIX = "Here's is the chat context between us:\n\n{{ chat_history }}\n\n"


class SequentialChainAsyncIteratorCallbackHandler(AsyncIteratorCallbackHandler):
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

    async def on_chain_start(
        self,
        serialized: Dict[str, Any],
        inputs: Dict[str, Any],
        *,
        run_id,
        parent_run_id=None,
        tags: Optional[List[str]] = None,
        metadata: Optional[Dict[str, Any]] = None,
        **kwargs: Any,
    ) -> None:
        """Run when chain starts running."""
        pass

    async def on_chain_end(
        self,
        outputs: Dict[str, Any],
        *,
        run_id,
        parent_run_id: None,
        tags: Optional[List[str]] = None,
        **kwargs: Any,
    ) -> None:
        """Run when chain ends running."""
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
        await super().on_llm_start(serialized, prompts, **kwargs)

    async def on_chain_end(self, response: LLMResult, **kwargs: Any):
        await super().on_llm_end(response, **kwargs)

    async def on_llm_new_token(self, token: str, **kwargs: Any) -> None:
        return await super().on_llm_new_token(token, **kwargs)


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


def parse_input_variables_from_template(template: str) -> List[str]:
    return re.findall(r"\{(.+?)\}", template)


def replace_dot_with_dash_for_tool_pattern(text):
    def repl(match):
        return match.group(0).replace(".", "-")

    return re.sub(r"\btool-\d+\.output\b", repl, text)


def extract_tool_patterns_from_brackets(text):
    matches = re.findall(r"\{(\btool-\d+\-output\b)\}", text)
    return matches


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
        self.known_keys = []
        for index, _chain in enumerate(model.chains):
            llm, prompt_template = self._prepare_llm_and_template(_chain, index)
            chain = self._prepare_chain(_chain, llm, prompt_template)
            if _chain.key is None:
                logger.warning(f"Chain key is None. model_id: {model.id}")
            chain.output_key = f"{_chain.key}-output"
            chains.append(chain)
            self.known_keys.append(chain.output_key)
        self.context = SequentialChain(
            chains=chains,
            verbose=True,
            input_variables=[QUESTION_KEY, CHAT_HISTORY_KEY],
            callbacks=[SequentialChainAsyncIteratorCallbackHandler()],
        )

    def _prepare_llm_and_template(self, _chain, index):
        llm = _chain.llm.dict()
        llm_model = llm.pop("name")
        # TODO add max_tokens to chain
        llm.pop("max_tokens")
        temperature = llm.pop("temperature")
        llm = ChatOpenAI(
            model=llm_model,
            model_kwargs=llm,
            streaming=True,
            temperature=temperature,
            callbacks=[LLMAsyncIteratorCallbackHandler()],
        )
        self.sequential_chain_callback = llm.callbacks[0]
        if _chain.chain_type == "conversational_retrieval_qa_chain" and (
            _chain.prompt.template == "" or _chain.prompt.template is None
        ):
            # TODO add context
            _chain.prompt.template = """Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.

{chat_history}

Question: {question}
Helpful Answer:"""
        template = replace_dot_with_dash_for_tool_pattern(_chain.prompt.template)
        template += (
            "\n {question}"
            if (index == 0 or _chain.chain_type == "conversational_retrieval_qa_chain")
            else ""
        )

        input_variables = extract_tool_patterns_from_brackets(template) + [
            QUESTION_KEY,
            CHAT_HISTORY_KEY,
        ]
        unique_input_variables = []
        for var in input_variables:
            if var not in unique_input_variables:
                unique_input_variables.append(var)
        input_variables = []
        for var in unique_input_variables:
            if var in self.known_keys or var in [QUESTION_KEY, CHAT_HISTORY_KEY]:
                input_variables.append(var)

        for var in input_variables:
            template = template.replace("{" + var + "}", "{{ " + var + " }}")
        for var in input_variables:
            if var.startswith("tool-"):
                _var = "_".join(var.split("-"))
                template = template.replace("{{ " + var + " }}", "{{ " + _var + " }}")

        prompt_template = PromptTemplate(
            template=template
            if "{chat_history}" in template or "{{ chat_history }}" in template
            else HISTORY_PREFIX + template,
            input_variables=input_variables,
            validate_template=True,
            template_format="jinja2",
        )
        return llm, prompt_template

    def _prepare_chain(self, _chain, llm, prompt_template):
        match _chain.chain_type:
            case "conversational_retrieval_qa_chain":
                try:
                    retriever = Retriever(dataset_ids=_chain.datasets).get_retriever()
                    chain = PatchedConversationalRetrievalChain.from_llm(
                        input_keys=prompt_template.input_variables,
                        llm=llm,
                        retriever=retriever,
                        condense_question_prompt=prompt_template,
                        condense_question_llm=ChatOpenAI(),
                    )
                except Exception as e:
                    logger.error(
                        f"Error while creating conversational_retrieval_qa_chain: {e}"
                    )
                    raise e

            case "conversation_chain":
                try:
                    chain = LLMChain(
                        llm=llm,
                        prompt=prompt_template,
                    )
                except Exception as e:
                    logger.error(f"Error while creating conversation_chain: {e}")
                    raise e

            case _:
                logger.error(f"Chain type {_chain.chain_type} not supported")
                raise Exception("Chain type not supported")
        return chain

    async def agenerate(self, messages: List[BaseMessage]) -> str:
        # TODO buffer size limit
        prompt = messages[-1].content
        history = ChatMessageHistory()
        for message in messages:
            history.add_message(message)
        memory = ConversationSummaryMemory.from_messages(
            llm=ChatOpenAI(temperature=0), chat_memory=history, summarize_step=5
        )

        await self.context.arun(
            {
                QUESTION_KEY: prompt,
                CHAT_HISTORY_KEY: [SystemMessage(content=memory.buffer)],
            }
        )
