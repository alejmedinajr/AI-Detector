import React, { useState, useEffect } from 'react';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

export const CreateAccountForm = (props) => {
  const [userCredentials, setUserCredentials] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [showReportsTable, setShowReportsTable] = useState(false);
  const [userReports, setUserReports] = useState([]);

  function handleCredentials(event) {
    setUserCredentials({ ...userCredentials, [event.target.name]: event.target.value });
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



  const toggleReportsTable = () => {
    setShowReportsTable(!showReportsTable);
  };


    useEffect(() => {
        const fetchUserReports = async () => {
        try {
            const db = getFirestore();
            const auth = getAuth();
            const user = auth.currentUser;

            if (user) {
                const q = query(
                    collection(db, "reports"),
                    where("userId", "==", user.uid),
                    orderBy("timestamp", "desc")
                );
                const querySnapshot = await getDocs(q);
                const reports = querySnapshot.docs.map((doc) => doc.data());
                setUserReports(reports);
            }
        } catch (error) {
            console.error("Error fetching user reports:", error);
        }
        };

        if (showReportsTable) {
            fetchUserReports();
        }
    }, [showReportsTable]);

  return (
    <div className='form-container'>
      <form className='createaccount-form' onSubmit={handleSignup}>
        <h2>Create Account</h2>
        <label htmlFor="name">Name</label>
        <input onChange={(event) => { handleCredentials(event) }} type="text" placeholder='Your Name' id='name' name='name' value={userCredentials.name} />
        <label htmlFor="email">Email</label>
        <input onChange={(event) => { handleCredentials(event) }} type="email" placeholder='Email' id='email' name='email' value={userCredentials.email} />
        <label htmlFor="password">Password</label>
        <input onChange={(event) => { handleCredentials(event) }} type="password" placeholder='Password' id='password' name='password' value={userCredentials.password} />
        <button type='submit'>Create Account</button>
      </form>
      <button onClick={() => props.onformSwitch('LoginForm')}> Back to Login</button>
      <button onClick={toggleReportsTable}>My Reports</button>
      {showReportsTable && (
        <table>
          <thead>
            <tr>
              <th>Report ID</th>
              <th>Report Data</th>
              {/* Add more columns as needed */}
            </tr>
          </thead>
          <tbody>
            {userReports.map((report, index) => (
              <tr key={index}>
                <td>{report.reportId}</td>
                <td>{report.reportData}</td>
                {/* Add more columns as needed */}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};