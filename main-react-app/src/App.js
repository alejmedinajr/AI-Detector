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
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";


function App() {
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const authenticateUser = (status) => {
    setIsAuthenticated(status);
  };

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
    <Router>
      <Box /* Your styling here */>
        {/* Your header and other components */}
        <Routes>
          <Route path="/" element={!isAuthenticated ? <AuthenticationForm onAuthenticate={authenticateUser} /> : <Navigate to="/prompt" />} />
          <Route path="/prompt" element={isAuthenticated ? (
              <>
                <PromptForm />
                <FileForm /> {/* Now showing FileForm alongside PromptForm */}
              </>
            ) : <Navigate to="/" />
          } />
        </Routes>
      </Box>
    </Router>
  );
}

export default App;
