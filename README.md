# AI-Detector (name work in progress)
This repository is dedicated to the **(name of project)** capstone project for the Spring 2024 graduating class at Southwestern University.

# Uses (anticipated)
This tool is meant to be useful in detecting the use of AI on homework/project submissions. If you are a student, you will be able to view how much your work matches the output of different AI models. To avoid the temptation of using any AI generated work, the student view is limited to only being able to see a match percentage. For admins (most likely teachers or professors), a different view will be available, where AI generated output will be avaialable to see and compare to the submission (for different AI models). 

# Securly Storing Your API Keys
The anticipated use of this tool is to utilize various APIs, some of which require a secure API Key to be generated. To do this, look at the file called `.gitignore`. This file specifies which files should be ignored when it comes to pushing those files to this *public* repository. If you use an API key in the actual files in this repository, then push those files, the API key may become invalid (and will no longer work). To avoid this from happening (and to practice good security practices), simply create a file in the main project directory named `config.py`. In that file, you can assign a variable the value of your API key. The main project file, `API.py`, imports `config.py`, and can access the local keys. If you need further assistance doing this, you can follow this quick reference [video](https://www.youtube.com/watch?v=MEmVsyw5rxc). 

Example of how an API key can be stored in a variable in the `config.py` file: `api_key = "mykey123"`
<BR>
<B>*Note: This is a fake API key</B>


# Contributors (alphabetical order)
1. Caleb Highsmith
2. Alejandro Medina
3. Travis Rafferty
4. Noah Zamarripa
