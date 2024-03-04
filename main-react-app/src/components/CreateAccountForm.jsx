import React, { useState } from 'react';
import {getAuth, createUserWithEmailAndPassword} from "firebase/auth"

export const CreateAccountForm = (props) => {
    // initial value is empty string for the fields(for now)
    const [user, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')

    // capture the state of fields when user submits the form
    const handleSubmit = (event) => {
        // declare to prevent page reloading and losing state
        event.preventDefault();
        console.log(user);
    }    

    return (
         // start form tag and connect handleSubmit
         <div className='form-container'>
            <form className='createaccount-form' onSubmit={handleSubmit}> 
            <>Create Account Page/Create an Account</>
             <label for="name" >Name</label>
             <input value={name} type="name" placeholder='Your Name' id='name' name='name'/>
             <label for="username" >Username</label>
             <input value={user} type="username" placeholder='Username' id='username' name='username'/>
             <label for="password" >Password</label>
             <input value={password} type="password" placeholder='Password' id='password' name='password'/>
             
             <button type='submit'>Create Account</button>

            </form>
        
         <button onClick={() => props.onformSwitch('LoginForm')}> Back to Login</button> 

         </div>
    )
}