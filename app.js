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
const adminPhone = "919526755210"; 

// ==========================================
// 2. DATA
// ==========================================
const courses = [
    { 
        id: "c_01",
        title: "പ്രാക്റ്റിക്കൽ ഫിഖ്ഹ് കോഴ്സ്", 
        price: 200, 
        desc: "ഫത്ഹുൽ മുഈൻ അടിസ്ഥാനത്തിൽ",
        features: ["ട്യൂട്ടർ: യാസീൻ സിദ്ദീഖ് നൂറാനി", "ക്ലാസ് രീതി: റെക്കോർഡ് ചെയ്ത വീഡിയോകൾ", "ക്ലാസ്സുകളുടെ എണ്ണം: ആഴ്ചയിൽ 4"]
    },
];

const courseContent = {
    "c_01": [
        { title: "Introduction to Course", videoId: "dQw4w9WgXcQ" }, 
        { title: "Chapter 1: Basics", videoId: "KMT1J3Lg6h0" },
        { title: "Chapter 2: Advanced", videoId: "8jP8CC23ibY" }
    ],
};

// ==========================================
// 3. UI NAVIGATION
// ==========================================
window.showPage = (pageId) => {
    document.querySelectorAll('.page').forEach(el => el.classList.add('hidden'));
    const target = document.getElementById(pageId);
    if(target) target.classList.remove('hidden');
};

window.openAuthModal = () => document.getElementById('authModal').classList.remove('hidden');

window.closeAuthModal = () => {
    document.getElementById('authModal').classList.add('hidden');
    const homeBtn = document.querySelector('.nav-item'); 
    if(homeBtn) window.switchTab(homeBtn, null); 
};

window.switchTab = (element, pageId) => {
    if(pageId) showPage(pageId);
    const bubble = document.getElementById('navBubble');
    bubble.style.width = `${element.offsetWidth}px`;
    bubble.style.transform = `translateX(${element.offsetLeft}px)`;
    bubble.classList.add('initialized'); 
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
};

document.addEventListener("DOMContentLoaded", () => {
    const activeBtn = document.querySelector('.nav-item.active'); 
    if(activeBtn) setTimeout(() => window.switchTab(activeBtn, null), 100); 
    renderCourses(null);
});

// ==========================================
// 4. AUTHENTICATION & LISTENERS
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

    await renderCourses(user);

    if (user) {
        // Logged In
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

        // Load History (With Error Handling)
        try {
            await loadHistory(user);
        } catch (e) {
            console.error("History load failed:", e);
            document.getElementById('historyList').innerHTML = "<p style='color:red; font-size:0.8rem;'>Error loading history.</p>";
        }

        await checkAndCreateProfile(user);
    } else {
        // Logged Out
        if(navIconDiv) navIconDiv.innerHTML = `<i class="fas fa-user"></i>`;
        if(label) label.innerText = "Login";
        
        if(loginView) loginView.classList.remove('hidden');
        if(profileView) profileView.classList.add('hidden');
        showPage('home'); 
    }
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
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) await setDoc(userRef, { email: user.email, uid: user.uid, expiryDate: null });
}

async function checkSubscription(userId) {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        const data = userSnap.data();
        if (!data.expiryDate) return { hasAccess: false };
        const today = new Date();
        const expiry = new Date(data.expiryDate);
        return (expiry - today) > 0 ? { hasAccess: true } : { hasAccess: false };
    }
    return { hasAccess: false };
}

async function renderCourses(user) {
    const courseList = document.getElementById('courseList');
    if(!courseList) return;

    let hasAccess = false;
    
    if (user) {
        courseList.innerHTML = '<p style="color:#aaa; text-align:center;">Checking subscription...</p>';
        const sub = await checkSubscription(user.uid);
        hasAccess = sub.hasAccess;
    }

    courseList.innerHTML = ""; 

    courses.forEach(c => {
        const div = document.createElement('div');
        div.className = 'course-card';
        const featuresHtml = c.features.map(f => `<li><i class="fas fa-check-circle"></i> ${f}</li>`).join('');
        
        let actionButton = "";
        
        if (c.price === 0) {
            actionButton = `<button class="btn-gold" style="font-size:0.8rem;" onclick="openCourse('${c.id}')"><i class="fas fa-play"></i> Open</button>`;
        } else if (hasAccess) {
            actionButton = `<button class="btn-gold" style="font-size:0.8rem;" onclick="openCourse('${c.id}')"><i class="fas fa-play"></i> Open</button>`;
        } else {
            actionButton = `<button class="btn-buy" onclick="buyCourse('${c.id}')">Buy</button>`;
        }

        div.innerHTML = `
            <div class="card-header"><h3>${c.title}</h3><span class="badge">${c.price === 0 ? "FREE" : "3-Month Plan"}</span></div>
            <p class="desc">${c.desc}</p><ul class="features">${featuresHtml}</ul>
            <div class="card-footer"><b class="price">₹${c.price}</b>
            <div style="display:flex; gap:10px;">
                ${actionButton}
            </div></div>`;
        courseList.appendChild(div);
    });
}

window.buyCourse = (courseId) => {
    const user = auth.currentUser;
    if (!user) { alert("Please Sign In."); openAuthModal(); return; }
    const course = courses.find(c => c.id === courseId);
    const msg = `Salam Kithademic!%0aI want to buy: *${course.title}*.%0aPrice: ₹${course.price}.%0aMy Email: ${user.email}%0aMy UID: ${user.uid}%0a%0aPlease send UPI details.`;
    window.open(`https://wa.me/${adminPhone}?text=${msg}`, '_blank');
};

// ==========================================
// 6. CLASSROOM & HISTORY
// ==========================================
window.openCourse = async (courseId) => {
    if (!auth.currentUser) { alert("Login first."); openAuthModal(); return; }
    
    const course = courses.find(c => c.id === courseId);
    if (course.price > 0) {
        const sub = await checkSubscription(auth.currentUser.uid);
        if (!sub.hasAccess) {
            if(confirm("Plan Expired. Renew?")) buyCourse(courseId);
            return;
        }
    }

    const lessons = courseContent[courseId];
    if (!lessons) return alert("Coming Soon.");

    showPage('classroom');
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
    document.getElementById('mainPlayer').src = `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&autoplay=1`;
    document.getElementById('videoTitle').innerText = title;
    
    document.querySelectorAll('.lesson-item').forEach(x => x.classList.remove('active'));
    if(el) el.classList.add('active');

    // SAVE HISTORY
    saveHistory(id, title);
};

// --- PREMIUM HISTORY LOGIC (Fixed "Stuck on Loading") ---
async function saveHistory(videoId, title) {
    const user = auth.currentUser;
    if(!user) return;
    
    // Save to Firestore
    const historyRef = doc(db, "users", user.uid, "watchHistory", videoId);
    try {
        await setDoc(historyRef, {
            videoId: videoId,
            title: title,
            timestamp: serverTimestamp()
        });
        // Reload list instantly
        loadHistory(user);
    } catch(e) { console.log("History save error", e); }
}

async function loadHistory(user) {
    const list = document.getElementById('historyList');
    if(!list) return;

    // We remove 'orderBy' from the query to prevent "Missing Index" errors
    // Instead, we sort the data in JavaScript
    const q = query(
        collection(db, "users", user.uid, "watchHistory"), 
        limit(10) 
    );
    
    const snapshot = await getDocs(q);
    list.innerHTML = ""; 
    
    if(snapshot.empty) {
        list.innerHTML = "<p style='color:#666; font-size:0.8rem; font-style:italic; padding:10px;'>No classes watched yet.</p>";
        return;
    }

    // Convert to array and Sort by Timestamp manually (Newest first)
    const historyItems = [];
    snapshot.forEach(doc => {
        historyItems.push(doc.data());
    });
    
    historyItems.sort((a, b) => {
        // Safe check for null timestamps (can happen immediately after write)
        const timeA = a.timestamp ? a.timestamp.seconds : Date.now()/1000;
        const timeB = b.timestamp ? b.timestamp.seconds : Date.now()/1000;
        return timeB - timeA;
    });

    // Render Cards
    historyItems.forEach(data => {
        const div = document.createElement('div');
        div.className = 'history-card';
        // Use YouTube Thumbnail API
        const thumbUrl = `https://img.youtube.com/vi/${data.videoId}/mqdefault.jpg`;
        
        div.innerHTML = `
            <div style="position:relative;">
                <img src="${thumbUrl}" class="history-thumb" alt="thumb">
                <i class="fas fa-play play-overlay"></i>
            </div>
            <div class="history-info">
                <div class="history-title">${data.title}</div>
                <div class="history-meta">
                    <i class="fas fa-check-circle" style="color:var(--accent-gold)"></i> Watched
                </div>
            </div>
        `;
        div.onclick = () => {
            closeAuthModal();
            findAndPlayVideo(data.videoId);
        };
        list.appendChild(div);
    });
}

function findAndPlayVideo(videoId) {
    for (const [courseId, lessons] of Object.entries(courseContent)) {
        const lesson = lessons.find(l => l.videoId === videoId);
        if (lesson) {
            openCourse(courseId).then(() => {
                setTimeout(() => playVideo(videoId, lesson.title, null), 500);
            });
            return;
        }
    }
}

// ==========================================
// 7. ADMIN & PWA
// ==========================================
window.openAdminCheck = () => {
    const password = prompt("Enter Admin Password:");
    if (password === "syd@123%") { showPage('adminPanel'); } 
    else if (password !== null) { alert("Access Denied"); }
};

window.addMonth = async () => {
    const uid = document.getElementById('studentId').value;
    if (!uid) return alert("Enter UID");
    const future = new Date(); future.setDate(future.getDate() + 90);
    await updateDoc(doc(db, "users", uid), { expiryDate: future.toISOString() });
    alert("Success! 90 Days Added.");
};

// --- PWA INSTALL ---
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installBtn = document.getElementById('installBtn');
    if(installBtn) installBtn.style.display = 'block';
});

window.installApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response: ${outcome}`);
    deferredPrompt = null;
};

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('SW Registered'))
            .catch(err => console.log('SW Failed', err));
    });
}
