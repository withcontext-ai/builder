class BaseStorageClient:
    def download(self, uri: str, path: str):
        raise NotImplementedError()


class GoogleCloudStorageClient(BaseStorageClient):
    def download(self, uri: str, path: str):
        import requests

        response = requests.get(uri)
        with open(path, "wb") as f:
            f.write(response.content)
