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

// --- YOUR FIREBASE CONFIGURATION ---
const firebaseConfig = {
    apiKey: "AIzaSyDm97rTDsP1sELznlVKLogPBkMiy0fpc9c",
    authDomain: "kithademic-studies.firebaseapp.com",
    projectId: "kithademic-studies",
    storageBucket: "kithademic-studies.firebasestorage.app",
    messagingSenderId: "962734931999",
    appId: "1:962734931999:web:3d335b466bafca1065552a",
    measurementId: "G-NXT6ZVKHSH"
};

// Initialize Services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// --- YOUR WHATSAPP NUMBER ---
const adminPhone = "919526755210"; 

// ==========================================
// 2. DATA (COURSES & VIDEOS)
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
        { title: "Introduction to Botany", videoId: "dQw4w9WgXcQ" }, 
        { title: "Photosynthesis Explained", videoId: "KMT1J3Lg6h0" },
        { title: "Genetics Part 1", videoId: "8jP8CC23ibY" }
    ],
};

// ==========================================
// 3. UI NAVIGATION & STATE
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

// ==========================================
// 4. AUTHENTICATION LOGIC
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
        alert("Google Login Failed. Note: If using Vercel, make sure you added the Vercel domain to Firebase Authorized Domains.");
    }
};

// Listener: Runs whenever user logs in/out
onAuthStateChanged(auth, async (user) => {
    const btn = document.getElementById('authBtn');
    if (user) {
        // User is logged in
        btn.innerText = "Log Out";
        btn.onclick = () => signOut(auth);
        
        // Check/Create Database Profile
        await checkAndCreateProfile(user);
        
        alert(`Welcome back, ${user.displayName || user.email}`);
    } else {
        // User is logged out
        btn.innerText = "Sign In";
        btn.onclick = openAuthModal;
        showPage('home'); 
    }
});

// ==========================================
// 5. DATABASE & SUBSCRIPTION LOGIC
// ==========================================

// Ensure user exists in DB
async function checkAndCreateProfile(user) {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        await setDoc(userRef, {
            email: user.email,
            uid: user.uid,
            expiryDate: null // No access initially
        });
    }
}

// Check if subscription is active
async function checkSubscription(userId) {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        const data = userSnap.data();
        if (!data.expiryDate) return { hasAccess: false, daysLeft: 0 };

        const today = new Date();
        const expiry = new Date(data.expiryDate);
        
        const diffTime = expiry - today; 
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

        return diffDays > 0 ? { hasAccess: true, daysLeft: diffDays } : { hasAccess: false, daysLeft: 0 };
    }
    return { hasAccess: false, daysLeft: 0 };
}

// ==========================================
// 6. COURSE & PURCHASING LOGIC
// ==========================================

// Render Course Cards
const courseList = document.getElementById('courseList');
if(courseList) {
    courseList.innerHTML = ""; 
    courses.forEach(c => {
        const div = document.createElement('div');
        div.className = 'course-card';
        
        const featuresHtml = c.features.map(f => `<li><i class="fas fa-check-circle"></i> ${f}</li>`).join('');

        div.innerHTML = `
            <div class="card-header">
                <h3>${c.title}</h3>
                <span class="badge">${c.price === 0 ? "FREE" : "3-Month Payment"}</span>
            </div>
            <p class="desc">${c.desc}</p>
            <ul class="features">${featuresHtml}</ul>
            <div class="card-footer">
                <b class="price">₹${c.price}</b>
                <div style="display:flex; gap:10px;">
                    <button class="btn-buy" onclick="buyCourse('${c.id}')">
                        ${c.price === 0 ? "Enroll" : "Buy"}
                    </button>
                    <button class="btn-gold" style="font-size:0.8rem;" onclick="openCourse('${c.id}')">
                        <i class="fas fa-play"></i> Open
                    </button>
                </div>
            </div>
        `;
        courseList.appendChild(div);
    });
}

// Handle Purchase (WhatsApp)
window.buyCourse = (courseId) => {
    const user = auth.currentUser;
    if (!user) {
        alert("Please Sign In to purchase.");
        openAuthModal();
        return;
    }

    const course = courses.find(c => c.id === courseId);
    
    // Free Course
    if (course.price === 0) {
        alert("This course is free! Just click 'Open'.");
        return;
    }

    // Paid Course -> WhatsApp
    const message = `Salam Kithademic!%0aI want to buy: *${course.title}*.%0aPrice: ₹${course.price}.%0aMy Email: ${user.email}%0aMy UID: ${user.uid}%0a%0aPlease send UPI details.`;
    const whatsappUrl = `https://wa.me/${adminPhone}?text=${message}`;
    window.open(whatsappUrl, '_blank');
};

// ==========================================
// 7. CLASSROOM & PLAYER LOGIC
// ==========================================
window.openCourse = async (courseId) => {
    if (!auth.currentUser) {
        alert("Please login first.");
        openAuthModal();
        return;
    }

    // 1. Check Subscription (Except for Free Courses)
    const course = courses.find(c => c.id === courseId);
    if (course.price > 0) {
        const subStatus = await checkSubscription(auth.currentUser.uid);
        if (!subStatus.hasAccess) {
            const renew = confirm("Subscription Expired/Inactive.\nRenew for 30 days via WhatsApp?");
            if (renew) buyCourse(courseId);
            return;
        }
    }

    // 2. Load Content
    const lessons = courseContent[courseId];
    if (!lessons) return alert("Content upload in progress.");

    showPage('classroom');
    
    // 3. Build Playlist
    const playlistDiv = document.getElementById('playlistItems');
    playlistDiv.innerHTML = "";
    
    lessons.forEach((lesson, index) => {
        const div = document.createElement('div');
        div.className = `lesson-item`; 
        div.innerHTML = `
            <i class="fas fa-play-circle"></i>
            <span>${index + 1}. ${lesson.title}</span>
        `;
        div.onclick = () => playVideo(lesson.videoId, lesson.title, div);
        playlistDiv.appendChild(div);
    });

    // Auto-play first video
    if (lessons.length > 0) playVideo(lessons[0].videoId, lessons[0].title, playlistDiv.firstChild);
};

window.playVideo = (id, title, listElement) => {
    document.getElementById('mainPlayer').src = `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`;
    document.getElementById('videoTitle').innerText = title;
    
    document.querySelectorAll('.lesson-item').forEach(el => el.classList.remove('active'));
    if(listElement) listElement.classList.add('active');
};

// ==========================================
// 8. ADMIN PANEL (SECRET)
// ==========================================
window.addMonth = async () => {
    const uid = document.getElementById('studentId').value;
    if (!uid) return alert("Enter User UID");

    const userRef = doc(db, "users", uid);
    
    // Add 30 Days from NOW
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    try {
        await updateDoc(userRef, { expiryDate: futureDate.toISOString() });
        document.getElementById('adminStatus').innerText = "Extended until: " + futureDate.toDateString();
        alert("Success! User has access for 30 days.");
    } catch (error) {
        // If user doesn't exist yet in DB, create them
        await setDoc(userRef, { expiryDate: futureDate.toISOString() });
        document.getElementById('adminStatus').innerText = "Created & Active until: " + futureDate.toDateString();
    }
};

// ==========================================
// 9. SECRET ADMIN TRIGGER
// ==========================================
let tapCount = 0;
document.querySelector('.logo').addEventListener('click', () => {
    tapCount++;
    if (tapCount === 5) {
        const password = prompt("Enter Admin Password:");
        if (password === "syd@123%") { // Change this to a real password
            showPage('adminPanel');
        }
        tapCount = 0; // Reset
    }
    // Reset count if not clicked quickly enough
    setTimeout(() => { tapCount = 0; }, 2000);
});
