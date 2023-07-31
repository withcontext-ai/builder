import pytest
from fastapi.testclient import TestClient
from app import app  # Assuming your FastAPI application is named app
from models.base import Dataset, dataset_manager
import uuid

client = TestClient(app)


def test_get_dataset():
    """
    Tests the GET /v1/datasets/{id} endpoint.
    The endpoint is supposed to return a specific dataset given its id.
    """
    # Insert a dataset into the system for testing
    test_dataset = Dataset(name="Test Dataset", documents=[], id="test1")
    dataset_manager.save_dataset(test_dataset)

    response = client.get("/v1/datasets/test1")

    # The endpoint should return with a 200 OK status
    assert response.status_code == 200
    assert response.json() == {
        "data": [{"documents": [], "id": "test1"}],
        "message": "success",
        "status": 200,
    }


def test_get_datasets():
    """
    Tests the GET /v1/datasets endpoint.
    The endpoint is supposed to return all datasets.
    """
    response = client.get("/v1/datasets")

    # The endpoint should return with a 200 OK status
    assert response.status_code == 200
    # Not testing the data because it depends on the datasets in the system


def test_create_dataset():
    """
    Tests the POST /v1/datasets endpoint.
    The endpoint is supposed to create a new dataset.
    """
    response = client.post("/v1/datasets", json={"name": "Test Dataset 2"})

    # The endpoint should return with a 200 OK status and the id of the created dataset
    assert response.status_code == 200
    assert "id" in response.json()["data"]


def test_update_dataset():
    """
    Tests the PATCH /v1/datasets/{id} endpoint.
    The endpoint is supposed to update an existing dataset.
    """
    # Update the dataset created in the test_create_dataset test
    response = client.patch("/v1/datasets/test1", json={"name": "Updated Test Dataset"})

    # The endpoint should return with a 200 OK status
    assert response.status_code == 200


def test_delete_dataset():
    """
    Tests the DELETE /v1/datasets/{id} endpoint.
    The endpoint is supposed to delete an existing dataset.
    """
    # Delete the dataset created in the test_create_dataset test
    response = client.delete("/v1/datasets/test1")

    # The endpoint should return with a 200 OK status
    assert response.status_code == 200
