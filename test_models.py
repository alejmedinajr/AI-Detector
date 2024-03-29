import pandas as pd
import numpy as np
from joblib import load

# Generate fake predictions
fake_data = {
    'MinTemp': np.random.uniform(10, 30, 10),
    'MaxTemp': np.random.uniform(20, 40, 10),
    'Rainfall': np.random.choice([0, 1], size=10),
    'Evaporation': np.random.uniform(2, 12, 10),
    'Sunshine': np.random.uniform(2, 12, 10),
    'WindGustDir': np.random.choice(['W', 'E', 'N', 'S'], size=10),
    'WindGustSpeed': np.random.uniform(20, 60, 10),
    'WindDir9am': np.random.choice(['W', 'E', 'N', 'S'], size=10),
    'WindDir3pm': np.random.choice(['W', 'E', 'N', 'S'], size=10),
    'WindSpeed9am': np.random.uniform(5, 20, 10),
    'WindSpeed3pm': np.random.uniform(10, 30, 10),
    'Humidity9am': np.random.uniform(40, 90, 10),
    'Humidity3pm': np.random.uniform(40, 90, 10),
    'Pressure9am': np.random.uniform(1000, 1020, 10),
    'Pressure3pm': np.random.uniform(995, 1015, 10),
    'Cloud9am': np.random.uniform(0, 8, 10),
    'Cloud3pm': np.random.uniform(0, 8, 10),
    'Temp9am': np.random.uniform(10, 30, 10),
    'Temp3pm': np.random.uniform(20, 40, 10),
    'RainToday': np.random.choice(['Yes', 'No'], size=10),
    'RainTomorrow': np.random.choice(['Yes', 'No'], size=10)
}

# Convert to DataFrame
fake_df = pd.DataFrame(fake_data)

# Save to CSV
fake_df.to_csv('fake_predictions.csv', index=False)

# Load the model and its parameters
loaded_model, loaded_params = load('best_model_Logistic Regression.joblib')

# Load the new predictions data
new_data = pd.read_csv('fake_predictions.csv')

# Extract features
x_new = new_data.drop('RainTomorrow', axis=1)

# Make predictions
predictions = loaded_model.predict(x_new)

# Print predictions
print("Predictions:")
print(predictions)
