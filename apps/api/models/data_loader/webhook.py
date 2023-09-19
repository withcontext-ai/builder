from loguru import logger
from models.base import DatasetStatusWebhookRequest
from tenacity import after_log, retry, stop_after_attempt, wait_fixed
from utils.config import WEBHOOK_ENDPOINT
import requests


class WebhookHandler:
    def __init__(self) -> None:
        self.target_url = (
            WEBHOOK_ENDPOINT
            if WEBHOOK_ENDPOINT is not None
            else "https://build.withcontext.ai/api/webhook/chat"
        )

    def get_annotated_data(self, model_id):
        logger.info(f"Getting annotated data {model_id}")
        payload = DatasetStatusWebhookRequest(
            type="annotations.get", data={"api_model_ids": [model_id]}
        )
        headers = {"Content-Type": "application/json"}
        response = requests.post(self.target_url, json=payload.dict(), headers=headers)
        try:
            response.raise_for_status()
        except requests.exceptions.HTTPError as e:
            logger.error(e)
            logger.error(response.text)
        return response.json().get("data", [])
