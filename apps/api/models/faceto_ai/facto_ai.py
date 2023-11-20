import json
from models.workflow.callbacks import TokenCostProcess
from typing import List
import requests
from loguru import logger
from utils import (
    BACKEND_URL,
    FACE_TO_AI_ENDPOINT,
    FACE_TO_CLIENT_ID,
    FACE_TO_CLIENT_SECRET,
    WEBHOOK_KEY,
)
from pydantic import BaseModel
from .webhook import WebhookHandler
from utils import (
    UPSTASH_REDIS_REST_PORT,
    UPSTASH_REDIS_REST_TOKEN,
    UPSTASH_REDIS_REST_URL,
    WEBHOOK_ENDPOINT,
)
import redis
import time
from langchain.schema import HumanMessage, AIMessage, get_buffer_string


class FaceToAiManager:
    url: FACE_TO_AI_ENDPOINT
    client_id: FACE_TO_CLIENT_ID
    client_secret: FACE_TO_CLIENT_SECRET

    @classmethod
    def get_token(cls):
        url = FACE_TO_AI_ENDPOINT + "/v1/auth"
        payload = {
            "client_id": FACE_TO_CLIENT_ID,
            "client_secret": FACE_TO_CLIENT_SECRET,
            "grant_type": "authorization_code",
            "code": "faceto-ai-code",
        }
        headers = {"Content-Type": "application/json"}
        response = requests.request(
            "POST", url, headers=headers, data=json.dumps(payload)
        )
        logger.info(response.json())
        return response.json()["access_token"]

    @classmethod
    def get_room_link(cls, opening_remarks: str, session_id: str, model_id: str):
        token = cls.get_token()
        url = FACE_TO_AI_ENDPOINT + "/v1/room/link"
        payload = {
            "config": {
                "greeting": opening_remarks,
            },
            "chatapi": {
                "api": f"{BACKEND_URL}/v1/chat/completions/video/{session_id}",
                "key": WEBHOOK_KEY,
            },
            "webhook": {
                "api": f"{BACKEND_URL}/v1/chat/completions/video/{session_id}/webhook",
                "key": WEBHOOK_KEY,
            },
        }
        mock_voices = {
            "24a683074e7c4c6f881b747296aabbae": "8QAi78THegBm75BpJ4f5",
            "e8c0e058e2944722be0fdad02d12d2be": "nF2FxJ50Kt8EKglc6fVP",
            "30048c219653405c9496fed8d6b581f7": "sKMbqHOYhThlmuvzrOPf",
        }
        if model_id in mock_voices:
            voice_id = mock_voices[model_id]
        else:
            voice_id = None
        if voice_id:
            payload["config"]["voice_id"] = voice_id
        logger.info(f"payload: {payload}")
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
        }
        response = requests.request(
            "POST", url, headers=headers, data=json.dumps(payload)
        )

        room_name = response.json()["name"]
        cls.save_room_name(session_id, room_name)
        return response.json()["link"]

    @classmethod
    def save_room_name(self, session_id, name):
        redis_client = redis.Redis(
            host=UPSTASH_REDIS_REST_URL,
            port=UPSTASH_REDIS_REST_PORT,
            password=UPSTASH_REDIS_REST_TOKEN,
            ssl=True,
        )
        redis_client.set(f"session_id_to_room_link:{session_id}", name)

    @classmethod
    def get_room_name(self, session_id):
        redis_client = redis.Redis(
            host=UPSTASH_REDIS_REST_URL,
            port=UPSTASH_REDIS_REST_PORT,
            password=UPSTASH_REDIS_REST_TOKEN,
            ssl=True,
        )
        return redis_client.get(f"session_id_to_room_link:{session_id}").decode("utf-8")

    @classmethod
    def delete_room_name(self, session_id):
        redis_client = redis.Redis(
            host=UPSTASH_REDIS_REST_URL,
            port=UPSTASH_REDIS_REST_PORT,
            password=UPSTASH_REDIS_REST_TOKEN,
            ssl=True,
        )
        redis_client.delete(f"session_id_to_room_link:{session_id}")

    @classmethod
    def get_room_info(cls, room_id):
        token = cls.get_token()
        url = FACE_TO_AI_ENDPOINT + "/v1/room/transcript"
        payload = {"name": room_id}
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
        }
        response = requests.request(
            "POST", url, headers=headers, data=json.dumps(payload)
        )
        try:
            response.raise_for_status()
            res = response.json()
            url = res.get("vod", {}).get("url")
            status = res.get("vod", {}).get("status")
            messages = []
            message_list = res.get("transcript", {}).get("list", [])
            for message in message_list:
                if message.get("is_bot"):
                    messages.append(
                        {
                            "createAt": message.get("timestamp"),
                            "content": message.get("text"),
                            "rold": "assistant",
                        }
                    )
                else:
                    messages.append(
                        {
                            "createAt": message.get("timestamp"),
                            "content": message.get("text"),
                            "rold": "user",
                        }
                    )
            return url, status, messages
        except Exception as e:
            logger.error(e)
            logger.error(response.text)
            raise e


class FaceToAiMixin(BaseModel):
    is_face_to_ai_service: bool = False
    session_id: str = ""
    model_id: str = ""
    cost_content: TokenCostProcess = TokenCostProcess()
    io_traces: List[str] = []
    error_flags: List[Exception] = []
    start_time: float = 0

    class Config:
        arbitrary_types_allowed = True

    def switch_to_face_to_ai(self, final_message: str):
        link = FaceToAiManager.get_room_link(
            final_message, self.session_id, self.model_id
        )
        webhook_handler = WebhookHandler()
        webhook_handler.create_video_room_link(self.session_id, link)

    def switch_to_context_builder(self, final_message: str):
        self.send_done_message_to_builder(final_message)

    def send_face_to_ai_info_to_builder(self):
        payload = {
            "type": "message.add",
            "data": {
                "session_id": self.session_id,
                "message_type": "conversation.record",
                "message_id": FaceToAiManager.get_room_name(self.session_id),
            },
        }
        url = WEBHOOK_ENDPOINT
        headers = {"Content-Type": "application/json"}
        response = requests.request(
            "POST", url, headers=headers, data=json.dumps(payload)
        )
        try:
            response.raise_for_status()
        except Exception as e:
            logger.error(e)
            logger.error(response.text)

    def send_done_message_to_builder(self, final_message):
        # TODO latency total_tokens raw
        end_time = time.time()
        payload = {
            "type": "message.add",
            "data": {
                "session_id": self.session_id,
                "message_type": "chat",
                "message_data": {
                    "answer": final_message,
                    "latency": end_time - self.start_time,
                    "total_tokens": self.cost_content.total_tokens,
                    "raw": self.io_traces,
                },
            },
        }
        url = WEBHOOK_ENDPOINT
        headers = {"Content-Type": "application/json"}
        response = requests.request(
            "POST", url, headers=headers, data=json.dumps(payload)
        )
        try:
            response.raise_for_status()
        except Exception as e:
            logger.error(e)
            logger.error(response.text)

    def send_done_message_to_face_to_ai(self):
        room_name = FaceToAiManager.get_room_name(self.session_id)
        url = FACE_TO_AI_ENDPOINT + f"/v1/room/{room_name}/event"
        payload = {"event": {"event": "CloseRoom", "status": 1}}
        token = FaceToAiManager.get_token()
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
        }
        response = requests.request(
            "POST", url, headers=headers, data=json.dumps(payload)
        )
        try:
            response.raise_for_status()
        except Exception as e:
            logger.error(e)
            logger.error(response.text)
