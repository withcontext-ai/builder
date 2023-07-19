import uvicorn
from fastapi import FastAPI
from apps.api.routers import chat, dataset, model

app = FastAPI()

app.include_router(chat.router)
app.include_router(dataset.router)
app.include_router(model.router)

if __name__ == "__main__":
    uvicorn.run(host="0.0.0.0", port=8000, app=app)
