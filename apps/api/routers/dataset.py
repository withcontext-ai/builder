import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from apps.api.models.dataset import Dataset, Document


class IndexResponse(BaseModel):
    index_type: str
    options: dict
    content: str


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/datasets")


@router.get("/{id}", tags=["datasets"])
def get_dataset(id: str):
    pass


@router.get("/", tags=["datasets"])
def get_datasets():
    pass


@router.post("/", tags=["datasets"])
def create_dataset(dataset: Dataset):
    pass


@router.patch("/{id}", tags=["datasets"])
def update_dataset(id: str, dataset: Dataset):
    pass


@router.delete("/{id}", tags=["datasets"])
def delete_dataset(id: str):
    pass


@router.post("/{id}/index", tags=["datasets"])
def query(id: str, index: IndexResponse):
    pass
