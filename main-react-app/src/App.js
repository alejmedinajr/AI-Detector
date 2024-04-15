import React, { useState } from "react";
import "./App.css";
import PromptForm from "./components/PromptForm";
import FileForm from "./components/FileForm";
import AccountHome from "./components/AccountHome";
import { AuthenticationForm } from './components/AuthenticationForm.jsx';
import { Box } from "@chakra-ui/react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import {getAuth, signOut} from "firebase/auth";


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const authenticateUser = (status) => {
    setIsAuthenticated(status);
  };

  const handleSignOut = () => {
    const auth = getAuth();
    signOut(auth).then(() => {
      console.log("User signed out");
      setIsAuthenticated(false); // Update isAuthenticated state
    }).catch((error) => {
      console.error("Sign out error:", error);
    });
  };

  // Create state of current form
  const [isLogin, setIsLogin] = useState(true);

  // Toggle between login and signup forms
  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <Router>
      <Box>
        <Routes>
          <Route path="/" element={!isAuthenticated ? <AuthenticationForm onAuthenticate={authenticateUser} /> : <Navigate to="/prompt" />} />
          <Route path="/prompt" element={isAuthenticated ? (
              <>
                <PromptForm />
              </>
            ) : <Navigate to="/" />
          } />
          <Route path="/account-home" element={isAuthenticated ? <AccountHome /> : <Navigate to="/" />}/>
        </Routes>
      </Box>
    </Router>
  );
}

export default App;