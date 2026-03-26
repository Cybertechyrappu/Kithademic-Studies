// Admin Course Management UI
import { getAllCourses, getCourseLessons, createCourse, addLesson, deleteLesson, deleteCourse, extractYouTubeId, addBasicVideo, deleteBasicVideo } from '../services/course-service.js';

let currentCourseId = null;

/**
 * Renders the course management UI
 */
export async function renderCourseManagement() {
    const container = document.getElementById('coursesManagementSection');
    if (!container) return;

    container.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
            <h4 class="gold-text">Manage Courses</h4>
            <button onclick="window.openCourseModal()" class="btn-gold" style="padding: 8px 16px;">
                <i class="fas fa-plus"></i> New Course
            </button>
        </div>
        <div id="coursesList" style="display:flex; flex-direction:column; gap:10px;"></div>
    `;

    await loadCourses();
}

/**
 * Loads and displays all courses
 */
async function loadCourses() {
    const list = document.getElementById('coursesList');
    if (!list) return;

    list.innerHTML = '<p style="text-align:center; color:#888;">Loading...</p>';

    const courses = await getAllCourses();

    if (courses.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:#888;">No courses yet. Create one!</p>';
        return;
    }

    list.innerHTML = '';

    courses.forEach(course => {
        const div = document.createElement('div');
        div.style.cssText = 'background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);';
        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:start;">
                <div style="flex:1;">
                    <h5 style="color:var(--accent-gold); margin:0 0 5px 0;">${course.title}</h5>
                    <p style="font-size:0.85rem; color:#ccc; margin:0 0 10px 0;">${course.description || 'No description'}</p>
                    <div style="display:flex; gap:15px; font-size:0.8rem;">
                        <span style="color:#4ade80;">₹${course.price}</span>
                        <span style="color:#888;">${course.isActive ? '✓ Active' : '✗ Inactive'}</span>
                        <span style="color:#888;">ID: ${course.id}</span>
                    </div>
                </div>
                <div style="display:flex; gap:8px;">
                    <button onclick="window.manageLessons('${course.id}')" class="btn-primary" style="padding:6px 12px; margin:0; font-size:0.8rem;">
                        <i class="fas fa-video"></i> Lessons
                    </button>
                    <button onclick="window.deleteCourseConfirm('${course.id}')" style="background:#ff4444; border:none; color:white; padding:6px 12px; border-radius:5px; cursor:pointer; font-size:0.8rem;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        list.appendChild(div);
    });
}

/**
 * Opens course creation modal
 */
window.openCourseModal = function() {
    const overlay = document.createElement('div');
    overlay.id = 'courseModalOverlay';
    overlay.className = 'popup-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) closeCourseModal(); };

    overlay.innerHTML = `
        <div class="popup-content" style="max-width:500px;" onclick="event.stopPropagation()">
            <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
                <h3 class="gold-text" style="margin:0;">Create Course</h3>
                <button onclick="window.closeCourseModal()" style="background:none; border:none; color:#aaa; cursor:pointer; font-size:1.2rem;">&times;</button>
            </div>

            <form id="courseForm" onsubmit="window.handleCreateCourse(event)">
                <div class="admin-input-group">
                    <label>Course Title *</label>
                    <input type="text" id="courseTitle" class="admin-input" required>
                </div>

                <div class="admin-input-group">
                    <label>Description *</label>
                    <textarea id="courseDesc" class="admin-input" rows="3" required></textarea>
                </div>

                <div class="admin-input-group">
                    <label>Price (₹) *</label>
                    <input type="number" id="coursePrice" class="admin-input" value="0" min="0" required>
                </div>

                <div class="admin-input-group">
                    <label>Instructor</label>
                    <input type="text" id="courseInstructor" class="admin-input" value="യാസീൻ സിദ്ദീഖ് നൂറാനി">
                </div>

                <div class="admin-input-group" style="margin-bottom:0;">
                    <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                        <input type="checkbox" id="coursePurchasable" style="width:auto;">
                        <span>Is Purchasable (Enrollments Open)</span>
                    </label>
                </div>

                <div style="display:flex; gap:10px; margin-top:25px;">
                    <button type="button" onclick="window.closeCourseModal()" class="btn-primary" style="flex:1; margin:0;">
                        Cancel
                    </button>
                    <button type="submit" class="btn-gold" style="flex:1; margin:0;">
                        <i class="fas fa-save"></i> Create
                    </button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(overlay);
};

window.closeCourseModal = function() {
    const overlay = document.getElementById('courseModalOverlay');
    if (overlay) overlay.remove();
};

window.handleCreateCourse = async function(e) {
    e.preventDefault();

    const title = document.getElementById('courseTitle').value.trim();
    const description = document.getElementById('courseDesc').value.trim();
    const price = parseInt(document.getElementById('coursePrice').value);
    const instructor = document.getElementById('courseInstructor').value.trim();
    const isPurchasable = document.getElementById('coursePurchasable').checked;

    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';

    const result = await createCourse({
        title,
        description,
        price,
        instructor,
        isPurchasable,
        features: [`ട്യൂട്ടർ: ${instructor}`, `${price === 0 ? 'Free Course' : `സബ്സ്ക്രിപ്ഷൻ ഫീ: 1 മാസത്തേക്ക് ₹${price}`}`]
    });

    if (result.success) {
        window.showPopup('Success', `Course created: ${result.courseId}`);
        closeCourseModal();
        await loadCourses();
    } else {
        window.showPopup('Error', result.error);
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-save"></i> Create';
    }
};

window.deleteCourseConfirm = async function(courseId) {
    if (!confirm(`Delete course ${courseId}? This will mark it as inactive.`)) return;

    const result = await deleteCourse(courseId);
    if (result.success) {
        window.showPopup('Success', 'Course deleted');
        await loadCourses();
    } else {
        window.showPopup('Error', result.error);
    }
};

/**
 * Opens lesson management for a course
 */
window.manageLessons = async function(courseId) {
    currentCourseId = courseId;

    const overlay = document.createElement('div');
    overlay.id = 'lessonsModalOverlay';
    overlay.className = 'popup-overlay';

    overlay.innerHTML = `
        <div class="popup-content details-content" style="max-width:600px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
                <h3 class="gold-text" style="margin:0;">Manage Lessons: ${courseId}</h3>
                <button onclick="window.closeLessonsModal()" style="background:none; border:none; color:#aaa; cursor:pointer; font-size:1.2rem;">&times;</button>
            </div>

            <div style="margin-bottom:20px;">
                <form id="addLessonForm" onsubmit="window.handleAddLesson(event)" style="background:rgba(255,255,255,0.05); padding:15px; border-radius:10px;">
                    <h4 style="color:var(--accent-gold); margin:0 0 10px 0; font-size:0.9rem;">Add New Lesson</h4>
                    <div class="admin-input-group" style="margin-bottom:10px;">
                        <label>Lesson Title *</label>
                        <input type="text" id="lessonTitle" class="admin-input" required>
                    </div>
                    <div class="admin-input-group" style="margin-bottom:10px;">
                        <label>YouTube URL or Video ID *</label>
                        <input type="text" id="lessonVideoId" class="admin-input" placeholder="https://youtube.com/watch?v=..." required>
                    </div>
                    <button type="submit" class="btn-gold" style="width:100%; margin:0;">
                        <i class="fas fa-plus"></i> Add Lesson
                    </button>
                </form>
            </div>

            <div id="lessonsList" style="max-height:300px; overflow-y:auto;"></div>

            <button onclick="window.closeLessonsModal()" class="btn-primary" style="width:100%; margin-top:20px;">
                Close
            </button>
        </div>
    `;

    document.body.appendChild(overlay);
    await loadLessons(courseId);
};

async function loadLessons(courseId) {
    const list = document.getElementById('lessonsList');
    if (!list) return;

    list.innerHTML = '<p style="text-align:center; color:#888;">Loading...</p>';

    const lessons = await getCourseLessons(courseId);

    if (lessons.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:#888;">No lessons yet</p>';
        return;
    }

    list.innerHTML = '';

    lessons.forEach((lesson, index) => {
        const div = document.createElement('div');
        div.style.cssText = 'background: rgba(255,255,255,0.03); padding: 10px; border-radius: 8px; margin-bottom: 8px; display:flex; justify-content:space-between; align-items:center;';
        div.innerHTML = `
            <div style="flex:1;">
                <div style="color:var(--accent-gold); font-size:0.85rem; margin-bottom:3px;">${index + 1}. ${lesson.title}</div>
                <div style="color:#888; font-size:0.75rem;">ID: ${lesson.videoId}</div>
            </div>
            <button onclick="window.deleteLessonConfirm('${courseId}', '${lesson.id}')" style="background:#ff4444; border:none; color:white; padding:5px 10px; border-radius:5px; cursor:pointer; font-size:0.75rem;">
                <i class="fas fa-trash"></i>
            </button>
        `;
        list.appendChild(div);
    });
}

window.closeLessonsModal = function() {
    const overlay = document.getElementById('lessonsModalOverlay');
    if (overlay) overlay.remove();
    currentCourseId = null;
};

window.handleAddLesson = async function(e) {
    e.preventDefault();

    const title = document.getElementById('lessonTitle').value.trim();
    const videoInput = document.getElementById('lessonVideoId').value.trim();
    const videoId = extractYouTubeId(videoInput);

    if (!videoId) {
        window.showPopup('Error', 'Invalid YouTube URL or Video ID');
        return;
    }

    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';

    const result = await addLesson(currentCourseId, { title, videoId });

    if (result.success) {
        document.getElementById('lessonTitle').value = '';
        document.getElementById('lessonVideoId').value = '';
        await loadLessons(currentCourseId);
    } else {
        window.showPopup('Error', result.error);
    }

    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-plus"></i> Add Lesson';
};

window.deleteLessonConfirm = async function(courseId, lessonId) {
    if (!confirm('Delete this lesson?')) return;

    const result = await deleteLesson(courseId, lessonId);
    if (result.success) {
        await loadLessons(courseId);
    } else {
        window.showPopup('Error', result.error);
    }
};
