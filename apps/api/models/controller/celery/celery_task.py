from celery import Celery
from models.base.dataset import Dataset
from models.controller import dataset_manager
from loguru import logger
from celery import current_task
from celery.exceptions import MaxRetriesExceededError
from urllib.parse import quote_plus
from utils.config import UPSTASH_REDIS_REST_TOKEN, UPSTASH_REDIS_REST_URL
from functools import wraps
from celery.exceptions import MaxRetriesExceededError
import traceback

logger.info("Celery Start")
app = Celery('celery_task')


# Configuration

broker_host = UPSTASH_REDIS_REST_URL
broker_port = 30535
broker_db = 0 
results_db = 0
password = UPSTASH_REDIS_REST_TOKEN

app.conf.broker_url = f"rediss://:{password}@{broker_host}:{broker_port}/{broker_db}?ssl_cert_reqs=CERT_REQUIRED"
app.conf.result_backend = f"rediss://:{password}@{broker_host}:{broker_port}/{results_db}?ssl_cert_reqs=CERT_REQUIRED"

def retry_on_exception(task_func, max_retries=3):
    @wraps(task_func)
    def wrapper(task_instance, *args, **kwargs):
        retries = 0
        while retries <= max_retries:
            try:
                return task_func(task_instance, *args, **kwargs)
            except Exception as e:
                retries += 1
                logger.error(f"Error in task {task_func.__name__} [Attempt {retries}/{max_retries}]: {e}\n{traceback.format_exc()}")
                if retries <= max_retries:
                    try:
                        # Use task_instance.retry to retry the task.
                        task_instance.retry(countdown=60)
                    except MaxRetriesExceededError:  # Make sure this exception is defined or imported.
                        logger.error(f"Max retries exceeded for task {task_func.__name__}")
                        break
                else:
                    break
    return wrapper

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
