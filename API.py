from fastapi import FastAPI, Form, Body
from fastapi.middleware.cors import CORSMiddleware

from openai import OpenAI
from pydantic import BaseModel

import config

# pip install python-multipart, openai, fastapi, uvicorn
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

class UserQuery(BaseModel):
    prompt: str

@app.post('/chatgpt_query/')
async def get_user_query(user_prompt: UserQuery):
    print("here")
    #user_prompt = await user_query
    client = OpenAI(api_key=config.chatgpt_api_key)
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": user_prompt.prompt,
            }
        ],
        model="gpt-4-1106-preview",
    )
    api_response = chat_completion.choices[0].message.content
    print(api_response)
    return {"Response":api_response}