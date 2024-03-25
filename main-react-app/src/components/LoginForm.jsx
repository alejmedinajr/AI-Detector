import React, { useState } from 'react';
import './LoginForm.css';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

export const LoginForm = (props) => {
    // initial value is empty string for both of these fields
    // user = email in this case
    // const [user, setUsername] = useState('')
    // const [password, setPassword] = useState('')

    // email and password will be in an object,, set the initial object to empty
    const [userCredentials, setUserCredentials] = useState({})

    function handleCredentials(event) {
        setUserCredentials({...userCredentials, [event.target.name]: event.target.value})
        
    }

    function handleLogin(event) {
        event.preventDefault();
        signInWithEmailAndPassword(getAuth, userCredentials.email, userCredentials.password)
        .then((userCredential) => {
            const user = userCredential.user;
    
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
        });
    }


    {/*}
    // capture the state of fields when user submits the form
    const handleSubmit = async (event) => {
        // declare to prevent page reloading and losing state
        event.preventDefault();
        console.log(user);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, user, password)
        } catch (error) {
            console.error(error);
        }

    }
    */}

    return (
        // start form tag and connect handleSubmit
        <div className='form-container'>
            <>S.N.I.T.C.H</>
            <form className='login-form' onSubmit={handleLogin}> 
            <label for="email" >Email</label>
            <input onChange={(event) =>{handleCredentials(event)}} type="email" placeholder='Email' id='email' name='email '/>
            <label for="password" >Password</label>
            <input onChange={(event) =>{handleCredentials(event)}} type="password" placeholder='Password' id='password' name='password'/>

            <button onClick = {(event) => {handleLogin(event)}} type='submit'>Log In</button>
            </form>

         <button onClick={() => props.onformSwitch('CreateAccountForm')}> Create an Account</button>   

        </div>
    )
}
