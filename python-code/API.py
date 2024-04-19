from fastapi import FastAPI, UploadFile, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from openai import OpenAI
from pydantic import BaseModel
import config
import os
import google.generativeai as genai
import parsing
import models
import uvicorn
from metrics import METRICS

app = FastAPI() # initializing new Restful API 

# code to prevent errors that occur when trying to make end to end connections where both ends are localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
  
# class definition for what a user query object would have (used to define what the post function below requires as parameter)
class FormQuery(BaseModel):
    prompt: str
    submission: str

@app.post('/form_submission/') # this function needs to be defined as post since it relies on form data from the react app
async def get_user_text(form: FormQuery): # this function needs to be asynchronous since it is waiting for the parameter from the react app
    print("loading") # small message just so the connection from react app is known to have succeeded
    api_responses = []
    #if not isinstance(form.prompt, str): form.prompt = parsing.convert_to_text(save)

    api_responses.append(openaiResponse(form.prompt))
    api_responses.append(geminiResponse(form.prompt))

    print(api_responses)
    return {"Responses": api_responses} # returning the response allows it to be used by the react-app

@app.post('/generate_report/') # this function needs to be defined as post since it relies on form data from the react app
async def get_user_text(form: FormQuery): # this function needs to be asynchronous since it is waiting for the parameter from the react app
    print("loading") # small message just so the connection from react app is known to have succeeded
    
    report = generate_report(form.prompt, form.submission) # calling helper function on the data that was sent to this endpoint
    print(report) # printing the report just to make sure it was made correctly
    model_path = 'leetcode_model.pkl' # specifying path for the machine learning model (could use better name)
    vectorizer_path = 'vectorizer.pkl' # specifying path for vectorizer for the ml model
    try: model,vectorizer = models.load_model(model_path, vectorizer_path) # attempt to load the model
    except: # if the model cannot be loaded, assume it has not been made, make the model.
        train_model() # kickoff to call the actual model training function from models.py
        model,vectorizer = models.load_model(model_path, vectorizer_path) # store the model and vectorizer so it can be used for unseen data

    # labeling the prediction made by the model
    if models.predict_unseen_data(model, vectorizer, form.submission) == 1: ml_prediction = 'AI-Generated' 
    else: ml_prediction = 'Human-Generated' 

    return {"ML": ml_prediction, "Report": report} # returning the model decision and the full report so both can be used in the generate report page

@app.post('/update_training_data/')
async def get_user_text(request: Request): # request simply has a submission in the form of text (string) and a numerical value that specifies the correct label for the submission
    print("Loading") # loading message to know the endpoints are connected and the call was successful

    data = await request.json() 

    report_submission = data.get('submission') # store the report's student submission (not necessary but cleaner in my opinion)
    feedback = data.get('feedback') # store the feedback (correct label) for the submission (also not necessary but still cleaner since data is awaited)

    # make sure both components were successfully retrieved
    print("Data:", report_submission) 
    print("Label:", feedback)

    # TODO: Implement the ability to add the new data to the training data

    return {"Response": "Training data updated"} # message to send to the react app (to know everything went smoothly)

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

def generate_report(prompt, submission, num_iterations=1):
    for _ in range(num_iterations): # repeat this step multiple times to get a variety of ai responses (default value is 1 for testing)
        chatgpt_response, gemini_response = openaiResponse(prompt), geminiResponse(prompt) # get both ai api's responses

        for model, response in [('ChatGPT', chatgpt_response), ('Gemini', gemini_response)]: # each model needs to have the metrics because both are used in the report
            # cosine similarity metrics
            cosine_sim = parsing.cosine_comparison(submission, response)
            METRICS[model]['Cosine Similarity'] = max(METRICS[model]['Cosine Similarity'], cosine_sim)

            # fuzzy wuzzy metrics
            _,fuzzy_metrics = parsing.fuzz_comparison(submission, response)
            METRICS[model]['Ratio Similarity'] = max(METRICS[model]['Ratio Similarity'], fuzzy_metrics[0])
            METRICS[model]['Partial Ratio Similarity'] = max(METRICS[model]['Partial Ratio Similarity'], fuzzy_metrics[1])
            METRICS[model]['Token Sort Ratio Similarity'] = max(METRICS[model]['Token Sort Ratio Similarity'], fuzzy_metrics[2])
            METRICS[model]['Token Set Ratio Similarity'] = max(METRICS[model]['Token Set Ratio Similarity'], fuzzy_metrics[3])

            # metrics for sequence comparison
            _,sequence_metrics = parsing.sequence_comparison(submission, response)
            METRICS[model]['Sequence Ratio Similarity'] = max(METRICS[model]['Sequence Ratio Similarity'], sequence_metrics[0])
            METRICS[model]['Sequence Quick Ratio Similarity'] = max(METRICS[model]['Sequence Quick Ratio Similarity'], sequence_metrics[1])
            METRICS[model]['Sequence Real Quick Ratio Similarity'] = max(METRICS[model]['Sequence Real Quick Ratio Similarity'], sequence_metrics[2])

            '''
            New metrics that could be introduced, but need to be implemented correctly/more efficiently
        
            wu_palmer_sim = parsing.wu_palmer_comparison(submission, response)
            METRICS[model]['Wu-Palmer Similarity'] = max(METRICS[model]['Wu-Palmer Similarity'], wu_palmer_sim)

            path_sim = parsing.path_similarity(submission, response)
            METRICS[model]['Path Similarity'] = max(METRICS[model]['Path Similarity'], path_sim)

            wmd_sim = parsing.word_movers_comparison(submission, response)
            METRICS[model]['Word Mover\'s Distance'] = max(METRICS[model]['Word Mover\'s Distance'], wmd_sim)

            '''

            # synctactic similarity metrics
            syntactic_sim = parsing.syntactic_comparison(submission, response) 
            METRICS[model]['Syntactic Similarity'] = max(METRICS[model]['Syntactic Similarity'], syntactic_sim)

    return METRICS

def train_model(): 
    root_folder = 'LeetCode' # needs to be changed so the training data folder is more generic
    model_path = 'leetcode_model.pkl' # also needs to be changed to a more generic path
    vectorizer_path = 'vectorizer.pkl' 
    
    # Create labeled dataset (same as in models.py main function)
    data = models.create_dataset(root_folder)
    #print(data) 
    #print(data['Label'].value_counts()) # ensuring the labeled data has two distinct labels

    features, vectorizer = models.extract_features(data) # extracting the features using an existing library: https://scikit-learn.org/stable/modules/generated/sklearn.feature_extraction.text.TfidfVectorizer.html
    labels = data['Label'] # the labels that will be used for the model are the 'Label' column of our dataset
    
    model = models.train_model(features, labels) # model tuning and hyperparameter updating (autonomous)
    models.save_model(model, vectorizer, model_path, vectorizer_path) # the best model is always saved

# UNCOMMENT THIS FOR DOCKER OR OTHER HOSTING OF OUR FASTAPI   
#if __name__ == "__main__":
#    uvicorn.run("API:app", host="0.0.0.0", port=8000, reload=True)