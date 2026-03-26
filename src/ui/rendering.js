// Rendering Logic for Courses, Videos, and History
import { fetchUserAccess, loadWatchHistory } from "../services/data-service.js";
import { openCourse, playSingleVideo } from "./player.js";
import { buyCourse } from "./player.js";
import { adminPhone } from "../config/firebase.js";
import { debounce } from "../utils/rate-limiter.js";

// Get courses and videos from global window object (loaded from Firestore)
const getCourses = () => window.coursesData || [];
const getBasicVideos = () => window.basicVideosData || [];

// Store current filter state
let currentSearchQuery = '';
let currentUser = null;
let currentTab = 'premium';

/**
 * Filters courses based on search query
 * @param {Array} courses - Array of course objects
 * @param {string} query - Search query string
 * @returns {Array} Filtered courses
 */
function filterCourses(courses, query) {
    if (!query || query.trim() === '') {
        return courses;
    }

    const lowerQuery = query.toLowerCase().trim();
    return courses.filter(course => {
        return course.title.toLowerCase().includes(lowerQuery) ||
               course.desc.toLowerCase().includes(lowerQuery) ||
               course.features.some(f => f.toLowerCase().includes(lowerQuery));
    });
}

/**
 * Renders course cards with appropriate actions based on user access
 * Includes search filtering functionality
 * @param {Object|null} user - Firebase user object or null if not authenticated
 * @param {string} currentCourseTab - Current tab filter: 'all', 'premium', or 'free'
 * @returns {Promise<void>}
 */
export async function renderCourses(user, currentCourseTab) {
    const courseList = document.getElementById('courseList');
    if(!courseList) return;

    // Store state for search functionality
    currentUser = user;
    currentTab = currentCourseTab;

    // Setup search functionality (only once)
    setupCourseSearch();

    let accessData = { purchasedCourses: {} };
    if (user) {
        courseList.innerHTML = '<p style="color:#aaa; text-align:center;">Loading courses...</p>';
        try {
            const data = await fetchUserAccess(user.uid);
            if(data) accessData = data;
        } catch(e) {
            console.error("Error rendering courses:", e);
        }
    }
    courseList.innerHTML = "";

    // Get courses from global data (loaded from Firestore)
    const courses = getCourses();

    // Filter courses by tab and search query
    let filteredCourses = courses.filter(c => {
        const price = parseInt(c.price);
        if(currentCourseTab === 'premium' && price === 0) return false;
        if(currentCourseTab === 'free' && price > 0) return false;
        return true;
    });

    // Apply search filter
    filteredCourses = filterCourses(filteredCourses, currentSearchQuery);

    // Show "no results" message if filtered list is empty
    if (filteredCourses.length === 0) {
        courseList.innerHTML = '<p style="color:#aaa; text-align:center; padding: 40px 20px;">No courses found matching your search.</p>';
        return;
    }

    filteredCourses.forEach(c => {
        const price = parseInt(c.price);

        let actionButton = "";
        const expiryStr = accessData.purchasedCourses[c.id];
        let hasAccess = false;
        let isExpired = false;

        if(expiryStr) {
            if(new Date(expiryStr) > new Date()) hasAccess = true;
            else isExpired = true;
        }

        if (price === 0 || hasAccess) {
            actionButton = `<button class="btn-gold opn-crs" data-id="${c.id}" style="font-size:0.8rem;"><i class="fas fa-play"></i> Open</button>`;
        } else if (isExpired && c.isPurchasable) {
            // Check if adminPhone is configured before showing buy buttons
            if (!adminPhone) {
                actionButton = `<button class="btn-primary" disabled style="opacity:0.5; cursor:not-allowed;" title="Admin contact not configured">Renew (Unavailable)</button>`;
            } else {
                actionButton = `<button class="btn-primary buy-crs" data-id="${c.id}" data-renewal="true" style="margin:0; padding: 8px 15px;">Renew</button>`;
            }
        } else if (c.isPurchasable) {
            // Check if adminPhone is configured before showing buy buttons
            if (!adminPhone) {
                actionButton = `<button class="btn-buy" disabled style="opacity:0.5; cursor:not-allowed;" title="Admin contact not configured">Buy (Unavailable)</button>`;
            } else {
                actionButton = `<button class="btn-buy buy-crs" data-id="${c.id}" data-renewal="false">Buy</button>`;
            }
        } else {
            actionButton = `<button class="btn-buy" disabled style="opacity:0.5; border-color:#888; color:#888;">Soon</button>`;
        }

        const div = document.createElement('div'); div.className = 'course-card';
        div.innerHTML = `
            <div class="card-header">
                <h3>${c.title}</h3>
                <span class="badge" style="${price === 0 ? 'background:#28a745;' : ''}">${price === 0 ? "FREE" : "Paid"}</span>
            </div>
            <p class="desc">${c.desc}</p>
            <ul class="features">${c.features.map(f => `<li><i class="fas fa-check-circle"></i> ${f}</li>`).join('')}</ul>
            <div class="card-footer">
                <b class="price">${price === 0 ? "FREE" : `₹${c.price}`}</b>
                <div style="display:flex; gap:10px;">${actionButton}</div>
            </div>`;
        courseList.appendChild(div);
    });

    document.querySelectorAll('.opn-crs').forEach(btn => btn.onclick = () => openCourse(btn.dataset.id));
    document.querySelectorAll('.buy-crs').forEach(btn => btn.onclick = () => buyCourse(btn.dataset.id, btn.dataset.renewal === 'true'));
}

/**
 * Renders basic video cards (free videos not part of courses)
 * Implements lazy loading for video thumbnails
 */
export function renderBasicVideos() {
    const list = document.getElementById('videoList');
    if (!list) return;
    list.innerHTML = "";

    // Get basic videos from global data (loaded from Firestore)
    const basicVideos = getBasicVideos();

    basicVideos.forEach(v => {
        const div = document.createElement('div');
        div.className = 'video-card';
        div.innerHTML = `
            <div class="video-thumb">
                <img data-src="https://img.youtube.com/vi/${v.id}/hqdefault.jpg"
                     src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 480 360'%3E%3Crect fill='%23022c22' width='480' height='360'/%3E%3C/svg%3E"
                     alt="Thumbnail"
                     class="lazy-thumbnail">
                <div class="badge" style="position:absolute; top:10px; right:10px; z-index:5; background:#28a745;">FREE</div>
                <i class="fas fa-play-circle play-icon-overlay"></i>
            </div>
            <div class="video-info">
                <h3>${v.title}</h3>
            </div>
        `;
        div.onclick = () => playSingleVideo(v.id, v.title);
        list.appendChild(div);
    });

    // Setup lazy loading for thumbnails
    setupLazyLoading();
}

/**
 * Renders user's watch history as clickable cards
 * Implements lazy loading for thumbnails
 * @param {Object} user - Firebase user object
 * @param {Function} onPlayHistory - Callback function to handle video playback from history
 * @returns {Promise<void>}
 */
export async function renderHistory(user, onPlayHistory) {
    const list = document.getElementById('historyList');
    if(!list) return;

    const history = await loadWatchHistory(user.uid);
    list.innerHTML = "";

    if(!history.length) {
        list.innerHTML = "<p style='color:#666;'>No history.</p>";
        return;
    }

    history.forEach(data => {
        const div = document.createElement('div');
        div.className = 'history-card';
        div.innerHTML = `
            <img data-src="https://img.youtube.com/vi/${data.videoId}/mqdefault.jpg"
                 src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 180'%3E%3Crect fill='%23022c22' width='320' height='180'/%3E%3C/svg%3E"
                 class="history-thumb lazy-thumbnail"
                 alt="${data.title}">
            <div class="history-info">
                <div class="history-title">${data.title}</div>
            </div>`;
        div.onclick = () => onPlayHistory(data.videoId);
        list.appendChild(div);
    });

    // Setup lazy loading for thumbnails
    setupLazyLoading();
}

/**
 * Sets up Intersection Observer for lazy loading images
 * Loads images only when they enter the viewport
 */
function setupLazyLoading() {
    // Check if Intersection Observer is supported
    if (!('IntersectionObserver' in window)) {
        // Fallback: load all images immediately
        document.querySelectorAll('.lazy-thumbnail').forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
            }
        });
        return;
    }

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            }
        });
    }, {
        rootMargin: '50px' // Start loading 50px before image enters viewport
    });

    // Observe all lazy-load images
    document.querySelectorAll('.lazy-thumbnail').forEach(img => {
        imageObserver.observe(img);
    });
}

// Track if search has been setup to avoid duplicate listeners
let searchSetupComplete = false;

/**
 * Sets up course search functionality with debouncing
 */
function setupCourseSearch() {
    if (searchSetupComplete) return;

    const searchInput = document.getElementById('courseSearch');
    const clearBtn = document.getElementById('clearSearch');

    if (!searchInput || !clearBtn) return;

    // Debounced search function
    const debouncedSearch = debounce((query) => {
        currentSearchQuery = query;
        renderCourses(currentUser, currentTab);
    }, 300);

    // Search input handler
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value;

        // Show/hide clear button
        if (query.length > 0) {
            clearBtn.classList.remove('hidden');
        } else {
            clearBtn.classList.add('hidden');
        }

        // Trigger debounced search
        debouncedSearch(query);
    });

    // Clear button handler
    clearBtn.onclick = () => {
        searchInput.value = '';
        currentSearchQuery = '';
        clearBtn.classList.add('hidden');
        renderCourses(currentUser, currentTab);
        searchInput.focus();
    };

    searchSetupComplete = true;
}
