// Firebase Services Initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/**
 * Validates Firebase configuration object
 * @param {Object} config - Firebase configuration object
 * @returns {boolean} True if valid configuration
 */
const isValidFirebaseConfig = (config) => {
    return config &&
           config.apiKey &&
           config.authDomain &&
           config.projectId;
};

// Load config from window.APP_CONFIG (required - no fallback)
const firebaseConfig = window.APP_CONFIG?.firebaseConfig;

// Validate configuration exists
if (!isValidFirebaseConfig(firebaseConfig)) {
    throw new Error(
        'Firebase configuration missing. Please create config.js with your Firebase credentials. ' +
        'See config.example.js for the required format.'
    );
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {
    app,
    auth,
    db,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup
};
export const adminPhone = window.APP_CONFIG?.adminPhone || "";
