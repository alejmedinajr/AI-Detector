import React, { useEffect, useState } from 'react';
import { Box, Button, Text, VStack } from '@chakra-ui/react';
import { getAuth } from "firebase/auth";

const AccountHome = () => {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user !== null) {
      const displayName = user.email;
      setUserName(displayName);
    }
  }, []);

  const handleCreateModelClick = () => {
    alert('Creating a custom AI detection model...');
  };

  return (
    <Box p={5} shadow="md" borderWidth="1px" flex="1" borderRadius="md">
      <VStack spacing={4}>
        <Text fontSize="xl">{`Welcome to Your Account Dashboard, ${userName}`}</Text>
        <Button colorScheme="blue" onClick={handleCreateModelClick}>
          Create Custom AI Model
        </Button>
      </VStack>
    </Box>
  );
};

export default AccountHome;
