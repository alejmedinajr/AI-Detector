import React, { useState, useEffect, useCallback } from 'react';
import { Button, ButtonGroup, Textarea, VStack, Heading, Spinner, Box, Text } from "@chakra-ui/react";
import { FaSpinner } from "react-icons/fa"; // Import loading spinner icon if needed
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth"; // Firebase imports
import { useNavigate } from "react-router-dom";

function PromptForm({ onSignOut }) {
    const [prompt, setPrompt] = useState("");
    const [responses, setResponses] = useState({});
    const [isLoading, setIsLoading] = useState(false); // State to track loading state
    const [selectedModel, setSelectedModel] = useState("ChatGPT"); // Set ChatGPT as default selected model
    const [formSubmitted, setFormSubmitted] = useState(false); // State to track whether form has been submitted
    const [user, setUser] = useState(null); // State for storing user info

    const auth = getAuth();
    const navigate = useNavigate();

    // Monitor auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, currentUser => {
            setUser(currentUser);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);


    // Function to fetch response from API
    const fetchResponse = useCallback(async (model) => {
        setIsLoading(true);
        try {
            const response = await fetch("http://localhost:8000/form_submission/", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: prompt
                })
            });

            if (response.ok) {
                const responseData = await response.json();
                setResponses(prevResponses => ({
                    ...prevResponses,
                    [model]: responseData.Responses
                }));
            } else {
                console.error("Failed to get responses.");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [prompt]); // Depend on prompt to trigger fetch when it changes

    // Effect to fetch response when form is submitted
    useEffect(() => {
        if (formSubmitted) {
            fetchResponse(selectedModel);
            setFormSubmitted(false); // Reset formSubmitted state after fetching response
        }
    }, [formSubmitted, fetchResponse, selectedModel]);

    // Function to handle model button click
    const handleButtonClick = useCallback((model) => {
        setSelectedModel(model);
    }, []);

    // Function to handle form submission
    const handleSubmit = (event) => {
        event.preventDefault();
        setFormSubmitted(true); // Set formSubmitted state to true when form is submitted
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            navigate('/login'); // Navigate to the login route after successful sign-out
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    const goToAccountHome = () => {
        navigate('/account-home');
    }

    return (
        <div>
            <Box>
            <div>
            <Button
                colorScheme="teal"
                size="md"
                onClick={goToAccountHome}
                mt="4"
            >
                Go to Account Home
            </Button>
        </div>
            {user ? (
                <Box>
                    <Text>Welcome, {user.email}</Text>
                    <Button onClick={handleSignOut} colorScheme="red" size="sm" marginY="2">Sign Out</Button>
                </Box>
            ) : (
                <Text>Please log in.</Text>
            )}
            </Box>
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
                    <ButtonGroup spacing={4}>
                        <Button
                            type="submit"
                            colorScheme="blue"
                            isLoading={isLoading}
                            disabled={!prompt.trim()} // Disable button if prompt is empty
                        >
                            Submit Prompt
                        </Button>
                        <Button
                            onClick={() => handleButtonClick("ChatGPT")}
                            colorScheme={selectedModel === "ChatGPT" ? "blue" : "gray"}
                            _hover={{ bg: "blue.500", color: "white" }}
                        >
                            ChatGPT
                        </Button>
                        <Button
                            onClick={() => handleButtonClick("Gemini/Bard")}
                            colorScheme={selectedModel === "Gemini/Bard" ? "blue" : "gray"}
                            _hover={{ bg: "blue.500", color: "white" }}
                        >
                            Gemini/Bard
                        </Button>
                    </ButtonGroup>
                </VStack>
            </form>

            {/* Display selected model response */}
            {responses[selectedModel] && (
                <div>
                    <h2>{selectedModel} Response:</h2>
                    <Textarea
                        readOnly
                        value={responses[selectedModel]}
                        width="100%"
                        height="200px"
                    />
                </div>
            )}
        </div>
    );
}


export default PromptForm;