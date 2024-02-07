from fastapi import FastAPI
from openai import OpenAI
app = FastAPI()
@app.get("/")
def first_example():
	return {"GFG Example": "FastAPI"}

@app.get("/chatResponse")
def chatGPTResponse(prompt):

    client = OpenAI(api_key="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")
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