from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path

from openai import OpenAI
from pydantic import BaseModel

import config

import google.generativeai as genai

import parsing

import database as db

UPLOAD_DIR = Path() / 'uploads'

# pip install python-multipart, openai, fastapi, uvicorn
app = FastAPI() # initializing new Restful API 

# code to prevent erros that occur when trying to make end to end connections where both ends are localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
  
# class definition for what a user query object would have (used to define what the post function below requires as parameter)
class UserQuery(BaseModel):
    prompt: str

@app.post('/form_submission/') # this function needs to be defined as post since it relies on form data from the react app
async def get_user_text(user_prompt: UserQuery): # this function needs to be asynchronous since it is waiting for the parameter from the react app
    print("loading") # small message just so the connection from react app is known to have succeeded
    api_responses = []

    api_responses.append(openaiResponse(user_prompt.prompt))
    api_responses.append(geminiResponse(user_prompt.prompt))
        
    print(api_responses)
    return {"Responses":api_responses} # returning the response allows it to be used by the react-app

@app.post('/uploadfile/') # this function needs to be defined as post since it relies on form data from the react app
async def uploadFile(file_uploads: list[UploadFile]):
    for file_upload in file_uploads:
        data = await file_upload.read()
        save = UPLOAD_DIR / file_upload.filename
        with open(save, 'wb') as f:
            f.write(data)
        
        text = parsing.convert_to_text(save)
        print(text)
        
        print("======OpenAI=======")
        openaiResponse(text)

        print("======Gemini=======")
        geminiResponse(text)

    return {"filenames": [f.filename for f in file_uploads]}

users_db = {}

class User(BaseModel):
    username: str
    password: str

@app.post("/signup")
async def sign_up(user: User):
    if user.username in users_db:
        raise HTTPException(status_code=400, detail="Username already exists")
    users_db[user.username] = user.password
    return {"message": "User signed up successfully"}

@app.post("/signin")
async def sign_in(user: User):
    if user.username not in users_db or users_db[user.username] != user.password:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return {"message": "User signed in successfully"}

def openaiResponse(prompt):
    client = OpenAI(api_key=config.chatgpt_api_key) # setting up the chatgpt client using the api key from the config file
    chat_completion = client.chat.completions.create( # chat completion allows for a response to a prompt to be made
        messages=[ # messages can be plural but for now only one message is being sent to the api
            {
                "role": "user", # standard role is user
                "content": prompt, # the prompt that is actually sent to the api 
            }
        ],
        model="gpt-4-1106-preview", # chatgpt model used
    )
    api_response = chat_completion.choices[0].message.content # limiting the response to only one for now
    print(api_response) # printing the response as another sign the connection and query to chatgpt worked (displays in terminal)
    return api_response

def geminiResponse(prompt):
    genai.configure(api_key=config.gemini_api_key)
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content(prompt)
    print(response.text)
    return response.text
   