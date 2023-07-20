import asyncio
import json
import logging
import os
import uuid
from typing import AsyncIterable, Awaitable, List

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from langchain.callbacks import AsyncIteratorCallbackHandler
from langchain.chat_models import ChatOpenAI
from langchain.schema import AIMessage, BaseMessage, HumanMessage, SystemMessage

from models.chat import Choices, CompletionsRequest, CompletionsResponse


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/chat")


async def send_message(
    messages: List[BaseMessage], model_name: str
) -> AsyncIterable[str]:
    callback = AsyncIteratorCallbackHandler()
    # TODO choose a model
    model = ChatOpenAI(
        streaming=True,
        verbose=True,
        callbacks=[callback],
    )
    completion_id = model_name + "-" + str(uuid.uuid4())

    async def wrap_done(fn: Awaitable, event: asyncio.Event):
        try:
            await fn
        except Exception as e:
            # TODO stream error
            logger.error(f"Error in stream: {e}")
            return f"data: {e}\n\n"
        finally:
            event.set()

    task = asyncio.create_task(
        wrap_done(
            model.agenerate(messages=[messages]),
            callback.done,
        )
    )
    async for token in callback.aiter():
        resp = CompletionsResponse(
            id=completion_id,
            object="chat.completion.chunk",
            model=model_name,
            choices=[Choices(index=0, finish_reason=None, delta={"content": token})],
        )
        yield f"data: {json.dumps(resp.dict())}\n\n"

    yield f"data: {json.dumps(CompletionsResponse(id=completion_id, object='chat.completion.chunk', model=model_name, choices=[Choices(index=0, finish_reason='stop', delta={})]).dict())}\n\n"
    yield "data: [DONE]\n\n"

    await task


@router.post("/completions")
def stream_completions(body: CompletionsRequest):
    # TODO check role
    if body.model != "OpenAI-GPT-3.5-Turbo":
        raise HTTPException(
            status_code=400, detail="Custom model functionality is not yet implemented."
        )
    messages = []
    for message in body.messages:
        if message.role == "user":
            messages.append(HumanMessage(content=message.content))
        elif message.role == "system":
            messages.append(SystemMessage(content=message.content))
        elif message.role == "assistant":
            messages.append(AIMessage(content=message.content))
        else:
            raise HTTPException(status_code=400, detail=f"Invalid role: {message.role}")
    return StreamingResponse(
        send_message(messages, body.model), media_type="text/event-stream"
    )
