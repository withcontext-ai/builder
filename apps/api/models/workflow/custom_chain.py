import asyncio
from typing import (
    Any,
    AsyncIterator,
    Coroutine,
    Dict,
    List,
    Literal,
    Optional,
    Union,
    cast,
)
from enum import Enum
import time
from langchain.callbacks import AsyncIteratorCallbackHandler
from langchain.callbacks.manager import (
    AsyncCallbackManagerForChainRun,
    CallbackManagerForChainRun,
)
from langchain.chains import (
    ConversationChain,
    LLMSummarizationCheckerChain,
    SequentialChain,
    LLMChain,
)
from langchain.chains.base import Chain
from langchain.prompts.base import BasePromptTemplate
from langchain.schema.language_model import BaseLanguageModel
from langchain.schema import SystemMessage
from loguru import logger
from pydantic import Extra, root_validator, Field
import inspect

from langchain.chat_models import ChatOpenAI
from langchain.retrievers import SelfQueryRetriever


class CustomAsyncIteratorCallbackHandler(AsyncIteratorCallbackHandler):
    def __init__(self, queue, done) -> None:
        self.done = done
        self.queue = queue

    async def on_llm_new_token(
        self, token: str, **kwargs: Any
    ) -> Coroutine[Any, Any, None]:
        if token is not None and token != "":
            await self.queue.put(token)

    async def on_chain_end(self, response: Any, **kwargs: Any) -> None:
        self.done.set()


class SelfCheckChainStatus(str, Enum):
    INIT = "initialized"
    FINISHED = "finished"
    ERROR = "error"
    RUNNING = "running"


class SelfCheckChain(Chain):
    system_prompt: BasePromptTemplate
    check_prompt: BasePromptTemplate
    llm: ChatOpenAI
    output_key: str = "text"
    max_retries: int = 0
    process: str = SelfCheckChainStatus.INIT

    class Config:
        extra = Extra.forbid
        arbitrary_types_allowed = True

    @property
    def input_keys(self) -> List[str]:
        return self.check_prompt.input_variables

    @property
    def output_keys(self) -> List[str]:
        return [self.output_key]

    def _call(
        self,
        inputs: Dict[str, Any],
        run_manager: CallbackManagerForChainRun | None = None,
    ) -> Dict[str, Any]:
        raise NotImplementedError

    async def _acall(
        self,
        inputs: Dict[str, Any],
        run_manager: AsyncCallbackManagerForChainRun | None = None,
    ) -> Coroutine[Any, Any, Dict[str, Any]]:
        if inputs.get("chat_history", None) is not None and isinstance(
            inputs["chat_history"], str
        ):
            inputs["chat_history"] = [inputs["chat_history"]]
        messages = inputs.get("chat_history", [])
        inputs.pop("chat_history", None)

        if self.process == SelfCheckChainStatus.INIT:
            prompt_value = self.system_prompt.format_prompt(**inputs)
            self.process = SelfCheckChainStatus.RUNNING
        elif self.process == SelfCheckChainStatus.RUNNING:
            prompt_value = self.check_prompt.format_prompt(**inputs)
        messages = [SystemMessage(content=prompt_value.to_string())] + messages
        response = await self.llm.agenerate(
            messages=[messages],
            callbacks=run_manager.get_child() if run_manager else None,
        )
        if response.generations[0][0].text == "Yes":
            self.process = SelfCheckChainStatus.FINISHED
            return {self.output_key: response.generations[0][0].text}
        else:
            self.max_retries -= 1
            if self.max_retries <= 0:
                self.process = SelfCheckChainStatus.ERROR
        return {self.output_key: response.generations[0][0].text}


class SequentialSelfCheckChain(SequentialChain):
    queue: asyncio.Queue[str]
    done: asyncio.Event
    known_values: Dict[str, Any] = Field(default_factory=dict)

    class Config:
        extra = Extra.allow
        arbitrary_types_allowed = True

    def _call(
        self,
        inputs: Dict[str, str],
        run_manager: CallbackManagerForChainRun | None = None,
    ) -> Dict[str, str]:
        raise NotImplementedError

    async def _acall(
        self,
        inputs: Dict[str, Any],
        run_manager: AsyncCallbackManagerForChainRun | None = None,
    ) -> Dict[str, Any]:
        self.known_values.update(inputs)
        _run_manager = run_manager or AsyncCallbackManagerForChainRun.get_noop_manager()
        callbacks = _run_manager.get_child()
        for i, chain in enumerate(self.chains):
            if isinstance(chain, SelfCheckChain):
                if (
                    chain.process == SelfCheckChainStatus.FINISHED
                    or chain.process == SelfCheckChainStatus.ERROR
                ):
                    logger.info(f"Skipping chain {i} as it is already {chain.process}")
                    continue
                else:
                    outputs = await chain.acall(
                        self.known_values, return_only_outputs=True, callbacks=callbacks
                    )
                    self.known_values.update(outputs)
                    if chain.process not in [
                        SelfCheckChainStatus.FINISHED,
                        SelfCheckChainStatus.ERROR,
                    ]:
                        for token in outputs[chain.output_key]:
                            await self.queue.put(token)
                        while not self.queue.empty():
                            await asyncio.sleep(2)
                        self.done.set()
                        return_dict = {}
                        for k in self.output_variables:
                            if k in self.known_values:
                                return_dict[k] = self.known_values[k]
                            else:
                                return_dict[k] = ""
                        return return_dict
            else:
                if i == len(self.chains) - 1:
                    callbacks.add_handler(
                        CustomAsyncIteratorCallbackHandler(self.queue, self.done)
                    )
                outputs = await chain.acall(
                    self.known_values, return_only_outputs=True, callbacks=callbacks
                )
                self.known_values.update(outputs)
        return_dict = {}
        for k in self.output_variables:
            if k in self.known_values:
                return_dict[k] = self.known_values[k]
            else:
                return_dict[k] = ""
        return return_dict

    async def aiter(self) -> AsyncIterator[str]:
        while not self.queue.empty() or not self.done.is_set():
            # Wait for the next token in the queue,
            # but stop waiting if the done event is set
            done, other = await asyncio.wait(
                [
                    # NOTE: If you add other tasks here, update the code below,
                    # which assumes each set has exactly one task each
                    asyncio.ensure_future(self.queue.get()),
                    asyncio.ensure_future(self.done.wait()),
                ],
                return_when=asyncio.FIRST_COMPLETED,
            )
            if other:
                other.pop().cancel()
            token_or_done = cast(Union[str, Literal[True]], done.pop().result())
            if token_or_done is True:
                while not self.queue.empty():
                    yield await self.queue.get()
                break
            yield token_or_done


class EnhanceConversationChain(Chain):
    prompt: BasePromptTemplate
    llm: ChatOpenAI
    output_key: str = "text"

    def _call(
        self,
        inputs: Dict[str, Any],
        run_manager: CallbackManagerForChainRun | None = None,
    ) -> Dict[str, Any]:
        raise NotImplementedError

    @property
    def input_keys(self) -> List[str]:
        return self.prompt.input_variables

    @property
    def output_keys(self) -> List[str]:
        return [self.output_key]

    async def _acall(
        self,
        inputs: Dict[str, Any],
        run_manager: AsyncCallbackManagerForChainRun | None = None,
    ) -> Dict[str, Any]:
        if inputs.get("chat_history", None) is not None and isinstance(
            inputs["chat_history"], str
        ):
            inputs["chat_history"] = [inputs["chat_history"]]
        messages = inputs.get("chat_history", [])
        inputs.pop("chat_history", None)
        prompt_value = self.prompt.format_prompt(**inputs)
        messages = [SystemMessage(content=prompt_value.to_string())] + messages
        response = await self.llm.agenerate(
            messages=[messages],
            callbacks=run_manager.get_child() if run_manager else None,
        )
        return {self.output_key: response.generations[0][0].text}


class EnhanceConversationalRetrievalChain(Chain):
    prompt: BasePromptTemplate
    llm: ChatOpenAI
    output_key: str = "text"
    retriever: SelfQueryRetriever

    @property
    def input_keys(self) -> List[str]:
        return self.prompt.input_variables

    @property
    def output_keys(self) -> List[str]:
        return [self.output_key]

    def _call(
        self,
        inputs: Dict[str, Any],
        run_manager: CallbackManagerForChainRun | None = None,
    ) -> Dict[str, Any]:
        raise NotImplementedError

    async def _acall(
        self,
        inputs: Dict[str, Any],
        run_manager: AsyncCallbackManagerForChainRun | None = None,
    ) -> Dict[str, Any]:
        if inputs.get("chat_history", None) is not None and isinstance(
            inputs["chat_history"], str
        ):
            inputs["chat_history"] = [inputs["chat_history"]]
        messages = inputs.get("chat_history", [])
        inputs.pop("chat_history", None)
        question = inputs.get("question", None)
        if question is None:
            raise ValueError("Question is required")
        inputs.pop("question", None)

        docs = await self.retriever.aget_relevant_documents(
            question, callbacks=run_manager.get_child()
        )
        context = "\n".join([doc.page_content for doc in docs])
        inputs["context"] = context
        prompt_value = self.prompt.format_prompt(**inputs)
        messages = [SystemMessage(content=prompt_value.to_string())] + messages
        messages = [SystemMessage(content=prompt_value.to_string())] + messages
        response = await self.llm.agenerate(
            messages=[messages],
            callbacks=run_manager.get_child() if run_manager else None,
        )
        return {self.output_key: response.generations[0][0].text}
