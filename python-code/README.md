# Python Code Directory: README

## Overview
This directory contains the Python components of the project, primarily focused on building RESTful APIs using FastAPI and related libraries. The project aims to distinguish AI-generated content from human-generated content through various endpoints and machine learning models. This README provides information on the purpose of the codebase, setup instructions, and additional context to help developers work with this project.

## Project Structure
- `api.py`: Main file containing the FastAPI setup and endpoint definitions.
- `models.py`: Contains functions to train and load machine learning models, including Random Forest Classifier and support for other models like Logistic Regression, Decision Tree, and Support Vector Machine.
- `parsing.py`: Responsible for text processing and comparisons. It includes various functions for reading, preprocessing, and comparing text using methods like cosine similarity and fuzzy matching.
- `metrics.py`: Defines the initial metric structure for comparing AI-generated and human-generated content.
- `config.py`: Contains configuration and API keys for external services such as OpenAI and Gemini.
- `Training-Dataset/`: Folder containing training data for AI-generated and human-generated content. It has two subfolders, "AI Solutions" and "Human Solutions".
  - `AI Solutions/`: Contains text files or other data representing AI-generated content.
  - `Human Solutions/`: Contains text files or other data representing human-generated content.
- `model.pkl`: Serialized machine learning model used for predicting whether text is AI-generated or human-generated.
- `vectorizer.pkl`: Serialized vectorizer for text feature extraction, used to convert raw text into a numerical representation for machine learning.

## Setup Instructions
To set up and run the FastAPI project, ensure you have the following prerequisites installed:
- Python 3.x
- Virtual environment tool (`venv` or `virtualenv`)

### Step-by-Step Setup
1. Clone the repository to your local machine.
2. Navigate to the project directory.
3. Create and activate a virtual environment:
   ```bash
   python -m venv env
   source env/bin/activate  # For Linux/macOS
   env\Scripts\activate     # For Windows

### Install
pip install -r requirements.txt


### FastAPI server
uvicorn api:app --reload
