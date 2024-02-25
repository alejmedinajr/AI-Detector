import React, { useState } from 'react';

function PromptForm() {
    const [prompt, setPrompt] = useState("");
    const [response, setResponse] = useState("");
    const [service, setService] = useState("chatgpt");

    const handleSubmit = async (event) => {
        event.preventDefault();
        let endpoint = "";

        if (service === "chatgpt") {
            endpoint = "http://localhost:8000/chatgpt_query/";
        } else if (service === "gemini") {
            endpoint = "http://localhost:8000/geminiResponse";
        }

        try {
            const serverResponse = await fetch(endpoint, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ "prompt": prompt })
            });

            if (serverResponse.ok) {
                const responseData = await serverResponse.json();
                setResponse(responseData.response); // Assuming 'response' is the correct key in your responseData
            } else {
                console.error("Failed to send prompt.");
                setResponse("Failed to send prompt."); // Update UI to show failure message
            }
        } catch (error) {
            console.error(error);
            setResponse(`Error: ${error.message}`); // Update UI to show error message
        }
    };

    return (
        <div>
            <h1>Enter your prompt</h1>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "20px" }}>
                    <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} />
                </div>
                <div style={{ marginBottom: "20px" }}>
                    <label>
                        Choose a service:
                        <select value={service} onChange={(e) => setService(e.target.value)}>
                            <option value="chatgpt">ChatGPT</option>
                            <option value="gemini">Gemini</option>
                        </select>
                    </label>
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
