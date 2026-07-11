import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDga0qqNo8LwNF5U6D3GHCTwyj5YsLwIMw",
    authDomain: "heart-beat-399e8.firebaseapp.com",
    projectId: "heart-beat-399e8",
    storageBucket: "heart-beat-399e8.firebasestorage.app",
    messagingSenderId: "997815697621",
    appId: "1:997815697621:web:25315cde7ebbdd3ca2225c",
    measurementId: "G-0CJBSERTJV"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);