// Authentication Manager
import { auth, googleProvider, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "../config/firebase.js";
import { signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { showCustomAlert, showCustomConfirm } from "../ui/dialogs.js";
import { isValidEmail, isValidPassword, sanitizeInput } from "../utils/validators.js";

/**
 * Opens the authentication modal
 */
export const openAuthModal = () => document.getElementById('authModal').classList.remove('hidden');

/**
 * Closes the authentication modal
 */
export const closeAuthModal = () => document.getElementById('authModal').classList.add('hidden');

/**
 * Handles Google Sign-In authentication
 * Shows error alert if authentication fails
 * @returns {Promise<void>}
 */
export const handleGoogleAuth = async () => {
    try {
        await signInWithPopup(auth, googleProvider);
        closeAuthModal();
    } catch (error) {
        showCustomAlert("Login Error", error.message);
    }
};

/**
 * Handles user sign out with confirmation dialog
 * Reloads page after successful sign out
 */
export const handleSignOut = () => {
    showCustomConfirm("Log Out", "Are you sure?", () => {
        signOut(auth).then(() => {
            closeAuthModal();
            window.location.reload();
        });
    });
};

/**
 * Checks if user profile exists in Firestore and creates one if not
 * @param {Object} user - Firebase user object
 * @returns {Promise<void>}
 */
export async function checkAndCreateProfile(user) {
    try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
            await setDoc(userRef, {
                displayName: user.displayName,
                email: user.email,
                uid: user.uid,
                purchasedCourses: {}
            });
        }
    } catch(e) {
        console.error("Error creating profile:", e);
    }
}

/**
 * Listens to Firebase authentication state changes
 * @param {Function} callback - Callback function to execute on auth state change
 */
export const listenToAuthChanges = (callback) => {
    onAuthStateChanged(auth, callback);
};

/**
 * Handles email/password registration
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} displayName - User display name
 * @returns {Promise<void>}
 */
export const handleEmailSignUp = async (email, password, displayName) => {
    try {
        // Validate inputs
        if (!isValidEmail(email)) {
            showCustomAlert("Invalid Email", "Please enter a valid email address.");
            return;
        }

        if (!isValidPassword(password)) {
            showCustomAlert("Weak Password", "Password must be at least 6 characters long.");
            return;
        }

        const sanitizedName = sanitizeInput(displayName) || "Student";

        // Create user account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Update display name
        await updateProfile(userCredential.user, {
            displayName: sanitizedName
        });

        // Create user profile in Firestore
        await checkAndCreateProfile({
            ...userCredential.user,
            displayName: sanitizedName
        });

        // Clear form fields
        document.getElementById('signUpName').value = '';
        document.getElementById('signUpEmail').value = '';
        document.getElementById('signUpPassword').value = '';

        closeAuthModal();
        showCustomAlert("Success", "Account created successfully!");
    } catch (error) {
        console.error("Sign up error:", error);

        // Handle specific Firebase errors
        if (error.code === 'auth/email-already-in-use') {
            showCustomAlert("Email In Use", "This email is already registered. Please sign in instead.");
        } else if (error.code === 'auth/invalid-email') {
            showCustomAlert("Invalid Email", "Please enter a valid email address.");
        } else if (error.code === 'auth/weak-password') {
            showCustomAlert("Weak Password", "Password must be at least 6 characters long.");
        } else {
            showCustomAlert("Sign Up Error", error.message);
        }
    }
};

/**
 * Handles email/password login
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<void>}
 */
export const handleEmailSignIn = async (email, password) => {
    try {
        // Validate inputs
        if (!isValidEmail(email)) {
            showCustomAlert("Invalid Email", "Please enter a valid email address.");
            return;
        }

        if (!password) {
            showCustomAlert("Missing Password", "Please enter your password.");
            return;
        }

        // Sign in
        await signInWithEmailAndPassword(auth, email, password);

        // Clear form fields
        document.getElementById('signInEmail').value = '';
        document.getElementById('signInPassword').value = '';

        closeAuthModal();
    } catch (error) {
        console.error("Sign in error:", error);

        // Handle specific Firebase errors
        if (error.code === 'auth/user-not-found') {
            showCustomAlert("Account Not Found", "No account found with this email. Please sign up first.");
        } else if (error.code === 'auth/wrong-password') {
            showCustomAlert("Wrong Password", "Incorrect password. Please try again.");
        } else if (error.code === 'auth/invalid-email') {
            showCustomAlert("Invalid Email", "Please enter a valid email address.");
        } else if (error.code === 'auth/too-many-requests') {
            showCustomAlert("Too Many Attempts", "Too many failed login attempts. Please try again later.");
        } else {
            showCustomAlert("Login Error", error.message);
        }
    }
};

/**
 * Toggles between sign in and sign up forms
 * Updates form visibility and toggle text accordingly
 */
export const toggleAuthMode = () => {
    const signInForm = document.getElementById('signInForm');
    const signUpForm = document.getElementById('signUpForm');
    const modeToggle = document.getElementById('authModeToggle');

    if (signInForm.classList.contains('hidden')) {
        signInForm.classList.remove('hidden');
        signUpForm.classList.add('hidden');
        modeToggle.innerHTML = 'Don\'t have an account? <span class="auth-link">Sign Up</span>';
    } else {
        signInForm.classList.add('hidden');
        signUpForm.classList.remove('hidden');
        modeToggle.innerHTML = 'Already have an account? <span class="auth-link">Sign In</span>';
    }
};
