import React, { useState } from 'react';
import './LoginForm.css';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

export const AuthenticationForm = (props) => {
    const [userCredentials, setUserCredentials] = useState({ email: '', password: '', name: '' });
    const [isLogin, setIsLogin] = useState(true);

    function handleCredentials(event) {
        setUserCredentials({...userCredentials, [event.target.name]: event.target.value});
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const auth = getAuth(); // Get the Auth object
        
        if (isLogin) {
            // Send login data to FastAPI
            try {
                const response = await fetch('http://localhost:8000/signin', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: userCredentials.email,
                        password: userCredentials.password,
                    }),
                });

                if (response.ok) {
                    // Login successful
                    const userData = await response.json();
                    console.log(userData);
                } else {
                    // Login failed
                    console.error('Login failed:', response.statusText);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        } else {
            // Send signup data to FastAPI
            try {
                const response = await fetch('http://localhost:8000/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        first_name: userCredentials.first_name,
                        last_name: userCredentials.last_name,
                        email: userCredentials.email,
                        password: userCredentials.password,
                    }),
                });

                if (response.ok) {
                    // Signup successful
                    const userData = await response.json();
                    console.log(userData);
                } else {
                    // Signup failed
                    console.error('Signup failed:', response.statusText);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
    }

    return (
        <div className='form-container'>
            <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
            <form className='auth-form' onSubmit={handleSubmit}> 
                {!isLogin && (
                    <><div>
                        <label htmlFor="first_name">First Name</label>
                        <input onChange={handleCredentials} type="text" placeholder='Your First Name' id='first_name' name='first_name' value={userCredentials.first_name} />
                    </div><div>
                            <label htmlFor="last_name">Last Name</label>
                            <input onChange={handleCredentials} type="text" placeholder='Your Last Name' id='last_name' name='last_name' value={userCredentials.last_name} />
                        </div></>
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
