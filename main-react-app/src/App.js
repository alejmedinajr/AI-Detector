import React, {useState} from "react";
import "./App.css"
import PromptForm from "./PromptForm";
import { LoginForm } from "./LoginForm";
import { CreateAccountForm } from "./CreateAccountForm";

function App() {
  //create state of current form
  const [currentForm, setForm] = useState('LoginForm');

  // take in form name to set current form to correct one
  const changeForm = (formName) => {
    setForm(formName);
  }

  return (
    <div className="App">
      {
        // if login is current form then go to the LoginForm otherwise go to CreateAccountForm
        currentForm === 'LoginForm' ? <LoginForm onformSwitch = {changeForm} /> : <CreateAccountForm onformSwitch = {changeForm} />
      } 
    </div>
  );
}

export default App;