// Main Entry Point
import { auth } from "./config/firebase.js";
import {
    listenToAuthChanges,
    handleSignOut,
    checkAndCreateProfile,
    closeAuthModal,
    openAuthModal,
    handleEmailSignUp,
    handleEmailSignIn,
    handleGoogleSignIn,
    toggleAuthMode
} from "./auth/auth-manager.js";
import {
    renderCourses,
    renderBasicVideos,
    renderHistory
} from "./ui/rendering.js";
import { switchTab, handleGetStarted } from "./ui/navigation.js";
import { findAndPlayVideo } from "./ui/player.js";
import { showCustomAlert } from "./ui/dialogs.js";
import { fetchCourses, fetchCourseLessons, fetchBasicVideos } from "./services/data-service.js";
import {
    initSplash,
    hideSplash,
    animateNavIn,
    animateTopBrandIn
} from "./animations.js";

let currentCourseTab = 'premium';

// Global data loaded from Firestore
window.coursesData = [];
window.courseContentData = {};
window.basicVideosData = [];

// ─── Global Error Handlers ───────────────────────────────────────────────────

window.onerror = function(message, source, lineno, colno, error) {
    console.error('Global error:', { message, source, lineno, colno, error });
    return false;
};

window.onunhandledrejection = function(event) {
    console.error('Unhandled rejection:', event.reason);
    event.preventDefault();
};

// ─── Data Loading ────────────────────────────────────────────────────────────

const loadCourseData = async () => {
    try {
        window.coursesData = await fetchCourses();

        for (const course of window.coursesData) {
            window.courseContentData[course.id] = await fetchCourseLessons(course.id);
        }

        window.basicVideosData = await fetchBasicVideos();

        console.log('✓ Course data loaded from Firestore:', {
            courses: window.coursesData.length,
            basicVideos: window.basicVideosData.length
        });

        return true;
    } catch (error) {
        console.error('Failed to load course data:', error);
        showCustomAlert('Error', 'Failed to load courses. Please refresh the page.');
        return false;
    }
};

// ─── App Init ────────────────────────────────────────────────────────────────

const initApp = async () => {
    // Start splash animation clock
    initSplash();

    // Start UI element entrance animations
    animateTopBrandIn();
    animateNavIn();

    // Load data from Firestore
    await loadCourseData();

    // Render videos (now we have data)
    renderBasicVideos();

    // Activate the home tab silently (no animation on first load)
    const activeBtn = document.querySelector('.nav-item.active');
    if (activeBtn) setTimeout(() => switchTab(activeBtn, null, true), 100);

    // Listen for auth state changes
    listenToAuthChanges(async (user) => {
        const navIconDiv = document.getElementById('navAuthIcon');
        const label = document.getElementById('authLabel');
        const loginView = document.getElementById('loginContent');
        const profileView = document.getElementById('profileContent');

        if (user) {
            if (navIconDiv) navIconDiv.innerHTML = `<img src="${user.photoURL || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}" class="nav-user-img">`;
            if (label) label.innerText = "Profile";
            if (loginView) loginView.classList.add('hidden');
            if (profileView) {
                profileView.classList.remove('hidden');
                document.getElementById('userProfileImg').src = user.photoURL || 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
                document.getElementById('userName').innerText = user.displayName || "Student";
                document.getElementById('userEmail').innerText = user.email;
            }
            checkAndCreateProfile(user);
            renderHistory(user, (videoId) => {
                closeAuthModal();
                findAndPlayVideo(videoId);
            });
        } else {
            if (navIconDiv) navIconDiv.innerHTML = `<i class="fas fa-user"></i>`;
            if (label) label.innerText = "Login";
            if (loginView) loginView.classList.remove('hidden');
            if (profileView) profileView.classList.add('hidden');
        }

        renderCourses(user, currentCourseTab);
    });

    // Dismiss splash after data is ready
    hideSplash(1800);

    // ─── Global Window Bindings ──────────────────────────────────────────────

    window.switchTab = switchTab;
    window.handleSignOut = handleSignOut;
    window.handleGetStarted = () => handleGetStarted(auth);
    window.closeAuthModal = closeAuthModal;
    window.openAuthModal = openAuthModal;

    window.setCourseTab = (tabType, btnElement) => {
        currentCourseTab = tabType;
        document.querySelectorAll('.top-tab-btn').forEach(btn => btn.classList.remove('active'));
        btnElement.classList.add('active');
        renderCourses(auth.currentUser, currentCourseTab);
    };

    window.handleEmailSignUp = handleEmailSignUp;
    window.handleEmailSignIn = handleEmailSignIn;
    window.handleGoogleSignIn = handleGoogleSignIn;
    window.toggleAuthMode = toggleAuthMode;
    window.findAndPlayVideo = findAndPlayVideo;

    window.handleEmailSignUpClick = () => {
        const name = document.getElementById('signUpName').value.trim();
        const email = document.getElementById('signUpEmail').value.trim();
        const password = document.getElementById('signUpPassword').value;
        handleEmailSignUp(email, password, name);
    };

    window.handleEmailSignInClick = () => {
        const email = document.getElementById('signInEmail').value.trim();
        const password = document.getElementById('signInPassword').value;
        handleEmailSignIn(email, password);
    };

    // ─── PWA ─────────────────────────────────────────────────────────────────

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        document.getElementById('installBtn').style.display = 'block';
        window.deferredPrompt = e;
    });

    window.installApp = async () => {
        if (window.deferredPrompt) {
            window.deferredPrompt.prompt();
            window.deferredPrompt = null;
        }
    };

    if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js');
};

document.addEventListener("DOMContentLoaded", initApp);
