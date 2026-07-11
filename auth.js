import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// ...rest of your file stays identical...

// DOM Elements
const authForm = document.getElementById("auth-form");
const authTitle = document.getElementById("auth-title");
const authSubtitle = document.getElementById("auth-subtitle");
const submitBtn = document.getElementById("submit-btn");
const confirmPasswordGroup = document.getElementById("confirm-password-group");
const confirmPasswordInput = document.getElementById("confirm-password");
const toggleContainer = document.getElementById("toggle-container");

let isSignUpMode = false;

// 1. Switch the form layout between Login / Sign Up
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

    // Rebind since innerHTML resets the element
    document.getElementById("switch-auth-mode").addEventListener("click", handleModeToggle);
}

function handleModeToggle(e) {
    e.preventDefault();
    isSignUpMode = !isSignUpMode;
    renderAuthForm();
}

document.getElementById("switch-auth-mode").addEventListener("click", handleModeToggle);

// 2. Inline error banner (shown above the form, no page rebuild needed)
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

// 3. Handle Authentication Submissions
authForm.addEventListener("submit", async(e) => {
    e.preventDefault();
    clearError();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (isSignUpMode) {
        // SIGN UP
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

            if (error.code === "auth/email-already-in-use") {
                showError("An account with this email already exists. Please log in instead.");
                isSignUpMode = false;
                renderAuthForm();
            } else if (error.code === "auth/weak-password") {
                showError("Password should be at least 6 characters.");
            } else if (error.code === "auth/invalid-email") {
                showError("Please enter a valid email address.");
            } else {
                sessionStorage.setItem("authError", "We couldn't create your account. Please try again.");
                window.location.href = "test.html";
            }
        }

    } else {
        // LOG IN
        try {
            await signInWithEmailAndPassword(auth, email, password);
            window.location.href = "book.html";
        } catch (error) {
            console.error("Login failed:", error);

            if (
                error.code === "auth/invalid-credential" ||
                error.code === "auth/user-not-found" ||
                error.code === "auth/wrong-password"
            ) {
                // Modern Firebase can't tell us which of these it is (by design),
                // so we give one safe message and an obvious way to sign up.
                sessionStorage.setItem(
                    "authError",
                    "Incorrect email or password. New here? Use the Sign Up link below."
                );
            } else if (error.code === "auth/invalid-email") {
                sessionStorage.setItem("authError", "Please enter a valid email address.");
            } else if (error.code === "auth/too-many-requests") {
                sessionStorage.setItem("authError", "Too many attempts. Please wait a bit and try again.");
            } else {
                sessionStorage.setItem("authError", "Login failed. Please try again.");
            }

            window.location.href = "test.html";
        }
    }
});