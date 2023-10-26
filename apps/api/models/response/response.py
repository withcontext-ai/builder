from fastapi.responses import StreamingResponse


class OpenAIStreamResponse(StreamingResponse):
    async def listen_for_disconnect(self, receive) -> None:
        while True:
            message = await receive()
            if message["type"] == "http.disconnect":
                raise RuntimeError("Client disconnected")
