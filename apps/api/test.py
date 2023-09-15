id = "95b820d2a268493ab5fb8685ea2237b3-wF6VSzBPhpxr-0"

import pinecone
from utils import PINECONE_API_KEY, PINECONE_ENVIRONMENT

pinecone.init(api_key=PINECONE_API_KEY, environment=PINECONE_ENVIRONMENT)
index = pinecone.Index(index_name="context-prod")
res = index.fetch(ids=[id], namespace="withcontext")
print(res)
