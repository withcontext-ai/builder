from models.controller import model_manager

from loguru import logger

models = model_manager.get_models()

print(f"Found {len(models)} models")

for index, model in enumerate(models):
    try:
        logger.info(f"index: {index}")
        logger.info(f"updating model {model.id}")
        updated_data = model.dict()
        logger.info(f"updated_data: {updated_data}")
        updated_data.pop("id")
        model_manager.update_model(model.id, update_data=updated_data)
    except Exception as e:
        logger.error(f"Error updating model {model.id}: {e}")
