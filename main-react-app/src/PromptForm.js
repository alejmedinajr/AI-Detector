import React, { useState } from 'react';

function PromptForm() {
    const [prompt, setPrompt] = useState("");
    const [response, setResponse] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const endpoint = "http://localhost:8000/chatgpt_query/";
            const response = await fetch(endpoint, { 
                method: "POST", 
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "prompt": prompt
                }) 
            });

            if (response.ok) {
                const responseData = await response.json();
                setResponse(responseData.response);
                console.log(JSON.stringify(responseData))
                alert(JSON.stringify(responseData))
            
            } else {
                console.error("Failed to send prompt.");
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <h1>Enter your prompt</h1>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "20px" }}>
                    <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} />
                </div>
                <button type="submit">Submit Prompt</button>
            </form>

            {response && (
                <div>
                    <h2>Response:</h2>
                    <textarea readOnly style={{ width: "100%", height: "200px" }} value={response} />
                </div>
            )}
        </div>
    );
}

export default PromptForm;
