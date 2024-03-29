import {initializeApp} from "firebase/app";
import {getAuth} from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import react_firebase_api_key from "./config.py";

//Firebase configuration
const firebaseConfig = {
    apiKey: react_firebase_api_key,
    authDomain: "inspectai.firebaseapp.com",
    databaseURL: "https://inspectai-default-rtdb.firebaseio.com",
    projectId: "inspectai",
    storageBucket: "inspectai.appspot.com",
    messagingSenderId: "519822346871",
    appId: "1:519822346871:web:f31cc55a29047ccc8a9472",
    measurementId: "G-HRGDZNQY2F"
  };
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);

export const auth = getAuth(app);

export default app;