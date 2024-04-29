import React, { useState } from 'react';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import app from '../firebase.js'; 
import {
  Select,
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  Heading,
  Alert,
  AlertIcon,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

export const AuthenticationForm = (props) => {
  const [userCredentials, setUserCredentials] = useState({
    email: '', 
    password: '', 
    first_name: '', 
    last_name: '', 
    role: '',
    university: '',
  });
  const [resetEmail, setResetEmail] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [showReset, setShowReset] = useState(false);

  const auth = getAuth(app);
  const db = getDatabase(app);
  const toast = useToast();
  const navigate = useNavigate(); 

  function handleCredentials(event) {
    setUserCredentials({
      ...userCredentials,
      [event.target.name]: event.target.value,
    });
  }

  function resetPassword(email) {
    if (!email) {
      alert("Please enter an email address.");
      return;
    }
    sendPasswordResetEmail(auth, email)
      .then(() => {
        toast({
          title: "Password reset email sent.",
          description: "Check your email to reset your password!",
          status: "success",
          duration: 9000,
          isClosable: true,
        });
        setShowReset(false);
        setResetEmail('');
      })
      .catch((error) => {
        console.error(error.message);
        toast({
          title: "Email does not exist.",
          description: "Double-check to ensure your email is correct!",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (isLogin) {
      signInWithEmailAndPassword(auth, userCredentials.email, userCredentials.password)
        .then((userCredential) => {
          props.onAuthenticate(true);
          navigate('/login'); // Redirect to login page
        })
        .catch((error) => {
          console.error(error.message);
          setError(error.message);
        });
    } else {
      createUserWithEmailAndPassword(auth, userCredentials.email, userCredentials.password)
        .then((userCredential) => {
          const user = userCredential.user;
          const userRef = ref(db, 'users/' + user.uid);
          set(userRef, {
            email: userCredentials.email,
            role: userCredentials.role,
            first_name: userCredentials.first_name,
            last_name: userCredentials.last_name,
          });
          toast({
            title: "Account created.",
            description: "Your account was successfully created!",
            status: "success",
            duration: 9000,
            isClosable: true,
          });
          setIsLogin(true);
        })
        .catch((error) => {
          console.error("Error in creating user profile:", error);
          setError(error.message);
          toast({
            title: "Error creating account.",
            description: error.message,
            status: "error",
            duration: 9000,
          });
        });
    }
  }

  return (
    <Box
      p={5}
      my={10}
      mx="auto"
      maxW="md"
      borderWidth="1px"
      borderRadius="lg"
      boxShadow="lg"
      bg={useColorModeValue('gray.50', 'gray.700')}
    >
      <Heading as="h1" size="2xl" textAlign="center" mb={6}>
        SNITCH
      </Heading>

      {error && (
        <Alert status="error" borderRadius={5}>
          <AlertIcon />
          {error}
        </Alert>
      )}
      <Heading mb={6}>{isLogin ? 'Login' : 'Sign Up'}</Heading>
      <VStack spacing={4} as="form" onSubmit={handleSubmit}>
        {!isLogin && (
          <>
            <FormControl isRequired>
              <FormLabel htmlFor="first_name">First Name</FormLabel>
              <Input
                id="first_name"
                type="text"
                placeholder="Your First Name"
                name="first_name"
                value={userCredentials.first_name}
                onChange={handleCredentials}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel htmlFor="last_name">Last Name</FormLabel>
              <Input
                id="last_name"
                type="text"
                placeholder="Your Last Name"
                name="last_name"
                value={userCredentials.last_name}
                onChange={handleCredentials}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel htmlFor="university">University</FormLabel>
              <Input
                id="university"
                type="text"
                placeholder="Your University"
                name="university"
                value={userCredentials.university}
                onChange={handleCredentials}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel htmlFor="role">Role</FormLabel>
              <Select
                id="role"
                name="role"
                placeholder="Select your role"
                value={userCredentials.role}
                onChange={handleCredentials}
              >
                <option value="student">Student</option>
                <option value="professor">Professor</option>
              </Select>
            </FormControl>
          </>
        )}
        <FormControl isRequired>
          <FormLabel htmlFor="email">Email</FormLabel>
          <Input
            id="email"
            type="email"
            placeholder="Email"
            name="email"
            value={userCredentials.email}
            onChange={handleCredentials}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel htmlFor="password">Password</FormLabel>
          <Input
            id="password"
            type="password"
            placeholder="Password"
            name="password"
            value={userCredentials.password}
            onChange={handleCredentials}
          />
        </FormControl>
        <Button colorScheme="blue" mt={4} width="full" type="submit">
          {isLogin ? 'Log In' : 'Sign Up'}
        </Button>
      </VStack>
      <Button
        variant="ghost"
        mt={4}
        onClick={() => setIsLogin(!isLogin)}
      >
        {isLogin ? 'Create an Account' : 'Back to Login'}
      </Button>
      {isLogin && (
        <>
          <Button
            variant="ghost"
            mt={4}
            onClick={() => setShowReset(!showReset)}
          >
            Forgot Password?
          </Button>
          {showReset && (
            <Box>
              <Input
                placeholder="Enter your email to reset password"
                mt={2}
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
              <Button mt={2} onClick={() => resetPassword(resetEmail)}>
                Send Reset Email
              </Button>
            </Box>
          )}
        </>
      )}
      <Button colorScheme="teal" mt={4} onClick={() => navigate('/aboutpage')}>
    About Project
  </Button>
  <Button colorScheme="teal" mt={4} ml={2} onClick={() => navigate('/FAQ')}>
    FAQ
  </Button>
      </Box>
  );
};
