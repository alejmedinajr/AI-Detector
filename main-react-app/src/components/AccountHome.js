import React, { useEffect, useState } from 'react';
import { Box, Button, Text, VStack, Input, FormControl, FormLabel, useToast } from '@chakra-ui/react';
import { getAuth, updateEmail, updateProfile } from "firebase/auth";
import { doc, updateDoc, getFirestore } from "firebase/firestore";
import ThemeToggleButton from "./ThemeToggleButton";
import { useNavigate } from 'react-router-dom';

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
    alert('Creating a custom AI detection model...');
  };

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
    <Box p={5} shadow="md" borderWidth="1px" flex="1" borderRadius="md">
      <ThemeToggleButton />
      <VStack spacing={4}>
      <Text fontSize="xl">{`Welcome to Your Account Dashboard, ${userDetails.email}`}</Text>
        <Button colorScheme="blue" onClick={handleCreateModelClick}>
          Create Custom AI Model
        </Button>
        <FormControl id="displayName">
          <FormLabel>Name</FormLabel>
          <Input type="text" name="displayName" value={userDetails.displayName} onChange={handleChange} />
        </FormControl>
        <FormControl id="email">
          <FormLabel>Email</FormLabel>
          <Input type="email" name="email" value={userDetails.email} onChange={handleChange} />
        </FormControl>
        <Button colorScheme="blue" onClick={handleSubmit}>
          Update Account
        </Button>
        <Button colorScheme="teal" onClick={handleGoToPrompt}>
          Go to Prompt Page
        </Button>
      </VStack>
    </Box>
  );
};

export default AccountHome;
