import React, { useEffect, useState } from 'react';
import { Flex, Icon, Box, Button, ButtonGroup, Text, VStack, Input, FormControl, FormLabel, useToast } from '@chakra-ui/react';
import { signOut, getAuth, updateEmail, updateProfile } from "firebase/auth";
import { doc, updateDoc, getFirestore } from "firebase/firestore";
import ThemeToggleButton from "./ThemeToggleButton";
import { useNavigate } from 'react-router-dom';
import { FaRobot } from 'react-icons/fa';

import { WarningTwoIcon } from "@chakra-ui/icons";

const AccountHome = () => {
  const [userDetails, setUserDetails] = useState({
    displayName: '',
    email: '',
  });
  const toast = useToast(); // For showing feedback
  const navigate = useNavigate();

  const auth = getAuth();
  const db = getFirestore(); // Initialize Firestore
  const user = auth.currentUser;

  const handleCreateModelClick = () => {
    toast({
      title: "New Feature Coming Soon!",
      description: "In future version of SNITCH, users will be able to create their own ML Models based on their own training data!",
      status: "warning", // 'warning' for a amber? color
      position: "top", // position at the top of the screen
      duration: 5000,
      isClosable: true,
      icon: <WarningTwoIcon color="black" boxSize={6} /> // add a warning icon
    });
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

  const handleGoToHistory = () => {
    navigate('/report-history');
  }

  useEffect(() => {
    if (user !== null) {
      // Set initial form values to current user details
      setUserDetails({
        displayName: user.displayName || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setUserDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleGoToPrompt = () => {
    navigate('/prompt'); // Assuming '/prompt' is the path for your prompt page
  };

  const handleSubmit = async () => {
    if (!user) return;

    try {
      // Update display name in Firebase Authentication
      if (userDetails.displayName !== user.displayName) {
        await updateProfile(user, { displayName: userDetails.displayName });
      }

      // Update email in Firebase Authentication
      if (userDetails.email !== user.email) {
        await updateEmail(user, userDetails.email);
      }

      // Optionally, update Firestore document with new details
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        displayName: userDetails.displayName,
        email: userDetails.email,
        // Add other fields as necessary
      });

      toast({
        title: "Account updated",
        description: "Your account details have been successfully updated.",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error updating account",
        description: error.message,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
  };

  return (
    <VStack height="75vh" alignItems="center" justifyContent="center">
      <ButtonGroup spacing={4} mt={1} justifyContent="center" size="md">
        <Button colorScheme="blue" onClick={handleCreateModelClick}>
          Custom AI Model
        </Button>
        <Button colorScheme="teal" onClick={handleGoToPrompt}>
          Go to Prompt Page
        </Button>
        <Button colorScheme="teal" onClick={handleGoToHistory}>
          Go to Report Page
        </Button>
        <Button colorScheme="red" onClick={handleSignOut}>
          Sign Out
        </Button> 
    </ButtonGroup>
  <Box maxWidth="800px" p={5} shadow="md" borderWidth="1px" borderRadius="md">
  
    <ThemeToggleButton />
    
  
    <VStack spacing={4}>
      <Text fontSize="xl">{`Welcome to Your Account Dashboard, ${userDetails.email}`}</Text>
      <FormControl id="displayName">
        <FormLabel>Name</FormLabel>
        <Input
          type="text"
          name="displayName"
          value={userDetails.displayName}
          onChange={handleChange}
        />
      </FormControl>
      <FormControl id="email">
        <FormLabel>Email</FormLabel>
        <Input
          type="email"
          name="email"
          value={userDetails.email}
          onChange={handleChange}
        />
      </FormControl>
      <Button colorScheme="blue" onClick={handleSubmit}>
        Update Account
      </Button>
      
    </VStack>
  </Box>
</VStack>
  );
};

export default AccountHome;
