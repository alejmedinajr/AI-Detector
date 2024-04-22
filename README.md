# SNITCH(Southwestern’s New Innovation to Cultivate Honor)
This repository is dedicated to the SNITCH capstone project for the Spring 2024 graduating class at Southwestern University.

# Uses 
This tool is meant to be useful in detecting the use of AI on homework/project submissions. If you are a student, you will be able to view how much your work matches the output of different AI models. To avoid the temptation of using any AI generated work, the student view is limited to only being able to see a match percentage. For admins (most likely teachers or professors), a different view will be available, where AI generated output will be avaialable to see and compare to the submission (for different AI models). 

# Securely Storing Your API Keys
The anticipated use of this tool is to utilize various APIs, some of which require a secure API Key to be generated. To do this, look at the file called `.gitignore`. This file specifies which files should be ignored when it comes to pushing those files to this *public* repository. If you use an API key in the actual files in this repository, then push those files, the API key may become invalid (and will no longer work). To avoid this from happening (and to practice good security practices), simply create a file in the main project directory named `config.py`. In that file, you can assign a variable the value of your API key. The main project file, `API.py`, imports `config.py`, and can access the local keys. If you need further assistance doing this, you can follow this quick reference [video](https://www.youtube.com/watch?v=MEmVsyw5rxc). 

Example of how an API key can be stored in a variable in the `config.py` file: `api_key = "mykey123"`
<BR>
<B>*Note: This is a fake API key</B>

# Requirements
For this project, the following packages need to be installed:
* google-generativeai
* python-multipart
* openai
* fastapi
* uvicorn
* nodejs
<BR>
If there are more packages that need to be installed, you will likely get an error saying that *x package could not be found*. This means you just need to pip install that package. In the future, we will incorporate a requirements file that can be run instead in order to install all necessary packages. 

# Instructions/Useful Commands
This project currently has two components, the React App that serves as what the user will actually see/use, and the FastAPI, which acts as the connection point between several of our APIs and React app. 
1. React App: This application runs on the localhost, and in order to run it, you need to be in the project folder called <b>main-react-app</b>. You can easily do this using the following commands: `cd snitch-ai` followed by `npm start`. The first command changes the directory to the react app directory, and the second command is used to run the application. Once this runs, a window should pop up, allowing you to see the main page of the react app.
2. FastAPI: This API also runs on the localhost. In order to run it, you need to have a seperate terminal that is in the `cd python-code` . Once you are in this directory, you can run `python3 -m uvicorn API:app --reload`. This command is what is used to start the API. If you are successful in running this command, then you should see a link to where the API can be found in the terminal. You can copy and paste this link into a browser in order to mess around/test API functions that are found in `API.py`. This is not necessary to open if you are focusing on the React app. You simply need to have this running in order for the React app to send data to the various APIs we are using (i.e. ChatGPT and Gemini).
<BR>
<b>Note: You must have BOTH of these running at the same time in order to successfully make queries to the AI API's</b>  

Docker stuff: 
- `docker build -t snitch-fastapi-image .`
- `docker run -p 8000:8000 snitch-fastapi-image`

# Contributors (alphabetical order)
1. [Caleb Highsmith](https://github.com/Caleb-Highsmith)
2. [Alejandro Medina](https://github.com/alejmedinajr)
3. [Travis Rafferty](https://github.com/TjRaffert)
4. [Noah Zamarripa](https://github.com/noahzamarripa)
