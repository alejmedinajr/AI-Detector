# Use the official Python image as the base image
FROM python:3.9

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file
COPY ./python-code/requirements.txt .

# Install the Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY ./python-code .

# Expose the port the app runs on
EXPOSE 8000

# Start the FastAPI application
CMD ["uvicorn", "API:app", "--host", "0.0.0.0", "--port", "8000"]