import { auth, ADMIN_EMAIL } from "../config/firebase.js";
import { signInWithEmailAndPassword, signOut as fbSignOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

export const handleAuthStateChanges = (onIn, onOut) => {
    onAuthStateChanged(auth, (user) => {
        if (user && user.email === ADMIN_EMAIL) onIn(user);
        else onOut();
    });
};

export const loginAdmin = async (password) => {
    try {
        await signInWithEmailAndPassword(auth, ADMIN_EMAIL, password);
        return { success: true };
    } catch (e) {
        console.error("Admin Login Error:", e);
        return { success: false, error: e.message };
    }
};

export const logoutAdmin = () => fbSignOut(auth);
