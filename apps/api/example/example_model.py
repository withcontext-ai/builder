from models.base import (
    Model,
    LLM,
    Prompt,
    Chain,
    model_manager,
    Dataset,
    Document,
    dataset_manager,
)
from utils import OPENAI_API_KEY


llm1 = LLM(
    name="gpt-3.5-turbo",
    max_tokens=4096,
    temperature=0.9,
    top_p=1,
    frequency_penalty=0,
    presence_penalty=0,
    api_key=OPENAI_API_KEY,
)


document = Document(
    uid="test_document_1",
    url="https://storage.googleapis.com/context-builder/public-tmp/0wpj5TqcnFRM.pdf",
    type="pdf",
)
template1 = Prompt(
    template="""Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question, in its original language.

Chat History:
{chat_history}
Follow Up Input: {question}

Do not change the language of the input!
Standalone question:"""
)
dataset = Dataset(
    id="test_dataset_1",
    documents=[document],
)

dataset_manager.update_dataset(dataset)

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

model_manager.update_model(model)
