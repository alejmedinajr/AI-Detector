import React, { useState } from 'react';

// Component for a form to submit prompts and display responses
function PromptForm() {
    // State hooks for prompt input and response display
    const [prompt, setPrompt] = useState("");
    const [response, setResponse] = useState("");

    const handleSubmit = async (event) => { // Function to handle form submission
        event.preventDefault(); // Prevent default form submission behavior

        try {
            const endpoint = "http://localhost:8000/chatgpt_query/"; // Define endpoint for querying the chatgpt api          
            const response = await fetch(endpoint, { // Send a POST request to the endpoint with prompt data
                method: "POST", // Specify POST method
                headers: {
                    'Content-Type': 'application/json' // Set content type to JSON
                },
                body: JSON.stringify({
                    "prompt": prompt // Send prompt data in JSON format
                }) 
            });

            if (response.ok) { // need to make sure the response is successful
                const responseData = await response.json(); // parse the JSON response data
                setResponse(responseData.response); // update the response state with the received response
                console.log(JSON.stringify(responseData)); // log the response data for debugging
                alert(JSON.stringify(responseData)); // show an alert with the response data (for debugging)
            } else {
                console.error("Failed to send prompt."); // request failed, reflect this in the console
            }
        } catch (error) {
            console.error(error); // log any other errors that may have occured
        }
    };

    // Render the component
    return (
        <div>
            <h1>Enter your prompt</h1>

            {/* Form for submitting prompts */}
            <form onSubmit={handleSubmit}>
                {/* Textarea for entering the prompt */}
                <div style={{ marginBottom: "20px" }}>
                    <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} />
                </div>
                <button type="submit">Submit Prompt</button>
            </form>

            {/* Display the response if available (currently does not work) */}
            {response && (
                <div>
                    <h2>Response:</h2>
                    <textarea readOnly style={{ width: "100%", height: "200px" }} value={response} />
                </div>
            )}
        </div>
    );
}

export default PromptForm; // Export the component as default