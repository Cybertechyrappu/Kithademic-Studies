// Page & Tab Navigation Logic
import { closeAuthModal } from "../auth/auth-manager.js";
import { destroyPlayer } from "./player.js";

let lastViewedPage = 'courses'; 

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

export const showPage = (pageId) => {
    document.querySelectorAll('.page').forEach(el => el.classList.add('hidden'));
    const target = document.getElementById(pageId);
    if(target) target.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

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

export const killVideo = () => {
    destroyPlayer();
    const wrapper = document.querySelector('.video-wrapper');
    if (wrapper) wrapper.innerHTML = ""; 
    const titleEl = document.getElementById('videoTitle');
    if (titleEl) titleEl.innerText = "Select a Class to Start";
};

export const handleGetStarted = (auth) => {
    if (auth.currentUser) {
        switchTab(document.querySelectorAll('.nav-item')[1], 'courses');
    } else {
        openAuthModal();
    }
};

export const openAuthModal = () => document.getElementById('authModal').classList.remove('hidden');
export const closeAuthModalWrapper = () => {
    closeAuthModal();
    const homeBtn = document.querySelectorAll('.nav-item')[0];
    if (homeBtn) switchTab(homeBtn, 'home', true);
};

window.addEventListener('resize', () => {
    const activeBtn = document.querySelector('.nav-item.active');
    if (activeBtn) switchTab(activeBtn, null, true);
});
