import logging
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from models.base import Dataset, dataset_manager
from models.retrieval import Retriever
from pydantic import BaseModel


class IndexResponse(BaseModel):
    index_type: str
    options: dict
    content: str


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/datasets")


@router.get("/{id}", tags=["datasets"])
def get_dataset(id: str):
    dataset = dataset_manager.get_datasets(id)
    if dataset is None:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return {"data": dataset, "message": "success", "status": 200}


@router.get("/", tags=["datasets"])
def get_datasets():
    return {"data": dataset_manager.get_datasets(), "message": "success", "status": 200}


@router.post("/", tags=["datasets"])
def create_dataset(dataset: Dataset):
    dataset.id = uuid4().hex
    dataset_manager.save_dataset(dataset)
    return {"data": {"id": dataset.id}, "message": "success", "status": 200}


@router.patch("/{id}", tags=["datasets"])
def update_dataset(id: str, dataset: Dataset):
    dataset.id = id
    dataset_manager.update_dataset(dataset)
    return {"message": "success", "status": 200}


@router.delete("/{id}", tags=["datasets"])
def delete_dataset(id: str):
    dataset_manager.delete_dataset(id)
    return {"message": "success", "status": 200}


@router.post("/{id}/index", tags=["datasets"])
def query(id: str, index: IndexResponse):
    retrieval = Retriever(index.options, id)
    try:
        query = retrieval.query(index.content, index.index_type)
        return {"data": {"query": query}, "message": "success", "status": 200}
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=400, detail="not supported")
