// Import necessary React and Chakra UI components
import React from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Button
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom'; // Hook to enable navigation between routes

// Define the FAQ component
const FAQ = () => {
  const navigate = useNavigate(); // Hook to navigate to different routes

  // Data for the FAQ section as an array of objects
  const faqData = [
    {
      question: 'How do I change my email address?',
      answer: 'To change your email address, navigate to your account settings and select "Edit Profile". Update your email address and save the changes.'
    },
    {
      question: 'Can I use a mix of file input and raw text?',
      answer: 'Yes, our platform supports both file uploads and direct text input for processing. You can choose the preferred method when submitting your information.'
    },
    {
      question: 'Why can’t I see my report after I click ‘Generate Report’?',
      answer: 'If you are unable to see your report after generating it, check your internet connection or try refreshing the page. If the issue persists, please contact support.'
    },
    {
      question: 'Why am I not getting a response to my prompt?',
      answer: 'If you are not receiving a response, ensure you are connected to the internet and that there are no errors in your prompt. If issues continue, it could be due to server maintenance or high traffic.'
    },
  ];

  return (
    // Container for the FAQ accordion and back button
    <Box>
      // Accordion component from Chakra UI, set to allow multiple items open at once
      <Accordion allowMultiple>
        // Map through the faqData array and create an AccordionItem for each FAQ entry
        {faqData.map((faq, index) => (
          <AccordionItem key={index}> // Unique key for each item based on index
            <h2>
              <AccordionButton> // Button that toggles the accordion's open/close state
                <Box flex="1" textAlign="left"> // Box containing the question, styled for alignment
                  {faq.question}
                </Box>
                <AccordionIcon /> // Icon indicating the expand/collapse state
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}> // Panel that holds the answer, with padding bottom
              {faq.answer}
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
      // Button to navigate back to the login page
      <Button colorScheme="blue" mt={4} onClick={() => navigate('/')}>
        Back to Login Page
      </Button>
    </Box>
  );
};

export default FAQ; // Export the FAQ component for use in other parts of the application
