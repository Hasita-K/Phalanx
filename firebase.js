import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // 1. Add this import

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: "your-app-id.firebaseapp.com",
    projectId: "your-app-id",
    storageBucket: "your-app-id.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export your services so you can use them in other files
export const auth = getAuth(app);
export const db = getFirestore(app); // 2. Add this line to initialize the database