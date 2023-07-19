from pydantic import BaseModel, Field


class LLMProperties(BaseModel):
    temperature: float = Field(default=0.7, ge=0, le=2)
    max_token: int = Field(default=100000000)
    model_name: str


class LLM(BaseModel):
    properties: LLMProperties


class PromptProperties(BaseModel):
    prompt: str


class Prompt(BaseModel):
    properties: PromptProperties
