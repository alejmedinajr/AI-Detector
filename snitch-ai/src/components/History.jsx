import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth"; // Firebase imports
import { getFirestore, collection, query, where, orderBy, getDocs, doc, updateDoc} from 'firebase/firestore';
import { Icon, Button, ButtonGroup, Table, Thead, Tbody, Tr, Th, Td, Heading, Spinner, Box, Text, Flex } from "@chakra-ui/react";
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';

import { useNavigate } from "react-router-dom";
import ThemeToggleButton  from "./ThemeToggleButton";

const ReportTable = () => {
    const [userReports, setUserReports] = useState([]);
    const [displayModel, setDisplayModel] = useState('ChatGPT');
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null); // State for storing user info

    const auth = getAuth();
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, currentUser => {
            setUser(currentUser);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);
    useEffect(() => {
        fetchUserReports();
    }, []);

    const fetchUserReports = async () => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
            const db = getFirestore();
            const reportsCollection = collection(db, "reports");
            const userReportsQuery = query(reportsCollection, where("userId", "==", user.uid),orderBy("timestamp", "desc"));
            const snapshot = await getDocs(userReportsQuery);
            const userReports = snapshot.docs.map((doc) => doc.data());
            setUserReports(userReports);
            setIsLoading(false);
        }
    };

    const toggleDisplayModel = () => {
        setDisplayModel(displayModel === 'ChatGPT' ? 'Gemini' : 'ChatGPT');
    };

    const navigate = useNavigate();

    const goToAccountHome = () => {
        navigate('/account-home');
    }

    const goToPromptForm = () => {
        navigate('/prompt');
    }
    
    const handleSignOut = async () => {
        try {
            await signOut(auth);
            navigate('/login'); // Navigate to the login route after successful sign-out
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    const handleFeedback = async (report, feedback) => {
        try {
          const response = await fetch('http://localhost:8000/update_training_data/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                submission: report.submission,
                feedback:
                  (report.result === 'AI-Generated' && feedback === 'correct') ||
                  (report.result === 'Human-Generated' && feedback === 'incorrect')
                    ? 1
                    : 0,
                }),
            });
      
          if (response.ok) {
            console.log('Training data updated successfully');
          } else {
            console.error('Failed to update training data');
          }
        } catch (error) {
          console.error('Error updating training data:', error);
        }
    };

    const renderReportData = (report) => {
    const metricData = report.reportData[displayModel];
    const mlData = report.mlData;
    return (
        <>
        <Td>{mlData}</Td>
        <Td>
          {report.feedback ? (
            <Flex justify="center">
              <Icon
                as={report.feedback === 'correct' ? FaThumbsUp : FaThumbsDown}
                color={report.feedback === 'correct' ? 'teal' : 'red'}
                boxSize={6}
              />
            </Flex>
          ) : (
            <>
              <Icon
                as={FaThumbsUp}
                color="gray.500"
                boxSize={6}
                cursor="pointer"
                onClick={() => handleFeedback(report, "correct")}
                mr={2}
              />
              <Icon
                as={FaThumbsDown}
                color="gray.500"
                boxSize={6}
                cursor="pointer"
                onClick={() => handleFeedback(report, "incorrect")}
              />
            </>
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

    return (
    <Box>
        
        <Box marginTop="4" display="flex" justifyContent="center">
            <Heading as="h2" size="lg">
                Report History
            </Heading>
        </Box>
        
        <Box marginTop="2" marginBottom="4" display="flex" justifyContent="center">
        <ButtonGroup spacing={4} mt={1} justifyContent="center">
            <Button colorScheme="teal" size="sm" onClick={goToPromptForm}>
                Go to Prompt Form
            </Button>
            <Button
                colorScheme="teal"
                size="sm"
                onClick={goToAccountHome}
                marginLeft="4"
            >
                Go to Account Home
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
        
        {isLoading ? (
        <Flex justify="center" align="center" height="200px">
            <Spinner size="xl" />
        </Flex>
        ) : (
        <Box marginTop="2" marginBottom="4" display="flex" justifyContent="center">
            <Table variant="striped" colorScheme="gray" size="sm" width="100px" justifyContent="center">
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
                {userReports.map((report) => (
                <Tr key={report.id}>
                    <Td>{new Date(report.timestamp.toDate()).toLocaleString()}</Td>
                    <Td>{report.id}</Td>
                    {renderReportData(report)}
                </Tr>
                ))}
            </Tbody>
            </Table>
        </Box>
        )}
    </Box>
    );
};

export default ReportTable;