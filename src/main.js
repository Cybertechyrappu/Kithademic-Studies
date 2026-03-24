// Main Entry Point
import { auth } from "./config/firebase.js";
import { 
    listenToAuthChanges, 
    handleGoogleAuth, 
    handleSignOut, 
    checkAndCreateProfile,
    closeAuthModal,
    openAuthModal
} from "./auth/auth-manager.js";
import { 
    renderCourses, 
    renderBasicVideos, 
    renderHistory 
} from "./ui/rendering.js";
import { switchTab, handleGetStarted } from "./ui/navigation.js";
import { findAndPlayVideo } from "./ui/player.js";

let currentCourseTab = 'premium';

// Global Event Listeners & State Manager
const initApp = () => {
    // 1. Render Basic UI
    renderBasicVideos();
    
    // 2. Setup Navigation
    const activeBtn = document.querySelector('.nav-item.active'); 
    if(activeBtn) setTimeout(() => switchTab(activeBtn, null, true), 100); 

    // 3. Listen to Auth Changes
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

    // 4. Global Window Bindings for HTML onclicks (if still needed)
    window.switchTab = switchTab;
    window.handleGoogleAuth = handleGoogleAuth;
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
