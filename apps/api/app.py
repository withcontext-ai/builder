import cProfile
import io
import os
import pstats
import sys
import traceback

import graphsignal
import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from loguru import logger
from routers import chat, dataset, model, auth
from starlette.responses import JSONResponse
from utils import GRAPH_SIGNAL_API_KEY, BACKEND_URL
import uuid

logger.add(sys.stdout, format="{time} {level} {message}", level="INFO", enqueue=True)


load_dotenv()

app = FastAPI(docs_url=None, redoc_url=None)
graphsignal.configure(api_key=GRAPH_SIGNAL_API_KEY, deployment="my-app-prod")

if BACKEND_URL.startswith("http://api-test") and os.getenv("TESTING"):

    @app.middleware("http")
    async def profiler_middleware(request: Request, call_next):
        pr = cProfile.Profile()
        pr.enable()
        response = await call_next(request)
        pr.disable()
        s = io.StringIO()
        ps = pstats.Stats(pr, stream=s).sort_stats("cumulative")
        ps.print_stats()
        logger.info(s.getvalue())
        return response


@app.get("/health")
async def health_check():
    return {"status": "ok"}


@app.middleware("http")
async def add_trace_id(request: Request, call_next):
    trace_id = uuid.uuid4().hex
    logger.add(
        lambda msg: print(msg, end=""),
        format="{time} {level} {message} | Trace ID: {extra[trace_id]}",
        filter=lambda record: "trace_id" in record["extra"],
    )
    logger_context = logger.bind(trace_id=trace_id)
    with logger_context.contextualize():
        response = await call_next(request)

    return response


app.include_router(chat.router)
app.include_router(dataset.router)
app.include_router(model.router)
app.include_router(auth.router)

if __name__ == "__main__":
    uvicorn.run(host="0.0.0.0", port=8000, app=app)
