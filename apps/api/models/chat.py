from typing import List, Optional

from pydantic import BaseModel


class Messages(BaseModel):
    role: str
    content: str


class CompletionsRequest(BaseModel):
    model: str
    messages: List[Messages]


class Choices(BaseModel):
    index: int
    finish_reason: Optional[str]
    delta: dict


class CompletionsResponse(BaseModel):
    id: str
    object: str
    model: str
    choices: List[Choices]
