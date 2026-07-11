import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// DOM Elements
const authForm = document.getElementById("auth-form");
const authTitle = document.getElementById("auth-title");
const authSubtitle = document.getElementById("auth-subtitle");
const submitBtn = document.getElementById("submit-btn");
const confirmPasswordGroup = document.getElementById("confirm-password-group");
const confirmPasswordInput = document.getElementById("confirm-password");
const toggleContainer = document.getElementById("toggle-container");

let isSignUpMode = false;

function renderAuthForm() {
    clearError();

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

    document.getElementById("switch-auth-mode").addEventListener("click", handleModeToggle);
}

function handleModeToggle(e) {
    e.preventDefault();
    isSignUpMode = !isSignUpMode;
    renderAuthForm();
}

document.getElementById("switch-auth-mode").addEventListener("click", handleModeToggle);

function showError(message) {
    let errorBox = document.getElementById("auth-error");
    if (!errorBox) {
        errorBox = document.createElement("div");
        errorBox.id = "auth-error";
        errorBox.style.cssText =
            "color:#e74c3c;font-size:13px;margin-bottom:15px;font-weight:bold;background:#fdf2f2;padding:10px;border-radius:6px;";
        authForm.parentNode.insertBefore(errorBox, authForm);
    }
    errorBox.textContent = message;
}

function clearError() {
    const errorBox = document.getElementById("auth-error");
    if (errorBox) errorBox.remove();
}

authForm.addEventListener("submit", async(e) => {
    e.preventDefault();
    clearError();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (isSignUpMode) {
        const confirmPassword = confirmPasswordInput.value;
        if (password !== confirmPassword) {
            showError("⚠️ Passwords do not match!");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                createdAt: new Date().toISOString()
            });

            window.location.href = "book.html";
        } catch (error) {
            console.error("Sign up failed:", error);
            // TEMP: show the raw error so we can see exactly what's wrong
            showError(`[${error.code}] ${error.message}`);
        }

    } else {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            window.location.href = "book.html";
        } catch (error) {
            console.error("Login failed:", error);
            // TEMP: show the raw error so we can see exactly what's wrong
            showError(`[${error.code}] ${error.message}`);
        }
    }
});