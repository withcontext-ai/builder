from functools import wraps

from sqlalchemy import MetaData, Table, create_engine
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from utils.config import DATABASE_URL
from sqlalchemy.pool import QueuePool

Base = declarative_base()


class BaseManager:
    engine = create_engine(
        DATABASE_URL,
        poolclass=QueuePool,
        pool_size=10,
        max_overflow=20,
        pool_recycle=300,
        pool_pre_ping=True,
    )
    metadata = MetaData()
    metadata.reflect(bind=engine)
    Session = sessionmaker(bind=engine)

    @staticmethod
    def db_session(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            session = BaseManager.Session()
            try:
                query = func(*args, **kwargs)
                if query is None:
                    return
                if isinstance(query, list):
                    results = [session.execute(q) for q in query]
                else:
                    results = session.execute(query)
                session.commit()
                return results
            except SQLAlchemyError as e:
                session.rollback()
                raise e
            finally:
                session.close()

        return wrapper

    def get_table(self, table_name: str) -> Table:
        return self.metadata.tables.get(table_name, None)
