// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBUAlxRqoFa81fCrLTaFdB9PMHwLmtW3oY",
  authDomain: "freshfind-1147e.firebaseapp.com",
  projectId: "freshfind-1147e",
  storageBucket: "freshfind-1147e.appspot.com",
  messagingSenderId: "620681357733",
  appId: "1:620681357733:web:cc47eeb1e4e2e38fa1a04c",
  measurementId: "G-BSZRZW9JLX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export {firestore}