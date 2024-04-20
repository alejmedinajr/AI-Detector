import React, { useState, useEffect, useCallback } from 'react';
import { Button, ButtonGroup, Textarea, VStack, Heading, Spinner, Box, Text, Flex, Modal, ModalOverlay,
    ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, useDisclosure, useToast } from "@chakra-ui/react";
import { FaSpinner } from "react-icons/fa"; // Import loading spinner icon if needed
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth"; // Firebase imports
import { useNavigate } from "react-router-dom";
import ThemeToggleButton from "./ThemeToggleButton";
import pdfToText from 'react-pdftotext'
import ReportTable from './History';
import { getFirestore, collection, addDoc, doc, setDoc } from "firebase/firestore";
import { encode } from 'gpt-tokenizer';

// References:
// https://v2.chakra-ui.com/docs/components
// https://firebase.google.com/docs/firestore
// https://firebase.google.com/docs/auth
// https://reactrouter.com/en/main/hooks/use-navigate
// https://v2.chakra-ui.com/docs/components/toast
// https://www.npmjs.com/search?q=pdftotext
// https://www.npmjs.com/package/gpt-tokenizer
// https://reactrouter.com/en/main/hooks/use-navigate

function PromptForm({ onSignOut }) {
    const toast = useToast();

    const [responses, setResponses] = useState({});
    const [GPTResponse, setGPTResponse] = useState('');
    const [GeminiResponse, setGeminiResponse] = useState('');
    const {isOpen, onOpen, onClose} = useDisclosure();

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

   const handleInstructionToggleButtonClick = (mode) => { // handle toggle for instruction input (file or text)
       setInstructionInputMode(mode); 
   };

   const handleSubmissionToggleButtonClick = (mode) => { // handle toggle for submission input (file or text)
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
        if(encode(prompt).length >= 100000) {
            toast({ // predefined maximum token size for ai api's
                title: "Prompt Too Long!",
                description: "The prompt is too long. The maximum number of tokens supported is 100000, but your submitted prompt was " + encode(prompt).length + ". Please try again with a shorter prompt.",
                status: "error",
                position: "top", // position at the top of the screen
                duration: 5000,
                isClosable: true,
            });
        } else if(encode(prompt).length === 0) {
            toast({ // a prompt needs to be included (otherwise whats the point (it also crashes if there is no prompt sent to chatgpt or gemini api))
                title: "No prompt sent!",
                description: "You must have forgotten to send a prompt!",
                status: "error",
                position: "top", // position at the top of the screen
                duration: 5000,
                isClosable: true,
            });
        } else {
            setIsLoading(true);
            try {
                const response = await fetch("http://localhost:8000/form_submission/", { // make call to fastAPI endpoint
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
                    const responseData = await response.json(); // contains both api responses
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
        }
        
    }, [prompt, submission, toast]);

   const fetchReport = useCallback(async () => {
    if(encode(prompt).length >= 100000) {
        toast({ // we defined a maximum length of 100000 tokens, this cannot be exceeded or it will crash the api's
            title: "Prompt Too Long!",
            description: "The prompt is too long. The maximum number of tokens supported is 100000, but your submitted prompt was " + encode(prompt).length + ". Please try again with a shorter prompt.",
            status: "error",
            position: "top", // position at the top of the screen
            duration: 5000,
            isClosable: true,
        });
    } else if(encode(prompt).length === 0) { // the prompt needs to be sent with at least one character
        toast({
            title: "No prompt sent!",
            description: "You must have forgotten to send a prompt!",
            status: "error",
            position: "top", // position at the top of the screen
            duration: 5000,
            isClosable: true,
        });
    } else if(encode(submission).length === 0) {
        toast({ // alert to notify a submission was not sent
            title: "No submission sent!",
            description: "You must have forgotten to enter a submission!",
            status: "error",
            position: "top", // position at the top of the screen
            duration: 5000,
            isClosable: true,
        });
    } else {
        setIsLoading(true);

        try {
            const response = await fetch("http://localhost:8000/generate_report/", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ // need to use JSON stringify for FastAPI
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
 
                    console.log('New report with custom ID:', customDocumentId);
                    toast({ // alert the user the report has been made (but at the bottom to not congest top area popups)
                        title: "New Report made!",
                        description: "Your new report has been created: " + customDocumentId,
                        status: "success",
                        position: "bottom", // position at the bottom of the screen
                        duration: 10000,
                        isClosable: true,
                    });

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
    }
       
   }, [prompt, submission, toast]);

   // Define a map of file types to parsing functions
   const fileTypeParsers = { // source of mime mapping idea: https://github.com/sindresorhus/file-type
       'application/pdf': parsePDF,
       'pdf': parsePDF,
       '.pdf': parsePDF
       //'application/pdf': parsePDF,
       //'application/vnd.openxmlformats-officedocument.wordprocessingml.document': parseDOCX
   };

   // Function to parse text from files
   async function parseTextFromFile(file) {
       const parser = fileTypeParsers[file.type]; // use the custom mappings to parse the files
       if (parser) {
        return await parser(file);
       } else {
        toast({ // notify the user that the file type was not supported
            title: "We cannot parse your file!",
            description: "It seems you have uploaded an unsupported file type (we accept pdf and txt)!",
            status: "error",
            position: "top", // position at the top of the screen
            duration: 10000,
            isClosable: true,
        });
       } throw new Error('Unsupported file type.'); // the uploaded file is not a supported file type
   }

   function parsePDF(event) { 
       const file = event.target.files[0] // define the file(s)
       pdfToText(file) // used existing module to parse the file content
           .then(text => console.log(text)) // if successful log this to console
           .catch(error => console.error("Failed to extract text from pdf")) // otherwise report that it crashed
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

   const handleSignOut = async () => { // used to sign the user out and redirect them to the login page
    const auth = getAuth()
       try {
           await signOut(auth);
           window.location.href = '/'; 
       } catch (error) {
           console.error("Error signing out: ", error);
       }
   };

    const handleReport = async () => {
       if(encode(submission).length > 0 && encode(prompt).length > 0 ) { // the prompt and submission both need to have at least one character
        fetchReport(); // Call fetchReport without waiting for it to complete
            toast({ // notify the user the report to generate the request was sent (any errors are handled by fetchReport)
                title: "Report Request Sent!",
                description: "It could take some time to generate your report, but when it is done, you will receive a notification on the bottom of the screen!",
                status: "warning",
                position: "top", // position at the top of the screen
                duration: 10000,
                isClosable: true,
            });
       } else {
            toast({ // notify the user that the prompt and/or submission are missing (should not be allowed)
                title: "Prompt and/or Submission are missing!",
                description: "You must fill out both components of the form (prompt and submission) in order to generate a report!",
                status: "error",
                position: "top", // position at the top of the screen
                duration: 10000,
                isClosable: true,
            });
       }
    }

   const goToAccountHome = () => { // navigation rules for pressing account home button
       navigate('/account-home');
   }

   const goToHistory = () => { // navigation rules for pressing reports button
       navigate('/report-history');
   }
   // components for the prompt form, following our initial layout and chalk talk design
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
                               disabled={!prompt || !prompt.trim()} // Disable button if prompt is empty
                               mt={8}
                           >
                               Submit Prompt
                           </Button>
                           <Button onClick={handleReport} colorScheme="blue" size="md" marginLeft="4" mt={8}>
                               Generate Report
                           </Button>
                       </ButtonGroup>
                       <Flex direction="column" alignItems="center">
                            <Button colorScheme="blue" marginTop={10} onClick={onOpen}>Help</Button>
                            <Modal isOpen={isOpen} onClose={onClose}>
                                <ModalOverlay />
                                <ModalContent>
                                    <ModalHeader>Help Guide</ModalHeader>
                                    <ModalCloseButton />
                                    <ModalBody>
                                        If you are putting code, put the raw code and try to leave out as much fluff as you can.
                                        Extra long assingments might not be as accurately parsed as smaller text sizes.
                                        You can toggle between putting raw texts and putting files(.pdf, .txt, .docx).
                                        'Submit Prompt' button will send your text/file to the AI API you choose and give out a raw response
                                        from them below. 
                                        'Generate Report' button will give a summary about the accuracy of the inputed file/text and the AI response
                                        as well as percentages of accuracy of each kind of comparison that is done on each text/file given. This report 
                                        will be available on your personal report page.
                                    </ModalBody>
                                    <ModalFooter>
                                        <Button colorScheme="red" mr={3} onClick={onClose}>
                                            Close
                                        </Button>
                                    </ModalFooter>
                                </ModalContent>
                            </Modal>
                        </Flex>
                        {GPTResponse && (
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
                        )}
                       
                    </Flex>
                </form>

                {/* Display selected model response */}
                {GPTResponse && (
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
                )}
                
            </Box>
        </div>
    );
}
export default PromptForm;