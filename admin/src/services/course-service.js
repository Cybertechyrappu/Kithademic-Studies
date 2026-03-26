// Admin Course Management Service
import { db } from '../config/firebase.js';
import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, setDoc, query, orderBy } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

/**
 * Creates a new course in Firestore
 * @param {Object} courseData - Course data (title, description, price, etc.)
 * @returns {Promise<Object>} Result with success status and courseId
 */
export const createCourse = async (courseData) => {
    try {
        // Generate course ID (c_XX format)
        const coursesSnapshot = await getDocs(collection(db, 'courses'));
        const courseNumber = coursesSnapshot.size + 1;
        const courseId = `c_${courseNumber.toString().padStart(2, '0')}`;

        await setDoc(doc(db, 'courses', courseId), {
            ...courseData,
            order: courseNumber,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        return { success: true, courseId };
    } catch (error) {
        console.error('Create course error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Updates an existing course
 * @param {string} courseId - Course identifier
 * @param {Object} courseData - Updated course data
 * @returns {Promise<Object>} Result with success status
 */
export const updateCourse = async (courseId, courseData) => {
    try {
        await updateDoc(doc(db, 'courses', courseId), {
            ...courseData,
            updatedAt: new Date()
        });
        return { success: true };
    } catch (error) {
        console.error('Update course error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Soft deletes a course (marks as inactive)
 * @param {string} courseId - Course identifier
 * @returns {Promise<Object>} Result with success status
 */
export const deleteCourse = async (courseId) => {
    try {
        await updateDoc(doc(db, 'courses', courseId), {
            isActive: false,
            updatedAt: new Date()
        });
        return { success: true };
    } catch (error) {
        console.error('Delete course error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Gets all courses from Firestore
 * @returns {Promise<Array>} Array of course objects
 */
export const getAllCourses = async () => {
    try {
        const snapshot = await getDocs(query(collection(db, 'courses'), orderBy('order', 'asc')));
        const courses = [];
        snapshot.forEach(doc => {
            courses.push({ id: doc.id, ...doc.data() });
        });
        return courses;
    } catch (error) {
        console.error('Get courses error:', error);
        return [];
    }
};

/**
 * Adds a lesson to a course
 * @param {string} courseId - Course identifier
 * @param {Object} lessonData - Lesson data (title, videoId)
 * @returns {Promise<Object>} Result with success status
 */
export const addLesson = async (courseId, lessonData) => {
    try {
        // Get current lessons to determine order
        const lessonsSnapshot = await getDocs(collection(db, 'courses', courseId, 'lessons'));
        const order = lessonsSnapshot.size + 1;

        await addDoc(collection(db, 'courses', courseId, 'lessons'), {
            ...lessonData,
            order,
            isPublished: true,
            createdAt: new Date()
        });

        return { success: true };
    } catch (error) {
        console.error('Add lesson error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Deletes a lesson from a course
 * @param {string} courseId - Course identifier
 * @param {string} lessonId - Lesson identifier
 * @returns {Promise<Object>} Result with success status
 */
export const deleteLesson = async (courseId, lessonId) => {
    try {
        await deleteDoc(doc(db, 'courses', courseId, 'lessons', lessonId));
        return { success: true };
    } catch (error) {
        console.error('Delete lesson error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Gets all lessons for a course
 * @param {string} courseId - Course identifier
 * @returns {Promise<Array>} Array of lesson objects
 */
export const getCourseLessons = async (courseId) => {
    try {
        const snapshot = await getDocs(query(collection(db, 'courses', courseId, 'lessons'), orderBy('order', 'asc')));
        const lessons = [];
        snapshot.forEach(doc => {
            lessons.push({ id: doc.id, ...doc.data() });
        });
        return lessons;
    } catch (error) {
        console.error('Get lessons error:', error);
        return [];
    }
};

/**
 * Extracts YouTube video ID from various URL formats
 * @param {string} url - YouTube URL or video ID
 * @returns {string|null} Video ID or null if invalid
 */
export const extractYouTubeId = (url) => {
    // Handle various YouTube URL formats
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }

    // If no pattern matches, assume it's just the ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
        return url.trim();
    }

    return null;
};

/**
 * Adds a basic video (not part of any course)
 * @param {Object} videoData - Video data (title, videoId)
 * @returns {Promise<Object>} Result with success status
 */
export const addBasicVideo = async (videoData) => {
    try {
        const videosSnapshot = await getDocs(collection(db, 'basicVideos'));
        const order = videosSnapshot.size + 1;

        await setDoc(doc(db, 'basicVideos', videoData.videoId), {
            ...videoData,
            order,
            isPublished: true,
            createdAt: new Date()
        });

        return { success: true };
    } catch (error) {
        console.error('Add basic video error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Deletes a basic video
 * @param {string} videoId - Video identifier
 * @returns {Promise<Object>} Result with success status
 */
export const deleteBasicVideo = async (videoId) => {
    try {
        await deleteDoc(doc(db, 'basicVideos', videoId));
        return { success: true };
    } catch (error) {
        console.error('Delete basic video error:', error);
        return { success: false, error: error.message };
    }
};
