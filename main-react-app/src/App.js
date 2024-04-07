import React, { useState } from "react";
import "./App.css";
import PromptForm from "./components/PromptForm";
import FileForm from "./components/FileForm";
import { AuthenticationForm } from "./components/AuthenticationForm"; // Changed import here
import { IconButton } from "@chakra-ui/button";
import { useColorMode } from "@chakra-ui/color-mode";
import { Flex, VStack, Heading, Spacer } from "@chakra-ui/layout";
import { FaSun, FaMoon } from "react-icons/fa";
import { Box } from "@chakra-ui/react";

function App() {
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === "dark";

  // Define light and dark gradients
  const lightGradient = "linear(to-b, white.200, cyan.200)";
  const darkGradient = "linear(to-b, gray.800, gray.900)";

  // Get the appropriate gradient based on color mode
  const bgGradient = isDark ? darkGradient : lightGradient;

  // Create state of current form
  const [isLogin, setIsLogin] = useState(true);

  // Toggle between login and signup forms
  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <Box
      bgGradient={bgGradient}
      minHeight="100vh"
      transition="background-color 200ms linear" // Apply transition effect
    >
      <VStack>
        <Flex w="100%">
          <Heading
            ml="2"
            size="lg"
            fontWeight="extrabold"
            color="blue.500"
            justifyContent="center"
          >
            SNITCH:AI
          </Heading>
          <Spacer />
          <IconButton
            ml={9}
            icon={isDark ? <FaSun /> : <FaMoon />}
            isRound="true"
            onClick={toggleColorMode}
          ></IconButton>
        </Flex>
        <PromptForm />
        <FileForm />
        <div className="App">
          <AuthenticationForm isLogin={isLogin} />
          
        </div>
      </VStack>
    </Box>
  );
}

export default App;
