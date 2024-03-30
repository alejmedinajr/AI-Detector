import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

export const LoginForm = (props) => {
    const [userCredentials, setUserCredentials] = useState({});

    function handleCredentials(event) {
        setUserCredentials({...userCredentials, [event.target.name]: event.target.value});
    }

    function handleLogin(event) {
        event.preventDefault();
        const auth = getAuth(); // Get the Auth object
        signInWithEmailAndPassword(auth, userCredentials.email, userCredentials.password)
            .then((userCredential) => {
                // Login successful
                const user = userCredential.user;
                console.log(user);
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorCode, errorMessage);
            });
    }

    return (
        <div className='form-container'>
            <h2>S.N.I.T.C.H</h2>
            <form className='login-form' onSubmit={handleLogin}> 
                <label htmlFor="email">Email</label>
                <input onChange={(event) => {handleCredentials(event)}} type="email" placeholder='Email' id='email' name='email'/>
                <label htmlFor="password">Password</label>
                <input onChange={(event) => {handleCredentials(event)}} type="password" placeholder='Password' id='password' name='password'/>

                <button type='submit'>Log In</button>
            </form>

            <button onClick={() => props.onformSwitch('CreateAccountForm')}>Create an Account</button>   
        </div>
    );
};
