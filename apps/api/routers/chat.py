import asyncio
import logging
import os
from typing import AsyncIterable, Awaitable

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from langchain.callbacks import AsyncIteratorCallbackHandler
from langchain.chat_models import ChatOpenAI
from langchain.schema import HumanMessage
from pydantic import BaseModel

logger = logging.getLogger(__name__)

if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = ""

router = APIRouter(prefix="/v1/chat")


async def send_message(message: str) -> AsyncIterable[str]:
    callback = AsyncIteratorCallbackHandler()
    model = ChatOpenAI(
        streaming=True,
        verbose=True,
        callbacks=[callback],
    )

    async def wrap_done(fn: Awaitable, event: asyncio.Event):
        try:
            await fn
        except Exception as e:
            # TODO stream error
            logger.error(f"Error in stream: {e}")
        finally:
            event.set()

    task = asyncio.create_task(
        wrap_done(
            model.agenerate(messages=[[HumanMessage(content=message)]]), callback.done
        )
    )
    async for token in callback.aiter():
        yield f"data: {token}\n\n"

    await task


class CompletionsRequest(BaseModel):
    class Messages(BaseModel):
        role: str
        content: str

    model: str
    messages: Messages


@router.post("/completions")
def stream_completions(body: CompletionsRequest):
    # TODO check role
    if body.model != "OpenAI-GPT-3.5-Turbo":
        raise HTTPException(
            status_code=400, detail="Custom model functionality is not yet implemented."
        )
    return StreamingResponse(
        send_message(body.messages.content), media_type="text/event-stream"
    )
