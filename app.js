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
const adminPhone = ""; 

// ==========================================
// 2. DATA (Added 'isPurchasable' flag)
// ==========================================
const courses = [
    { 
        id: "c_01",
        title: "പ്രാക്റ്റിക്കൽ ഫിഖ്ഹ് കോഴ്സ്",
        price: "200",
        isPurchasable: true, // SPECIFIC BUY OPTION ENABLED
        desc: "KITHADEMIC STUDIES നിങ്ങൾക്കായി ഒരുക്കുന്നു, പ്രായോഗിക ജീവിതത്തിൽ ഉപകാരപ്പെടും വിധം ഫിഖ്ഹിനെ ലളിതമായി പരിചയപ്പെടുത്തുന്ന ഒരു പ്രത്യേക കോഴ്സ്. ഫത്ഹുൽ മുഈൻ അടിസ്ഥാനമാക്കി തയ്യാറാക്കിയ ഈ കോഴ്സിൻ്റെ പ്രധാന ലക്ഷ്യം കർമ്മശാസ്ത്രത്തെ നിങ്ങളുടെ ദൈനംദിന ജീവിതവുമായി ബന്ധിപ്പിക്കുക എന്നതാണ്.",
        features: ["ട്യൂട്ടർ: യാസീൻ സിദ്ദീഖ് നൂറാനി", "ക്ലാസ് രീതി: റെക്കോർഡ് ചെയ്ത വീഡിയോകൾ", "ക്ലാസ്സുകളുടെ എണ്ണം: ആഴ്ചയിൽ 4","സബ്സ്ക്രിപ്ഷൻ ഫീ: 3 മാസത്തേക്ക് ₹200 (മുൻകൂട്ടി അടയ്ക്കുക)"]
    },
    { 
        id: "c_02",
        title: "അഖീദ കോഴ്സ്",
        price: "0",
        isPurchasable: false, // Free courses handle this automatically, but explicitly marking false
        desc: "വിശ്വാസ കാര്യങ്ങളെ കുറിച്ചുള്ള പഠനം.",
        features: ["ട്യൂട്ടർ: യാസീൻ സിദ്ദീഖ് നൂറാനി", "ക്ലാസ് രീതി: റെക്കോർഡ് ചെയ്ത വീഡിയോകൾ", "Free Course"]
    },
    { 
        id: "c_03",
        title: "Upcoming Special Class",
        price: "150",
        isPurchasable: false, // SPECIFIC BUY OPTION DISABLED (Will show as Coming Soon)
        desc: "An advanced look into specialized topics. Enrollment is currently closed.",
        features: ["ട്യൂട്ടർ: യാസീൻ സിദ്ദീഖ് നൂറാനി", "Live + Recorded", "Enrollment Closed"]
    }
];

const courseContent = {
    "c_01": [
        { title: "Introduction to Course", videoId: "pWBPJlPFqRY" }, 
        { title: "Chapter 1: Basics", videoId: "KMT1J3Lg6h0" },
        { title: "Chapter 2: Advanced", videoId: "8jP8CC23ibY" }
    ],
    "c_02": [
        { title: "Part-1 Aqeeda Foundation Course", videoId: "Mj2_llpeq_Q" }, 
        { title: "Part-2 Aqeeda Foundation Course", videoId: "-FAi2iOkQF4" }
    ],
    "c_03": []
};

// ==========================================
// 3. UI NAVIGATION & LOGIC
// ==========================================
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
    // Smooth scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.openAuthModal = () => document.getElementById('authModal').classList.remove('hidden');

window.closeAuthModal = () => {
    document.getElementById('authModal').classList.add('hidden');
    const homeBtn = document.querySelectorAll('.nav-item')[0];
    if (homeBtn) window.switchTab(homeBtn, 'home');
};

window.switchTab = (element, pageId) => {
    if (pageId !== 'classroom') killVideo();
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
        closeAuthModal(); 
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
        closeAuthModal();
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
        const userData = { displayName: user.displayName || "Student", email: user.email, uid: user.uid };

        if (!userSnap.exists()) {
            await setDoc(userRef, { ...userData, expiryDate: null });
        } else {
            await updateDoc(userRef, { displayName: userData.displayName, email: userData.email });
        }
    } catch(e) { console.error("Profile Error:", e); }
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
        try { 
            const sub = await checkSubscription(user.uid); 
            hasAccess = sub.hasAccess; 
        } catch(e){}
    }

    courseList.innerHTML = ""; 

    courses.forEach(c => {
        const div = document.createElement('div');
        div.className = 'course-card';
        const featuresHtml = c.features.map(f => `<li><i class="fas fa-check-circle"></i> ${f}</li>`).join('');

        let actionButton = "";
        const price = parseInt(c.price);

        // MODIFIED LOGIC: Check explicit `isPurchasable` property
        if (price === 0 || hasAccess) {
            actionButton = `<button class="btn-gold" style="font-size:0.8rem;" onclick="openCourse('${c.id}')"><i class="fas fa-play"></i> Open</button>`;
        } else if (c.isPurchasable) {
            actionButton = `<button class="btn-buy" onclick="buyCourse('${c.id}')">Buy</button>`;
        } else {
            // Disabled state for non-purchasable specific courses
            actionButton = `<button class="btn-disabled" disabled>Closed</button>`;
        }

        const priceDisplay = price === 0 ? "FREE" : `₹${c.price}`;
        const badgeDisplay = price === 0 ? "FREE" : "Paid Course";

        div.innerHTML = `
            <div class="card-header">
                <h3>${c.title}</h3>
                <span class="badge" style="${price === 0 ? 'background:#28a745;' : ''}">${badgeDisplay}</span>
            </div>
            <p class="desc">${c.desc}</p>
            <ul class="features">${featuresHtml}</ul>
            <div class="card-footer">
                <b class="price">${priceDisplay}</b>
                <div style="display:flex; gap:10px;">${actionButton}</div>
            </div>`;
        courseList.appendChild(div);
    });
}

window.buyCourse = (courseId) => {
    const user = auth.currentUser;
    if (!user) { alert("Please Sign In."); openAuthModal(); return; }

    const course = courses.find(c => c.id === courseId);
    
    // Safety check just in case
    if (!course.isPurchasable) { alert("This course is currently not available for purchase."); return; }

    const userName = user.displayName || "Student";
    const msg = `${userName}%0aI want to buy: *${course.title}*.%0aPrice: ₹${course.price}.%0aMy Email: ${user.email}%0aMy UID: ${user.uid}%0a%0aPlease send UPI details.`;

    window.open(`https://wa.me/${adminPhone}?text=${msg}`, '_blank');
};

window.openCourse = async (courseId) => {
    if (!auth.currentUser) { alert("Please login to continue."); openAuthModal(); return; }

    const course = courses.find(c => c.id === courseId);
    const price = parseInt(course.price);

    if (price > 0) {
        const sub = await checkSubscription(auth.currentUser.uid);
        if (!sub.hasAccess) { 
            if(course.isPurchasable && confirm("Subscription Expired. Renew now?")) buyCourse(courseId); 
            else if (!course.isPurchasable) alert("Subscription Expired. Renewals are currently closed.");
            return; 
        }
    }

    document.querySelectorAll('.page').forEach(el => el.classList.add('hidden'));
    document.getElementById('classroom').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Smooth scroll top

    const lessons = courseContent[courseId];
    if (!lessons || lessons.length === 0) { alert("No content added yet."); return; }

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
