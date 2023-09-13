# -*- coding: utf-8 -*-
print("=====================================")
from models.workflow import TargetedChain, TargetedChainStatus
from langchain.chat_models import ChatOpenAI
from langchain.schema import HumanMessage, AIMessage
from langchain.prompts import PromptTemplate
import asyncio

import csv

base_system_prompt = "目标是充分获取到候选人的[{abilities}]的评估。"
base_check_prompt = "请判断这段对话是否达到了目标，如果达到目标，仅输出“Yes”,不要多说别的。如果没有达到目标，为了继续完成目标，请结合这段对话，继续提出一个问题。请确保没有达到目标的情况，你的问题一定是为了达成目标，不要偏离目标。"


data = []
print("running")
with open("data/first.csv", mode="r", encoding="utf-8") as csv_file:
    csv_reader = csv.DictReader(csv_file)
    for row in csv_reader:
        try:
            print("=====================================")
            print(row["考察能力"])
            abilities = row["考察能力"]
            system_prompt = base_system_prompt.replace("[{abilities}]", abilities)
            chain = TargetedChain(
                system_prompt=PromptTemplate(
                    template=system_prompt, input_variables=[]
                ),
                check_prompt=PromptTemplate(
                    template=base_check_prompt, input_variables=[]
                ),
                llm=ChatOpenAI(model="gpt-4"),
                suffix="你需要优先输出的内容是",
            )
            chain.process = TargetedChainStatus.RUNNING
            res = asyncio.run(
                chain.acall(
                    inputs={
                        "chat_history": [
                            AIMessage(content=row["面试题目"]),
                            HumanMessage(content=row["候选人回答内容"]),
                        ]
                    }
                )
            )
            row["answer"] = res
            print(res)
            data.append(row)
        except:
            print(f"err line: {row}")


with open("data/first.csv", mode="w", encoding="utf-8") as csv_file:
    write = csv.DictWriter(csv_file, fieldnames=data[0].keys())
    write.writeheader()
    write.writerows(data)
