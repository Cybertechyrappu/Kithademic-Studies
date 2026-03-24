// ==========================================
// 1. IMPORTS & SETUP
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { 
    getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { 
    getFirestore, doc, updateDoc, collection, getDocs, getDoc
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
const ADMIN_EMAIL = "admin@kithademic.com";

// ==========================================
// 2. MAIN LOGIC
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const adminPass = document.getElementById('adminPass');
    
    onAuthStateChanged(auth, (user) => {
        if (user) {
            document.getElementById('loginView').classList.add('hidden');
            document.getElementById('dashboardView').classList.remove('hidden');
            fetchAndRenderUsers();
        } else {
            document.getElementById('loginView').classList.remove('hidden');
            document.getElementById('dashboardView').classList.add('hidden');
        }
    });

    if(loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            document.getElementById('loadingOverlay').classList.remove('hidden');
            signInWithEmailAndPassword(auth, ADMIN_EMAIL, adminPass.value)
                .then(() => { document.getElementById('loadingOverlay').classList.add('hidden'); adminPass.value = ""; })
                .catch((error) => { document.getElementById('loadingOverlay').classList.add('hidden'); showPopup(false, "Login Failed."); });
        });
    }

    if(document.getElementById('logoutBtn')) {
        document.getElementById('logoutBtn').addEventListener('click', () => signOut(auth));
    }
});

// ==========================================
// 3. STUDENT MANAGEMENT LOGIC (VIEW ONLY)
// ==========================================
window.fetchUsers = async function() {
    const listContainer = document.getElementById('usersListContainer');
    listContainer.innerHTML = '<div class="spinner" style="width:20px; height:20px; margin:20px auto;"></div>';

    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        listContainer.innerHTML = ""; 

        if (querySnapshot.empty) { listContainer.innerHTML = "<p style='text-align:center;'>No students.</p>"; return; }

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const displayName = data.displayName || data.email || "Unknown";
            
            // Check specific courses owned using Object.keys since it is now a map
            const purchasedCount = data.purchasedCourses ? Object.keys(data.purchasedCourses).length : 0;
            let statusHtml = `<span class='user-status' style='color:#aaa;'>Courses Owned: <b style='color:var(--accent-gold)'>${purchasedCount}</b></span>`;

            const div = document.createElement('div'); div.className = 'user-item';
            div.innerHTML = `
                <div class="user-info" onclick="openUserDetails('${docSnap.id}', '${displayName}')" title="Click to view progress" style="cursor: pointer; width: 100%;">
                    <span class="user-name main-text">${displayName}</span>
                    ${statusHtml}
                </div>`;
            listContainer.appendChild(div);
        });
    } catch (error) { listContainer.innerHTML = "<p style='color:#ff4444;'>Error loading users.</p>"; }
};

async function fetchAndRenderUsers() { window.fetchUsers(); }

// ==========================================
// 4. USER DETAILS & INSIGHTS
// ==========================================
window.openUserDetails = async (uid, name) => {
    const modal = document.getElementById('userDetailsModal');
    const historyList = document.getElementById('modalHistoryList');
    document.getElementById('modalUserEmail').innerText = name;
    modal.classList.add('active');

    try {
        const snapshot = await getDocs(collection(db, "users", uid, "watchHistory"));
        historyList.innerHTML = ""; let historyItems = [];
        snapshot.forEach(doc => historyItems.push(doc.data()));
        historyItems.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));

        document.getElementById('totalWatched').innerText = historyItems.length;
        document.getElementById('lastActive').innerText = historyItems.length > 0 ? new Date(historyItems[0].timestamp.seconds * 1000).toLocaleDateString() : "Never";

        if (historyItems.length === 0) { historyList.innerHTML = "<p style='text-align:center;'>No classes watched.</p>"; return; }

        historyItems.forEach(data => {
            const div = document.createElement('div'); div.className = 'history-item';
            div.innerHTML = `<img src="https://img.youtube.com/vi/${data.videoId}/mqdefault.jpg" class="history-thumb-small">
                <div class="history-details"><span class="history-title">${data.title}</span></div>`;
            historyList.appendChild(div);
        });
    } catch (error) { historyList.innerHTML = `<p style='color:#ff4444;'>Error</p>`; }
};
window.closeUserModal = () => document.getElementById('userDetailsModal').classList.remove('active');

// ==========================================
// 5. SMART APPROVE (1 MONTH MONTHLY LOGIC)
// ==========================================
window.switchAdminTab = (tabId, btnElement) => {
    document.getElementById('usersListSection').classList.add('hidden');
    document.getElementById('waProcessorSection').classList.add('hidden');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.remove('hidden'); btnElement.classList.add('active');
};

window.processWaMessage = () => {
    const text = document.getElementById('waInput').value;
    const courseIdMatch = text.match(/Course ID:\s*([^\n]+)/);
    const uidMatch = text.match(/My UID:\s*([^\n]+)/) || text.match(/Account UID:\s*([^\n]+)/); // Adjusted to catch updated WA MSG format
    
    if(courseIdMatch && uidMatch) {
        document.getElementById('confirmCourseId').value = courseIdMatch[1].trim();
        document.getElementById('confirmUid').value = uidMatch[1].trim();
        document.getElementById('enrollConfirmModal').classList.add('active');
    } else { showPopup(false, "Extraction Failed."); }
};

window.closeEnrollModal = () => document.getElementById('enrollConfirmModal').classList.remove('active');

window.approveSpecificCourse = async () => {
    const uid = document.getElementById('confirmUid').value;
    const courseId = document.getElementById('confirmCourseId').value;
    
    window.closeEnrollModal();
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.classList.remove('hidden');
    
    try {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        if(!userSnap.exists()) throw new Error("Student UID not found."); 
        
        // ADD EXACTLY 30 DAYS EXPIRY
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30);
        
        // Updates nested map via dot-notation
        await updateDoc(userRef, {
            [`purchasedCourses.${courseId}`]: futureDate.toISOString()
        });
        
        document.getElementById('waInput').value = ""; 
        showPopup(true, `Successfully granted 1 Month Access!`);
        fetchAndRenderUsers(); 
    } catch(error) { showPopup(false, error.message); } 
    finally { loadingOverlay.classList.add('hidden'); }
};

// Popup Logic
window.closePopup = () => document.getElementById('popupOverlay').classList.remove('active');
function showPopup(isSuccess, message) {
    document.getElementById('popupMessage').innerText = message;
    document.getElementById('popupOverlay').classList.add('active');
}
