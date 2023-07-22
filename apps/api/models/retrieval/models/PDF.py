from typing import List

import pinecone
from langchain.chains import ConversationalRetrievalChain
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.llms import OpenAI
from langchain.schema import Document
from langchain.text_splitter import CharacterTextSplitter
from langchain.vectorstores import Pinecone
from pdfminer.high_level import extract_text
from pydantic import BaseModel
from utils.config import PIPECONE_API_KEY, PIPECONE_ENVIRONMENT


class PDFSplitterOption(BaseModel):
    type: str
    chunk_size: int
    chunk_overlap: int


class PDFEmbeddingOption(BaseModel):
    model: str


class PDFRetrivalOption(BaseModel):
    splitter: PDFSplitterOption
    embedding: PDFEmbeddingOption


class PDFRetrieverMixin:
    def create_retriever(self):
        if hasattr(self, "retriever"):
            return
        text_splitter = CharacterTextSplitter(
            chunk_size=self.options.splitter.chunk_size,
            chunk_overlap=self.options.splitter.chunk_overlap,
        )
        doc = []
        for document in self.dataset.documents:
            if document.type == "pdf":
                pdf_content = self.storage_client.load(document.url)
                doc.append(Document(page_content=extract_text(pdf_content)))
        doc = text_splitter.split_documents(doc)

        embeddings = OpenAIEmbeddings(model=self.options.embedding.model)
        # TODO check if this is the right way to do it ⬇️
        pinecone.init(api_key=PIPECONE_API_KEY, environment=PIPECONE_ENVIRONMENT)
        vector_store = Pinecone.from_documents(
            doc, embeddings, index_name="context-prod"
        )
        self.retriever = ConversationalRetrievalChain.from_llm(
            OpenAI(temperature=0), vector_store.as_retriever()
        )

    def query_from_pdf(self, query: str):
        self.options = PDFRetrivalOption(**self.options)
        self.create_retriever()
        return self.retriever({"question": query, "chat_history": {}})["answer"]
