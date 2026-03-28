// Authentication Manager
import {
    auth, db,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup
} from "../config/firebase.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { showCustomAlert, showCustomConfirm } from "../ui/dialogs.js";
import { isValidEmail, isValidPassword, sanitizeInput } from "../utils/validators.js";

// ─── Modal open / close ───────────────────────────────────────────────────────

export const openAuthModal = () => {
    const modal = document.getElementById('authModal');
    if (!modal) return;
    modal.classList.remove('hidden');
    requestAnimationFrame(() => requestAnimationFrame(() => {
        modal.classList.add('modal-visible');
        staggerAuthFields();
    }));
};

export const closeAuthModal = () => {
    const modal = document.getElementById('authModal');
    if (!modal) return;
    modal.classList.remove('modal-visible');
    modal.classList.add('modal-exit');
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('modal-exit');
    }, 280);
};

// ─── Button loading state ─────────────────────────────────────────────────────

function setButtonLoading(btnId) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.classList.add('loading');
    btn.disabled = true;
}

function clearButtonLoading(btnId) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.classList.remove('loading');
    btn.disabled = false;
}

// ─── Input shake on error ─────────────────────────────────────────────────────

function shakeInput(inputId) {
    const el = document.getElementById(inputId);
    if (!el) return;
    el.classList.remove('input-error');
    void el.offsetWidth;
    el.classList.add('input-error');
    el.addEventListener('input', () => el.classList.remove('input-error'), { once: true });
}

// ─── Field stagger on modal open ──────────────────────────────────────────────

function staggerAuthFields() {
    const fields = document.querySelectorAll('#authModal .auth-input-group, #authModal .btn-google, #authModal .auth-divider, #authModal .btn-auth-submit');
    fields.forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(14px)';
        el.style.transition = 'none';
        requestAnimationFrame(() => {
            setTimeout(() => {
                el.style.transition = 'opacity 0.35s ease, transform 0.35s cubic-bezier(0.34,1.1,0.64,1)';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, 60 + i * 55);
        });
    });
}

// ─── Sign out ─────────────────────────────────────────────────────────────────

export const handleSignOut = () => {
    showCustomConfirm("Log Out", "Are you sure you want to sign out?", () => {
        signOut(auth).then(() => {
            closeAuthModal();
            window.location.reload();
        });
    });
};

// ─── Profile creation ─────────────────────────────────────────────────────────

export async function checkAndCreateProfile(user) {
    try {
        const userRef = doc(db, "users", user.uid);
        const snap    = await getDoc(userRef);
        if (!snap.exists()) {
            await setDoc(userRef, {
                displayName: user.displayName,
                email: user.email,
                uid: user.uid,
                purchasedCourses: {}
            });
        }
    } catch (e) {
        console.error("Error creating profile:", e);
    }
}

// ─── Auth state listener ──────────────────────────────────────────────────────

export const listenToAuthChanges = (callback) => onAuthStateChanged(auth, callback);

// ─── Google Sign-In ───────────────────────────────────────────────────────────

export const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    const btn = document.getElementById('googleSignInBtn');
    if (btn) {
        btn.disabled = true;
        btn.classList.add('btn-google-loading');
    }

    try {
        const result = await signInWithPopup(auth, provider);
        await checkAndCreateProfile(result.user);
        closeAuthModal();
    } catch (error) {
        console.error("Google sign-in error:", error);
        if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
            showCustomAlert("Google Sign-In Failed", "Could not sign in with Google. Please try again.");
        }
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.classList.remove('btn-google-loading');
        }
    }
};

// ─── Email Sign-Up ────────────────────────────────────────────────────────────

export const handleEmailSignUp = async (email, password, displayName) => {
    setButtonLoading('signUpBtn');
    try {
        if (!isValidEmail(email)) {
            shakeInput('signUpEmail');
            showCustomAlert("Invalid Email", "Please enter a valid email address.");
            return;
        }
        if (!isValidPassword(password)) {
            shakeInput('signUpPassword');
            showCustomAlert("Weak Password", "Password must be at least 6 characters long.");
            return;
        }

        const sanitizedName = sanitizeInput(displayName) || "Student";
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: sanitizedName });
        await checkAndCreateProfile({ ...cred.user, displayName: sanitizedName });

        document.getElementById('signUpName').value     = '';
        document.getElementById('signUpEmail').value    = '';
        document.getElementById('signUpPassword').value = '';

        closeAuthModal();
        showCustomAlert("Welcome!", "Account created successfully. Start learning today!");
    } catch (error) {
        console.error("Sign up error:", error);
        if (error.code === 'auth/email-already-in-use') {
            shakeInput('signUpEmail');
            showCustomAlert("Email In Use", "This email is already registered. Please sign in instead.");
        } else if (error.code === 'auth/invalid-email') {
            shakeInput('signUpEmail');
            showCustomAlert("Invalid Email", "Please enter a valid email address.");
        } else if (error.code === 'auth/weak-password') {
            shakeInput('signUpPassword');
            showCustomAlert("Weak Password", "Password must be at least 6 characters long.");
        } else {
            showCustomAlert("Sign Up Error", error.message);
        }
    } finally {
        clearButtonLoading('signUpBtn');
    }
};

// ─── Email Sign-In ────────────────────────────────────────────────────────────

export const handleEmailSignIn = async (email, password) => {
    setButtonLoading('signInBtn');
    try {
        if (!isValidEmail(email)) {
            shakeInput('signInEmail');
            showCustomAlert("Invalid Email", "Please enter a valid email address.");
            return;
        }
        if (!password) {
            shakeInput('signInPassword');
            showCustomAlert("Missing Password", "Please enter your password.");
            return;
        }

        await signInWithEmailAndPassword(auth, email, password);
        document.getElementById('signInEmail').value    = '';
        document.getElementById('signInPassword').value = '';
        closeAuthModal();
    } catch (error) {
        console.error("Sign in error:", error);
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            shakeInput('signInEmail');
            shakeInput('signInPassword');
            showCustomAlert("Account Not Found", "No account found with this email, or the password is incorrect.");
        } else if (error.code === 'auth/wrong-password') {
            shakeInput('signInPassword');
            showCustomAlert("Wrong Password", "Incorrect password. Please try again.");
        } else if (error.code === 'auth/invalid-email') {
            shakeInput('signInEmail');
            showCustomAlert("Invalid Email", "Please enter a valid email address.");
        } else if (error.code === 'auth/too-many-requests') {
            showCustomAlert("Too Many Attempts", "Too many failed login attempts. Please try again later.");
        } else {
            showCustomAlert("Login Error", error.message);
        }
    } finally {
        clearButtonLoading('signInBtn');
    }
};

// ─── Toggle between Sign In / Sign Up ────────────────────────────────────────

export const toggleAuthMode = () => {
    const signInForm  = document.getElementById('signInForm');
    const signUpForm  = document.getElementById('signUpForm');
    const modeToggle  = document.getElementById('authModeToggle');
    const modalTitle  = document.getElementById('modalTitle');
    const authSubtitle= document.getElementById('authSubtitle');

    const isSignIn = !signInForm.classList.contains('hidden');

    // Slide out current form
    const current = isSignIn ? signInForm : signUpForm;
    current.style.transition = 'opacity 0.18s ease, transform 0.18s ease';
    current.style.opacity    = '0';
    current.style.transform  = 'translateY(-10px)';

    setTimeout(() => {
        current.classList.add('hidden');
        current.style.cssText = '';

        const next = isSignIn ? signUpForm : signInForm;
        next.classList.remove('hidden');
        next.style.opacity   = '0';
        next.style.transform = 'translateY(12px)';
        next.style.transition = 'none';

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                next.style.transition = 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.34,1.1,0.64,1)';
                next.style.opacity    = '1';
                next.style.transform  = 'translateY(0)';
            });
        });

        if (isSignIn) {
            if (modalTitle)   modalTitle.textContent   = 'Create Account';
            if (authSubtitle) authSubtitle.textContent = 'Join thousands of students learning today';
            if (modeToggle)   modeToggle.innerHTML     = 'Already have an account? <span class="auth-link">Sign In</span>';
        } else {
            if (modalTitle)   modalTitle.textContent   = 'Welcome Back';
            if (authSubtitle) authSubtitle.textContent = 'Sign in to continue your learning journey';
            if (modeToggle)   modeToggle.innerHTML     = 'Don\'t have an account? <span class="auth-link">Sign Up</span>';
        }
    }, 180);
};
