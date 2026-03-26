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

let currentCourseTab = 'premium';

// Global data loaded from Firestore
window.coursesData = [];
window.courseContentData = {};
window.basicVideosData = [];

// ============================================
// Global Error Handler
// ============================================

/**
 * Global error handler for uncaught exceptions
 * Logs error details and shows user-friendly message
 */
window.onerror = function(message, source, lineno, colno, error) {
    console.error('Global error caught:', {
        message,
        source,
        lineno,
        colno,
        error
    });

    // Show user-friendly error message
    if (showCustomAlert) {
        showCustomAlert(
            'Something Went Wrong',
            'An unexpected error occurred. Please refresh the page and try again.'
        );
    }

    // Return false to allow default error handling
    return false;
};

/**
 * Global handler for unhandled promise rejections
 * Logs rejection details and shows user-friendly message
 */
window.onunhandledrejection = function(event) {
    console.error('Unhandled promise rejection:', {
        reason: event.reason,
        promise: event.promise
    });

    // Show user-friendly error message
    if (showCustomAlert) {
        showCustomAlert(
            'Operation Failed',
            'An error occurred while processing your request. Please try again.'
        );
    }

    // Prevent default handling
    event.preventDefault();
};

/**
 * Loads all course data from Firestore
 * Populates global data structures used by the app
 */
const loadCourseData = async () => {
    try {
        // Show loading indicator
        const coursesContainer = document.getElementById('coursesContainer');
        const basicVideosContainer = document.getElementById('basicVideosGrid');

        if (coursesContainer) coursesContainer.innerHTML = '<p style="text-align:center; color:#888;">Loading courses...</p>';
        if (basicVideosContainer) basicVideosContainer.innerHTML = '<p style="text-align:center; color:#888;">Loading videos...</p>';

        // Fetch courses from Firestore
        window.coursesData = await fetchCourses();

        // Fetch lessons for each course
        for (const course of window.coursesData) {
            window.courseContentData[course.id] = await fetchCourseLessons(course.id);
        }

        // Fetch basic videos
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

/**
 * Initializes the application
 * Sets up UI, navigation, authentication listeners, and PWA functionality
 */
const initApp = async () => {
    // 1. Load course data from Firestore
    await loadCourseData();

    // 2. Render Basic UI
    renderBasicVideos();

    // 3. Setup Navigation
    const activeBtn = document.querySelector('.nav-item.active');
    if(activeBtn) setTimeout(() => switchTab(activeBtn, null, true), 100);

    // 4. Listen to Auth Changes
    listenToAuthChanges(async (user) => {
        const navIconDiv = document.getElementById('navAuthIcon'); 
        const label = document.getElementById('authLabel');
        const loginView = document.getElementById('loginContent'); 
        const profileView = document.getElementById('profileContent');

        if (user) {
            if(navIconDiv) navIconDiv.innerHTML = `<img src="${user.photoURL || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}" class="nav-user-img">`;
            if(label) label.innerText = "Profile";
            if(loginView) loginView.classList.add('hidden');
            if(profileView) {
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
            if(navIconDiv) navIconDiv.innerHTML = `<i class="fas fa-user"></i>`;
            if(label) label.innerText = "Login";
            if(loginView) loginView.classList.remove('hidden');
            if(profileView) profileView.classList.add('hidden');
        }
        
        renderCourses(user, currentCourseTab);
    });

    // 5. Global Window Bindings for HTML onclicks (if still needed)
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

    // Email/Password Auth
    window.handleEmailSignUp = handleEmailSignUp;
    window.handleEmailSignIn = handleEmailSignIn;
    window.toggleAuthMode = toggleAuthMode;

    // Video Player
    window.findAndPlayVideo = findAndPlayVideo;

    // Wrapper functions to handle form submissions
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
    
    // PWA
    window.addEventListener('beforeinstallprompt', (e) => { 
        e.preventDefault(); 
        document.getElementById('installBtn').style.display='block'; 
        window.deferredPrompt = e; 
    });
    window.installApp = async () => { 
        if(window.deferredPrompt){ 
            window.deferredPrompt.prompt(); 
            window.deferredPrompt = null; 
        } 
    };
    
    if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js');
};

document.addEventListener("DOMContentLoaded", initApp);
