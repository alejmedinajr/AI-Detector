import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

export const CreateAccountForm = (props) => {
    const [userCredentials, setUserCredentials] = useState({
        name: '',
        email: '',
        password: ''
    });

    function handleCredentials(event) {
        setUserCredentials({...userCredentials, [event.target.name]: event.target.value});
    }
    
    function handleSignup(event) {
        event.preventDefault();
        const auth = getAuth(); // Getting the auth instance
        createUserWithEmailAndPassword(auth, userCredentials.email, userCredentials.password)
            .then((userCredential) => {
                // Signed up 
                const user = userCredential.user;
                console.log(user);
                alert("Account created successfully!");
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorCode);
                console.log(errorMessage);
            });
    }

    return (
         <div className='form-container'>
            <form className='createaccount-form' onSubmit={handleSignup}> 
                <h2>Create Account</h2>
                <label htmlFor="name">Name</label>
                <input onChange={(event) => {handleCredentials(event)}} type="text" placeholder='Your Name' id='name' name='name' value={userCredentials.name}/>
                <label htmlFor="email">Email</label>
                <input onChange={(event) => {handleCredentials(event)}} type="email" placeholder='Email' id='email' name='email' value={userCredentials.email}/>
                <label htmlFor="password">Password</label>
                <input onChange={(event) => {handleCredentials(event)}} type="password" placeholder='Password' id='password' name='password' value={userCredentials.password}/>
             
                <button type='submit'>Create Account</button>
            </form>
        
            <button onClick={() => props.onformSwitch('LoginForm')}> Back to Login</button> 
         </div>
    );
};
