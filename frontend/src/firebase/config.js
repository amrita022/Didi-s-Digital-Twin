// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDVSZF2tRSwBst2zR7ieSwBeuE9zY53J_8",
  authDomain: "didi-25cdb.firebaseapp.com",
  projectId: "didi-25cdb",
  storageBucket: "didi-25cdb.firebasestorage.app",
  messagingSenderId: "779103793455",
  appId: "1:779103793455:web:e141ef62cd35fbd3e4f1da",
  measurementId: "G-55SFYLMR6V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export default app;