// Page & Tab Navigation Logic
import { closeAuthModal } from "../auth/auth-manager.js";
import { destroyPlayer } from "./player.js";

let lastViewedPage = 'courses';

/**
 * Switches active tab and displays corresponding page
 * @param {HTMLElement} element - Tab element to activate
 * @param {string} pageId - Page ID to display
 * @param {boolean} initialization - True if called during initialization
 */
export const switchTab = (element, pageId, initialization = false) => {
    if (pageId !== 'classroom' && !initialization) killVideo();
    if (pageId === 'courses' || pageId === 'videos') lastViewedPage = pageId;

    if(pageId) showPage(pageId);
    if (element) {
        const bubble = document.getElementById('navBubble');
        if(bubble) {
            bubble.style.width = `${element.offsetWidth}px`;
            bubble.style.transform = `translateX(${element.offsetLeft}px)`;
            bubble.classList.add('initialized');
        }
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        element.classList.add('active');
    }
};

/**
 * Shows specified page and hides all others
 * @param {string} pageId - Page ID to display
 */
export const showPage = (pageId) => {
    document.querySelectorAll('.page').forEach(el => el.classList.add('hidden'));
    const target = document.getElementById(pageId);
    if(target) target.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

/**
 * Sets up the back button functionality in classroom view
 */
export const setupBackButton = () => {
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.onclick = () => {
            killVideo();
            const targetBtnIndex = lastViewedPage === 'videos' ? 2 : 1;
            switchTab(document.querySelectorAll('.nav-item')[targetBtnIndex], lastViewedPage);
        };
    }
};

/**
 * Destroys video player and resets video wrapper
 */
export const killVideo = () => {
    destroyPlayer();
    const wrapper = document.querySelector('.video-wrapper');
    if (wrapper) wrapper.innerHTML = "";
    const titleEl = document.getElementById('videoTitle');
    if (titleEl) titleEl.innerText = "Select a Class to Start";
};

/**
 * Handles "Get Started" button click
 * @param {Object} auth - Firebase auth instance
 */
export const handleGetStarted = (auth) => {
    if (auth.currentUser) {
        switchTab(document.querySelectorAll('.nav-item')[1], 'courses');
    } else {
        openAuthModal();
    }
};

/**
 * Opens the authentication modal
 */
export const openAuthModal = () => document.getElementById('authModal').classList.remove('hidden');

/**
 * Closes auth modal and returns to home page
 */
export const closeAuthModalWrapper = () => {
    closeAuthModal();
    const homeBtn = document.querySelectorAll('.nav-item')[0];
    if (homeBtn) switchTab(homeBtn, 'home', true);
};

// Adjust navigation bubble on window resize
window.addEventListener('resize', () => {
    const activeBtn = document.querySelector('.nav-item.active');
    if (activeBtn) switchTab(activeBtn, null, true);
});
