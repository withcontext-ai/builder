import json
from utils.base import to_string


class PromptManagerMixin:
    @staticmethod
    def get_chain_output_urn(session_id: str, output_key: str):
        return f"output:{session_id}:{output_key}"

    @staticmethod
    def get_reload_chain_output_urn(session_id: str, output_key: str):
        return f"reload_output:{session_id}:{output_key}"

    def save_chain_output(self, session_id: str, output_key: str, output: str):
        # save reload output
        current_output = self.redis.get(
            self.get_chain_output_urn(session_id, output_key)
        )
        if current_output:
            self.redis.set(
                self.get_reload_chain_output_urn(session_id, output_key), current_output
            )
        # save current output
        self.redis.set(self.get_chain_output_urn(session_id, output_key), output)

    def get_chain_output(self, session_id: str, output_key: str):
        content = self.redis.get(self.get_chain_output_urn(session_id, output_key))
        return to_string(content)

    def reload_chain_output(self, session_id: str, output_key: str):
        reload_output = self.redis.get(
            self.get_reload_chain_output_urn(session_id, output_key)
        )
        if reload_output:
            self.redis.set(
                self.get_chain_output_urn(session_id, output_key), reload_output
            )

    def get_chain_memory_urn(self, session_id, output_key):
        return f"memory:{session_id}-{output_key}"

    def get_reload_chain_memory_urn(self, session_id, output_key):
        return f"reload_memory:{session_id}-{output_key}"

    def save_chain_memory(self, session_id: str, contents: list):
        def get_human_input(content):
            if "Human:" in content["input"]:
                return content["input"].split("Human:")[1].strip()
            return content["input"]

        # [{"input":"xxx", "output":"xxx", "chain_key": "xxx"}, ...]
        for content in contents:
            current_chain_memory = self.get_chain_memory(
                session_id, content["chain_key"]
            )
            self.redis.set(
                self.get_reload_chain_memory_urn(session_id, content["chain_key"]),
                json.dumps(current_chain_memory),
            )
            if current_chain_memory == []:
                current_chain_memory.append(
                    {"input": get_human_input(content), "output": content["output"]}
                )
            else:
                current_input = current_chain_memory[-1].get("input", "")
                # filt midium value in self checking chain
                if current_input == get_human_input(content):
                    current_chain_memory[-1]["output"] = content["output"]
                else:
                    current_chain_memory.append(
                        {"input": get_human_input(content), "output": content["output"]}
                    )
            self.redis.set(
                self.get_chain_memory_urn(session_id, content["chain_key"]),
                json.dumps(current_chain_memory),
            )

    def reload_chain_memory(self, session_id: str, output_key: str):
        reload_chain_memory = self.redis.get(
            self.get_reload_chain_memory_urn(session_id, output_key)
        )
        if reload_chain_memory:
            self.redis.set(
                self.get_chain_memory_urn(session_id, output_key), reload_chain_memory
            )

    def get_chain_memory(self, session_id: str, output_key: str):
        current_chain_memory = self.redis.get(
            self.get_chain_memory_urn(session_id, output_key)
        )
        if current_chain_memory:
            return json.loads(current_chain_memory)
        return []

    def get_chain_summrize_memory_urn(self, session_id, output_key):
        return f"summrize_memory:{session_id}-{output_key}"

    def save_chain_summrize_memory(self, session_id: str, contents: list):
        # TODO map-reduce all memory
        raise NotImplementedError
