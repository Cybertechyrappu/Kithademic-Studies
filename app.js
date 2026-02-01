// Import Firebase functions from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } 
from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";


// --- CONFIGURATION ---
// 1. Go to console.firebase.google.com
// 2. Create project > Add Web App > Copy Config
const firebaseConfig = {
    apiKey: "AIzaSyDm97rTDsP1sELznlVKLogPBkMiy0fpc9c",
  authDomain: "kithademic-studies.firebaseapp.com",
  projectId: "kithademic-studies",
  storageBucket: "kithademic-studies.firebasestorage.app",
  messagingSenderId: "962734931999",
  appId: "1:962734931999:web:3d335b466bafca1065552a",
  measurementId: "G-NXT6ZVKHSH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// --- STATE MANAGEMENT ---
let isLoginMode = true;

// --- UI FUNCTIONS ---
window.showPage = (pageId) => {
    document.querySelectorAll('.page').forEach(el => el.classList.add('hidden'));
    document.getElementById(pageId).classList.remove('hidden');
};

window.openAuthModal = () => document.getElementById('authModal').classList.remove('hidden');
window.closeAuthModal = () => document.getElementById('authModal').classList.add('hidden');

window.toggleAuthMode = () => {
    isLoginMode = !isLoginMode;
    document.getElementById('modalTitle').innerText = isLoginMode ? "Student Login" : "Student Registration";
    document.getElementById('toggleAuth').innerText = isLoginMode ? "New here? Create Account" : "Already have an account? Login";
};

// --- GOOGLE AUTH LOGIC ---
const googleProvider = new GoogleAuthProvider();

window.handleGoogleAuth = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        
        console.log("User Info:", user); // Useful for debugging
        alert(`Welcome, ${user.displayName}!`);
        
        closeAuthModal();
        // The onAuthStateChanged listener will automatically update the UI
    } catch (error) {
        console.error(error);
        alert("Login Failed: " + error.message);
    }
};

// --- AUTH LOGIC ---
window.handleAuth = async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        if (isLoginMode) {
            await signInWithEmailAndPassword(auth, email, password);
            alert("Welcome back!");
        } else {
            await createUserWithEmailAndPassword(auth, email, password);
            alert("Account created successfully!");
        }
        closeAuthModal();
        updateUI(auth.currentUser);
    } catch (error) {
        alert(error.message);
    }
};

// Listen to Auth Changes
onAuthStateChanged(auth, (user) => {
    const btn = document.getElementById('authBtn');
    if (user) {
        btn.innerText = "Log Out";
        btn.onclick = () => signOut(auth);
        // Load secure content here
    } else {
        btn.innerText = "Sign In";
        btn.onclick = openAuthModal;
    }
});

// --- COURSE DATA ---
const courses = [
    { 
        id: "c_bio_01",
        title: "+2 Bio-Science Mastery", 
        price: 4999, 
        desc: "Complete revisions and mock tests.",
        features: ["Live Classes", "PDF Notes", "24/7 Support"]
    },
    { 
        id: "c_ent_02",
        title: "Entrance Crash Course", 
        price: 2999, 
        desc: "Physics, Chemistry, and Biology focus.",
        features: ["Mock Tests", "Previous Year QPs"]
    },
    { 
        id: "c_his_03",
        title: "Islamic History", 
        price: 0, 
        desc: "The golden age of science and faith.",
        features: ["Documentary Access", "E-Book"]
    }
];

// --- PURCHASE LOGIC ---
window.buyCourse = (courseId) => {
    // 1. Check if user is logged in
    const user = auth.currentUser;
    if (!user) {
        alert("Please Sign In to purchase a course.");
        openAuthModal();
        return;
    }

    // 2. Find the course details
    const course = courses.find(c => c.id === courseId);
    
    // 3. Handle Free Courses
    if (course.price === 0) {
        alert("Success! You have enrolled in " + course.title + " for free.");
        // Here you would normally save this to Firebase Database
        return;
    }

    // 4. Handle Paid Courses (WhatsApp Method)
    // Replace this phone number with YOUR number (format: 91XXXXXXXXXX)
    const adminPhone = "919526755210"; 
    
    const message = `Hello Kithademic!%0aI am interested in buying the course: *${course.title}*.%0aPrice: ₹${course.price}.%0aMy Email: ${user.email}%0a%0aPlease send me the UPI/Payment details.`;
    
    const whatsappUrl = `https://wa.me/${adminPhone}?text=${message}`;
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
};

// Render Courses (Updated Design)
const courseList = document.getElementById('courseList');
courseList.innerHTML = ""; // Clear existing
courses.forEach(c => {
    const div = document.createElement('div');
    div.className = 'course-card';
    
    // Create feature list HTML
    const featuresHtml = c.features.map(f => `<li><i class="fas fa-check-circle"></i> ${f}</li>`).join('');

    div.innerHTML = `
        <div class="card-header">
            <h3>${c.title}</h3>
            <span class="badge">${c.price === 0 ? "FREE" : "PREMIUM"}</span>
        </div>
        <p class="desc">${c.desc}</p>
        <ul class="features">
            ${featuresHtml}
        </ul>
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

// --- VIDEO CONTENT DATA ---
// Ideally, this comes from a database. For now, we hardcode it.
const courseContent = {
    "c_bio_01": [
        { title: "Introduction to Botany", videoId: "dQw4w9WgXcQ", locked: false }, // Sample YouTube ID
        { title: "Photosynthesis Explained", videoId: "KMT1J3Lg6h0", locked: true },
        { title: "Genetics Part 1", videoId: "8jP8CC23ibY", locked: true }
    ],
    "c_ent_02": [
        { title: "Physics: Motion", videoId: "kKKM8Y-u7ds", locked: false },
        { title: "Chemistry: Periodic Table", videoId: "fPnwBITSmgU", locked: true }
    ],
    "c_his_03": [
        { title: "Golden Age of Islam", videoId: "9gXw3Jj3JjI", locked: false } // Search real IDs
    ]
};

// --- CLASSROOM LOGIC ---
let currentCourseId = null;

window.openCourse = (courseId) => {
    // Security Check: Is user logged in?
    if (!auth.currentUser) {
        alert("Please login to access courses.");
        openAuthModal();
        return;
    }

    // In a real app, we check if they PAID here. 
    // For now, we just open it.
    
    currentCourseId = courseId;
    const lessons = courseContent[courseId];

    if (!lessons) {
        alert("Content coming soon!");
        return;
    }

    // Show Classroom
    showPage('classroom');
    
    // Render Playlist
    const playlistDiv = document.getElementById('playlistItems');
    playlistDiv.innerHTML = "";
    
    lessons.forEach((lesson, index) => {
        const div = document.createElement('div');
        div.className = `lesson-item ${lesson.locked ? 'locked' : ''}`;
        div.innerHTML = `
            <i class="fas fa-play-circle"></i>
            <span>${index + 1}. ${lesson.title}</span>
            ${lesson.locked ? '<i class="fas fa-lock" style="margin-left:auto;"></i>' : ''}
        `;
        
        // Click Event
        div.onclick = () => {
            if (lesson.locked) {
                alert("This lesson is locked. Please complete the previous lesson or upgrade.");
            } else {
                playVideo(lesson.videoId, lesson.title, div);
            }
        };
        
        playlistDiv.appendChild(div);
    });

    // Auto-play first video
    if (lessons.length > 0) {
        playVideo(lessons[0].videoId, lessons[0].title, playlistDiv.firstChild);
    }
};

window.playVideo = (id, title, listElement) => {
    // Update Player
    document.getElementById('mainPlayer').src = `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`;
    document.getElementById('videoTitle').innerText = title;
    
    // Update Active Styling in Playlist
    document.querySelectorAll('.lesson-item').forEach(el => el.classList.remove('active'));
    if(listElement) listElement.classList.add('active');
};
