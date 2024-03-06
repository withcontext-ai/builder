from typing import List, Optional

from pydantic import BaseModel, Field


class Messages(BaseModel):
    role: str
    content: str


class CompletionsRequest(BaseModel):
    session_id: str
    messages: List[Messages]
    message_id: str


class VideoCompletionsRequest(BaseModel):
    messages: List[Messages]


class FaceToAiWebhookRequest(BaseModel):
    object: str
    type: str
    data: dict = Field(default={})


class Choices(BaseModel):
    index: int
    finish_reason: Optional[str]
    delta: dict


class CompletionsResponse(BaseModel):
    id: str
    object: str
    model: str
    choices: List[Choices]


class SessionRequest(BaseModel):
    model_id: str
