from celery import Celery
from loguru import logger
from celery.exceptions import MaxRetriesExceededError
from utils.config import UPSTASH_REDIS_REST_TOKEN, UPSTASH_REDIS_REST_URL
from functools import wraps

# cmd: celery -A crontab worker -l INFO
logger.info("Celery Start")
app = Celery('crontab')

# Configuration
broker_host = UPSTASH_REDIS_REST_URL
broker_port = 30535
broker_db = 0
results_db = 0
password = UPSTASH_REDIS_REST_TOKEN

app.conf.broker_url = f"rediss://:{password}@{broker_host}:{broker_port}/{broker_db}?ssl_cert_reqs=CERT_REQUIRED"
app.conf.result_backend = f"rediss://:{password}@{broker_host}:{broker_port}/{results_db}?ssl_cert_reqs=CERT_REQUIRED"

# Optional configuration, see the application user guide.
app.conf.update(
    result_expires=3600,
)


def retry_on_exception(task_func=None, max_retries=3, countdown=60):
    if task_func is None:
        return lambda func: retry_on_exception(func, max_retries=max_retries, countdown=countdown)

    @wraps(task_func)
    def wrapper(task_instance, *args, **kwargs):
        retries = 0
        while retries <= max_retries:
            try:
                return task_func(task_instance, *args, **kwargs)
            except Exception as e:
                retries += 1
                logger.error(f"Error executing task {task_func.__name__}: {e}")
                if retries <= max_retries:
                    try:
                        # use task_instance.retry to retry the task.
                        task_instance.retry(countdown=countdown)
                    except MaxRetriesExceededError:
                        logger.error(f"Max retries exceeded for task {task_func.__name__}")
                        break
                else:
                    break

    return wrapper


if __name__ == '__main__':
    app.start()
