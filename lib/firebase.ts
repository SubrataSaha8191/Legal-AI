// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCjuNO436T__GKvHt0cgF-LvkRJ74jxc18",
  authDomain: "hackoasis-a7101.firebaseapp.com",
  projectId: "hackoasis-a7101",
  storageBucket: "hackoasis-a7101.firebasestorage.app",
  messagingSenderId: "1061041704072",
  appId: "1:1061041704072:web:3a2b2697c15c18c68fe33d",
  measurementId: "G-71JPM3SQ85"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Analytics (only in browser environment)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { analytics };
export default app;