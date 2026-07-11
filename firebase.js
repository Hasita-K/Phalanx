import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "PASTE_YOUR_REAL_API_KEY_HERE",
    authDomain: "PASTE_YOUR_REAL_PROJECT.firebaseapp.com",
    projectId: "PASTE_YOUR_REAL_PROJECT_ID",
    storageBucket: "PASTE_YOUR_REAL_PROJECT.appspot.com",
    messagingSenderId: "PASTE_YOUR_REAL_SENDER_ID",
    appId: "PASTE_YOUR_REAL_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);