import React, { useState } from 'react';
import './LoginForm.css';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

export const AuthenticationForm = (props) => {
    const [userCredentials, setUserCredentials] = useState({ email: '', password: '', name: '' });
    const [isLogin, setIsLogin] = useState(true);

    function handleCredentials(event) {
        setUserCredentials({...userCredentials, [event.target.name]: event.target.value});
    }

    function handleSubmit(event) {
        event.preventDefault();
        const auth = getAuth(); // Get the Auth object
        
        if (isLogin) {
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
        } else {
            createUserWithEmailAndPassword(auth, userCredentials.email, userCredentials.password)
                .then((userCredential) => {
                    // Signed up 
                    const user = userCredential.user;
                    console.log(user);
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    console.log(errorCode, errorMessage);
                });
        }
    }

    return (
        <div className='form-container'>
            <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
            <form className='auth-form' onSubmit={handleSubmit}> 
                {!isLogin && (
                    <div>
                        <label htmlFor="name">Name</label>
                        <input onChange={handleCredentials} type="text" placeholder='Your Name' id='name' name='name' value={userCredentials.name}/>
                    </div>
                )}
                <div>
                    <label htmlFor="email">Email</label>
                    <input onChange={handleCredentials} type="email" placeholder='Email' id='email' name='email' value={userCredentials.email}/>
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input onChange={handleCredentials} type="password" placeholder='Password' id='password' name='password' value={userCredentials.password}/>
                </div>
                <button type='submit'>{isLogin ? 'Log In' : 'Sign Up'}</button>
            </form>
            <button onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? 'Create an Account' : 'Back to Login'}
            </button>
        </div>
    );
};
