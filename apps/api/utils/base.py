def to_string(content):
    if isinstance(content, str):
        return content
    elif isinstance(content, bytes):
        return content.decode()
    else:
        raise ValueError(f"type {type(content)} is not supported")
