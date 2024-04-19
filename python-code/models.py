import os
import pandas as pd
import joblib
import parsing
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

def create_dataset(root_folder):
    """
    This helper function creates a pandas DataFrame containing the contents of text files in two subfolders: 'AI Solutions' and 'Human Solutions', where
    the corresponding labels for the files in these subdirectories are 1 and 0 respectively. 

    Parameters:
        root_folder: The path to the root folder containing the 'AI Solutions' and 'Human Solutions' subfolders.

    Returns:
        pandas.DataFrame: A DataFrame that acts as the dataset created by getting all training data files and labeling them
    """
    data = []
    ai_solutions_folder = os.path.join(root_folder, 'AI Solutions') # path to the 'AI Solutions' subfolder (so we know which files to label with a 1)
    human_solutions_folder = os.path.join(root_folder, 'Human Solutions') # path to the 'Human Solutions' subfolder (so we know which files to label with a 0)

    for folder_path, label in [(ai_solutions_folder, 1), (human_solutions_folder, 0)]: # iterate over the two subfolders and their respective labels (1 for 'AI Solutions' and 0 for 'Human Solutions')
        if os.path.exists(folder_path):  # make sure the subfolder exists
            for root, _, files in os.walk(folder_path): # recursively traverse through all files in the subfolder and its subdirectories
                for file in files: 
                    file_path = os.path.join(root, file)  # construct the full file path
                    with open(file_path, 'r') as f:
                        content = f.read()  # read the file content
                    
                    data.append({ # each data point is a dictionary with the file path, content, and label
                        'Name': file_path,
                        'Text': content,
                        'Label': label
                    })
        else: print(f"Warning: Folder '{folder_path}' does not exist.")  # print warning that the folder path was not found

    return pd.DataFrame(data) # return the data list as a pandas DataFrame (easier to use for machine learning predefined packages)
    
def extract_features(data):
    """
    This helper function extracts features from text data using the TF-IDF (Term Frequency-Inverse Document Frequency) vectorization technique.
    
    This function is crucial for machine learning tasks involving text data, which happens to be our data. Raw text is converted into 
    a numerical representation that can be used as input to machine learning models. The TF-IDF vectorization technique is widely
    used in natural language processing (NLP) tasks because it considers both the frequency of a word in a document
    (Term Frequency) and the importance of the word across the entire corpus (Inverse Document Frequency). This helps
    to capture the most relevant and discriminative words in the text data, which can improve the performance of machine
    learning models.

    Parameters:
        data (pandas.DataFrame): A DataFrame containing text data in a column named 'Text' (the main meat of the data)

    Returns:
        tuple: 
            features: A sparse matrix representing the TF-IDF features of the text data
            vectorizer: The fitted TfidfVectorizer instance
    """
    vectorizer = TfidfVectorizer(preprocessor=parsing.preprocess_text) # source for initilization and use: https://medium.com/@cmukesh8688/tf-idf-vectorizer-scikit-learn-dbc0244a911a
    features = vectorizer.fit_transform(data['Text']) # learn the vocabulary (in the form of a set of unique words) from the input text documents (while also transforming the documents into a sparse matrix of TF-IDF features): https://www.analyticsvidhya.com/blog/2021/04/difference-between-fit-transform-fit_transform-methods-in-scikit-learn-with-python-code/
    return features, vectorizer # return the features in the form of a sparse matrix and the fitted vectorizer instance

def train_model(features, labels):
    """
    This helper function trains and evaluates multiple machine learning models using grid search cross-validation (GridSearchCV) 
    in order to find the best model based on the F1-score, which is the primary metric considered in this function.

    GridSearchCV is a commonly used technique that performs an exhaustive search over a specified range of hyperparameters for a given model.
    By using cross-validation, GridSearchCV helps prevent overfitting and ensures that the model's performance is evaluated
    on unseen data, which is essential for obtaining a reliable estimate of the model's generalization ability.

    Our model uses the F1-score as the main metric since it provides a balanced measure of a model's precision (the ability to
    avoid false positives) and recall (the ability to detect true positives). In many real-world scenarios, such as text
    classification or anomaly detection, both precision and recall are important.

    The function trains and evaluates the following models:

    1. Logistic Regression: A linear model that models the probability of a binary or multi-class outcome using the logistic
       function. It is widely used for classification tasks and is often a good baseline model (https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LogisticRegression.html).

    2. Decision Tree: A tree-based model that recursively partitions the feature space into smaller regions based on the
       feature values. Decision trees are intuitive, interpretable, and can handle both numerical and categorical data (https://scikit-learn.org/stable/modules/tree.html).

    3. Random Forest: An ensemble learning method that constructs multiple decision trees and aggregates their predictions.
       Random forests are powerful and robust to overfitting, making them suitable for a wide range of tasks (https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.RandomForestClassifier.html).

    4. Support Vector Machine (SVM): A discriminative model that finds the optimal hyperplane that separates classes with
       the maximum margin. SVMs are effective for high-dimensional data and can handle non-linear decision boundaries
       using kernel functions (https://scikit-learn.org/stable/modules/svm.html).

    5. Naive Bayes: A probabilistic model based on Bayes' theorem and the assumption of feature independence. Naive Bayes
       models are simple, fast, and often perform well on text classification tasks (https://scikit-learn.org/stable/modules/naive_bayes.html).

    Parameters:
        features: A sparse matrix representing the features of the data
        labels: An array containing the true labels for the data

    Returns:
        The best-performing model based on the F1-score
    """
    X_train, X_test, y_train, y_test = train_test_split(features, labels, test_size=0.2, random_state=7) # using existing package for the train test split, alternatively could be done by slicing the data array/list

    models = { # models considered based on our task and labeled data (all using pretty standard hyperparameter ranges (important for grid search))
        "Logistic Regression": (LogisticRegression(), {'C': [0.1, 1, 10]}), 
        "Decision Tree": (DecisionTreeClassifier(), {'max_depth': [None, 10, 20]}),
        "Random Forest": (RandomForestClassifier(), {'n_estimators': [100, 200, 300], 'max_depth': [None, 10, 20]}),
        "Support Vector Machine": (SVC(), {'C': [0.1, 1, 10], 'gamma': ['scale', 'auto']}),
        "Naive Bayes": (MultinomialNB(), {'alpha': [0.1, 0.5, 1.0]})
    }
    
    best_model = None # the intial best model does not exist until all are computed
    best_performance = { # the best performance will also be recorded in case this information ends up being shown to the user
        "Accuracy":0, 
        "Precision":0,
        "Recall":0,
        "F1-score":0
    }

    for model_name, (model, param_grid) in models.items(): # each model needs to be trained (with respect the parameter grid size (for gridsearch))
        print(f'Training {model_name} model...') # message to know that training is happening from FastAPI side

        grid_search = GridSearchCV(model, param_grid, cv=5, scoring='accuracy') # using built in grid search pacakge to auto-tune hyperparameters: https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.GridSearchCV.html
        grid_search.fit(X_train, y_train) # perform crossfit validation to make sure overfitting is not happening

        best_params = grid_search.best_params_ # setting the best hyperparameters to the results from gridsearch
        print(f'Best hyperparameters for {model_name}: {best_params}')

        model = grid_search.best_estimator_
        y_pred = model.predict(X_test) # make a prediction on the testing data
        accuracy = accuracy_score(y_test, y_pred) # record accuracy based on predictions and actual responses
        precision = precision_score(y_test, y_pred) # record precision based on predictions and actual responses
        recall = recall_score(y_test, y_pred) # record recall based on predictions and actual responses
        f1 = f1_score(y_test, y_pred) # record f1 score based on predictions and actual responses

        if f1 > best_performance['F1-score']: # our most considered performance metric is the f1-score, which basically combines precision and recall 
            best_model = model # if the current f1 score is better than current best f1 score, update all other comparison metrics
            best_performance['Accuracy'] = accuracy
            best_performance['Precision'] = precision
            best_performance['Recall'] = recall
            best_performance['F1-score'] = f1

    return best_model # return the overall best model

def save_model(model, vectorizer, model_path, vectorizer_path):
    """
    This helper function saves the trained machine learning model and the vectorizer to disk using joblib.
    (https://www.analyticsvidhya.com/blog/2023/02/how-to-save-and-load-machine-learning-models-in-python-using-joblib-library/)

    Parameters:
        model: Trained machine learning model to be saved.
        vectorizer: Fitted vectorizer used for text feature extraction
        model_path: File path where the model will be saved
        vectorizer_path: File path where the vectorizer will be saved
    """
    joblib.dump(model, model_path) # use joblib library to save the model (so it can be used later)
    joblib.dump(vectorizer, vectorizer_path) # use joblib library to save the vectorizer (so it can be used later for extracting features)

def load_model(model_path, vectorizer_path):
    """
    This helper function allows us to load a pre-trained model and its corresponding vectorizer for making predictions
    or performing other tasks without having to retrain the model or refit the vectorizer.
    (https://www.analyticsvidhya.com/blog/2023/02/how-to-save-and-load-machine-learning-models-in-python-using-joblib-library/)

    Parameters:
        model_path: File path where the model is saved
        vectorizer_path: File path where the vectorizer is saved

    Returns:
        tuple:
            model: Loaded machine learning model
            vectorizer: Loaded vectorizer used for text feature extraction
    """
    model = joblib.load(model_path) # use joblib library to load existing model
    vectorizer = joblib.load(vectorizer_path) # use joblib library to load existing vectorizer (so we can extract features)
    return model,vectorizer

def predict_unseen_data(model, vectorizer, new_data):
    """
    This helper function make a prediction on new, unseen text data using a pre-trained machine learning model and vectorizer.

    Parameters:
        model: Pre-trained machine learning model
        vectorizer: Vectorizer used for text feature extraction
        new_data: New, unseen text data to make a prediction on

    Returns:
        int: Predicted label (1 for AI-Generated or 0 for Human-Generated) for the new text data
    """
    new_data = parsing.preprocess_text(new_data) # the new data may not be preprocessed, so make sure (does not change anything if it already is preprocessed)
    features = vectorizer.transform([new_data]) # extract a numerical representation of the new data (originally a string)
    prediction = model.predict(features) # make a prediction of the new (and unseen) data's label
    return prediction[0] # the 0th index contains the actual prediction value we care about