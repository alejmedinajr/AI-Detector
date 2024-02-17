from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from openai import OpenAI
from pydantic import BaseModel

import config

import google.generativeai as genai

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

@app.get("/geminiResponse")
def geminiResponse(prompt):

    genai.configure(api_key=config.gemini_api_key)
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content(prompt)
    return {"GeminiResponse": response.text}
     
# class definition for what a user query object would have (used to define what the post function below requires as parameter)
class UserQuery(BaseModel):
    prompt: str

@app.post('/chatgpt_query/') # this function needs to be defined as post since it relies on form data from the react app
async def get_user_query(user_prompt: UserQuery): # this function needs to be asynchronous since it is waiting for the parameter from the react app
    print("loading") # small message just so the connection from react app is known to have succeeded
    client = OpenAI(api_key=config.chatgpt_api_key) # setting up the chatgpt client using the api key from the config file
    chat_completion = client.chat.completions.create( # chat completion allows for a response to a prompt to be made
        messages=[ # messages can be plural but for now only one message is being sent to the api
            {
                "role": "user", # standard role is user
                "content": user_prompt.prompt, # the prompt that is actually sent to the api 
            }
        ],
        model="gpt-4-1106-preview", # chatgpt model used
    )
    api_response = chat_completion.choices[0].message.content # limiting the response to only one for now
    print(api_response) # printing the response as another sign the connection and query to chatgpt worked (displays in terminal)
    return {"Response":api_response} # returning the response allows it to be used by the react-app