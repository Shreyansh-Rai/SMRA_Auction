// Import the functions you need from the SDKs you need
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD3Rrrllmjd8PvymunPkyi4hoNQqU0IvVY",
  authDomain: "smra-final.firebaseapp.com",
  projectId: "smra-final",
  storageBucket: "smra-final.appspot.com",
  messagingSenderId: "1033557091557",
  appId: "1:1033557091557:web:cb2b861caded7a52b1200c"
};


// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
export const auth = firebase.auth();
