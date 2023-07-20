from pydantic import BaseModel, Field
from sqlalchemy import Column, String, JSON
from .base import Base, BaseManager


class Document(BaseModel):
    uid: str = Field(default_factory=str)
    url: str = Field(default_factory=str)
    type: str = Field(default_factory=str)


class Dataset(BaseModel):
    id: str = Field(default_factory=str)
    documents: list[Document]


class DatasetTable(Base):
    __tablename__ = "backend_datasets"

    id = Column(String, primary_key=True)
    documents = Column(JSON)


class DatasetManager(BaseManager):
    def __init__(self) -> None:
        super().__init__()
        self.table = self.get_table("backend_datasets")

    @BaseManager.db_session
    def save_dataset(self, dataset: Dataset):
        return self.table.insert().values(dataset.dict())

    @BaseManager.db_session
    def update_dataset(self, dataset: Dataset):
        return self.table.update().values(dataset.dict())

    @BaseManager.db_session
    def delete_dataset(self, dataset_id: str):
        return self.table.delete().where(self.table.c.id == dataset_id)

    @BaseManager.db_session
    def get_dataset(self, dataset_id: str = None):
        if dataset_id:
            return self.table.select().where(self.table.c.id == dataset_id)
        else:
            return self.table.select()


dataset_manager = DatasetManager()
