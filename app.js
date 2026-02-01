// ==========================================
// 1. IMPORTS & SETUP
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut, 
    GoogleAuthProvider, 
    signInWithPopup 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// --- CONFIGURATION ---
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
// 2. DATA (COURSES)
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
// 3. UI NAVIGATION (BUBBLE FIX HERE)
// ==========================================
let isLoginMode = true;

window.showPage = (pageId) => {
    document.querySelectorAll('.page').forEach(el => el.classList.add('hidden'));
    const target = document.getElementById(pageId);
    if(target) target.classList.remove('hidden');
};

window.openAuthModal = () => document.getElementById('authModal').classList.remove('hidden');
window.closeAuthModal = () => document.getElementById('authModal').classList.add('hidden');

window.toggleAuthMode = () => {
    isLoginMode = !isLoginMode;
    document.getElementById('modalTitle').innerText = isLoginMode ? "Student Login" : "Student Registration";
    document.getElementById('toggleAuth').innerText = isLoginMode ? "New here? Create Account" : "Already have an account? Login";
};

// --- BUBBLE ANIMATION ---
window.switchTab = (element, pageId) => {
    if(pageId) showPage(pageId);

    const bubble = document.getElementById('navBubble');
    const nav = document.querySelector('.bottom-nav');
    
    // Calculate Position
    const navRect = nav.getBoundingClientRect();
    const itemRect = element.getBoundingClientRect();
    const offsetLeft = itemRect.left - navRect.left;
    
    // Move Bubble
    bubble.style.width = `${itemRect.width}px`;
    bubble.style.transform = `translateX(${offsetLeft}px)`;
    bubble.classList.add('initialized'); // Makes it visible

    // Set Active State
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
};

// --- INITIALIZATION FIX ---
document.addEventListener("DOMContentLoaded", () => {
    // Find the item that is ALREADY active in HTML (which is Home)
    const activeBtn = document.querySelector('.nav-item.active'); 

    if(activeBtn) {
        // Trigger the bubble calculation immediately
        setTimeout(() => {
             window.switchTab(activeBtn, 'home'); 
        }, 100); 
    }
});

// ==========================================
// 4. AUTHENTICATION
// ==========================================
window.handleAuth = async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        if (isLoginMode) {
            await signInWithEmailAndPassword(auth, email, password);
        } else {
            await createUserWithEmailAndPassword(auth, email, password);
        }
        closeAuthModal();
    } catch (error) {
        alert(error.message);
    }
};

window.handleGoogleAuth = async () => {
    try {
        await signInWithPopup(auth, googleProvider);
        closeAuthModal();
    } catch (error) {
        console.error(error);
        alert("Google Login Error. Check Firebase Console.");
    }
};

onAuthStateChanged(auth, async (user) => {
    const btn = document.getElementById('authBtn');
    const label = document.getElementById('authLabel');
    
    if (user) {
        if(label) label.innerText = "Profile";
        await checkAndCreateProfile(user);
    } else {
        if(label) label.innerText = "Login";
    }
});

// ==========================================
// 5. DATABASE & PURCHASING
// ==========================================
async function checkAndCreateProfile(user) {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
        await setDoc(userRef, { email: user.email, uid: user.uid, expiryDate: null });
    }
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

// Render Courses
const courseList = document.getElementById('courseList');
if(courseList) {
    courseList.innerHTML = ""; 
    courses.forEach(c => {
        const div = document.createElement('div');
        div.className = 'course-card';
        const featuresHtml = c.features.map(f => `<li><i class="fas fa-check-circle"></i> ${f}</li>`).join('');
        div.innerHTML = `
            <div class="card-header"><h3>${c.title}</h3><span class="badge">${c.price === 0 ? "FREE" : "PAID"}</span></div>
            <p class="desc">${c.desc}</p><ul class="features">${featuresHtml}</ul>
            <div class="card-footer"><b class="price">₹${c.price}</b>
            <div style="display:flex; gap:10px;">
            <button class="btn-buy" onclick="buyCourse('${c.id}')">${c.price === 0 ? "Enroll" : "Buy"}</button>
            <button class="btn-gold" style="font-size:0.8rem;" onclick="openCourse('${c.id}')"><i class="fas fa-play"></i> Open</button>
            </div></div>`;
        courseList.appendChild(div);
    });
}

window.buyCourse = (courseId) => {
    const user = auth.currentUser;
    if (!user) { alert("Please Sign In."); openAuthModal(); return; }
    const course = courses.find(c => c.id === courseId);
    const msg = `Salam! Buying: *${course.title}*. User: ${user.email}`;
    window.open(`https://wa.me/${adminPhone}?text=${msg}`, '_blank');
};

// ==========================================
// 6. CLASSROOM
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
    document.getElementById('mainPlayer').src = `https://www.youtube.com/embed/${id}?rel=0`;
    document.getElementById('videoTitle').innerText = title;
    document.querySelectorAll('.lesson-item').forEach(x => x.classList.remove('active'));
    if(el) el.classList.add('active');
};

// ==========================================
// 7. ADMIN TOOLS
// ==========================================
window.openAdminCheck = () => {
    const password = prompt("Enter Admin Password:");
    if (password === "syd@123%") { 
        showPage('adminPanel');
    } else if (password !== null) {
        alert("Access Denied");
    }
};

window.addMonth = async () => {
    const uid = document.getElementById('studentId').value;
    if (!uid) return alert("Enter UID");
    const future = new Date(); future.setDate(future.getDate() + 90);
    await updateDoc(doc(db, "users", uid), { expiryDate: future.toISOString() });
    alert("Success! 90 Days Added.");
};
