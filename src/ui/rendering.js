// Rendering Logic — Courses, Videos, History
import { fetchUserAccess, loadWatchHistory } from "../services/data-service.js";
import { openCourse, playSingleVideo, buyCourse } from "./player.js";
import { adminPhone } from "../config/firebase.js";
import { debounce } from "../utils/rate-limiter.js";
import { setupScrollReveal } from "../animations.js";

const getCourses     = () => window.coursesData    || [];
const getBasicVideos = () => window.basicVideosData || [];

let currentSearchQuery = '';
let currentUser = null;
let currentTab  = 'premium';

// ─── Course icon mapping ──────────────────────────────────────────────────────

function courseIcon(title = '') {
    const t = title.toLowerCase();
    if (t.includes('فقه') || t.includes('fiqh'))  return '⚖️';
    if (t.includes('قرآن') || t.includes('quran'))return '📖';
    if (t.includes('عقيد') || t.includes('aqeed'))return '🌙';
    if (t.includes('arabic') || t.includes('عربي'))return '🔤';
    if (t.includes('hadith') || t.includes('حديث'))return '📜';
    return '🎓';
}

// ─── Skeleton markup ─────────────────────────────────────────────────────────

function skeletonCourseCard() {
    return `<div class="skeleton-card" style="min-height:280px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
            <div class="skeleton skeleton-line" style="width:60px;height:18px;border-radius:99px;"></div>
            <div class="skeleton" style="width:40px;height:40px;border-radius:10px;"></div>
        </div>
        <div class="skeleton skeleton-line h-24 w-80" style="margin-top:8px;"></div>
        <div class="skeleton skeleton-line w-60"></div>
        <div style="display:flex;flex-direction:column;gap:8px;margin-top:4px;">
            <div class="skeleton skeleton-line w-80"></div>
            <div class="skeleton skeleton-line w-60"></div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:auto;padding-top:16px;border-top:1px solid rgba(255,255,255,0.05);">
            <div class="skeleton skeleton-line" style="width:55px;height:26px;"></div>
            <div class="skeleton skeleton-line" style="width:75px;height:34px;border-radius:8px;"></div>
        </div>
    </div>`;
}

function skeletonVideoCard() {
    return `<div class="skeleton-card" style="padding:0;overflow:hidden;border-radius:18px;">
        <div class="skeleton skeleton-thumb"></div>
        <div style="padding:14px;display:flex;flex-direction:column;gap:8px;">
            <div class="skeleton skeleton-line w-80"></div>
            <div class="skeleton skeleton-line w-50" style="width:50%;"></div>
        </div>
    </div>`;
}

// ─── Filter ───────────────────────────────────────────────────────────────────

function filterCourses(courses, query) {
    if (!query?.trim()) return courses;
    const q = query.toLowerCase().trim();
    return courses.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.desc.toLowerCase().includes(q)  ||
        c.features.some(f => f.toLowerCase().includes(q))
    );
}

// ─── renderCourses ────────────────────────────────────────────────────────────

export async function renderCourses(user, currentCourseTab) {
    const courseList = document.getElementById('courseList');
    if (!courseList) return;

    currentUser = user;
    currentTab  = currentCourseTab;
    setupCourseSearch();

    let accessData = { purchasedCourses: {} };

    if (user) {
        courseList.innerHTML = Array(4).fill(skeletonCourseCard()).join('');
        try {
            const data = await fetchUserAccess(user.uid);
            if (data) accessData = data;
        } catch (e) { console.error('Error fetching access:', e); }
    }

    courseList.innerHTML = '';
    const courses = getCourses();

    let filtered = courses.filter(c => {
        const price = parseInt(c.price);
        if (currentCourseTab === 'premium' && price === 0) return false;
        if (currentCourseTab === 'free'    && price > 0)  return false;
        return true;
    });

    filtered = filterCourses(filtered, currentSearchQuery);

    if (!filtered.length) {
        courseList.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:56px 20px;color:var(--text-tertiary);">
                <i class="fas fa-search" style="font-size:2.2rem;opacity:0.25;margin-bottom:16px;display:block;"></i>
                <p style="font-size:0.92rem;">No courses found matching your search.</p>
            </div>`;
        return;
    }

    filtered.forEach(c => {
        const price     = parseInt(c.price);
        const isFree    = price === 0;
        const expiryStr = accessData.purchasedCourses[c.id];
        let hasAccess   = false;
        let isExpired   = false;

        if (expiryStr) {
            if (new Date(expiryStr) > new Date()) hasAccess = true;
            else isExpired = true;
        }

        let actionBtn = '';
        if (isFree || hasAccess) {
            actionBtn = `<button class="btn-primary opn-crs" data-id="${c.id}" style="font-size:0.78rem;padding:9px 18px;">
                <i class="fas fa-play"></i> Open
            </button>`;
        } else if (isExpired && c.isPurchasable) {
            actionBtn = adminPhone
                ? `<button class="btn-primary buy-crs" data-id="${c.id}" data-renewal="true" style="font-size:0.78rem;padding:9px 18px;">Renew</button>`
                : `<button class="btn-primary" disabled style="opacity:0.4;cursor:not-allowed;font-size:0.78rem;padding:9px 18px;">Renew</button>`;
        } else if (c.isPurchasable) {
            actionBtn = adminPhone
                ? `<button class="btn-buy buy-crs" data-id="${c.id}" data-renewal="false" style="font-size:0.78rem;">Buy Access</button>`
                : `<button class="btn-buy" disabled style="opacity:0.4;cursor:not-allowed;font-size:0.78rem;">Buy</button>`;
        } else {
            actionBtn = `<button class="btn-buy" disabled style="opacity:0.35;border-color:#444;color:#666;font-size:0.78rem;">Coming Soon</button>`;
        }

        const div = document.createElement('div');
        div.className = 'course-card';
        div.innerHTML = `
            <div class="cc-top">
                <span class="cc-category ${isFree ? 'cat-free' : 'cat-premium'}">
                    ${isFree ? '<i class="fas fa-gift" style="margin-right:4px;font-size:0.6rem;"></i>Free' : '<i class="fas fa-crown" style="margin-right:4px;font-size:0.6rem;"></i>Premium'}
                </span>
                <div class="cc-icon">${courseIcon(c.title)}</div>
            </div>
            <div class="cc-body">
                <h3 class="cc-title">${c.title}</h3>
                <p class="cc-desc">${c.desc}</p>
                <ul class="cc-features">
                    ${c.features.slice(0, 4).map(f => `<li><i class="fas fa-check-circle"></i>${f}</li>`).join('')}
                </ul>
            </div>
            <div class="cc-footer">
                <div class="cc-price-wrap">
                    <span class="cc-price ${isFree ? 'free' : ''}">${isFree ? 'Free' : `₹${c.price}`}</span>
                    ${price > 0 ? '<span class="cc-period">/month</span>' : ''}
                </div>
                ${actionBtn}
            </div>`;

        courseList.appendChild(div);
    });

    document.querySelectorAll('.opn-crs').forEach(btn => btn.onclick = () => openCourse(btn.dataset.id));
    document.querySelectorAll('.buy-crs').forEach(btn => btn.onclick = () => buyCourse(btn.dataset.id, btn.dataset.renewal === 'true'));

    setupScrollReveal();
}

// ─── renderBasicVideos ────────────────────────────────────────────────────────

export function renderBasicVideos() {
    const list = document.getElementById('videoList');
    if (!list) return;

    const videos = getBasicVideos();

    if (!videos.length) {
        list.innerHTML = Array(3).fill(skeletonVideoCard()).join('');
        return;
    }

    list.innerHTML = '';

    videos.forEach(v => {
        const div = document.createElement('div');
        div.className = 'video-card';
        div.innerHTML = `
            <div class="video-thumb">
                <img data-src="https://img.youtube.com/vi/${v.id}/hqdefault.jpg"
                     src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 480 360'%3E%3Crect fill='%230e0e0e' width='480' height='360'/%3E%3C/svg%3E"
                     alt="${v.title}"
                     class="lazy-thumbnail">
                <span class="vc-badge">FREE</span>
                <div class="vc-play-overlay">
                    <div class="vc-play-btn"><i class="fas fa-play" style="margin-left:2px;"></i></div>
                </div>
            </div>
            <div class="video-info">
                <h3>${v.title}</h3>
            </div>`;
        div.onclick = () => playSingleVideo(v.id, v.title);
        list.appendChild(div);
    });

    setupLazyLoading();
    setupScrollReveal();
}

// ─── renderHistory ────────────────────────────────────────────────────────────

export async function renderHistory(user, onPlayHistory) {
    const list = document.getElementById('historyList');
    if (!list) return;

    list.innerHTML = `<div style="display:flex;gap:10px;padding:4px 0;">
        <div class="skeleton" style="width:96px;height:54px;border-radius:7px;flex-shrink:0;"></div>
        <div style="flex:1;display:flex;flex-direction:column;gap:8px;justify-content:center;">
            <div class="skeleton skeleton-line w-80"></div>
            <div class="skeleton skeleton-line w-60"></div>
        </div>
    </div>`;

    const history = await loadWatchHistory(user.uid);
    list.innerHTML = '';

    if (!history.length) {
        list.innerHTML = `<p style="color:var(--text-tertiary);font-size:0.82rem;text-align:center;padding:14px 0;">No recent activity.</p>`;
        return;
    }

    history.forEach((data, i) => {
        const div = document.createElement('div');
        div.className = 'history-card';
        div.style.animationDelay = `${i * 65}ms`;
        div.innerHTML = `
            <img data-src="https://img.youtube.com/vi/${data.videoId}/mqdefault.jpg"
                 src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 180'%3E%3Crect fill='%230e0e0e' width='320' height='180'/%3E%3C/svg%3E"
                 class="history-thumb lazy-thumbnail"
                 alt="${data.title}">
            <div style="overflow:hidden;">
                <div class="history-title">${data.title}</div>
            </div>`;
        div.onclick = () => onPlayHistory(data.videoId);
        list.appendChild(div);
    });

    setupLazyLoading();
}

// ─── Lazy loading ─────────────────────────────────────────────────────────────

function setupLazyLoading() {
    if (!('IntersectionObserver' in window)) {
        document.querySelectorAll('.lazy-thumbnail').forEach(img => {
            if (img.dataset.src) { img.src = img.dataset.src; img.classList.add('loaded'); }
        });
        return;
    }

    const obs = new IntersectionObserver((entries, o) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.onload = () => img.classList.add('loaded');
                    img.onerror = () => img.classList.add('loaded');
                    o.unobserve(img);
                }
            }
        });
    }, { rootMargin: '90px' });

    document.querySelectorAll('.lazy-thumbnail:not(.loaded)').forEach(img => obs.observe(img));
}

// ─── Search ───────────────────────────────────────────────────────────────────

let searchSetupComplete = false;

function setupCourseSearch() {
    if (searchSetupComplete) return;

    const input   = document.getElementById('courseSearch');
    const clearBtn = document.getElementById('clearSearch');
    if (!input || !clearBtn) return;

    const debouncedSearch = debounce(q => {
        currentSearchQuery = q;
        renderCourses(currentUser, currentTab);
    }, 280);

    input.addEventListener('input', e => {
        const q = e.target.value;
        clearBtn.classList.toggle('hidden', q.length === 0);
        debouncedSearch(q);
    });

    clearBtn.onclick = () => {
        input.value = '';
        currentSearchQuery = '';
        clearBtn.classList.add('hidden');
        renderCourses(currentUser, currentTab);
        input.focus();
    };

    searchSetupComplete = true;
}
