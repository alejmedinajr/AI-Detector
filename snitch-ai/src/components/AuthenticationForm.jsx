import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import app from '../firebase.js'; 
import {Box, FormControl, FormLabel, Input, Button, VStack, Heading, Alert, AlertIcon, useColorModeValue} from '@chakra-ui/react';

export const AuthenticationForm = (props) => {
  const [userCredentials, setUserCredentials] = useState({ email: '', password: '', first_name: '', last_name: '' });
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');

  const auth = getAuth(app); // Initialize Firebase Auth

  function handleCredentials(event) {
    setUserCredentials({...userCredentials, [event.target.name]: event.target.value});
  }

  function resetPassword(email) {
      return sendPasswordResetEmail(auth, email).then((a) => {
        alert("Password reset email sent")
      }).catch((error) => {
       alert("There is no account associated with that email. Or no email was provided")
    });
  }


  async function handleSubmit(event) {
    event.preventDefault();

    if (isLogin) {
      signInWithEmailAndPassword(auth, userCredentials.email, userCredentials.password)
          .then((userCredential) => {
              console.log(userCredential.user);
              props.onAuthenticate(true);
          })
          .catch((error) => {
              console.error(error.message);
              setError(error.message);
          });
    } else {
      createUserWithEmailAndPassword(auth, userCredentials.email, userCredentials.password)
          .then((userCredential) => {
              console.log(userCredential.user);
          })
          .catch((error) => {
              console.error(error.message);
              setError(error.message);
          });
    }
  }

  return (
    <Box p={5} my={10} mx="auto" maxW="md" borderWidth="1px" borderRadius="lg" boxShadow="lg" bg={useColorModeValue('gray.50', 'gray.700')}>
      {error && <Alert status="error" borderRadius={5}>
          <AlertIcon />
          {error}
      </Alert>}
      <Heading mb={6}>{isLogin ? 'Login' : 'Sign Up'}</Heading>
      <VStack spacing={4} as="form" onSubmit={handleSubmit}>
        {!isLogin && (
          <>
            <FormControl isRequired>
              <FormLabel htmlFor="first_name">First Name</FormLabel>
              <Input id="first_name" type="text" placeholder='Your First Name' name='first_name' value={userCredentials.first_name} onChange={handleCredentials} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel htmlFor="last_name">Last Name</FormLabel>
              <Input id="last_name" type="text" placeholder='Your Last Name' name='last_name' value={userCredentials.last_name} onChange={handleCredentials} />
            </FormControl>
          </>
        )}
        <FormControl isRequired>
          <FormLabel htmlFor="email">Email</FormLabel>
          <Input id="email" type="email" placeholder='Email' name='email' value={userCredentials.email} onChange={handleCredentials}/>
        </FormControl>
        <FormControl isRequired>
          <FormLabel htmlFor="password">Password</FormLabel>
          <Input id="password" type="password" placeholder='Password' name='password' value={userCredentials.password} onChange={handleCredentials}/>
        </FormControl>
        <Button colorScheme="blue" mt={4} width="full" type="submit">
          {isLogin ? 'Log In' : 'Sign Up'}
        </Button>
      </VStack>
      <Button variant="ghost" mt={4} onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? 'Create an Account' : 'Back to Login'}
      </Button>
      <Button variant="ghost" mt={4} onClick={() => resetPassword(userCredentials.email)}>
        {isLogin ? 'Forgot Password?' : ""}
      </Button>
    </Box>
  );
};
