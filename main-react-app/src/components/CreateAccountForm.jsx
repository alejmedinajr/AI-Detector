import React, { useState } from 'react';
import {getAuth, createUserWithEmailAndPassword} from "firebase/auth"

export const CreateAccountForm = (props) => {
    {/*]
    // initial value is empty string for the fields(for now)
    const [user, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    */}

    const [userCredentials, setUserCredentials] = useState({})

    function handleCredentials(event) {
        setUserCredentials({...userCredentials, [event.target.name]: event.target.value})
    }
    
    function handleSignup(event) {
        event.preventDefault();
        createUserWithEmailAndPassword(auth, userCredentials.email, userCredentials.password)
        .then((userCredential) => {
        // Signed up 
            const user = userCredential.user;
            console.log(user);
    })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode);
            console.log(errorMessage);
    });
    }

    {/*
    // capture the state of fields when user submits the form
    const handleSubmit = async (event) => {
        // declare to prevent page reloading and losing state
        event.preventDefault();
        console.log(user);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, user, password);
            
        } catch (error) {
            console.error(error);
        }
    }    
    */}

    return (
         // start form tag and connect handleSubmit
         <div className='form-container'>
            <form className='createaccount-form' onSubmit={handleSubmit}> 
            <>Create Account Page/Create an Account</>
             <label for="name" >Name</label>
             <input onChange={(event) =>{handleCredentials(event)}} type="name" placeholder='Your Name' id='name' name='name'/>
             <label for="email" >Email</label>
             <input onChange={(event) =>{handleCredentials(event)}} type="email" placeholder='Email' id='email' name='email'/>
             <label for="password" >Password</label>
             <input onChange={(event) =>{handleCredentials(event)}} type="password" placeholder='Password' id='password' name='password'/>
             
             <button onClick = {(event) => {handleSignup}} type='submit'>Create Account</button>

            </form>
        
         <button onClick={() => props.onformSwitch('LoginForm')}> Back to Login</button> 

         </div>
    )
}