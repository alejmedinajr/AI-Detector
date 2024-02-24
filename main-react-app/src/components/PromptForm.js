import React, { useState } from 'react';
import { Button, Textarea, VStack, ButtonGroup, Heading } from "@chakra-ui/react";

function PromptForm() {
    const [prompt, setPrompt] = useState("");
    const [response, setResponse] = useState("");
    const [selectedButton, setSelectedButton] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const endpoint = "http://localhost:8000/form_submission/";          
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
                console.log(JSON.stringify(responseData));
                alert(JSON.stringify(responseData));
            } else {
                console.error("Failed to send prompt.");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleButtonClick = (buttonName) => {
        if (selectedButton === buttonName) {
            setSelectedButton(null); // Toggle off if already selected
        } else {
            setSelectedButton(buttonName);
        }
    };

    return (
        <div>
            <Heading marginBottom="2">Enter your prompt</Heading>

            <form onSubmit={handleSubmit}>
                <VStack spacing={4} align="stretch">
                    <Textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Enter your prompt"
                        borderColor="gray.300"
                        borderRadius="md"
                        p={2}
                        resize="vertical"
                    />
                    <Button type="submit" colorScheme="blue">Submit Prompt</Button>
                </VStack>
            </form>

            {response && (
                <div>
                    <h2>Response:</h2>
                    <Textarea
                        readOnly
                        value={response}
                        width="100%"
                        height="200px"
                    />
                </div>
            )}

            {/* Button Group for additional buttons */}
            <ButtonGroup spacing={4} mt={4}>
                <Button
                    onClick={() => handleButtonClick("ChatGPT")}
                    colorScheme={selectedButton === "ChatGPT" ? "blue" : "gray"}
                    _hover={{ bg: "blue.500", color: "white" }}
                >
                    ChatGPT
                </Button>
                <Button
                    onClick={() => handleButtonClick("GeminiBard")}
                    colorScheme={selectedButton === "GeminiBard" ? "blue" : "gray"}
                    _hover={{ bg: "blue.500", color: "white" }}
                >
                    Gemini/Bard
                </Button>
            </ButtonGroup>
        </div>
    );
}

export default PromptForm;
