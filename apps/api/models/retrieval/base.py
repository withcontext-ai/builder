import pinecone
from models.base import dataset_manager
from utils.config import PINECONE_ENVIRONMENT, PINECONE_API_KEY
from utils.StorageClient import GoogleCloudStorageClient

from .models.PDF import PDFRetrieverMixin


class Retriever(PDFRetrieverMixin):
    def __init__(self, dataset_ids: str, storage_client=GoogleCloudStorageClient()):
        self.datasets = []
        pinecone.init(api_key=PINECONE_API_KEY, environment=PINECONE_ENVIRONMENT)
        for dataset_id in dataset_ids:
            dataset = dataset_manager.get_datasets(dataset_id)
            assert len(dataset) == 1, "internal error about dataset"
            dataset = dataset[0]
            self.datasets.append(dataset)
        self.storage_client = storage_client

    def query(self, query: str, index_type: str):
        if index_type == "pdf":
            return self.query_from_pdf(query)
        raise Exception("Index type not supported")
