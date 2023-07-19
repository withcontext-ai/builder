import logging

from fastapi import APIRouter, HTTPException

from apps.api.models.model import LLM, Prompt

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/v1/models")


@router.get("/{id}", tags=["models"])
def get_model(id: str):
    pass


@router.post("/", tags=["models"])
def create_model(model: LLM):
    pass


@router.patch("/{id}", tags=["models"])
def update_model(id: str, model: LLM):
    pass


@router.delete("/{id}", tags=["models"])
def delete_model(id: str):
    pass


@router.get("/", tags=["models"])
def get_models():
    pass
