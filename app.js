// ==========================================
// 1. IMPORTS & SETUP
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { 
    getAuth, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { 
    getFirestore, doc, getDoc, setDoc, updateDoc, 
    collection, query, limit, getDocs, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDm97rTDsP1sELznlVKLogPBkMiy0fpc9c",
    authDomain: "kithademic-studies.firebaseapp.com",
    projectId: "kithademic-studies",
    storageBucket: "kithademic-studies.firebasestorage.app",
    messagingSenderId: "962734931999",
    appId: "1:962734931999:web:3d335b466bafca1065552a",
    measurementId: "G-NXT6ZVKHSH"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
const adminPhone = ""; // ADD ADMIN NUMBER HERE

// ==========================================
// 2. DATA & STATE
// ==========================================
let currentCourseTab = 'premium';
let lastViewedPage = 'courses'; // Used for dynamic back button

// --- NEW: Standalone Basic Videos ---
const basicVideos = [
    { id: "42d2zuCqRY4", title: "Ramzan Talk | Yaseen Sidheeq Nurani" },
    { id: "pWBPJlPFqRY", title: "എത്രയാണ് അറിവ് സമ്പാദിക്കേണ്ടത്" },
    { id: "qvZPXKDLfLc", title: "സൂഫിസം | Yaseen Sidheeq Nurani" },
    { id: "Myr2DVUwaXk", title: "ഒരേയൊരു മനുഷ്യൻ | യാസീൻ സിദ്ദീഖ് നൂറാനി" },
    { id: "HGuknpnuHXs", title: "മുസ്ലിം വ്യക്തി നിയമം : മാനദണ്ഡങ്ങളിലെ നീതിബോധം" },
    { id: "RHoOG42BnnI", title: "അശ്‌റഖ ബൈത്ത്  |  Yaseen Sidheeq Nurani" }
];

const courses = [
    { 
        id: "c_01", title: "പ്രാക്റ്റിക്കൽ ഫിഖ്ഹ് കോഴ്സ് - Batch 4", price: "200", isPurchasable: false,
        desc: "KITHADEMIC STUDIES നിങ്ങൾക്കായി ഒരുക്കുന്നു, പ്രായോഗിക ജീവിതത്തിൽ ഉപകാരപ്പെടും വിധം ഫിഖ്ഹിനെ ലളിതമായി പരിചയപ്പെടുത്തുന്ന ഒരു പ്രത്യേക കോഴ്സ്.",
        features: ["ട്യൂട്ടർ: യാസീൻ സിദ്ദീഖ് നൂറാനി", "ക്ലാസ് രീതി: റെക്കോർഡ് ചെയ്ത വീഡിയോകൾ", "ക്ലാസ്സുകളുടെ എണ്ണം: ആഴ്ചയിൽ 4","സബ്സ്ക്രിപ്ഷൻ ഫീ: 1 മാസത്തേക്ക് ₹200"]
    },
    { 
        id: "c_02", title: "അഖീദ കോഴ്സ്", price: "0", isPurchasable: false,
        desc: "വിശ്വാസ കാര്യങ്ങളെ കുറിച്ചുള്ള പഠനം.",
        features: ["ട്യൂട്ടർ: യാസീൻ സിദ്ദീഖ് നൂറാനി", "ക്ലാസ് രീതി: റെക്കോർഡ് ചെയ്ത വീഡിയോകൾ", "Free Course"]
    }
];

const courseContent = {
    "c_01": [ { title: "Introduction to Course", videoId: "pWBPJlPFqRY" }, { title: "Chapter 1: Basics", videoId: "KMT1J3Lg6h0" } ],
    "c_02": [ { title: "Part-1 Aqeeda Foundation Course", videoId: "Mj2_llpeq_Q" }, { title: "Part-2 Aqeeda Foundation Course", videoId: "-FAi2iOkQF4" } ],
    "c_03": []
};

// ==========================================
// 3. UI DIALOGS & NAVIGATION
// ==========================================
const dialogModal = document.getElementById('customDialog');
const dialogTitle = document.getElementById('dialogTitle');
const dialogMessage = document.getElementById('dialogMessage');
const dialogButtons = document.getElementById('dialogButtons');

window.closeCustomDialog = () => dialogModal.classList.add('hidden');
window.showCustomAlert = (title, message) => {
    dialogTitle.innerText = title; dialogMessage.innerText = message;
    dialogButtons.innerHTML = `<button class="btn-gold" onclick="closeCustomDialog()">OK</button>`;
    dialogModal.classList.remove('hidden');
};
window.showCustomConfirm = (title, message, onConfirmCallback) => {
    dialogTitle.innerText = title; dialogMessage.innerText = message;
    dialogButtons.innerHTML = `<button class="btn-cancel" onclick="closeCustomDialog()">Cancel</button><button class="btn-gold" onclick="closeCustomDialog(); ${onConfirmCallback.name}()">Confirm</button>`;
    dialogButtons.lastChild.onclick = () => { closeCustomDialog(); onConfirmCallback(); };
    dialogModal.classList.remove('hidden');
};

const killVideo = () => {
    const wrapper = document.querySelector('.video-wrapper');
    if (wrapper) wrapper.innerHTML = ""; 
    const titleEl = document.getElementById('videoTitle');
    if (titleEl) titleEl.innerText = "Select a Class to Start";
};

window.showPage = (pageId) => {
    document.querySelectorAll('.page').forEach(el => el.classList.add('hidden'));
    const target = document.getElementById(pageId);
    if(target) target.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.openAuthModal = () => document.getElementById('authModal').classList.remove('hidden');
window.closeAuthModal = () => {
    document.getElementById('authModal').classList.add('hidden');
    const homeBtn = document.querySelectorAll('.nav-item')[0];
    if (homeBtn) window.switchTab(homeBtn, 'home');
};

window.handleGetStarted = () => {
    if (auth.currentUser) {
        window.switchTab(document.querySelectorAll('.nav-item')[1], 'courses');
    } else {
        openAuthModal();
    }
};

window.setCourseTab = (tabType, btnElement) => {
    currentCourseTab = tabType;
    document.querySelectorAll('.top-tab-btn').forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');
    renderCourses(auth.currentUser);
};

window.switchTab = (element, pageId) => {
    if (pageId !== 'classroom') killVideo();
    if (pageId === 'courses' || pageId === 'videos') lastViewedPage = pageId; // Save for back button
    
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

document.addEventListener("DOMContentLoaded", () => {
    const activeBtn = document.querySelector('.nav-item.active'); 
    if(activeBtn) setTimeout(() => window.switchTab(activeBtn, null), 100); 
    renderCourses(null);
    renderBasicVideos(); // Render new videos section
});

// ==========================================
// 4. AUTH LOGIC
// ==========================================
window.handleGoogleAuth = async () => { try { await signInWithPopup(auth, googleProvider); closeAuthModal(); } catch (error) { showCustomAlert("Login Error", error.message); } };
onAuthStateChanged(auth, async (user) => {
    const navIconDiv = document.getElementById('navAuthIcon'); const label = document.getElementById('authLabel');
    const loginView = document.getElementById('loginContent'); const profileView = document.getElementById('profileContent');

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
    } else {
        if(navIconDiv) navIconDiv.innerHTML = `<i class="fas fa-user"></i>`;
        if(label) label.innerText = "Login";
        if(loginView) loginView.classList.remove('hidden');
        if(profileView) profileView.classList.add('hidden');
    }
    await renderCourses(user);
    if(user) loadHistory(user);
});
window.handleSignOut = () => { showCustomConfirm("Log Out", "Are you sure?", () => { signOut(auth).then(() => { closeAuthModal(); window.location.reload(); }); }); };

// ==========================================
// 5. DATABASE & ACCESS LOGIC
// ==========================================
async function checkAndCreateProfile(user) {
    try {
        const userRef = doc(db, "users", user.uid); const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) await setDoc(userRef, { displayName: user.displayName, email: user.email, uid: user.uid, purchasedCourses: {} });
    } catch(e) {}
}

async function fetchUserAccess(userId) {
    try {
        const userSnap = await getDoc(doc(db, "users", userId));
        if (userSnap.exists()) return { purchasedCourses: userSnap.data().purchasedCourses || {} };
    } catch (e) {} return null;
}

// --- RENDER STANDALONE VIDEOS ---
function renderBasicVideos() {
    const list = document.getElementById('videoList');
    if (!list) return;
    list.innerHTML = "";
    
    basicVideos.forEach(v => {
        const div = document.createElement('div');
        div.className = 'video-card';
        // Auto-extract high quality YouTube thumbnail
        div.innerHTML = `
            <div class="video-thumb">
                <img src="https://img.youtube.com/vi/${v.id}/hqdefault.jpg" alt="Thumbnail">
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

async function renderCourses(user) {
    const courseList = document.getElementById('courseList'); if(!courseList) return;
    let accessData = { purchasedCourses: {} };
    if (user) {
        courseList.innerHTML = '<p style="color:#aaa; text-align:center;">Loading courses...</p>';
        try { const data = await fetchUserAccess(user.uid); if(data) accessData = data; } catch(e){}
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
            actionButton = `<button class="btn-gold" style="font-size:0.8rem;" onclick="openCourse('${c.id}')"><i class="fas fa-play"></i> Open</button>`;
        } else if (isExpired && c.isPurchasable) {
            actionButton = `<button class="btn-primary" style="margin:0; padding: 8px 15px;" onclick="buyCourse('${c.id}', true)">Renew</button>`;
        } else if (c.isPurchasable) {
            actionButton = `<button class="btn-buy" onclick="buyCourse('${c.id}', false)">Buy</button>`;
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
}

window.buyCourse = (courseId, isRenewal = false) => {
    const user = auth.currentUser;
    if (!user) { showCustomAlert("Required", "Sign in to enroll."); openAuthModal(); return; }
    const course = courses.find(c => c.id === courseId);
    
    const reqType = isRenewal ? "🔄 *Renewal Request*" : "🎓 *New Enrollment*";
    const msg = `${reqType}%0a%0aHello Admin,%0aI'd like to pay for 1 month of:%0a*Course:* ${course.title}%0a*Course ID:* ${course.id}%0a*Price:* ₹${course.price}%0a%0a*My UID:* ${user.uid}%0a%0aPlease send UPI details.`;
    window.open(`https://wa.me/${adminPhone}?text=${msg}`, '_blank');
};

// Setup Dynamic Back Button Logic
const setupBackButton = () => {
    document.getElementById('backBtn').onclick = () => {
        killVideo();
        // 1 = Courses Tab, 2 = Videos Tab
        const targetBtnIndex = lastViewedPage === 'videos' ? 2 : 1;
        window.switchTab(document.querySelectorAll('.nav-item')[targetBtnIndex], lastViewedPage);
    };
};

// --- NEW: Play Single Standalone Video ---
window.playSingleVideo = (id, title) => {
    if (!auth.currentUser) { showCustomAlert("Access Denied", "Please login to watch classes."); openAuthModal(); return; }

    document.querySelectorAll('.page').forEach(el => el.classList.add('hidden'));
    document.getElementById('classroom').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setupBackButton();

    const pl = document.getElementById('playlistItems');
    pl.innerHTML = `<div class="lesson-item active"><i class="fas fa-play-circle"></i> <span>${title}</span></div>`;
    
    window.playVideo(id, title, pl.firstChild);
};

window.openCourse = async (courseId) => {
    if (!auth.currentUser) { showCustomAlert("Access Denied", "Please login."); openAuthModal(); return; }
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
    const pl = document.getElementById('playlistItems'); pl.innerHTML = "";
    lessons.forEach((l, i) => {
        const d = document.createElement('div'); d.className = 'lesson-item';
        d.innerHTML = `<i class="fas fa-play-circle"></i> <span>${i+1}. ${l.title}</span>`;
        d.onclick = () => window.playVideo(l.videoId, l.title, d); pl.appendChild(d);
    });
    if(lessons.length) window.playVideo(lessons[0].videoId, lessons[0].title, pl.firstChild);
};

window.playVideo = (id, title, el) => {
    const wrapper = document.querySelector('.video-wrapper'); let player = document.getElementById('mainPlayer');
    if (!player && wrapper) { player = document.createElement('iframe'); player.id = 'mainPlayer'; player.allowFullscreen = true; wrapper.appendChild(player); }
    player.src = `https://www.youtube.com/embed/${id}?autoplay=1&modestbranding=1&rel=0`; document.getElementById('videoTitle').innerText = title;
    document.querySelectorAll('.lesson-item').forEach(x => x.classList.remove('active')); if(el) el.classList.add('active');
    try { setDoc(doc(db, "users", auth.currentUser.uid, "watchHistory", id), { videoId: id, title, timestamp: serverTimestamp() }); } catch(e){}
};

async function loadHistory(user) {
    const list = document.getElementById('historyList'); if(!list) return;
    const snap = await getDocs(query(collection(db, "users", user.uid, "watchHistory"), limit(10)));
    list.innerHTML = ""; if(snap.empty) { list.innerHTML = "<p style='color:#666;'>No history.</p>"; return; }
    snap.forEach(d => {
        const data = d.data(); const div = document.createElement('div'); div.className = 'history-card';
        div.innerHTML = `<img src="https://img.youtube.com/vi/${data.videoId}/mqdefault.jpg" class="history-thumb"><div class="history-info"><div class="history-title">${data.title}</div></div>`;
        div.onclick = () => { closeAuthModal(); findAndPlayVideo(data.videoId); }; list.appendChild(div);
    });
}

function findAndPlayVideo(videoId) {
    // 1. Check if it's inside a premium course
    for (const [cid, ls] of Object.entries(courseContent)) {
        if (ls.find(l => l.videoId === videoId)) { 
            window.openCourse(cid).then(() => window.playVideo(videoId, "", null)); 
            return; 
        }
    }
    // 2. Check if it's a basic standalone video
    const basic = basicVideos.find(v => v.id === videoId);
    if (basic) {
        window.playSingleVideo(basic.id, basic.title);
    }
}

// PWA
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); document.getElementById('installBtn').style.display='block'; window.deferredPrompt = e; });
window.installApp = async () => { if(window.deferredPrompt){ window.deferredPrompt.prompt(); window.deferredPrompt = null; } };
if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js');
