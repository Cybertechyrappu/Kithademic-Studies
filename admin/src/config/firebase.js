import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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

// Load config from window.ADMIN_CONFIG (required - no fallback)
const firebaseConfig = window.ADMIN_CONFIG?.firebaseConfig;

// Validate configuration exists
if (!isValidFirebaseConfig(firebaseConfig)) {
    throw new Error(
        'Admin Firebase configuration missing. Please create admin/config.js with your Firebase credentials. ' +
        'See config.example.js for the required format.'
    );
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
export const ADMIN_EMAIL = window.ADMIN_CONFIG?.adminEmail || "admin@kithademic.com";
