import asyncio
from typing import Optional, Union

from pydantic import BaseModel
from sqlalchemy import JSON, Column, String

from ..workflow import Workflow
from .base import Base, BaseManager


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

    @BaseManager.db_session
    def save_session_state(self, session_id: str, model_id: str):
        return self.table.insert().values(id=session_id, model_id=model_id)

    @BaseManager.db_session
    def update_session_state(self, session_id: str, model_id: str):
        return (
            self.table.update()
            .where(self.table.c.id == session_id)
            .values(model_id=model_id)
        )

    @BaseManager.db_session
    def delete_session_state(self, session_id: str):
        return self.table.delete().where(self.table.c.id == session_id)

    @BaseManager.db_session
    def _get_session_state(self, session_id: str = None):
        if session_id:
            return self.table.select().where(self.table.c.id == session_id)
        else:
            return self.table.select()

    def get_model_id(self, session_id: str) -> Union[SessionState, list[SessionState]]:
        session_state_info = self._get_session_state(session_id)
        if session_state_info is None:
            return None
        session_state_info = session_state_info.fetchall()
        session_states = []
        for session_state in session_state_info:
            session_states.append(SessionState(**session_state._mapping))
        if len(session_states) == 0:
            raise Exception("Session state not found")
        return session_states[0].model_id


session_state_manager = SessionStateManager()
