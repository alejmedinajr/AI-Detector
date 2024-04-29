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
import { useNavigate } from 'react-router-dom';

const FAQ = () => {
  const navigate = useNavigate();
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
    <Box>
      <Accordion allowMultiple>
        {faqData.map((faq, index) => (
          <AccordionItem key={index}>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  {faq.question}
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              {faq.answer}
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
      <Button colorScheme="blue" mt={4} onClick={() => navigate('/')}>
        Back to Login Page
      </Button>
    </Box>
  );
};

export default FAQ;
