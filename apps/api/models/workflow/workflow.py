from typing import List, Optional, Union

from langchain.callbacks import AsyncIteratorCallbackHandler
from langchain.chains import LLMChain, SequentialChain
from langchain.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.schema import BaseMessage
from langchain.schema.messages import get_buffer_string
from loguru import logger
from models.base.model import Model
from models.retrieval import Retriever

from .utils import (
    LLMAsyncIteratorCallbackHandler,
    PatchedRetrievalQA,
    SequentialChainAsyncIteratorCallbackHandler,
    extract_tool_patterns_from_brackets,
    replace_dot_with_dash_for_tool_pattern,
)


CHAT_HISTORY_KEY = "chat_history"
QUESTION_KEY = "question"
CONTEXT_KEY = "context"

HISTORY_PREFIX = "Here's is the chat context between us:\n\n{chat_history}\n\n"
CONTEXT_PREFIX = """Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.

{context}"""

DEFAULT_CONVERSATION_CHAIN_PROMPT = """The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.

Current conversation:
{chat_history}
Human: {question}
AI:"""

DEFAULT_CONVERSATIONAL_RETRIEVAL_QA_CHAIN_PROMPT = """Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.

context:
{context}

question_history:
{chat_history}


Question: {question}
Helpful Answer:"""


class Workflow:
    model: Model
    session_id: str
    context: Optional[Union[SequentialChain, PatchedRetrievalQA, LLMChain]] = None
    sequential_chain_callback: Optional[AsyncIteratorCallbackHandler] = None

    def __init__(self, model: Model, session_id: str) -> None:
        chains = []
        self.session_id = session_id
        self.model = model
        self.known_keys = []
        if len(model.chains) == 1:
            llm, prompt_template = self._prepare_llm_and_template(model.chains[0], 0)
            chain = self._prepare_chain(model.chains[0], llm, prompt_template)
            self.context = chain
        else:
            for index, _chain in enumerate(model.chains):
                llm, prompt_template = self._prepare_llm_and_template(_chain, index)
                chain = self._prepare_chain(_chain, llm, prompt_template)
                if _chain.key is None:
                    logger.warning(f"Chain key is None. model_id: {model.id}")
                chain.output_key = f"{_chain.key}-output".replace("-", "_")
                chains.append(chain)
                self.known_keys.append(chain.output_key)
            self.context = SequentialChain(
                chains=chains,
                input_variables=[QUESTION_KEY, CHAT_HISTORY_KEY, CONTEXT_KEY],
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
            _chain.prompt.template = DEFAULT_CONVERSATIONAL_RETRIEVAL_QA_CHAIN_PROMPT
        elif _chain.chain_type == "conversation_chain" and (
            _chain.prompt.template == "" or _chain.prompt.template is None
        ):
            _chain.prompt.template = DEFAULT_CONVERSATION_CHAIN_PROMPT
        template = replace_dot_with_dash_for_tool_pattern(_chain.prompt.template)
        template += (
            "\n {question}"
            if (index == 0 or _chain.chain_type == "conversational_retrieval_qa_chain")
            and "{question}" not in template
            else ""
        )

        template = (
            template
            if "{chat_history}" in template or "{{ chat_history }}" in template
            else HISTORY_PREFIX + template
        )

        if _chain.chain_type == "conversational_retrieval_qa_chain":
            # add context
            template = (
                template
                if ("{context}" in template or "{{ context }}" in template)
                else CONTEXT_PREFIX + template
            )

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

        prompt_template = PromptTemplate(
            template=template,
            input_variables=input_variables,
            validate_template=True,
            template_format="jinja2",
        )
        return llm, prompt_template

    def _prepare_chain(self, _chain, llm, prompt_template):
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

                    # chain = PatchedConversationalRetrievalChain.from_llm(
                    #     input_keys=prompt_template.input_variables,
                    #     llm=llm,
                    #     retriever=retriever,
                    #     condense_question_prompt=prompt_template,
                    #     condense_question_llm=ChatOpenAI(),
                    # )

                    chain = PatchedRetrievalQA.from_chain_type(
                        llm=llm,
                        retriever=retriever,
                        input_keys=prompt_template.input_variables,
                    )

                    chain.callbacks = [LLMAsyncIteratorCallbackHandler()]
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

        await self.context.arun(
            {
                CHAT_HISTORY_KEY: get_buffer_string(messages[-7:-1]),
                QUESTION_KEY: prompt,
                CONTEXT_KEY: "",
            }
        )
