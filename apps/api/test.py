from models.controller import dataset_manager
from loguru import logger
datasets = dataset_manager.get_datasets()
print(f"Found {len(datasets)} datasets")

for dataset in datasets:
    try:
        print(f"updating dataset {dataset.id}")
        updated_data = dataset.dict()
        print(f"updated_data: {updated_data}")
        updated_data.pop("id")
        dataset_manager.update_dataset(dataset.id, update_data=updated_data)
    except Exception as e:
        logger.error(f"Error updating dataset {dataset.id}: {e}")