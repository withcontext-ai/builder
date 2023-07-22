import pinecone
from models.dataset import dataset_manager
from utils.config import PIPECONE_API_KEY, PIPECONE_ENVIRONMENT
from utils.StorageClient import GoogleCloudStorageClient

from .models.PDF import PDFRetrieverMixin


class Retriever(PDFRetrieverMixin):
    def __init__(
        self, options: dict, dataset_id: str, storage_client=GoogleCloudStorageClient()
    ):
        self.options = options
        pinecone.init(api_key=PIPECONE_API_KEY, environment=PIPECONE_ENVIRONMENT)
        dataset = dataset_manager.get_datasets(dataset_id)
        assert len(dataset) == 1, "internal error about dataset"
        dataset = dataset[0]
        self.dataset = dataset
        self.storage_client = storage_client

    def query(self, query: str, index_type: str):
        if index_type == "pdf":
            return self.query_from_pdf(query)
        raise Exception("Index type not supported")
