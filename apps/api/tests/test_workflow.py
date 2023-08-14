import pytest
from models.base import (
    Model,
    LLM,
    Prompt,
    Chain,
    model_manager,
    Dataset,
    Document,
    dataset_manager,
    session_state_manager,
    Messages,
)
from utils import OPENAI_API_KEY
from routers.chat import send_message
import uuid


@pytest.fixture
def test_data():
    llm1 = LLM(
        name="gpt-3.5-turbo",
        max_tokens=1000,
        temperature=0.9,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0,
        api_key=OPENAI_API_KEY,
    )
    document = Document(
        uid="test_document_1",
        url="https://storage.googleapis.com/context-builder/public-tmp/kxPvcLZ1BzRC.pdf",
        type="pdf",
    )
    template1 = Prompt(
        template="""Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question, in its original language.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:"""
    )
    dataset = Dataset(
        id="test_dataset_1",
        documents=[document],
    )

    dataset_manager.update_dataset(dataset.id, dataset.dict())

    chain1 = Chain(
        llm=llm1,
        prompt=template1,
        chain_type="conversational_retrieval_qa_chain",
        datasets=["test_dataset_1"],
        retrieval={
            "splitter": {"type": "fake", "chunk_size": 100, "chunk_overlap": 0},
            "embedding": {"model": "text-embedding-ada-002"},
        },
    )

    model = Model(id="test_model_2", chains=[chain1])

    model_manager.update_model(model.id, model.dict())
    return model.id


@pytest.mark.asyncio
async def test_qa_chat(test_data, capfd):
    session_id = uuid.uuid4().hex
    session_state_manager.save_session_state(session_id=session_id, model_id=test_data)
    async for response in send_message(
        [
            Messages(content="How old is kobe", role="user"),
        ],
        session_id,
        filt=True,
    ):
        print(response)
    captured = capfd.readouterr()
    assert "135" in captured.out
    assert "[DONE]" in captured.out


@pytest.fixture
def test_conversation():
    llm = LLM(
        name="gpt-3.5-turbo",
        max_tokens=1000,
        temperature=0.3,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0,
        api_key=OPENAI_API_KEY,
    )
    template = Prompt(
        template="""The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.

Current conversation:
{chat_history}
Human: {question}
AI:"""
    )
    chain = Chain(
        llm=llm,
        prompt=template,
        chain_type="conversation_chain",
    )
    model = Model(id="test_model_3", chains=[chain])
    model_manager.upsert_model(model.id, model.dict())
    return model.id


@pytest.mark.asyncio
async def test_conversation_chat(test_conversation, capfd):
    session_id = uuid.uuid4().hex
    session_state_manager.save_session_state(
        session_id=session_id, model_id=test_conversation
    )
    async for response in send_message(
        [
            Messages(content="tell me the ans of 2^10", role="user"),
        ],
        session_id,
        filt=True,
    ):
        print(response)
    captured = capfd.readouterr()
    # 1024 in different tokens
    # assert "1024" in captured.out
    assert "[DONE]" in captured.out
