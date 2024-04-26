# Import necessary modules
from firebase_functions import https_fn
from firebase_admin import initialize_app
from API import app  # Import your FastAPI application instance

# Initialize Firebase app
initialize_app()

# Define Firebase Cloud Function
@https_fn.on_request()
def fastapi_cloud_function(req: https_fn.Request) -> https_fn.Response:
    """
    Firebase Cloud Function that proxies requests to your FastAPI application.
    """
    # Capture FastAPI response
    fastapi_response = app(req.method, req.url, body=req.body)

    # Extract response data
    response_data = fastapi_response.body
    status_code = fastapi_response.status_code
    headers = fastapi_response.headers.items()

    # Return response
    return https_fn.Response(body=response_data, status=status_code, headers=dict(headers))
