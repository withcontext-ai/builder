from .celery import app, retry_on_exception
from models.base import Model
from models.base.dataset import Dataset
from models.controller import dataset_manager, model_manager, session_state_manager
from loguru import logger


@app.task(bind=True)
@retry_on_exception(countdown=10)
def background_create_dataset(self, dataset_dict: dict):
    dataset = Dataset(**dataset_dict)
    dataset_manager.save_dataset(dataset)
    logger.info(f"Dataset {dataset.id} created.")
    self.update_state(state='PROGRESS', meta={'progress': 100})


@app.task(bind=True)
@retry_on_exception
def background_add_document(self, dataset_id: str, document: dict):
    dataset_manager.add_document_to_dataset(dataset_id, document)
    logger.info(f"Document {document['uid']} added to dataset {dataset_id}.")
    self.update_state(state='PROGRESS', meta={'progress': 100})


@app.task(bind=True)
@retry_on_exception
def background_delete_document(self, dataset_id: str, document_uid: str):
    dataset_manager.delete_document_from_dataset(dataset_id, document_uid)
    logger.info(f"Document {document_uid} deleted from dataset {dataset_id}.")
    self.update_state(state='PROGRESS', meta={'progress': 100})


@app.task(bind=True)
@retry_on_exception(countdown=10)
def background_create_model(self, model_dict: dict):
    model = Model(**model_dict)
    model_manager.save_model(model)
    logger.info(f"model: {model} created")
    self.update_state(state='PROGRESS', meta={'progress': 100})


@app.task(bind=True)
@retry_on_exception(countdown=10)
def background_update_model(self, id: str, model: dict):
    model_manager.upsert_model(id, model)
    logger.info(f"model: {model} updated")
    session_state_manager.delete_session_state_cache_via_model(id)
    self.update_state(state='PROGRESS', meta={'progress': 100})