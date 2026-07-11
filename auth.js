import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

// DOM Elements
const authForm = document.getElementById("auth-form");
const authTitle = document.getElementById("auth-title");
const authSubtitle = document.getElementById("auth-subtitle");
const submitBtn = document.getElementById("submit-btn");
const confirmPasswordGroup = document.getElementById("confirm-password-group");
const confirmPasswordInput = document.getElementById("confirm-password");
const toggleContainer = document.getElementById("toggle-container");

let isSignUpMode = false;

// Function to update the interface layout dynamically
function renderAuthForm() {
    if (isSignUpMode) {
        authTitle.textContent = "Create Account";
        authSubtitle.textContent = "Start your digital journal journey today";
        submitBtn.textContent = "Sign Up";
        confirmPasswordGroup.style.display = "block";
        confirmPasswordInput.setAttribute("required", "true");
        toggleContainer.innerHTML = 'Already have an account? <a href="#" id="switch-auth-mode">Log In</a>';
    } else {
        authTitle.textContent = "Welcome Back";
        authSubtitle.textContent = "Log in to your private journal";
        submitBtn.textContent = "Log In";
        confirmPasswordGroup.style.display = "none";
        confirmPasswordInput.removeAttribute("required");
        toggleContainer.innerHTML = 'Don\'t have an account? <a href="#" id="switch-auth-mode">Sign Up</a>';
    }

    // Re-bind the click event listener safely to the new link element in the DOM
    document.getElementById("switch-auth-mode").addEventListener("click", handleModeToggle);
}

// Click handler function for switching modes
function handleModeToggle(e) {
    e.preventDefault();
    isSignUpMode = !isSignUpMode;
    renderAuthForm();
}

// Initial binding of the toggle action when the page loads
document.getElementById("switch-auth-mode").addEventListener("click", handleModeToggle);

// Handle Form Submission (Firebase Communications)
authForm.addEventListener("submit", async(e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    console.log("Form submitting... Mode is SignUp:", isSignUpMode); // Debug log to developer console

    if (isSignUpMode) {
        const confirmPassword = confirmPasswordInput.value;
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {
            // 1. Authenticate & create the user profile
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("User authentication created:", user.uid);

            // 2. Direct database document record creation
            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                createdAt: new Date().toISOString()
            });

            alert("Account created successfully! Database entry saved.");

        } catch (error) {
            console.error(error);
            alert("Sign Up Error: " + error.message);
        }
    } else {
        // Handle Login Mode action
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            alert("Logged in successfully! Welcome " + userCredential.user.email);
        } catch (error) {
            console.error(error);
            alert("Login Error: " + error.message);
        }
    }
});