from typing import Optional, Union
import os

from pydantic import BaseModel, Field
from sqlalchemy import JSON, Column, String

from .base import Base, BaseManager
from utils import OPENAI_API_KEY


class LLM(BaseModel):
    name: str = Field(default_factory=str)
    max_tokens: int = Field(default=100)
    temperature: float = Field(default=1)
    top_p: float = Field(default=1)
    frequency_penalty: float = Field(default=0)
    presence_penalty: float = Field(default=0)
    api_key: str = Field(default=OPENAI_API_KEY)


class Prompt(BaseModel):
    template: str = Field(default_factory=str)


class Chain(BaseModel):
    llm: LLM
    prompt: Prompt
    datasets: Optional[list[str]] = []
    chain_type: str
    key: Optional[str] = None


class Model(BaseModel):
    id: Optional[str]
    chains: list[Chain]


class ModelTable(Base):
    __tablename__ = "models"

    id = Column(String, primary_key=True)
    chains = Column(JSON)


class ModelManager(BaseManager):
    def __init__(self) -> None:
        super().__init__()
        self.table = self.get_table("models")

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
        if len(model_info) == 0:
            return None
        return [Model(**model._mapping) for model in model_info]


model_manager = ModelManager()
