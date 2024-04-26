import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth"; // Firebase imports
import { getFirestore, collection, query, where, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Icon, Button, ButtonGroup, Table, Thead, Tbody, Tr, Th, Td, Heading, Spinner, Box, Text, Flex, Stack, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, useDisclosure } from "@chakra-ui/react";
import { FaThumbsUp, FaThumbsDown, FaRobot } from 'react-icons/fa';

import { useNavigate } from "react-router-dom";
import ThemeToggleButton from "./ThemeToggleButton";

// documentation used to interact with database: https://firebase.google.com/docs/firestore (the beginning of the official documentation)

const ReportTable = () => {
  const [userReports, setUserReports] = useState([]);
  const [displayModel, setDisplayModel] = useState('ChatGPT'); // used to toggle report model metrics
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null); // State for storing user info
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const {isOpen, onOpen, onClose} = useDisclosure();
  const [isOpen1, setIsOpen1] = React.useState(false);
  const [isOpen2, setIsOpen2] = React.useState(false);
  const [isOpen3, setIsOpen3] = React.useState(false);
  const onClose1 = () => setIsOpen1(false); // these are used for modals
  const onClose2 = () => setIsOpen2(false);
  const onClose3 = () => setIsOpen3(false);
  const [showDefinition, setShowDefinition] = useState(true); // used to determine whether modal definition needs to be shown
  const rowsPerPage = 10; // defines the number of records in one page
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
      if (currentUser) {
        fetchUserReports(currentUser); // Call the fetch function with the current user
      } else {
        setIsLoading(false); // If no user, ensure loading is set to false
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchUserReports();
  }, []);

  const fetchUserReports = async () => { // used to retrieve all of the logged in user's reports
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const db = getFirestore();
      const reportsCollection = collection(db, "reports"); // reference to the location in our database
      const userReportsQuery = query(reportsCollection, where("userId", "==", user.uid), orderBy("timestamp", "desc")); // getting and ordering the reports by date
      const snapshot = await getDocs(userReportsQuery); // snapshot contains all of the reports
      const userReports = snapshot.docs.map((doc) => doc.data()); // takes the array of documents returned from a Firestore query and transforms it into an array of JavaScript objects
      setUserReports(userReports);
      setIsLoading(false);
    }
  };

  const toggleDisplayModel = () => { // toggle between chatgpt and gemini metric results
    setDisplayModel(displayModel === 'ChatGPT' ? 'Gemini' : 'ChatGPT');
  };

  const navigate = useNavigate();

   // Ensure buttons for navigation do not submit forms or cause unintended actions
   const goToAccountHome = (event) => {
    event.preventDefault(); // Prevent default form submission behavior
    navigate('/account-home');
  };

  const goToPromptForm = (event) => {
    event.preventDefault(); // Prevent default form submission behavior
    navigate('/prompt');
  };

  const handleSignOut = async () => { // handle the logout
    try {
      await signOut(auth);
      window.location.href = '/'; // Navigate to the login route after successful sign-out
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const handleFeedback = async (report, feedback) => { // function for handling feedback (basically the user clicks thumbs up/down to label data and update training data)
    try {
      const response = await fetch('https://fastapi-cloud-function-xazwabprtq-uc.a.run.app/update_training_data/', { // make call to FastAPI endpoint function responsible for updating training data
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submission: report.submission,
          feedback: // values of label depending on prediction and result
            (report.result === 'AI-Generated' && feedback === 'correct') || 
            (report.result === 'Human-Generated' && feedback === 'incorrect')
              ? 1
              : 0,
        }),
      });

      if (response.ok) {
        console.log('Training data updated successfully');

        async function getReportByID(reportId) { // repsonsible for getting all of the reports (used to update a single report)
          try {
            const auth = getAuth();
            const user = auth.currentUser;

            if (user) {
              const db = getFirestore();
              const reportsCollection = collection(db, "reports");

              // Query to get the specific report by ID and user (this reportQuery const was troubleshooted and worked out by chatGPT because we were having trouble with it)
              const reportQuery = query( // start of chatgpt produced code
                reportsCollection,
                where("userId", "==", user.uid),
                where("__name__", "==", reportId)
              ); // end of chatgpt produced code

              const querySnapshot = await getDocs(reportQuery);

              if (!querySnapshot.empty) { // if there are results, we need to check one for the specific id
                const reportDoc = querySnapshot.docs[0];
                const reportRef = doc(db, "reports", reportDoc.id);
                await updateDoc(reportRef, { // if we find it, update the feedback to true so the robot icon is shown (no more labeling for that specific report)
                  feedback: true
                });
                return reportDoc.data();
              } else { // report was not found by id
                console.log("No report found with the provided ID", reportId);
                return null;
              }
            } else {
              console.log("No user is currently authenticated");
              return null;
            }
          } catch (error) {
            console.error("Error getting report:", error);
            return null;
          }
        }

        const reportId = report.reportId;
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) { // need to make sure the user is logged in and authenticated before we try to get report data
          getReportByID(reportId)
            .then((report) => {
              if (report) {
                console.log("Report data:", report);
                fetchUserReports();
              }
            })
            .catch((error) => {
              console.error("Error:", error);
            });
        } else {
          console.log("No user is currently authenticated");
        }

      } else {
        console.error('Failed to update training data');
      }
    } catch (error) {
      console.error('Error updating training data:', error);
    }
  };

  const renderReportData = (report) => { // responsible for iteratively producing the rows of the report data
    const metricData = report.reportData[displayModel];
    const mlData = report.mlData;
    return (
      <>
        <Td>{mlData}</Td>
        <Td>
          {report.feedback ? (
            <Flex justify="center" direction="column" align="center">
              <Icon
                as={FaRobot}
                color="teal"
                boxSize={4}
              />
              Thanks!
            </Flex>
          ) : (
            <Flex justify="center" direction="row" align="center">
                    
                    
              <Icon
                as={FaThumbsUp}
                color="gray.500"
                boxSize={4}
                cursor="pointer"
                onClick={() => handleFeedback(report, "correct")}
                mr={2}
                _hover={{ color: "teal" }}
              />
              <Icon
                as={FaThumbsDown}
                color="gray.500"
                boxSize={4}
                cursor="pointer"
                _hover={{ color: "red" }}
                onClick={() => handleFeedback(report, "incorrect")}
              />
            </Flex>
          )}
        </Td>
        <Td>{Math.round(metricData['Cosine Similarity'])}%</Td>
        <Td>{Math.round(metricData['Partial Ratio Similarity'])}%</Td>
        <Td>{Math.round(metricData['Ratio Similarity'])}%</Td>
        <Td>{Math.round(metricData['Sequence Quick Ratio Similarity'])}%</Td>
        <Td>{Math.round(metricData['Sequence Ratio Similarity'])}%</Td>
        <Td>{Math.round(metricData['Sequence Real Quick Ratio Similarity'])}%</Td>
        <Td>{Math.round(metricData['Syntactic Similarity'])}%</Td>
        <Td>{Math.round(metricData['Token Set Ratio Similarity'])}%</Td>
        <Td>{Math.round(metricData['Token Sort Ratio Similarity'])}%</Td>
      </>
    );
  };

  const totalPages = Math.ceil(userReports.length / rowsPerPage); // calculation to decide the total number of pages based on the total report count

  const handlePageChange = (pageNumber) => { // used to define how the page should be updated when the user goes to the next report page
    setCurrentPage(pageNumber);
  };

  const getReportsForCurrentPage = () => { // responsible for actually showing the subset of reports (using slicing): https://www.w3schools.com/jsref/jsref_slice_array.asp
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return userReports.slice(startIndex, endIndex);
  };
  // return the components responsible for building the form (contains table of reports and modals)
  return (
    <Box>
      <Box marginTop="4" display="flex" justifyContent="center">
        <Heading as="h2" size="lg">
          Report History
        </Heading>
      </Box>

      <Box marginTop="2" marginBottom="4" display="flex" justifyContent="center">
        <ButtonGroup spacing={4} mt={1} justifyContent="center">
          <Button
            colorScheme="teal"
            size="sm"
            onClick={goToAccountHome}
            marginLeft="4"
          >
            Go to Account Home
          </Button>
          <Button colorScheme="teal" size="sm" onClick={goToPromptForm}>
            Go to Prompt Form
          </Button>
          <Button onClick={toggleDisplayModel} colorScheme="blue" size="sm">
            Toggle Model: {displayModel}
          </Button>
          {user ? (
            <Button onClick={handleSignOut} colorScheme="red" size="sm" marginLeft="4">
              Sign Out
            </Button>
          ) : (
            <Text>Please log in.</Text>
          )}
          <ThemeToggleButton />
        </ButtonGroup>
      </Box>

      <Flex justifyContent='center' marginBottom="4">
        <ButtonGroup spacing={4} mt={1} justifyContent='center' size="sm">
          <Button colorScheme="gray" marginTop={2} onClick={() => setIsOpen1(true)}>Sequence Comparison</Button>
            <Modal isOpen={isOpen1} onClose={onClose1}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Sequence Information</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <>
                    {showDefinition ? (
                        <div>
                        <p>
                            The sequence comparison compares string using difflib sequence matcher. This is an extension of  
                            <i> gestalt</i> pattern matching which finds the longest contiguous matching subsequence that is applied to
                            pieces of the sequence on the left and right of the matching subsequence. The extension of this 
                            sequence matcher is the removal of whitespace and blank lines in the strings before they are turned 
                            into sequences.
                        </p>
                        </div>
                    ) : (
                        <div align="center">
                        <p>
                            <b>Sentence 1:</b> "The quick brown fox jumps over the lazy dog"<br/><br />
                            <b>Sentence 2:</b> "A fast brown fox leaps above a tired canine"<br/><br />
                            In this example, the longest common subsequence (LCS) between these two sentences is <b>"brown fox"</b>.<br></br>
                            <br></br>"The quick <b>brown fox</b> jumps over the lazy dog"<br></br>
                            <br></br>"A fast <b>brown fox</b> leaps above a tired canine"<br></br><br></br>
                            The similarity score can be calculated as the length of the LCS divided by the length of the longer string.
                        </p>
                        </div>
                    )}
                    <div align="center">
                        <button onClick={() => setShowDefinition(!showDefinition)}>
                            <br></br><b>{showDefinition ? 'Show Example' : 'Show Definition'}</b>
                        </button>
                    </div>
                    
                    </>
                </ModalBody>
                </ModalContent>
            </Modal>
          <Button colorScheme="gray" marginTop={2} onClick={() => setIsOpen2(true)}>Cosine Comparison</Button>
            <Modal isOpen={isOpen2} onClose={onClose2}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Cosine Information</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                The cosine comparison converts the texts into numerical representations in the form of vectors, where each dimension represents the importance of 
                a particular word in the context of the entire text. The vectorization step uses cosine similarity which measures the cosine of 
                the angle between two vectors. This provides a similarity metric, indicating the degree of similarity between the two texts. 
              </ModalBody>
            </ModalContent>
          </Modal>
          <Button colorScheme="gray" marginTop={2} onClick={() => setIsOpen3(true)}>FuzzyWuzzy Comparison</Button>
            <Modal isOpen={isOpen3} onClose={onClose3}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>FuzzyWuzzy Information</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
    <>
      {showDefinition ? (
        <div>
          <p>
            The fuzz comparison compares two strings in various sequence comparison functions from the FuzzyWuzzy Python library. Strings
            can have a score out of 100 that denotes similarity between strings with a similarity index. Fuzzy string matching finds strings
            which match under a given pattern. The Levenshtein Distance is used to calculate the difference between string sequences. Levenshtein
            Distance between two words is the minimum number of single character edits required to change one string into the other.
          </p>
        </div>
      ) : (
        <div align="center">
          <p>
            <b>Sentence 1:</b> "The quick brown fox jumps over the lazy dog"<br/><br />
            <b>Sentence 2:</b> "A fast brown fox leaps above a tired canine"<br/><br />
            In this example, the Levenshtein distance between these two sentences is <b>7</b>:
          </p>
          <br></br>
          
            1. Replace "The" with "A"<br></br>
            2. Replace "quick" with "fast"<br></br>
            3. Replace "jumps" with "leaps"<br></br>
            4. Replace "over" with "above"<br></br>
            5. Replace "the" with "a"<br></br>
            6. Replace "lazy" with "tired"<br></br>
            7. Replace "dog" with "canine"<br></br>
          
        </div>
      )}
      <div align="center">
        <button onClick={() => setShowDefinition(!showDefinition)}>
            <br></br><b>{showDefinition ? 'Show Example' : 'Show Definition'}</b>
        </button>
      </div>
      
    </>

</ModalBody>
            </ModalContent>
          </Modal>
        </ButtonGroup>
      </Flex>

      {isLoading ? (
        <Flex justify="center" align="center" height="200px">
          <Spinner size="xl" />
        </Flex>
      ) : (
        <>
          <Box marginTop="2" marginBottom="4" display="flex" justifyContent="center">
            <Table 
                variant="striped" 
                colorScheme="gray" 
                size="sm" 
                justifyContent="center"
                sx={{
                    th: {
                    fontSize: '0.7rem',
                    px: 2,
                    },
                    td: {
                    fontSize: '0.7rem',
                    px: 2,
                    },
                }}
            >
              <Thead>
                <Tr>
                  <Th>Date</Th>
                  <Th>Report ID</Th>
                  <Th>Machine Learning Prediction</Th>
                  <Th>Verify Prediction</Th>
                  <Th>Cosine Similarity</Th>
                  <Th>Partial Ratio Similarity</Th>
                  <Th>Ratio Similarity</Th>
                  <Th>Sequence Quick Ratio Similarity</Th>
                  <Th>Sequence Ratio Similarity</Th>
                  <Th>Sequence Real Quick Ratio Similarity</Th>
                  <Th>Syntactic Similarity</Th>
                  <Th>Token Set Ratio Similarity</Th>
                  <Th>Token Sort Ratio Similarity</Th>
                </Tr>
              </Thead>
              <Tbody>
                {getReportsForCurrentPage().map((report) => (
                  <Tr key={report.reportId}>
                    <Td>{new Date(report.timestamp.toDate()).toLocaleString()}</Td>
                    <Td>{report.reportId}</Td>
                    {renderReportData(report)}
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
          <Box marginTop="4" marginBottom="8" display="flex" justifyContent="center">
            <ButtonGroup>
              {Array.from({ length: totalPages }, (_, index) => (
                <Button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  colorScheme={currentPage === index + 1 ? 'blue' : 'gray'}
                  size="sm"
                >
                  {index + 1}
                </Button>
              ))}
            </ButtonGroup>
          </Box>
        </>
      )}
    </Box>
  );
};

export default ReportTable; 