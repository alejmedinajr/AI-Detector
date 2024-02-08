from fastapi import FastAPI
from openai import OpenAI
import config

app = FastAPI()
@app.get("/")
def first_example():
	return {"GFG Example": "FastAPI"}

@app.get("/chatResponse")
def chatGPTResponse(prompt):
    # API key no longer functioning. Need to generate new one.
    #
    client = OpenAI(api_key=config.chatgpt_api_key)
    chat_completion = client.chat.completions.create(
    messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
        model="gpt-4-1106-preview",
    )
    chatResponse = chat_completion.choices[0].message.content
    return {"ChatResponse": chatResponse}