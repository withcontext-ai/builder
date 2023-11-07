import openai

response = openai.completions.create(
    model="text-davinci-003",
    prompt="Translate the following English text to French: 'Hello, how are you?'",
    response_format={"type": "json_object"},
)
