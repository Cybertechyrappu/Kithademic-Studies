// Authentication Manager
import { auth, googleProvider, db } from "../config/firebase.js";
import { signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { showCustomAlert, showCustomConfirm } from "../ui/dialogs.js";

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
