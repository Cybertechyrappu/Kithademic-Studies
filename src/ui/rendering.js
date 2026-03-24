// Rendering Logic for Courses, Videos, and History
import { fetchUserAccess, loadWatchHistory } from "../services/data-service.js";
import { courses, basicVideos } from "../utils/constants.js";
import { openCourse, playSingleVideo } from "./player.js";
import { buyCourse } from "./player.js";

export async function renderCourses(user, currentCourseTab) {
    const courseList = document.getElementById('courseList'); 
    if(!courseList) return;
    
    let accessData = { purchasedCourses: {} };
    if (user) {
        courseList.innerHTML = '<p style="color:#aaa; text-align:center;">Loading courses...</p>';
        try { 
            const data = await fetchUserAccess(user.uid); 
            if(data) accessData = data; 
        } catch(e){ 
            console.error("Error rendering courses:", e); 
        }
    }
    courseList.innerHTML = ""; 

    courses.forEach(c => {
        const price = parseInt(c.price);
        if(currentCourseTab === 'premium' && price === 0) return;
        if(currentCourseTab === 'free' && price > 0) return;

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
            actionButton = `<button class="btn-primary buy-crs" data-id="${c.id}" data-renewal="true" style="margin:0; padding: 8px 15px;">Renew</button>`;
        } else if (c.isPurchasable) {
            actionButton = `<button class="btn-buy buy-crs" data-id="${c.id}" data-renewal="false">Buy</button>`;
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

export function renderBasicVideos() {
    const list = document.getElementById('videoList');
    if (!list) return;
    list.innerHTML = "";
    
    basicVideos.forEach(v => {
        const div = document.createElement('div');
        div.className = 'video-card';
        div.innerHTML = `
            <div class="video-thumb">
                <img src="https://img.youtube.com/vi/${v.id}/hqdefault.jpg" alt="Thumbnail">
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
}

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
            <img src="https://img.youtube.com/vi/${data.videoId}/mqdefault.jpg" class="history-thumb">
            <div class="history-info">
                <div class="history-title">${data.title}</div>
            </div>`;
        div.onclick = () => onPlayHistory(data.videoId);
        list.appendChild(div);
    });
}
