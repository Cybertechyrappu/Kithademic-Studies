// ==========================================
// 1. IMPORTS & SETUP
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { 
    getAuth, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { 
    getFirestore, doc, getDoc, setDoc, updateDoc, 
    collection, query, orderBy, limit, getDocs, serverTimestamp 
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
const adminPhone = "919544268849"; 

// ==========================================
// 2. DATA
// ==========================================
const courses = [
    { 
        id: "c_01",
        title: "പ്രാക്റ്റിക്കൽ ഫിഖ്ഹ് കോഴ്സ്",
        price: "200",
        desc: "ഫത്ഹുൽ മുഈൻ അടിസ്ഥാനത്തിൽ",
        features: ["ട്യൂട്ടർ: യാസീൻ സിദ്ദീഖ് നൂറാനി", "ക്ലാസ് രീതി: റെക്കോർഡ് ചെയ്ത വീഡിയോകൾ", "ക്ലാസ്സുകളുടെ എണ്ണം: ആഴ്ചയിൽ 4"]
    },
];

const courseContent = {
    "c_01": [
        { title: "Introduction to Course", videoId: "pWBPJlPFqRY" }, 
        { title: "Chapter 1: Basics", videoId: "KMT1J3Lg6h0" },
        { title: "Chapter 2: Advanced", videoId: "8jP8CC23ibY" }
    ],
};

// ==========================================
// 3. UI NAVIGATION & LOGIC
// ==========================================

// Helper: Kill Video (Stops Audio)
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
};

window.openAuthModal = () => document.getElementById('authModal').classList.remove('hidden');

// --- FIX: GO HOME ON CLOSE ---
window.closeAuthModal = () => {
    document.getElementById('authModal').classList.add('hidden');
    
    // Find the Home Button (Index 0) and click it virtually
    const homeBtn = document.querySelectorAll('.nav-item')[0];
    if (homeBtn) {
        window.switchTab(homeBtn, 'home');
    }
};

window.goBackToCourses = () => {
    killVideo();
    const coursesBtn = document.querySelectorAll('.nav-item')[1]; 
    window.switchTab(coursesBtn, 'courses');
};

window.switchTab = (element, pageId) => {
    // If leaving classroom, destroy video
    if (pageId !== 'classroom') {
        killVideo();
    }

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
    
    // Back Button Logic
    const backBtn = document.getElementById('backToCoursesBtn');
    if(backBtn) {
        backBtn.addEventListener('click', () => {
            killVideo(); 
            const coursesBtn = document.querySelectorAll('.nav-item')[1]; 
            window.switchTab(coursesBtn, 'courses');
        });
    }

    renderCourses(null);
});

// ==========================================
// 4. AUTH & USER LOGIC
// ==========================================
window.handleGoogleAuth = async () => {
    try {
        await signInWithPopup(auth, googleProvider);
        closeAuthModal(); // This will now auto-redirect to Home
    } catch (error) {
        console.error(error);
        alert("Login Error: " + error.message);
    }
};

onAuthStateChanged(auth, async (user) => {
    const navIconDiv = document.getElementById('navAuthIcon');
    const label = document.getElementById('authLabel');
    const loginView = document.getElementById('loginContent');
    const profileView = document.getElementById('profileContent');

    if (user) {
        const photoURL = user.photoURL || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
        if(navIconDiv) navIconDiv.innerHTML = `<img src="${photoURL}" class="nav-user-img" alt="User">`;
        if(label) label.innerText = "Profile";

        if(loginView) loginView.classList.add('hidden');
        if(profileView) {
            profileView.classList.remove('hidden');
            document.getElementById('userProfileImg').src = photoURL;
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

window.handleSignOut = () => {
    signOut(auth).then(() => {
        closeAuthModal(); // Will go to Home
        alert("Logged Out Successfully");
        window.location.reload();
    }).catch((error) => alert("Error: " + error.message));
};

// ==========================================
// 5. DATABASE & LOGIC
// ==========================================
async function checkAndCreateProfile(user) {
    try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) await setDoc(userRef, { email: user.email, uid: user.uid, expiryDate: null });
    } catch(e) { console.error(e); }
}

async function checkSubscription(userId) {
    try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            const data = userSnap.data();
            if (!data.expiryDate) return { hasAccess: false };
            const today = new Date();
            const expiry = new Date(data.expiryDate);
            return (expiry - today) > 0 ? { hasAccess: true } : { hasAccess: false };
        }
    } catch (e) { return { hasAccess: false }; }
    return { hasAccess: false };
}

async function renderCourses(user) {
    const courseList = document.getElementById('courseList');
    if(!courseList) return;
    let hasAccess = false;
    if (user) {
        courseList.innerHTML = '<p style="color:#aaa; text-align:center;">Checking subscription...</p>';
        try { const sub = await checkSubscription(user.uid); hasAccess = sub.hasAccess; } catch(e){}
    }
    courseList.innerHTML = ""; 
    courses.forEach(c => {
        const div = document.createElement('div');
        div.className = 'course-card';
        const featuresHtml = c.features.map(f => `<li><i class="fas fa-check-circle"></i> ${f}</li>`).join('');
        let actionButton = (c.price === 0 || hasAccess) 
            ? `<button class="btn-gold" style="font-size:0.8rem;" onclick="openCourse('${c.id}')"><i class="fas fa-play"></i> Open</button>`
            : `<button class="btn-buy" onclick="buyCourse('${c.id}')">Buy</button>`;

        div.innerHTML = `
            <div class="card-header"><h3>${c.title}</h3><span class="badge">${c.price === 0 ? "FREE" : "3-Month Plan"}</span></div>
            <p class="desc">${c.desc}</p><ul class="features">${featuresHtml}</ul>
            <div class="card-footer"><b class="price">₹${c.price}</b><div style="display:flex; gap:10px;">${actionButton}</div></div>`;
        courseList.appendChild(div);
    });
}

// --- UPDATED WHATSAPP MESSAGE LOGIC ---
window.buyCourse = (courseId) => {
    const user = auth.currentUser;
    if (!user) { alert("Please Sign In."); openAuthModal(); return; }
    
    const course = courses.find(c => c.id === courseId);
    const userName = user.displayName || "Student";
    
    const msg = `${userName}%0aI want to buy: *${course.title}*.%0aPrice: ₹${course.price}.%0aMy Email: ${user.email}%0aMy UID: ${user.uid}%0a%0aPlease send UPI details.`;
    
    window.open(`https://wa.me/${adminPhone}?text=${msg}`, '_blank');
};

window.openCourse = async (courseId) => {
    if (!auth.currentUser) { alert("Login first."); openAuthModal(); return; }
    const course = courses.find(c => c.id === courseId);
    if (course.price > 0) {
        const sub = await checkSubscription(auth.currentUser.uid);
        if (!sub.hasAccess) { if(confirm("Renew?")) buyCourse(courseId); return; }
    }
    
    // Switch to Classroom
    document.querySelectorAll('.page').forEach(el => el.classList.add('hidden'));
    document.getElementById('classroom').classList.remove('hidden');
    
    const lessons = courseContent[courseId];
    const pl = document.getElementById('playlistItems');
    pl.innerHTML = "";
    lessons.forEach((l, i) => {
        const d = document.createElement('div');
        d.className = 'lesson-item';
        d.innerHTML = `<i class="fas fa-play-circle"></i> <span>${i+1}. ${l.title}</span>`;
        d.onclick = () => window.playVideo(l.videoId, l.title, d);
        pl.appendChild(d);
    });
    if(lessons.length) window.playVideo(lessons[0].videoId, lessons[0].title, pl.firstChild);
};

window.playVideo = (id, title, el) => {
    const wrapper = document.querySelector('.video-wrapper');
    let player = document.getElementById('mainPlayer');
    
    if (!player && wrapper) {
        player = document.createElement('iframe');
        player.id = 'mainPlayer';
        player.width = "100%";
        player.height = "100%";
        player.frameBorder = "0";
        player.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        player.allowFullscreen = true;
        wrapper.appendChild(player);
    }
    
    player.src = `https://www.youtube.com/embed/${id}?autoplay=1&modestbranding=1&rel=0&showinfo=0&controls=1&fs=1`;
    document.getElementById('videoTitle').innerText = title;

    document.querySelectorAll('.lesson-item').forEach(x => x.classList.remove('active'));
    if(el) el.classList.add('active');
    
    saveHistory(id, title);
};

async function saveHistory(videoId, title) {
    const user = auth.currentUser;
    if(!user) return;
    try { await setDoc(doc(db, "users", user.uid, "watchHistory", videoId), { videoId, title, timestamp: serverTimestamp() }); } catch(e){}
}
async function loadHistory(user) {
    const list = document.getElementById('historyList');
    if(!list) return;
    const snap = await getDocs(query(collection(db, "users", user.uid, "watchHistory"), limit(10)));
    list.innerHTML = ""; 
    if(snap.empty) { list.innerHTML = "<p style='color:#666; font-size:0.8rem;'>No history.</p>"; return; }
    
    const items = [];
    snap.forEach(d => items.push(d.data()));
    items.sort((a,b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));

    items.forEach(d => {
        const div = document.createElement('div');
        div.className = 'history-card';
        div.innerHTML = `<img src="https://img.youtube.com/vi/${d.videoId}/mqdefault.jpg" class="history-thumb"><div class="history-info"><div class="history-title">${d.title}</div></div>`;
        div.onclick = () => { closeAuthModal(); findAndPlayVideo(d.videoId); };
        list.appendChild(div);
    });
}
function findAndPlayVideo(videoId) {
    for (const [cid, ls] of Object.entries(courseContent)) {
        if (ls.find(l => l.videoId === videoId)) { window.openCourse(cid).then(() => window.playVideo(videoId, "", null)); return; }
    }
}
// PWA
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); document.getElementById('installBtn').style.display='block'; window.deferredPrompt = e; });
window.installApp = async () => { if(window.deferredPrompt){ window.deferredPrompt.prompt(); window.deferredPrompt = null; } };
if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js');
