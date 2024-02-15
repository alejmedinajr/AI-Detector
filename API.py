from fastapi import FastAPI, Form, Body
from fastapi.middleware.cors import CORSMiddleware

from openai import OpenAI
from pydantic import BaseModel

import config


import pathlib
import textwrap

import google.generativeai as genai

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

@app.get("/geminiResponse")
def geminiResponse(prompt):

    genai.configure(api_key=config.gemini_api_key)
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content(prompt)
    return {"GeminiResponse": response.text}
     

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