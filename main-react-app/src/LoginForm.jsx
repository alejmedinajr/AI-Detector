import React, { useState } from 'react';
import './LoginForm.css';

export const LoginForm = (props) => {
    // initial value is empty string for both of these fields
    const [user, setUsername] = useState('')
    const [password, setPassword] = useState('')

    // capture the state of fields when user submits the form
    const handleSubmit = (event) => {
        // declare to prevent page reloading and losing state
        event.preventDefault();
        console.log(user);
    }

    return (
        // start form tag and connect handleSubmit
        <>
        <form onSubmit={handleSubmit}> 
            <>S.N.I.T.C.H</> 
            <label for="username" >Username</label>
            <input value={user} type="username" placeholder='Username' id='username' name='username'/>
            <label for="password" >Password</label>
            <input value={password} type="password" placeholder='Password' id='password' name='password'/>

            <button type='submit'>Log In</button>
        </form>

         <button onClick={() => props.onformSwitch('CreateAccountForm')}> Create an Account</button>   

        </>
    )
}
