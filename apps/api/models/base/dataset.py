from typing import Optional, Union

from pydantic import BaseModel, Field
from sqlalchemy import JSON, Column, String

from .base import Base, BaseManager


class Document(BaseModel):
    uid: str = Field(default_factory=str)
    url: str = Field(default_factory=str)
    type: str = Field(default_factory=str)


class Dataset(BaseModel):
    id: str = Field(default_factory=str)
    documents: Optional[list[Document]] = Field(default_factory=list)
    retrieval: Optional[dict] = Field(default_factory=dict)


class DatasetTable(Base):
    __tablename__ = "datasets"

    id = Column(String, primary_key=True)
    documents = Column(JSON)
    retrieval = Column(JSON)


class DatasetManager(BaseManager):
    def __init__(self) -> None:
        super().__init__()
        self.table = self.get_table("datasets")

    @BaseManager.db_session
    def save_dataset(self, dataset: Dataset):
        return self.table.insert().values(dataset.dict())

    @BaseManager.db_session
    def update_dataset(self, dataset: Dataset):
        return (
            self.table.update()
            .where(self.table.c.id == dataset.id)
            .values(dataset.dict())
        )

    @BaseManager.db_session
    def delete_dataset(self, dataset_id: str):
        return self.table.delete().where(self.table.c.id == dataset_id)

    @BaseManager.db_session
    def _get_datasets(self, dataset_id: str = None):
        if dataset_id:
            return self.table.select().where(self.table.c.id == dataset_id)
        else:
            return self.table.select()

    def get_datasets(self, dataset_id: str = None) -> Union[Dataset, list[Dataset]]:
        dataset_info = self._get_datasets(dataset_id)
        if dataset_info is None:
            return None
        dataset_info = dataset_info.fetchall()
        if len(dataset_info) == 0:
            return None
        return [Dataset(**dataset._mapping) for dataset in dataset_info]


dataset_manager = DatasetManager()
