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

from langchain.callbacks import AsyncIteratorCallbackHandler
from langchain.callbacks.manager import (
    AsyncCallbackManagerForChainRun,
    CallbackManagerForChainRun,
)
from langchain.chains import (
    ConversationChain,
    LLMSummarizationCheckerChain,
    SequentialChain,
)
from langchain.chains.base import Chain
from langchain.prompts.base import BasePromptTemplate
from langchain.schema.language_model import BaseLanguageModel
from loguru import logger
from pydantic import Extra, root_validator


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
    prompt: BasePromptTemplate
    llm: BaseLanguageModel
    output_key: str = "text"
    max_retries: int = 0
    status: str = "initialized"

    def __init__(self, **kwargs: Any) -> None:
        super().__init__(**kwargs)
        self.status = SelfCheckChainStatus.INIT

    class Config:
        extra = Extra.forbid
        arbitrary_types_allowed = True

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
    ) -> Coroutine[Any, Any, Dict[str, Any]]:
        prompt_value = self.prompt.format_prompt(**inputs)
        response = await self.llm.agenerate_prompt(
            [prompt_value], callbacks=[run_manager.get_child() if run_manager else None]
        )
        if response.generations[0][0].text == "Yes":
            self.status = SelfCheckChainStatus.FINISHED
        else:
            self.max_retries -= 1
            if self.max_retries <= 0:
                self.status = SelfCheckChainStatus.ERROR
        return {self.output_key: response.generations[0][0].text}


class SequentialSelfCheckChain(SequentialChain):
    queue: asyncio.Queue[str]
    done: asyncio.Event

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
        known_values = inputs.copy()
        _run_manager = run_manager or AsyncCallbackManagerForChainRun.get_noop_manager()
        callbacks = _run_manager.get_child()
        for i, chain in enumerate(self.chains):
            if isinstance(chain, SelfCheckChain):
                if (
                    chain.status == SelfCheckChainStatus.FINISHED
                    or chain.status == SelfCheckChainStatus.ERROR
                ):
                    continue
                else:
                    outputs = await chain.acall(
                        known_values, return_only_outputs=True, callbacks=callbacks
                    )
                    known_values.update(outputs)
                    if chain.status not in [
                        SelfCheckChainStatus.FINISHED,
                        SelfCheckChainStatus.ERROR,
                    ]:
                        for token in outputs[chain.output_key]:
                            await self.queue.put(token)
                        self.done.set()
                        return {
                            k: known_values[k]
                            for k in self.output_variables
                            if k in known_values
                        }
            else:
                if i == len(self.chains) - 1:
                    callbacks.add_handler(
                        CustomAsyncIteratorCallbackHandler(self.queue, self.done)
                    )
                outputs = await chain.acall(
                    known_values, return_only_outputs=True, callbacks=callbacks
                )
                known_values.update(outputs)
        return {k: known_values[k] for k in self.output_variables if k in known_values}

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
