// Classroom & Individual Video Player Logic
import { auth, adminPhone } from "../config/firebase.js";
import { fetchUserAccess, saveWatchHistory } from "../services/data-service.js";
import { courses, courseContent, basicVideos } from "../utils/constants.js";
import { showCustomAlert, showCustomConfirm } from "./dialogs.js";
import { openAuthModal, setupBackButton } from "./navigation.js";

let plyrInstance = null;

/**
 * Plays a video in the classroom player
 * @param {string} id - YouTube video ID
 * @param {string} title - Video title
 * @param {HTMLElement} el - Optional lesson item element to mark as active
 */
export const playVideo = (id, title, el) => {
    const wrapper = document.querySelector('.video-wrapper');
    if (!wrapper) return;

    if (!plyrInstance) {
        wrapper.innerHTML = `<div id="player" data-plyr-provider="youtube" data-plyr-embed-id="${id}"></div>`;
        plyrInstance = new window.Plyr('#player', {
            controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'],
            youtube: { noCookie: true, rel: 0, showinfo: 0, iv_load_policy: 3, modestbranding: 1 }
        });

        // Use Plyr ready event for reliable autoplay
        plyrInstance.on('ready', () => {
            plyrInstance.play().catch(err => {
                console.error("Autoplay prevented:", err);
            });
        });

        // Force-disable the context menu (Right-click) on the player and classroom
        const classroom = document.getElementById('classroom');
        if(classroom) {
            classroom.oncontextmenu = (e) => { e.preventDefault(); return false; };
            classroom.style.userSelect = "none"; // Discourage text/link copying
        }
    } else {
        plyrInstance.source = {
            type: 'video',
            sources: [{ src: id, provider: 'youtube' }],
        };
        // Autoplay on source change
        plyrInstance.play().catch(err => {
            console.error("Autoplay prevented:", err);
        });
    }

    document.getElementById('videoTitle').innerText = title;

    document.querySelectorAll('.lesson-item').forEach(x => x.classList.remove('active'));
    if(el) el.classList.add('active');

    if (auth.currentUser) saveWatchHistory(auth.currentUser.uid, id, title);
};

/**
 * Destroys the Plyr player instance and cleans up resources
 */
export const destroyPlayer = () => {
    if (plyrInstance) {
        plyrInstance.destroy();
        plyrInstance = null;
    }
};

/**
 * Plays a single video (not part of a course)
 * @param {string} id - YouTube video ID
 * @param {string} title - Video title
 */
export const playSingleVideo = (id, title) => {
    if (!auth.currentUser) {
        showCustomAlert("Access Denied", "Please login to watch classes.");
        openAuthModal();
        return;
    }

    document.querySelectorAll('.page').forEach(el => el.classList.add('hidden'));
    document.getElementById('classroom').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setupBackButton();

    const pl = document.getElementById('playlistItems');
    pl.innerHTML = `<div class="lesson-item active"><i class="fas fa-play-circle"></i> <span>${title}</span></div>`;

    playVideo(id, title, pl.firstChild);
};

/**
 * Opens a course and displays its lessons
 * Checks user authentication and course access before allowing access
 * @param {string} courseId - Course identifier (e.g., "c_01")
 * @returns {Promise<void>}
 */
export const openCourse = async (courseId) => {
    if (!auth.currentUser) {
        showCustomAlert("Access Denied", "Please login.");
        openAuthModal();
        return;
    }

    const course = courses.find(c => c.id === courseId);

    if (parseInt(course.price) > 0) {
        const accessData = await fetchUserAccess(auth.currentUser.uid);
        const expiryStr = accessData?.purchasedCourses[courseId];

        if (!expiryStr || new Date(expiryStr) < new Date()) {
            if(course.isPurchasable) {
                showCustomConfirm(
                    expiryStr ? "Subscription Expired" : "Access Denied",
                    expiryStr ? "Your monthly subscription has expired. Renew it to continue." : "You must purchase this course to access it.",
                    () => buyCourse(courseId, !!expiryStr)
                );
            } else {
                showCustomAlert("Access Denied", "Enrollments are closed.");
            }
            return;
        }
    }

    document.querySelectorAll('.page').forEach(el => el.classList.add('hidden'));
    document.getElementById('classroom').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setupBackButton();

    const lessons = courseContent[courseId];
    const pl = document.getElementById('playlistItems');
    pl.innerHTML = "";

    lessons.forEach((l, i) => {
        const d = document.createElement('div');
        d.className = 'lesson-item';
        d.innerHTML = `<i class="fas fa-play-circle"></i> <span>${i+1}. ${l.title}</span>`;
        d.onclick = () => playVideo(l.videoId, l.title, d);
        pl.appendChild(d);
    });

    if(lessons.length) playVideo(lessons[0].videoId, lessons[0].title, pl.firstChild);
};

/**
 * Finds a video by ID and plays it in the appropriate context
 * Searches through course content and basic videos
 * @param {string} videoId - YouTube video ID to find and play
 */
export function findAndPlayVideo(videoId) {
    for (const [cid, ls] of Object.entries(courseContent)) {
        const item = ls.find(l => l.videoId === videoId);
        if (item) {
            openCourse(cid).then(() => playVideo(videoId, item.title, null));
            return;
        }
    }
    const basic = basicVideos.find(v => v.id === videoId);
    if (basic) {
        playSingleVideo(basic.id, basic.title);
    }
}

/**
 * Opens WhatsApp with pre-filled message to purchase or renew a course
 * @param {string} courseId - Course identifier
 * @param {boolean} isRenewal - True if renewing an expired subscription, false for new purchase
 */
export const buyCourse = (courseId, isRenewal = false) => {
    if (!auth.currentUser) {
        showCustomAlert("Required", "Sign in to enroll.");
        openAuthModal();
        return;
    }
    if (!adminPhone) {
        showCustomAlert("Error", "Admin contact not set up yet. Please check back later.");
        return;
    }
    const course = courses.find(c => c.id === courseId);

    const reqType = isRenewal ? "🔄 *Renewal Request*" : "🎓 *New Enrollment*";
    const msg = `${reqType}%0a%0aHello Admin,%0aI'd like to pay for 1 month of:%0a*Course:* ${course.title}%0a*Course ID:* ${course.id}%0a*Price:* ₹${course.price}%0a%0a*My UID:* ${auth.currentUser.uid}%0a%0aPlease send UPI details.`;
    window.open(`https://wa.me/${adminPhone}?text=${msg}`, '_blank');
};
