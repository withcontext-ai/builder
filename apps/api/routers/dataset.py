import logging
from uuid import uuid4

import pinecone
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from models.dataset import Dataset, Document, dataset_manager
from utils.config import PIPECONE_API_KEY, PIPECONE_ENVIRONMENT


class IndexResponse(BaseModel):
    index_type: str
    options: dict
    content: str


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/datasets")


@router.get("/{id}", tags=["datasets"])
def get_dataset(id: str):
    dataset = dataset_manager.get_dataset(id)
    if dataset is None:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return {"data": dataset, "message": "success", "status": 200}


@router.get("/", tags=["datasets"])
def get_datasets():
    return {"data": dataset_manager.get_dataset(), "message": "success", "status": 200}


@router.post("/", tags=["datasets"])
def create_dataset(dataset: Dataset):
    dataset.id = uuid4().hex
    dataset_manager.save_dataset(dataset)
    return {"data": dataset.id, "message": "success", "status": 200}


@router.patch("/{id}", tags=["datasets"])
def update_dataset(id: str, dataset: Dataset):
    dataset_manager.update_dataset(dataset)
    return {"message": "success", "status": 200}


@router.delete("/{id}", tags=["datasets"])
def delete_dataset(id: str):
    dataset_manager.delete_dataset(id)
    return {"message": "success", "status": 200}


@router.post("/{id}/index", tags=["datasets"])
def query(id: str, index: IndexResponse):
    pinecone.init(api_key=PIPECONE_API_KEY, environment=PIPECONE_ENVIRONMENT)
    # print(pinecone.list_indexes())
    # print(pinecone.list_collections())
    # TODO
    raise NotImplementedError
