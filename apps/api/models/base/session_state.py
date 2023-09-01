import sys
from typing import Union

from loguru import logger
from pydantic import BaseModel
from sqlalchemy import Column, String

from .base import Base, BaseManager
from models.workflow import Workflow


class SessionState(BaseModel):
    id: str
    model_id: str


class SessionStateTable(Base):
    __tablename__ = "session_state"

    id = Column(String, primary_key=True)
    model_id = Column(String)


class SessionStateManager(BaseManager):
    def __init__(self) -> None:
        super().__init__()
        self.table = self.get_table("session_state")
        self.cache = {}
        self.workflow_cache = {}

    @BaseManager.db_session
    def save_session_state(self, session_id: str, model_id: str):
        logger.info(f"Saving session state {session_id}")
        return self.table.insert().values(id=session_id, model_id=model_id)

    @BaseManager.db_session
    def update_session_state(self, session_id: str, model_id: str):
        logger.info(f"Updating session state {session_id}")
        return (
            self.table.update()
            .where(self.table.c.id == session_id)
            .values(model_id=model_id)
        )

    @BaseManager.db_session
    def delete_session_state(self, session_id: str):
        logger.info(f"Deleting session state {session_id}")
        return self.table.delete().where(self.table.c.id == session_id)

    @BaseManager.db_session
    def _get_session_state(self, session_id: str = None):
        if session_id:
            logger.info(f"Getting session state {session_id}")
            return self.table.select().where(self.table.c.id == session_id)
        else:
            logger.info("Getting all session states")
            return self.table.select()

    def get_model_id(self, session_id: str) -> Union[SessionState, list[SessionState]]:
        if session_id in self.cache:
            return self.cache[session_id]
        session_state_info = self._get_session_state(session_id)
        if session_state_info is None:
            return None
        session_state_info = session_state_info.fetchall()
        session_states = []
        for session_state in session_state_info:
            try:
                session_states.append(SessionState(**session_state._mapping))
            except Exception as e:
                logger.error(
                    f"Error when parsing session state {session_state._mapping['id']}: {e}"
                )
        if len(session_states) == 0:
            raise Exception("Session state not found")
        self.cache[session_id] = session_states[0].model_id
        return session_states[0].model_id

    def save_workflow(self, workflow, session_id):
        self.workflow_cache[session_id] = workflow

    def get_workflow(self, session_id, model):
        if session_id in self.workflow_cache:
            return self.workflow_cache[session_id]
        elif model is None:
            return None
        else:
            workflow = Workflow(model=model, session_id=session_id)
            self.save_workflow(workflow, session_id)
            return workflow


session_state_manager = SessionStateManager()
