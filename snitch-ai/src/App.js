import React, { useState } from "react";
import "./App.css";
import PromptForm from "./components/PromptForm";
import AccountHome from "./components/AccountHome";
import { AuthenticationForm } from './components/AuthenticationForm.jsx';
import FAQ from './components/FAQ'; // Ensure this is the correct path
import AboutPage from './components/AboutPage'; // Ensure this is the correct path
import { Box } from "@chakra-ui/react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import {getAuth, signOut} from "firebase/auth";
import ReportTable from "./components/History.jsx";

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
          <Route path="/account-home" element={isAuthenticated ? <AccountHome /> : <Navigate to="/" />} />
          <Route path="/report-history" element={<ReportTable />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/aboutpage" element={<AboutPage />} />
        </Routes>
      </Box>
    </Router>
  );
}

export default App;
