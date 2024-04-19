import React, { useState, useEffect, useCallback } from 'react';
import { Button, ButtonGroup, Textarea, VStack, Heading, Spinner, Box, Text, Flex } from "@chakra-ui/react";
import { FaSpinner } from "react-icons/fa"; // Import loading spinner icon if needed
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth"; // Firebase imports
import { useNavigate } from "react-router-dom";
import ThemeToggleButton from "./ThemeToggleButton";
import pdfToText from 'react-pdftotext'
import ReportTable from './History';
import { getFirestore, collection, addDoc, doc, setDoc } from "firebase/firestore";

function PromptForm({ onSignOut }) {
   const [responses, setResponses] = useState({});
   const [GPTResponse, setGPTResponse] = useState('');
   const [GeminiResponse, setGeminiResponse] = useState('');

   const [isLoading, setIsLoading] = useState(false); // State to track loading state
   const [selectedModel, setSelectedModel] = useState("ChatGPT"); // Set ChatGPT as default selected model
   const [formSubmitted, setFormSubmitted] = useState(false); // State to track whether form has been submitted
   const [user, setUser] = useState(null); // State for storing user info

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

   const handlePromptFileInputChange = async (event) => {
       const file = event.target.files[0];

       if (!file) return;

       // Check if the file type is text or PDF
       if (file.type === 'text/plain') {
           // If it's a text file, read it as text
           try {
               const text = await parseTextFromFile(file);
               setParsedText(text);
               if (instructionInputMode === 'file') {
                   setPrompt(text);
               }
           } catch (error) {
               console.error('Error reading text file:', error);
           }
       } else if (file.type === 'application/pdf') {
           // If it's a PDF file, parse it to text
           try {
               const text = await pdfToText(file)
                   .catch(error => console.error("Failed to extract text from pdf", error));
               setParsedText(text);
               if (instructionInputMode === 'file') {
                   setPrompt(text);
               }
           } catch (error) {
               console.error('Error parsing PDF file:', error);
           }
       } else {
           // Handle unsupported file types
           console.error('Unsupported file type:', file.type);
       }
   };

   const handleSubmissionFileInputChange = async (event) => {
       const file = event.target.files[0];

       if (!file) return;

       // Check if the file type is text or PDF
       if (file.type === 'text/plain') {
           // If it's a text file, read it as text
           try {
               const text = await parseTextFromFile(file);
               setParsedText(text);
               if (submissionInputMode === 'file') {
                   setSubmission(text);
               }
           } catch (error) {
               console.error('Error reading text file:', error);
           }
       } else if (file.type === 'application/pdf') {
           // If it's a PDF file, parse it to text
           try {
               const text = await pdfToText(file)
                   .catch(error => console.error("Failed to extract text from pdf", error));
               setParsedText(text);
               if (submissionInputMode === 'file') {
                   setSubmission(text);
               }
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
               setGPTResponse(responseData.Responses[0]);
               setGeminiResponse(responseData.Responses[1]);

           } else {
               console.error("Failed to get responses.");
           }
       } catch (error) {
           console.error(error);
       } finally {
           setIsLoading(false);
       }
   }, [prompt, submission]); // Depend on prompt to trigger fetch when it changes

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

                   // Generate a custom document ID
                   const customDocumentId = doc(reportsCollection).id;
                   const newReport = {
                       reportId: customDocumentId,
                       userId: user.uid,
                       prompt: prompt,
                       submission: submission,
                       reportData: responseData.Report,
                       mlData: responseData.ML,
                       feedback: false,
                       timestamp: new Date()
                   };

                   // Create a document reference with the custom document ID
                   const docRef = doc(reportsCollection, customDocumentId);

                   // Set the document data with the custom document ID
                   await setDoc(docRef, newReport);

                   // You can now access the custom document ID
                   console.log('New report with custom ID:', customDocumentId);
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
       'application/pdf': parsePDF,
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
    const auth = getAuth()
       try {
           await signOut(auth);
           window.location.href = '/'; 
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

   const goToHistory = () => {
       navigate('/report-history');
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
                   <Button
                       colorScheme="teal"
                       size="md"
                       onClick={goToAccountHome}
                       marginLeft="4"
                   >
                       Go to Account Home
                   </Button>
                   <Button
                       colorScheme="teal"
                       size="md"
                       onClick={goToHistory}
                       marginLeft="4"
                   >
                       Report History
                   </Button>
                       <Button onClick={handleSignOut} colorScheme="red" size="md" marginLeft="4">
                           Sign Out
                       </Button>
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
                                   onChange={handlePromptFileInputChange}
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
                                   onChange={handleSubmissionFileInputChange}
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
                <Box mt={8}>
                    {selectedModel === "ChatGPT" && (
                        <Box>
                            <h2>ChatGPT Response:</h2>
                            <Textarea
                                readOnly
                                value={GPTResponse}
                                width="100%"
                                height="200px"
                            />
                        </Box>
                    )}

                    {selectedModel === "Gemini/Bard" && (
                        <Box>
                            <h2>Gemini/Bard Response:</h2>
                            <Textarea
                                readOnly
                                value={GeminiResponse}
                                width="100%"
                                height="200px"
                            />
                        </Box>
                    )}
                </Box>
            </Box>
        </div>
    );
}
export default PromptForm;