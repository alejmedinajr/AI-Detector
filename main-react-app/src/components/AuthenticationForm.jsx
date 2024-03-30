import React, { useState } from 'react';
import './LoginForm.css';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import app from '../firebase.js'; // Import your Firebase app instance

export const AuthenticationForm = (props) => {
    const [userCredentials, setUserCredentials] = useState({ email: '', password: '', first_name: '', last_name: '' });
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState(''); // To display error messages

    const auth = getAuth(app); // Initialize Firebase Auth

    function handleCredentials(event) {
        setUserCredentials({...userCredentials, [event.target.name]: event.target.value});
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (isLogin) {
            signInWithEmailAndPassword(auth, userCredentials.email, userCredentials.password)
                .then((userCredential) => {
                    console.log(userCredential.user);
                    props.onAuthenticate(true);
                    // Handle login success, e.g., redirect or state update
                })
                .catch((error) => {
                    console.error(error.message);
                    setError(error.message);
                });
        } else {
            createUserWithEmailAndPassword(auth, userCredentials.email, userCredentials.password)
                .then((userCredential) => {
                    console.log(userCredential.user);
                    // Handle sign-up success
                })
                .catch((error) => {
                    console.error(error.message);
                    setError(error.message);
                });
        }
    }

    return (
        <div className='form-container'>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
            <form className='auth-form' onSubmit={handleSubmit}>
                {!isLogin && (
                    <>
                        <div>
                            <label htmlFor="first_name">First Name</label>
                            <input onChange={handleCredentials} type="text" placeholder='Your First Name' name='first_name' value={userCredentials.first_name} />
                        </div>
                        <div>
                            <label htmlFor="last_name">Last Name</label>
                            <input onChange={handleCredentials} type="text" placeholder='Your Last Name' name='last_name' value={userCredentials.last_name} />
                        </div>
                    </>
                )}
                <div>
                    <label htmlFor="email">Email</label>
                    <input onChange={handleCredentials} type="email" placeholder='Email' name='email' value={userCredentials.email}/>
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input onChange={handleCredentials} type="password" placeholder='Password' name='password' value={userCredentials.password}/>
                </div>
                <button type='submit'>{isLogin ? 'Log In' : 'Sign Up'}</button>
            </form>
            <button onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? 'Create an Account' : 'Back to Login'}
            </button>
        </div>
    );
};
