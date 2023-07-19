from pydantic import BaseModel


class Document(BaseModel):
    document_id: str
    document_uri: str
    document_type: str


class Dataset(BaseModel):
    dataset_id: str
    documents: list[Document]
