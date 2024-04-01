import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from sklearn.preprocessing import LabelEncoder
from joblib import dump

# Load the data
data = pd.read_csv('weatherAUS.csv')  # Replace 'your_data.csv' with the path to your CSV file
print("Shape of the data:", data.shape)
print("Sample data:")
print(data.head())

# Drop rows with missing values
data.dropna(inplace=True)

# Drop irrelevant columns like 'Date' and 'Location' if they are not relevant for prediction
data.drop(['Date', 'Location'], axis=1, inplace=True)

label_encoder = LabelEncoder() # categorical variables need to be converted to numerical values
categorical_columns = ['WindGustDir', 'WindDir9am', 'WindDir3pm', 'RainToday', 'RainTomorrow'] # list of categorical variables
for column in categorical_columns: data[column] = label_encoder.fit_transform(data[column]) # each column needs to be transformed

# Split the data into features (X) and target variable (y)
x = data.drop('RainTomorrow', axis=1)
y = data['RainTomorrow']

# Split the data into training and testing sets
x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.2, random_state=42)

# Define models and their parameter grids for tuning
models = {
    "Logistic Regression": (LogisticRegression(), {'C': [0.1, 1, 10]}),
    "Decision Tree": (DecisionTreeClassifier(), {'max_depth': [None, 10, 20]}),
    #"Random Forest": (RandomForestClassifier(), {'n_estimators': [100, 200, 300], 'max_depth': [None, 10, 20]}),
    #"Support Vector Machine": (SVC(), {'C': [0.1, 1, 10], 'gamma': ['scale', 'auto']})
}

# Train and evaluate each model with parameter tuning
results = {}

for name, (model, param_grid) in models.items():
    grid_search = GridSearchCV(model, param_grid, cv=5, scoring='accuracy')
    grid_search.fit(x_train, y_train)
    best_model = grid_search.best_estimator_
    y_pred = best_model.predict(x_test)  # Predict on the testing set
    
    # Evaluation metrics
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    roc_auc = roc_auc_score(y_test, y_pred)
    
    results[name] = {
        'accuracy': accuracy,
        'precision': precision,
        'recall': recall,
        'f1': f1,
        'roc_auc': roc_auc,
        'best_params': grid_search.best_params_
    }
    
    print(f"{name} Metrics:\n"
          f"\tAccuracy: {accuracy}\n"
          f"\tPrecision: {precision}\n"
          f"\tRecall: {recall}\n"
          f"\tF1-score: {f1}\n"
          f"\tROC AUC: {roc_auc}\n"
          f"\tBest Parameters: {grid_search.best_params_}\n")
    
    dump((best_model, grid_search.best_params_), f'best_model_{name}.joblib')


# Choose the best performing model based on the desired metric
best_metric_name = 'accuracy'  # Choose the metric to select the best model
best_model_name = max(results, key=lambda x: results[x][best_metric_name])
best_model = models[best_model_name][0]
best_params = results[best_model_name]['best_params']

print(f"Best Performing Model based on {best_metric_name}: {best_model_name}, Best Parameters: {best_params}")
#dump((best_model, best_params), 'best_model_overall.joblib')