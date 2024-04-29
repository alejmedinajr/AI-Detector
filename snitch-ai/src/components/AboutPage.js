import React from 'react';
import { Box, Text, Button, Image } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import pic from '../images/IMG_5744.jpg'; // Make sure this path is correct based on where your image is stored

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <Box p={5} my={10} mx="auto" maxW="md" borderWidth="1px" borderRadius="lg" boxShadow="lg" bg='gray.50'>
      <Text fontSize="2xl" fontWeight="bold" mb={4}>About the Project</Text>
      <Text mb={2}>
        This project aims to detect AI-generated content in student submissions. The goal is to maintain academic integrity by providing a tool for educators and students to gauge authenticity.
      </Text>
      <Text mb={2}>
        This tool uses Firebase for authentication and data storage, along with Chakra UI for a clean user interface. The form allows users to sign up, log in, and reset passwords.
      </Text>
      <Text mb={2}>
        Data gathered helps analyze trends in AI-generated content and supports educators in maintaining academic standards.
      </Text>
      <Text mb={4}>
        This project, including Caleb Highsmith, Alejandro Medina, Travis Rafferty, and Noah Zamarripa, secured 3rd place at the 34th Annual Conference of the Consortium for Computing Sciences in Colleges: South Central Region.
      </Text>
      <Image
        src={pic}
        alt="Team's 3rd place finish"
        boxSize="300px"
        objectFit="contain"
        width="100%"
      />
      <Button colorScheme="blue" mt={4} onClick={() => navigate('/')}>
        Back to Login Page
      </Button>
    </Box>
  );
};

export default AboutPage;
