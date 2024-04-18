import os
import pandas as pd
import joblib
import parsing
#from new_data import data as d
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

def create_dataset(root_folder):
    data = []
    
    ai_solutions_folder = os.path.join(root_folder, 'AI Solutions')
    human_solutions_folder = os.path.join(root_folder, 'Human Solutions')
    
    for folder_path, label in [(ai_solutions_folder, 1), (human_solutions_folder, 0)]:
        if os.path.exists(folder_path):
            for root, dirs, files in os.walk(folder_path):
                for file in files:
                    file_path = os.path.join(root, file)
                    with open(file_path, 'r') as f:
                        content = f.read()
                        data.append({
                            'Name': file_path,
                            'Text': content,
                            'Label': label          
                        })
        else:
            print(f"Warning: Folder '{folder_path}' does not exist.")
    
    return pd.DataFrame(data)
    
def extract_features(data):
    vectorizer = TfidfVectorizer(preprocessor=parsing.preprocess_text)
    features = vectorizer.fit_transform(data['Text'])
    return features, vectorizer

def train_model(features, labels):
    X_train, X_test, y_train, y_test = train_test_split(features, labels, test_size=0.2, random_state=7)

    models = {
        "Logistic Regression": (LogisticRegression(), {'C': [0.1, 1, 10]}),
        "Decision Tree": (DecisionTreeClassifier(), {'max_depth': [None, 10, 20]}),
        "Random Forest": (RandomForestClassifier(), {'n_estimators': [100, 200, 300], 'max_depth': [None, 10, 20]}),
        "Support Vector Machine": (SVC(), {'C': [0.1, 1, 10], 'gamma': ['scale', 'auto']}),
        "Naive Bayes": (MultinomialNB(), {'alpha': [0.1, 0.5, 1.0]})
    }
    
    best_model = None
    best_performance = {
        "Accuracy":0,
        "Precision":0,
        "Recall":0,
        "F1-score":0
    }

    for model_name, (model, param_grid) in models.items():
        print(f'Training {model_name} model...')

        grid_search = GridSearchCV(model, param_grid, cv=5, scoring='accuracy')
        grid_search.fit(X_train, y_train)

        best_params = grid_search.best_params_
        print(f'Best hyperparameters for {model_name}: {best_params}')

        model = grid_search.best_estimator_
        y_pred = model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred)
        recall = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)

        print(f"Accuracy: {accuracy:.4f}")
        print(f"Precision: {precision:.4f}")
        print(f"Recall: {recall:.4f}")
        print(f"F1-score: {f1:.4f}")

        if f1 > best_performance['F1-score']:
            best_model = model
            best_performance['Accuracy'] = accuracy
            best_performance['Precision'] = precision
            best_performance['Recall'] = recall
            best_performance['F1-score'] = f1

    return best_model

def save_model(model, vectorizer, model_path, vectorizer_path):
    joblib.dump(model, model_path)
    joblib.dump(vectorizer, vectorizer_path)

def load_model(model_path, vectorizer_path):
    model = joblib.load(model_path)
    vectorizer = joblib.load(vectorizer_path)
    return model,vectorizer

def predict_unseen_data(model, vectorizer, new_data):
    new_data = parsing.preprocess_text(new_data)
    features = vectorizer.transform([new_data])
    prediction = model.predict(features)
    return prediction[0]

def main():
    root_folder = 'LeetCode'
    model_path = 'leetcode_model.pkl'
    vectorizer_path = 'vectorizer.pkl'
    
    # Create labeled dataset
    data = create_dataset(root_folder)
    print(data)
    print(data['Label'].value_counts())

    # Feature engineering
    features, vectorizer = extract_features(data)
    labels = data['Label']
    
    # Model training, evaluation, and refinement
    model = train_model(features, labels)
    
    # Save the best performing model and vectorizer
    save_model(model, vectorizer, model_path, vectorizer_path)

    #model, vectorizer = load_model(model_path, vectorizer_path)

    #prediction = predict_unseen_data(model, vectorizer, d)

    #if prediction == 1: print('The new data is predicted as AI-generated')
    #else: print('The new data is predicted as human-written')

if __name__ == '__main__':
    main()