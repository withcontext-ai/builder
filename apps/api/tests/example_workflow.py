from models.base import session_state_manager

import asyncio

from routers.chat import send_message
from langchain.schema import HumanMessage, AIMessage
import uuid


async def test_chat():
    session_id = uuid.uuid4().hex
    session_state_manager.save_session_state(
        session_id=session_id, model_id="test_model_2"
    )
    async for response in send_message(
        [
            HumanMessage(content="昌平区政务服务中心地址"),
            AIMessage(content="昌平区政务服务中心的地址是北京市昌平区龙水路22号院14号楼2层。"),
            HumanMessage(content="昌平区政务服务中心电话"),
            AIMessage(content="昌平区政务服务中心的咨询电话是69740926。"),
            HumanMessage(content="我们之前聊了什么？"),
        ],
        session_id,
    ):
        print(response)


asyncio.run(test_chat())
