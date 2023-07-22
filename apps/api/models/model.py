from typing import Optional, Union

from pydantic import BaseModel, Field
from sqlalchemy import JSON, Column, String

from .base import Base, BaseManager


class LLM(BaseModel):
    temperature: float = Field(default=0.7, ge=0, le=2)
    max_token: int = Field(default=100000000)
    name: str = Field(default_factory=str)


class Prompt(BaseModel):
    prompt: str = Field(default_factory=str)


class Chain(BaseModel):
    llm: LLM
    prompt: Prompt
    datasets: list[str]


class Model(BaseModel):
    id: Optional[str]
    name: str
    chains: list[Chain]


class ModelTable(Base):
    __tablename__ = "backend_models"

    id = Column(String, primary_key=True)
    name = Column(String)
    chains = Column(JSON)


class ModelManager(BaseManager):
    def __init__(self) -> None:
        super().__init__()
        self.table = self.get_table("backend_models")

    @BaseManager.db_session
    def save_model(self, model: Model):
        return self.table.insert().values(model.dict())

    @BaseManager.db_session
    def update_model(self, model: Model):
        return (
            self.table.update().where(self.table.c.id == model.id).values(model.dict())
        )

    @BaseManager.db_session
    def delete_model(self, model_id: str):
        return self.table.delete().where(self.table.c.id == model_id)

    @BaseManager.db_session
    def _get_model(self, model_id: str = None):
        if model_id:
            return self.table.select().where(self.table.c.id == model_id)
        else:
            return self.table.select()

    def get_models(self, model_id: str = None) -> Union[Model, list[Model]]:
        model_info = self._get_model(model_id)
        if model_info is None:
            return None
        model_info = model_info.fetchall()
        return [Model(**model._mapping) for model in model_info]


model_manager = ModelManager()
