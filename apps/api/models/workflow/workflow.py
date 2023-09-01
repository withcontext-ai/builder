from typing import List, Optional, Union
import asyncio
from langchain.callbacks import (
    AsyncIteratorCallbackHandler,
    OpenAICallbackHandler,
    get_openai_callback,
)
from langchain.chains import LLMChain, SequentialChain
from langchain.llms import OpenAIChat
from langchain.prompts import PromptTemplate
from langchain.schema import BaseMessage
from langchain.schema.messages import get_buffer_string
from loguru import logger
from models.base.model import Model
from models.retrieval import Retriever
from langchain.memory import ConversationBufferMemory
from .custom_chain import SequentialSelfCheckChain, SelfCheckChain
from .utils import (
    PatchedRetrievalQA,
    extract_tool_patterns_from_brackets,
    replace_dot_with_dash_for_tool_pattern,
)

from .callbacks import (
    CostCalcAsyncHandler,
    LLMAsyncIteratorCallbackHandler,
    SequentialChainAsyncIteratorCallbackHandler,
    TokenCostProcess,
    IOTraceCallbackHandler,
)


CHAT_HISTORY_KEY = "chat_history"
QUESTION_KEY = "question"
CONTEXT_KEY = "context"

# HISTORY_PREFIX = "Question History:\n\n{chat_history}\n\n"
# CONTEXT_PREFIX = """Background: '''{context}'''

# Use the text separated by three quotation marks after "Background" to answer the question. Do not add any additional information. Ensure the answer is correct and do not produce false content. If the answer cannot be found in the text, write "The document does not provide an answer."
# """

# DEFAULT_CONVERSATION_CHAIN_PROMPT = """The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.

# Current conversation:
# {chat_history}
# Human: {question}
# AI:"""

# DEFAULT_CONVERSATIONAL_RETRIEVAL_QA_CHAIN_PROMPT = """Background: '''{context}'''

# Use the text separated by three quotation marks after "Background" to answer the question. Do not add any additional information. Ensure the answer is correct and do not produce false content. If the answer cannot be found in the text, write "The document does not provide an answer."


# question history:
# {chat_history}


# Question: {question}
# Helpful Answer:"""


class Workflow:
    model: Model
    session_id: str
    context: Optional[Union[SequentialChain, PatchedRetrievalQA, LLMChain]] = None
    cost_content: TokenCostProcess = TokenCostProcess()
    io_traces: List[str] = []

    def __init__(self, model: Model, session_id: str) -> None:
        chains = []
        self.session_id = session_id
        self.model = model
        self.known_keys = []
        self.cost_content = TokenCostProcess()
        for index, _chain in enumerate(model.chains):
            llm, prompt_template = self._prepare_llm_and_template(_chain, index)
            chain = self._prepare_chain(_chain, llm, prompt_template)
            if _chain.key is None:
                logger.warning(f"Chain key is None. model_id: {model.id}")
            chain.output_key = f"{_chain.key}-output".replace("-", "_")
            chains.append(chain)
            self.known_keys.append(chain.output_key)
        self.context = SequentialSelfCheckChain(
            chains=chains,
            input_variables=[QUESTION_KEY, CHAT_HISTORY_KEY, CONTEXT_KEY],
            callbacks=[
                SequentialChainAsyncIteratorCallbackHandler(),
                OpenAICallbackHandler(),
            ],
            queue=asyncio.Queue(),
            done=asyncio.Event(),
        )

    def clear(self):
        self.context.done = asyncio.Event()
        self.io_traces = []
        self.cost_content = TokenCostProcess()
        self.context.queue = asyncio.Queue()

    def _prepare_llm_and_template(self, _chain, index):
        llm = _chain.llm.dict()
        llm_model = llm.pop("name")
        # TODO add max_tokens to chain
        llm.pop("max_tokens")
        temperature = llm.pop("temperature")
        top_p = llm.pop("top_p")
        frequency_penalty = llm.pop("frequency_penalty")
        presence_penalty = llm.pop("presence_penalty")
        llm = OpenAIChat(
            model=llm_model,
            model_kwargs=llm,
            streaming=True,
            temperature=temperature,
            callbacks=[
                CostCalcAsyncHandler(llm_model, self.cost_content),
                IOTraceCallbackHandler(self.io_traces),
            ],
            top_p=top_p,
            frequency_penalty=frequency_penalty,
            presence_penalty=presence_penalty,
        )
        template = _chain.prompt.template
        if _chain.prompt.basic_prompt is not None:
            template += "\n" + _chain.prompt.basic_prompt
        elif _chain.prompt.check_prompt is not None:
            if _chain.prompt.target is None:
                logger.warning(f"Target is None. model_id: {self.model.id}")
            template += "\n" + _chain.prompt.check_prompt
            template.replace("[{target}]", _chain.prompt.target)

        template = replace_dot_with_dash_for_tool_pattern(template)
        # transfer f-format to jinja2 format
        input_variables = extract_tool_patterns_from_brackets(template) + [
            QUESTION_KEY,
            CHAT_HISTORY_KEY,
            CONTEXT_KEY,
        ]
        unique_input_variables = []
        for var in input_variables:
            if var not in unique_input_variables:
                unique_input_variables.append(var)
        input_variables = []
        for var in unique_input_variables:
            if var.startswith("tool-"):
                _var = "_".join(var.split("-"))
                if _var in self.known_keys:
                    input_variables.append(var)
            elif var in [QUESTION_KEY, CHAT_HISTORY_KEY, CONTEXT_KEY]:
                input_variables.append(var)

        for var in input_variables:
            template = template.replace("[{" + var + "}]", "{{ " + var + " }}")
        for var in input_variables:
            if var.startswith("tool-"):
                _var = "_".join(var.split("-"))
                template = template.replace("{{ " + var + " }}", "{{ " + _var + " }}")
                input_variables.remove(var)
                input_variables.append(_var)
            else:
                template = template.replace("{" + var + "}", "{{ " + var + " }}")

        prompt_template = PromptTemplate(
            template=template,
            input_variables=input_variables,
            validate_template=True,
            template_format="jinja2",
        )
        return llm, prompt_template

    def _prepare_chain(self, _chain, llm, prompt_template: PromptTemplate):
        match _chain.chain_type:
            case "conversational_retrieval_qa_chain":
                try:
                    retriever = Retriever.get_retriever(
                        filter={
                            "relative_chains": {
                                "$in": [f"{self.model.id}-{_chain.key}"]
                            }
                        }
                    )
                    chain = PatchedRetrievalQA.from_chain_type(
                        llm=llm,
                        retriever=retriever,
                        input_keys=prompt_template.input_variables,
                        chain_type_kwargs={"prompt": prompt_template},
                    )

                    chain.callbacks = [
                        LLMAsyncIteratorCallbackHandler(),
                    ]
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
                    chain.callbacks = [
                        LLMAsyncIteratorCallbackHandler(),
                    ]
                except Exception as e:
                    logger.error(f"Error while creating conversation_chain: {e}")
                    raise e

            case "self_checking_chain":
                try:
                    chain = SelfCheckChain(
                        llm=llm,
                        prompt=prompt_template,
                        max_retries=_chain.prompt.follow_up_questions_num,
                    )
                    chain.callbacks = [
                        LLMAsyncIteratorCallbackHandler(),
                    ]
                except Exception as e:
                    logger.error(f"Error while creating self_checking_chain: {e}")
                    raise e

            case _:
                logger.error(f"Chain type {_chain.chain_type} not supported")
                raise Exception("Chain type not supported")
        return chain

    async def agenerate(self, messages: List[BaseMessage]) -> str:
        # TODO buffer size limit
        prompt = messages[-1].content
        memory = ConversationBufferMemory(
            memory_key="chat_history", input_key="question"
        )
        for i in range(len(messages) - 1):
            memory.chat_memory.add_message(messages[i])
        self.context.memory = memory
        await self.context.arun(
            {
                # CHAT_HISTORY_KEY: messages,
                QUESTION_KEY: prompt,
                CONTEXT_KEY: "",
            }
        )
