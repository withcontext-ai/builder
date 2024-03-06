from typing import Union

from models.controller import model_manager
from loguru import logger
from models.base import BaseManager, Dataset, Model, SessionState
from models.workflow import Workflow
from utils.config import (
    UPSTASH_REDIS_REST_TOKEN,
    UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_PORT,
)
import redis
import json

from models.prompt_manager.manager import PromptManagerMixin


class SessionStateManager(BaseManager, PromptManagerMixin):
    def __init__(self) -> None:
        super().__init__()
        self.table = self.get_table("session_state")
        self.redis = redis.Redis(
            host=UPSTASH_REDIS_REST_URL,
            password=UPSTASH_REDIS_REST_TOKEN,
            port=UPSTASH_REDIS_REST_PORT,
            ssl=True,
        )

    @staticmethod
    def get_session_state_urn(session_id: str):
        return f"session:{session_id}"

    @staticmethod
    def get_reload_session_state_urn(session_id: str):
        return f"reload_session:{session_id}"

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

    @BaseManager.db_session
    def _get_session_id(self, model_id: str):
        logger.info(f"Getting session id {model_id}")
        return self.table.select().where(self.table.c.model_id == model_id)

    def get_model_id(self, session_id: str) -> Union[SessionState, list[SessionState]]:
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
        return session_states[0].model_id

    def save_workflow_status(self, session_id, workflow):
        logger.info(f"Saving workflow status {session_id}")
        for chain in workflow.context.chains:
            if type(chain) in workflow.context.state_dependent_chains:
                self.save_chain_status(
                    session_id,
                    chain.output_keys[0],
                    chain.process,
                    chain.max_retries,
                )
                self.save_chain_output(
                    session_id,
                    chain.output_keys[0],
                    workflow.context.known_values[chain.output_keys[0]],
                )
        self.save_chain_memory(session_id, workflow.context.current_chain_io)
        self.save_workflow_step(session_id, workflow.context.current_chain)

    def get_workflow(self, session_id, model, disconnect_event):
        if model is None:
            model_id = self.get_model_id(session_id)
            if model_id is None:
                raise Exception("Session state not found")
            model = model_manager.get_models(model_id)[0]
        workflow = Workflow(
            model=model, session_id=session_id, disconnect_event=disconnect_event
        )
        # get chain status
        for chain in workflow.context.chains:
            if type(chain) in workflow.context.state_dependent_chains:
                tup = self.get_chain_status(session_id, chain.output_keys[0])
                if tup is not None:
                    chain.process = tup[0]
                    chain.max_retries = tup[1]
                output = self.get_chain_output(session_id, chain.output_keys[0])
                if output is None:
                    output = ""
                workflow.outputs[chain.output_keys[0]] = output
        # get chain memory
        # memory example: {"tool_%d_dialog": [{"input": "human input", "output": "tool output"}]}
        workflow.current_memory = {}
        for chain in workflow.context.chains:
            workflow.current_memory[chain.dialog_key] = self.get_chain_memory(
                session_id, chain.output_keys[0]
            )
        # get workflow step
        workflow.context.current_chain = self.get_workflow_step(session_id)
        workflow.context.session_id = session_id
        workflow.context.model_id = model.id
        return workflow

    def delete_session_state_cache_via_model(self, model_id):
        session_info = self._get_session_id(model_id)
        if session_info is None:
            return None
        session_info = session_info.fetchall()
        session_ids = []
        for session in session_info:
            try:
                session_ids.append(SessionState(**session._mapping).id)
            except Exception as e:
                logger.error(
                    f"Error when parsing session state {session._mapping['id']}: {e}"
                )
        for session_id in session_ids:
            self.redis.delete(self.get_session_state_urn(session_id))

    def save_chain_status(self, session_id, output_key, status, max_retries):
        current_status = self.redis.get(self.get_session_state_urn(session_id))

        if current_status:
            current_status = json.loads(current_status)
            # save reload status
            self.redis.set(
                self.get_reload_session_state_urn(session_id),
                json.dumps(current_status),
            )

            # save current status
            current_status[output_key] = (status, max_retries)
            self.redis.set(
                self.get_session_state_urn(session_id),
                json.dumps(current_status),
            )
        else:
            self.redis.set(
                self.get_session_state_urn(session_id),
                json.dumps({output_key: (status, max_retries)}),
            )

    def reload_chain_status(self, sesion_id):
        reload_status = self.redis.get(self.get_reload_session_state_urn(sesion_id))
        if reload_status:
            self.redis.set(
                self.get_session_state_urn(sesion_id),
                reload_status,
            )

    def get_chain_status(self, session_id, output_key):
        current_status = self.redis.get(self.get_session_state_urn(session_id))
        if current_status:
            current_status = json.loads(current_status)
            return current_status.get(output_key)
        return None

    def get_workflow_step(self, session_id):
        current_step = self.redis.get(f"workflow_step:{session_id}")
        if current_step is None:
            return 0
        return int(current_step)

    def get_workflow_step_urn(self, session_id):
        return f"workflow_step:{session_id}"

    def get_reload_workflow_step_urn(self, session_id):
        return f"reload_workflow_step:{session_id}"

    def save_workflow_step(self, session_id, current_step):
        reload_step = self.redis.get(self.get_workflow_step_urn(session_id))
        if reload_step:
            self.redis.set(self.get_reload_workflow_step_urn(session_id), reload_step)
        self.redis.set(self.get_workflow_step_urn(session_id), current_step)

    def reload_workflow_step(self, session_id):
        reload_step = self.redis.get(self.get_reload_workflow_step_urn(session_id))
        if reload_step:
            self.redis.set(self.get_workflow_step_urn(session_id), reload_step)

    def get_current_message_id(self, session_id):
        current_message_id = self.redis.get(f"current_message_id:{session_id}")
        if current_message_id is None:
            return current_message_id
        return current_message_id.decode("utf-8")

    def save_current_message_id(self, session_id, message_id):
        self.redis.set(f"current_message_id:{session_id}", message_id)

    def reload_session(self, session_id):
        workflow = self.get_workflow(session_id, None, None)
        self.reload_chain_status(session_id)
        for chain in workflow.context.chains:
            if type(chain) in workflow.context.state_dependent_chains:
                self.reload_chain_output(session_id, chain.output_keys[0])
            self.reload_chain_memory(session_id, chain.output_keys[0])
            self.reload_workflow_step(session_id)


session_state_manager = SessionStateManager()
