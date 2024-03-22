import {initializeApp} from "firebase/app";
import {getAuth} from "firebase/auth";

//Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBo555Ir5ZL1dygUgDihtU1btm10HkIuJg",
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