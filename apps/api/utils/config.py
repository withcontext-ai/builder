import os
from dotenv import load_dotenv

# 加载.env文件中的环境变量
load_dotenv()

DATABASE_URL = os.environ.get("DATABASE_URL")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
PINECONE_ENVIRONMENT = os.environ.get("PINECONE_ENVIRONMENT")
PINECONE_API_KEY = os.environ.get("PINECONE_API_KEY")
CONVERSION_CHAIN = "conversation_chain"
CONVERSIONAL_RETRIEVAL_QA_CHAIN = "conversational_retrieval_qa_chain"
FACE_TO_AI_ENDPOINT = os.environ.get("FACE_TO_AI_ENDPOINT")
FACE_TO_CLIENT_ID = os.environ.get("FACE_TO_CLIENT_ID")
FACE_TO_CLIENT_SECRET = os.environ.get("FACE_TO_CLIENT_SECRET")
WEBHOOK_KEY = os.environ.get("WEBHOOK_KEY")
WEBHOOK_ENDPOINT = os.environ.get("WEBHOOK_ENDPOINT")
BACKEND_URL = os.environ.get("BACKEND_URL")
GRAPH_SIGNAL_API_KEY = os.environ.get("GRAPH_SIGNAL_API_KEY")
LOGSNAG_API_KEY = os.environ.get("LOGSNAG_API_KEY")
UPSTASH_REDIS_REST_URL = os.getenv("UPSTASH_REDIS_REST_URL")
UPSTASH_REDIS_REST_TOKEN = os.getenv("UPSTASH_REDIS_REST_TOKEN")
AZURE_BASE_URL = "https://context-ai.openai.azure.com"
AZURE_DEPLOYMENT_NAME = "gpt-35-turbo-0613"
AZURE_API_VERSION = "2023-03-15-preview"
AZURE_API_KEY = os.environ.get("AZURE_API_KEY")
