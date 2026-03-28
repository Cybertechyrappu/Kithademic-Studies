// Page & Tab Navigation Logic
import { closeAuthModal } from "../auth/auth-manager.js";
import { destroyPlayer } from "./player.js";
import { animatedShowPage } from "../animations.js";

let lastViewedPage = 'courses';

/**
 * Switches active tab and displays corresponding page with animation.
 * @param {HTMLElement} element - Tab element to activate
 * @param {string} pageId - Page ID to display
 * @param {boolean} initialization - True if called during initialization
 */
export const switchTab = (element, pageId, initialization = false) => {
    if (pageId !== 'classroom' && !initialization) killVideo();
    if (pageId === 'courses' || pageId === 'videos') lastViewedPage = pageId;

    if (pageId) {
        if (initialization) {
            showPage(pageId);
        } else {
            animatedShowPage(pageId);
        }
    }

    if (element) {
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        element.classList.add('active');
    }
};

/**
 * Shows specified page instantly (no animation — used for init).
 * @param {string} pageId - Page ID to display
 */
export const showPage = (pageId) => {
    document.querySelectorAll('.page').forEach(el => {
        el.classList.add('hidden');
        el.classList.remove('active', 'page-enter', 'page-exit');
    });
    const target = document.getElementById(pageId);
    if (target) {
        target.classList.remove('hidden');
        target.classList.add('active');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

/**
 * Sets up the back button functionality in classroom view.
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
 * Destroys video player and resets video wrapper.
 */
export const killVideo = () => {
    destroyPlayer();
    const wrapper = document.querySelector('.video-wrapper');
    if (wrapper) wrapper.innerHTML = "";
    const titleEl = document.getElementById('videoTitle');
    if (titleEl) titleEl.innerText = "Select a Class to Start";
};

/**
 * Handles "Get Started" button click.
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
 * Opens the authentication modal.
 */
export const openAuthModal = () => {
    const modal = document.getElementById('authModal');
    if (!modal) return;
    modal.classList.remove('hidden');
    requestAnimationFrame(() => {
        requestAnimationFrame(() => modal.classList.add('modal-visible'));
    });
};

/**
 * Closes the authentication modal.
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
