import React, { useState, useEffect, useCallback } from 'react';
import { Button, ButtonGroup, Textarea, VStack, Heading, Spinner, Box, Text, Flex } from "@chakra-ui/react";
import { FaSpinner } from "react-icons/fa"; // Import loading spinner icon if needed
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth"; // Firebase imports
import { useNavigate } from "react-router-dom";
import ThemeToggleButton  from "./ThemeToggleButton";
import FileForm from './FileForm';
import pdfToText from 'react-pdftotext'

import { getFirestore, collection, addDoc } from "firebase/firestore";

function PromptForm({ onSignOut }) {
    //const [prompt, setPrompt] = useState("");
    //const [submission, setSubmission] = useState("");
    const [responses, setResponses] = useState({});
    const [isLoading, setIsLoading] = useState(false); // State to track loading state
    const [selectedModel, setSelectedModel] = useState("ChatGPT"); // Set ChatGPT as default selected model
    const [formSubmitted, setFormSubmitted] = useState(false); // State to track whether form has been submitted
    const [user, setUser] = useState(null); // State for storing user info
    const [showFileForm, setShowFileForm] = useState(false); // Added state to toggle visibility
    
    // NEWLY ADDED
    // const [inputMode, setInputMode] = useState('text'); // if we want one or strictly the other
    const [prompt, setPrompt] = useState('');
    const [submission, setSubmission] = useState('');
    const [instructionInputMode, setInstructionInputMode] = useState('text'); // 'text' or 'file' for instruction
    const [submissionInputMode, setSubmissionInputMode] = useState('text'); // 'text' or 'file' for submission
    const [files, setFiles] = useState([]);

    const [reportStatus, setReportStatus] = useState('');

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

    // NEWLY ADDED
    const handleInstructionToggleButtonClick = (mode) => {
        setInstructionInputMode(mode);
    };

    const handleSubmissionToggleButtonClick = (mode) => {
        setSubmissionInputMode(mode);
    };

    const [parsedText, setParsedText] = useState('');
  
    const handleFileInputChange = async (event) => {
        const file = event.target.files[0];
        
        if (!file) return;
        
        // Check if the file type is text or PDF
        if (file.type === 'text/plain') {
        // If it's a text file, read it as text
        try {
            const text = await parseTextFromFile(file);
            setParsedText(text);
        } catch (error) {
            console.error('Error reading text file:', error);
        }
        } else if (file.type === 'application/pdf') {
        // If it's a PDF file, parse it to text
        try {
            const text = pdfToText(file)
                .then(text => console.log(text))
                .catch(error => console.error("Failed to extract text from pdf"));
            setParsedText(text);
        } catch (error) {
            console.error('Error parsing PDF file:', error);
        }
        } else {
        // Handle unsupported file types
        console.error('Unsupported file type:', file.type);
        }
    };
    
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
                    prompt: prompt,
                    submission: submission
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
    }, [prompt, submission]); // Depend on prompt to trigger fetch when it changes




    // NEW CODE
    const fetchReport = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch("http://localhost:8000/generate_report/", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: prompt,
                    submission: submission
                })
            });
    
            if (response.ok) {
                const responseData = await response.json();
                setReportStatus('Report generated successfully'); // Update report status
    
                // Add the report to Firestore
                const auth = getAuth();
                const user = auth.currentUser;
                if (user) {
                    const db = getFirestore();
                    const reportsCollection = collection(db, "reports");
                    const newReport = {
                        userId: user.uid,
                        prompt: prompt,
                        submission: submission,
                        reportData: responseData.reportData, // Assuming the report data is in responseData.reportData
                        timestamp: new Date()
                    };
                    await addDoc(reportsCollection, newReport);
                }
    
                console.log(responseData);
            } else {
                setReportStatus('Failed to generate report'); // Update report status
                console.error("Failed to generate report.");
            }
        } catch (error) {
            setReportStatus('Failed to generate report'); // Update report status
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [prompt, submission]);






    
    // Define a map of file types to parsing functions
    const fileTypeParsers = {
        'application/pdf':parsePDF,
        'pdf': parsePDF, 
        '.pdf': parsePDF
        //'application/pdf': parsePDF,
        //'application/vnd.openxmlformats-officedocument.wordprocessingml.document': parseDOCX
    };

    // Function to parse text from files
    async function parseTextFromFile(file) {
        const parser = fileTypeParsers[file.type];
        if (parser) {
            return await parser(file);
        } else {
            throw new Error('Unsupported file type.');
        }
    }

    function parsePDF(event) {
        const file = event.target.files[0]
        pdfToText(file)
            .then(text => console.log(text))
            .catch(error => console.error("Failed to extract text from pdf"))
    }

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

    const handleReport = async () => {
        fetchReport(); // Call fetchReport without waiting for it to complete
        navigate('/account-home'); // Navigate to the account home page immediately
    }

    const goToAccountHome = () => {
        navigate('/account-home');
    }

    const toggleFormView = () => {
        setShowFileForm(!showFileForm); // Toggle between PromptForm and FileForm
    };

    if (showFileForm) {
        return (
            <Box>
                <FileForm />
                <Button colorScheme="teal" onClick={toggleFormView} mt="4">
                    Back to Prompt Form
                </Button>
            </Box>
        );
    }

    return (
        <div>
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                textAlign="center"
                marginTop="4"
                marginBottom="4"
            >
                <ThemeToggleButton />
                <Box marginTop="4" display="flex" justifyContent="center">
                    <Button colorScheme="teal" size="md" onClick={toggleFormView}>
                        Go to File Form
                    </Button>
                    <Button
                        colorScheme="teal"
                        size="md"
                        onClick={goToAccountHome}
                        marginLeft="4"
                    >
                        Go to Account Home
                    </Button>
                    {user ? (
                        <Button onClick={handleSignOut} colorScheme="red" size="md" marginLeft="4">
                            Sign Out
                        </Button>
                    ) : (
                        <Text>Please log in.</Text>
                    )}
                </Box>
            </Box>



            <Box
                maxWidth="600px"
                margin="auto"
                border="1px solid #ccc"
                padding="20px"
                borderRadius="md"
            >
                <Heading marginBottom="2" textAlign="center">
                    Enter your prompt
                </Heading>

                <form onSubmit={handleSubmit}>
                    <Flex>
                        <Box flex={1} mr={2}>
                            {instructionInputMode === 'text' ? (
                                <Textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="Assignment Instructions"
                                    borderColor="gray.300"
                                    borderRadius="md"
                                    p={2}
                                    resize="vertical"
                                />
                            ) : (
                                <input
                                    type="file"
                                    onChange={handleFileInputChange}
                                />
                            )}
                            
                            <Box maxWidth="150px" margin="auto">
                                <ButtonGroup spacing={4} mt={1} justifyContent="center">
                                    <Button
                                        onClick={() => handleInstructionToggleButtonClick('text')}
                                        colorScheme={instructionInputMode === 'text' ? 'blue' : 'gray'}
                                        size='sm'
                                        _hover={{ bg: 'blue.500', color: 'white' }}
                                    >
                                        Text
                                    </Button>
                                    <Button
                                        onClick={() => handleInstructionToggleButtonClick('file')}
                                        colorScheme={instructionInputMode === 'file' ? 'blue' : 'gray'}
                                        size='sm'
                                        _hover={{ bg: 'blue.500', color: 'white' }}
                                    >
                                        File
                                    </Button>
                                </ButtonGroup>
                            </Box>
                        </Box>
                        <Box flex={1} ml={2}>
                            {submissionInputMode === 'text' ? (
                                <Textarea
                                    value={submission}
                                    onChange={(e) => setSubmission(e.target.value)}
                                    placeholder="Student Submission"
                                    borderColor="gray.300"
                                    borderRadius="md"
                                    p={2}
                                    resize="vertical"
                                />
                            ) : (
                                <input
                                    type="file"
                                    onChange={handleFileInputChange}
                                />
                            )}
                            <Box maxWidth="150px" margin="auto">
                                <ButtonGroup spacing={4} mt={1} justifyContent="center">
                                    <Button
                                        onClick={() => handleSubmissionToggleButtonClick('text')}
                                        colorScheme={submissionInputMode === 'text' ? 'blue' : 'gray'}
                                        size='sm'
                                        _hover={{ bg: 'blue.500', color: 'white' }}
                                    >
                                        Text
                                    </Button>
                                    <Button
                                        onClick={() => handleSubmissionToggleButtonClick('file')}
                                        colorScheme={submissionInputMode === 'file' ? 'blue' : 'gray'}
                                        size='sm'
                                        _hover={{ bg: 'blue.500', color: 'white' }}
                                    >
                                        File
                                    </Button>
                                </ButtonGroup>
                            </Box>
                        </Box>
                    </Flex>
                    <Flex direction="column" alignItems="center">
                        <ButtonGroup>
                            <Button
                                type="submit"
                                colorScheme="blue"
                                isLoading={isLoading}
                                disabled={!prompt.trim()} // Disable button if prompt is empty
                                mt={8}
                            >
                                Submit Prompt
                            </Button>
                            <Button onClick={handleReport} colorScheme="blue" size="md" marginLeft="4" mt={8}>
                                Generate Report
                            </Button>
                        </ButtonGroup>
                        <Box mt={20}>
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
                                ml={4}
                            >
                                Gemini/Bard
                            </Button>
                        </Box>
                    </Flex>
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
            </Box>
        </div>
    );
}

export default PromptForm;