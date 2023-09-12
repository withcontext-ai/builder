from utils import PINECONE_API_KEY, PINECONE_ENVIRONMENT

import pinecone

pinecone.init(api_key=PINECONE_API_KEY, environment=PINECONE_ENVIRONMENT)
index = pinecone.Index("context-prod")

id = "c18986842ef14154ae55041313b57b99-https://storage.googleapis.com/context-builder/public-tmp/Jr1UEEQj7Bpo.pdf-3"

res = index.fetch(ids=[id], namespace="withcontext")

print(res)
