import { loginAdmin, logoutAdmin, handleAuthStateChanges } from "./auth/admin-auth.js";
import { getStudents, getStudentHistory, approveCourse } from "./services/student-service.js";
import { renderCourseManagement } from "./ui/course-manager.js";

// Make renderCourseManagement available globally for onclick
window.renderCourseManagement = renderCourseManagement;

// DOM Elements
const loginView = document.getElementById('loginView');
const dashboardView = document.getElementById('dashboardView');
const loginForm = document.getElementById('loginForm');
const adminPass = document.getElementById('adminPass');
const usersListContainer = document.getElementById('usersListContainer');
const loadingOverlay = document.getElementById('loadingOverlay');

// Initialize Auth
handleAuthStateChanges(
    (user) => {
        loginView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
        renderStudents();
    },
    () => {
        loginView.classList.remove('hidden');
        dashboardView.classList.add('hidden');
    }
);

// Auth Listeners
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loadingOverlay.classList.remove('hidden');
        const res = await loginAdmin(adminPass.value);
        loadingOverlay.classList.add('hidden');
        if (!res.success) {
            alert("Login Failed: " + res.error);
        }
    });
}

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) logoutBtn.addEventListener('click', () => logoutAdmin());

// Student Management
async function renderStudents() {
    usersListContainer.innerHTML = '<div class="spinner"></div>';
    try {
        const students = await getStudents();
        usersListContainer.innerHTML = "";
        if (students.length === 0) {
            usersListContainer.innerHTML = "<p>No students enrolled yet.</p>";
            return;
        }
        students.forEach(student => {
            const div = document.createElement('div');
            div.className = 'user-item';
            const courseCount = Object.keys(student.purchasedCourses || {}).length;
            div.innerHTML = `
                <div class="user-info" onclick="viewHistory('${student.id}', '${student.displayName || student.email}')">
                    <span class="user-name">${student.displayName || student.email}</span>
                    <span class="user-status">Courses Owned: <b>${courseCount}</b></span>
                </div>
            `;
            usersListContainer.appendChild(div);
        });
    } catch (e) {
        usersListContainer.innerHTML = "<p>Error loading students.</p>";
    }
}

// Global UI Functions
window.viewHistory = async (uid, name) => {
    const modal = document.getElementById('userDetailsModal');
    const historyList = document.getElementById('modalHistoryList');
    document.getElementById('modalUserEmail').innerText = name;
    modal.classList.add('active');

    try {
        const history = await getStudentHistory(uid);
        historyList.innerHTML = "";
        document.getElementById('totalWatched').innerText = history.length;
        document.getElementById('lastActive').innerText = history.length > 0 ? new Date(history[0].timestamp.seconds * 1000).toLocaleDateString() : "Never";

        if (history.length === 0) {
            historyList.innerHTML = "<p>No history.</p>"; return;
        }
        history.forEach(item => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `
                <img src="https://img.youtube.com/vi/${item.videoId}/mqdefault.jpg">
                <div class="history-details"><span>${item.title}</span></div>
            `;
            historyList.appendChild(div);
        });
    } catch (e) {
        historyList.innerHTML = "<p>Error.</p>";
    }
};

window.closeUserModal = () => document.getElementById('userDetailsModal').classList.remove('active');

window.switchAdminTab = (tabId, btn) => {
    document.getElementById('usersListSection').classList.add('hidden');
    document.getElementById('waProcessorSection').classList.add('hidden');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.remove('hidden');
    btn.classList.add('active');
};

window.processWaMessage = () => {
    const text = document.getElementById('waInput').value;
    const cid = text.match(/Course ID:\s*([^\n]+)/);
    const uid = text.match(/My UID:\s*([^\n]+)/) || text.match(/Account UID:\s*([^\n]+)/);
    
    if (cid && uid) {
        document.getElementById('confirmCourseId').value = cid[1].trim();
        document.getElementById('confirmUid').value = uid[1].trim();
        document.getElementById('enrollConfirmModal').classList.add('active');
    } else {
        alert("Extraction failed.");
    }
};

window.closeEnrollModal = () => document.getElementById('enrollConfirmModal').classList.remove('active');

window.approveSpecificCourse = async () => {
    const uid = document.getElementById('confirmUid').value;
    const cid = document.getElementById('confirmCourseId').value;
    
    closeEnrollModal();
    loadingOverlay.classList.remove('hidden');
    const res = await approveCourse(uid, cid);
    loadingOverlay.classList.add('hidden');
    if (res.success) {
        alert("Approved!");
        renderStudents();
        document.getElementById('waInput').value = "";
    } else {
        alert("Error: " + res.error);
    }
};
