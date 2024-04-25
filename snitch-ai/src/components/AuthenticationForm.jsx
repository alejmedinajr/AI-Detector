import React, { useState } from 'react';
import pic from '../images/IMG_5744.jpg'
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
  Image,
  Text,
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
    return sendPasswordResetEmail(auth, email)
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
          console.log(userCredential.user);
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
          return set(userRef, {
            email: userCredentials.email,
            role: userCredentials.role,
            first_name: userCredentials.first_name,
            last_name: userCredentials.last_name,
          });
        })
        .then(() => {
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
      <Box mt={10} p={4} borderWidth={1} borderRadius="lg" boxShadow="lg" bg={useColorModeValue('gray.50', 'gray.700')}>
        <Text fontWeight="bold">About the Project</Text>
        <Text>
          This project aims to detect AI-generated content in student submissions. The goal is to maintain academic integrity by providing a tool for educators and students to gauge authenticity.
        </Text>
        <Text>
          This tool uses Firebase for authentication and data storage, along with Chakra UI for a clean user interface. The form allows users to sign up, log in, and reset passwords.
        </Text>
        <Text>
          Data gathered helps analyze trends in AI-generated content and supports educators in maintaining academic standards.
        </Text>
        <Text>
          This project including Caleb Highsmith, Alejandro Medina, Travis Rafferty, and Noah Zamarripa, secured 3rd place at the 34th Annual Conference of the Consortium for Computing Sciences in Colleges: South Central Region.
        </Text>
        <Image
          src={pic}
          alt="Team's 3rd place finish"
          boxSize="300px"
          objectFit="cover"
          width="100%"  // Ensures the image takes the full width available
          height="auto"  // Maintains aspect ratio
        />
      </Box>
    </Box>
  );
};
