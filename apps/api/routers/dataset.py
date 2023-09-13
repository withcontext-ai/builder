import asyncio
import sys
from uuid import uuid4

import graphsignal
from fastapi import APIRouter, HTTPException
from loguru import logger
from models.base.dataset import Dataset
from models.controller import dataset_manager
from models.retrieval import Retriever
from pydantic import BaseModel
from concurrent.futures import ThreadPoolExecutor
import pinecone
from pinecone import Index
from fastapi import Query
from utils import PINECONE_API_KEY, PINECONE_ENVIRONMENT

executor = ThreadPoolExecutor(max_workers=1000)


class IndexResponse(BaseModel):
    index_type: str
    options: dict
    content: str


router = APIRouter(prefix="/v1/datasets")


@router.get("/{id}", tags=["datasets"])
def get_dataset(id: str):
    with graphsignal.start_trace("get_dataset"):
        dataset = dataset_manager.get_datasets(id)
        if dataset is None:
            raise HTTPException(status_code=404, detail="Dataset not found")
        return {"data": dataset, "message": "success", "status": 200}


@router.get("/", tags=["datasets"])
def get_datasets():
    with graphsignal.start_trace("get_datasets"):
        return {
            "data": dataset_manager.get_datasets(),
            "message": "success",
            "status": 200,
        }


def background_create_dataset(dataset: Dataset):
    try:
        dataset_manager.save_dataset(dataset)
        logger.info(f"Dataset {dataset.id} created.")
    except Exception as e:
        logger.error(f"Error during creation of dataset {dataset.id}: {e}")


@router.post("/", tags=["datasets"])
async def create_dataset(dataset: Dataset):
    with graphsignal.start_trace("create_dataset"):
        logger.info(f"dataset creating: {dataset}")
        dataset.id = uuid4().hex
        try:
            loop = asyncio.get_event_loop()
            loop.run_in_executor(executor, background_create_dataset, dataset)
            return {"data": {"id": dataset.id}, "message": "success", "status": 200}
        except Exception as e:
            logger.error(e)
            raise HTTPException(
                status_code=400, detail="Dataset not created with error: {}".format(e)
            )


def background_upsert_dataset(id: str, dataset_info: dict):
    try:
        dataset_manager.upsert_dataset(id, dataset_info)
        logger.info(f"Upsert for dataset {id} completed.")
    except Exception as e:
        logger.error(f"Error during upsert for dataset {id}: {e}")


@router.patch("/{id}", tags=["datasets"])
async def update_dataset(id: str, dataset: dict):
    with graphsignal.start_trace("update_dataset"):
        logger.info(f"dataset updating: {dataset}")
        try:
            loop = asyncio.get_event_loop()
            loop.run_in_executor(
                executor, background_upsert_dataset, id, dataset)
            return {"message": "success", "status": 200}
        except Exception as e:
            logger.error(e)
            raise HTTPException(
                status_code=400, detail="Dataset not updated with error: {}".format(e)
            )


@router.delete("/{id}", tags=["datasets"])
def delete_dataset(id: str):
    with graphsignal.start_trace("delete_dataset"):
        logger.info(f"dataset: {id}")
        try:
            dataset_manager.delete_dataset(id)
            return {"message": "success", "status": 200}
        except Exception as e:
            logger.error(e)
            raise HTTPException(
                status_code=400, detail="Dataset not deleted with error: {}".format(e)
            )


@router.get("/{dataset_id}/document/{uid}", tags=["datasets"])
def get_document_segments(dataset_id: str, uid: str, offset: int = Query(0, description="Offset for pagination"), limit: int = Query(10, description="Limit for pagination")):
    with graphsignal.start_trace("get_document_segments"):
        # 初始化Pinecone
        pinecone.init(api_key=PINECONE_API_KEY,
                      environment=PINECONE_ENVIRONMENT)
        index = Index("context-prod")
        # 从get_dataset函数获取dataset对象
        dataset_response = get_dataset(dataset_id)
        dataset = dataset_response["data"][0]

        matching_url = None
        segment_size = None
        for document in dataset.documents:
            if document.uid == uid:
                matching_url = document.url
                segment_size = document.page_size
                break

        if not matching_url:
            raise HTTPException(
                status_code=404, detail="UID not found in dataset documents")

        # 使用找到的url构造id
        id = f"{dataset_id}-{matching_url}-0"
        segment_ids = [f"{dataset_id}-{matching_url}-{i}" for i in range(
            offset, offset+limit) if i < segment_size]
        # 从Pinecone数据库中获取向量及对应文本
        segments = []
        for seg_id in segment_ids:
            vectors = index.fetch(namespace="withcontext", ids=[
                                  seg_id]).to_dict().get("vectors", {})
            vector = vectors.get(seg_id)
            if not vector or 'metadata' not in vector or 'text' not in vector['metadata']:
                raise HTTPException(
                    status_code=500, detail="Unexpected data format from Pinecone")
            if vector:
                text = vector['metadata']['text']
                segments.append({
                    "segment_id": seg_id,
                    "content": text
                })
        # 构建响应
        response_data = {
            "totalItems": limit,
            "segments": segments
        }

        return {
            "message": "success",
            "status": "200",
            "data": response_data
        }


@router.post("/{id}/index", tags=["datasets"])
def query(id: str, index: IndexResponse):
    try:
        retrieval = Retriever(index.options, id)
        query = retrieval.query(index.content, index.index_type)
        return {"data": {"query": query}, "message": "success", "status": 200}
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=400, detail="not supported")
