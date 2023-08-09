import os
import hashlib
import base64

password = "build-eli"  # 示例密码
salt = os.urandom(16)
key = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 100000)
base64_string = base64.b64encode(key).decode("utf-8")

print(base64_string)
