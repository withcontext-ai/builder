from fastapi.responses import StreamingResponse
import asyncio
from loguru import logger
import time


class OpenAIStreamResponse(StreamingResponse):
    def __init__(
        self,
        disconnect_event: asyncio.Event,
        workflow_saved_event: asyncio.Event,
        is_faceto_service: bool = False,
        *args,
        **kwargs,
    ):
        super().__init__(*args, **kwargs)
        self.disconnect_event = disconnect_event
        self.workflow_saved_event = workflow_saved_event
        self.is_faceto_service = is_faceto_service

    async def listen_for_disconnect(self, receive) -> None:
        while True:
            message = await receive()
            if message["type"] == "http.disconnect":
                if self.is_faceto_service:
                    await self.workflow_saved_event.wait()
                self.disconnect_event.set()
                break
            else:
                logger.info(f"message: {message}")
