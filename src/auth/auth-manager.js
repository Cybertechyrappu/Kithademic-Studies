// Authentication Manager
import { auth, googleProvider, db } from "../config/firebase.js";
import { signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { showCustomAlert, showCustomConfirm } from "../ui/dialogs.js";

export const openAuthModal = () => document.getElementById('authModal').classList.remove('hidden');
export const closeAuthModal = () => document.getElementById('authModal').classList.add('hidden');

export const handleGoogleAuth = async () => { 
    try { 
        await signInWithPopup(auth, googleProvider); 
        closeAuthModal(); 
    } catch (error) { 
        showCustomAlert("Login Error", error.message); 
    } 
};

export const handleSignOut = () => { 
    showCustomConfirm("Log Out", "Are you sure?", () => { 
        signOut(auth).then(() => { 
            closeAuthModal(); 
            window.location.reload(); 
        }); 
    }); 
};

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

export const listenToAuthChanges = (callback) => {
    onAuthStateChanged(auth, callback);
};
