// Firebase Services Initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Load config from window.APP_CONFIG or fallback to the current project credentials
const firebaseConfig = window.APP_CONFIG?.firebaseConfig || {
    apiKey: "AIzaSyDm97rTDsP1sELznlVKLogPBkMiy0fpc9c",
    authDomain: "kithademic-studies.firebaseapp.com",
    projectId: "kithademic-studies",
    storageBucket: "kithademic-studies.firebasestorage.app",
    messagingSenderId: "962734931999",
    appId: "1:962734931999:web:3d335b466bafca1065552a",
    measurementId: "G-NXT6ZVKHSH"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };
export const adminPhone = window.APP_CONFIG?.adminPhone || "";
