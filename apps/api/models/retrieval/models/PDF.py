from typing import List

import pinecone
import PyPDF2
from langchain.callbacks.manager import AsyncCallbackManagerForRetrieverRun
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.llms import OpenAI
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain.schema import Document
from langchain.text_splitter import CharacterTextSplitter
from langchain.vectorstores import Pinecone
from pydantic import BaseModel, Field
from utils import PINECONE_API_KEY, PINECONE_ENVIRONMENT


class PDFSplitterOption(BaseModel):
    type: str = Field(default="character")
    chunk_size: int = Field(default=1000)
    chunk_overlap: int = Field(default=0)


class PDFEmbeddingOption(BaseModel):
    model: str = Field(default="gpt-3.5-turbo")


class PDFRetrivalOption(BaseModel):
    splitter: PDFSplitterOption = Field(default_factory=PDFSplitterOption)
    embedding: PDFEmbeddingOption = Field(default_factory=PDFEmbeddingOption)


class PatchedSelfQueryRetriever(SelfQueryRetriever):
    async def _aget_relevant_documents(
        self, query: str, *, run_manager: AsyncCallbackManagerForRetrieverRun
    ) -> List[Document]:
        if self.search_type == "similarity":
            docs = await self.vectorstore.asimilarity_search(
                query, **self.search_kwargs
            )
        elif self.search_type == "similarity_score_threshold":
            docs_and_similarities = (
                await self.vectorstore.asimilarity_search_with_relevance_scores(
                    query, **self.search_kwargs
                )
            )
            docs = [doc for doc, _ in docs_and_similarities]
        elif self.search_type == "mmr":
            docs = await self.vectorstore.amax_marginal_relevance_search(
                query, **self.search_kwargs
            )
        else:
            raise ValueError(f"search_type of {self.search_type} not allowed.")
        return docs


class PDFRetrieverMixin:
    def create_retriever(self):
        doc = []
        for dataset in self.datasets:
            _doc = []
            options = PDFRetrivalOption(**dataset.retrieval)
            text_splitter = CharacterTextSplitter(
                chunk_size=options.splitter.chunk_size,
                chunk_overlap=options.splitter.chunk_overlap,
            )
            for document in dataset.documents:
                if document.type == "pdf":
                    pdf_content = self.storage_client.load(document.url)
                    pdf_reader = PyPDF2.PdfReader(pdf_content)
                    for page in pdf_reader.pages:
                        _doc.append(
                            Document(
                                page_content=page.extract_text(),
                                metadata={
                                    "source": document.url,
                                    "page_number": pdf_reader.get_page_number(page),
                                },
                            )
                        )
            _doc = text_splitter.split_documents(_doc)
            doc += _doc

        embeddings = OpenAIEmbeddings()
        # TODO check if this is the right way to do it ⬇️
        pinecone.init(api_key=PINECONE_API_KEY, environment=PINECONE_ENVIRONMENT)
        vector_store = Pinecone.from_documents(
            doc,
            embeddings,
            index_name="context-prod",
        )
        vector_store.as_retriever()

        self.retriever = PatchedSelfQueryRetriever.from_llm(
            llm=OpenAI(),
            vectorstore=vector_store,
            verbose=True,
            document_contents="",
            metadata_field_info=[
                AttributeInfo(
                    name="source", type="string", description="source of pdf"
                ),
                AttributeInfo(
                    name="page_number", type="int", description="pdf page number"
                ),
            ],
        )

    def get_retriever(self):
        if hasattr(self, "retriever"):
            return self.retriever
        self.create_retriever()
        return self.retriever

    def query_from_pdf(self, query: str):
        return self.get_retriever().get_relevant_documents(query)
