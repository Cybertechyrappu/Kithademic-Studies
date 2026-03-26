// Firestore Data Service
import { db } from "../config/firebase.js";
import { getDoc, doc, setDoc, getDocs, collection, query, limit, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { isValidUserId, isValidVideoId } from "../utils/validators.js";
import { rateLimiter, createRequestCache } from "../utils/rate-limiter.js";

// Create request cache with 30 second TTL for user access data
const userAccessCache = createRequestCache(30000);

// ============================================
// Retry Logic for Firebase Operations
// ============================================

/**
 * Retries a Firebase operation with exponential backoff
 * @param {Function} operation - Async function to retry
 * @param {number} maxRetries - Maximum number of retry attempts (default: 3)
 * @param {number} initialDelay - Initial delay in milliseconds (default: 1000)
 * @returns {Promise<*>} Result of the operation
 * @throws {Error} If all retry attempts fail
 */
const retryOperation = async (operation, maxRetries = 3, initialDelay = 1000) => {
    let lastError;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;

            // Don't retry on certain error types
            if (error.code === 'permission-denied' || error.code === 'unauthenticated') {
                throw error;
            }

            // Calculate exponential backoff delay
            const delay = initialDelay * Math.pow(2, attempt);

            console.warn(`Operation failed (attempt ${attempt + 1}/${maxRetries}). Retrying in ${delay}ms...`, error);

            // Wait before retrying (except on last attempt)
            if (attempt < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    // All retries failed
    console.error(`Operation failed after ${maxRetries} attempts:`, lastError);
    throw lastError;
};

/**
 * Fetches user access data including purchased courses
 * Uses caching to reduce redundant Firestore queries
 * @param {string} userId - Firebase user UID
 * @returns {Promise<Object|null>} User access data with purchasedCourses object, or null on error
 * @throws {Error} If userId format is invalid
 */
export async function fetchUserAccess(userId) {
    if (!isValidUserId(userId)) {
        console.error("Invalid user ID format:", userId);
        return null;
    }

    // Check cache first
    const cached = userAccessCache.get(userId);
    if (cached) {
        return cached;
    }

    try {
        const result = await retryOperation(async () => {
            const userSnap = await getDoc(doc(db, "users", userId));
            if (userSnap.exists()) return { purchasedCourses: userSnap.data().purchasedCourses || {} };
            return null;
        });

        // Cache the result
        if (result) {
            userAccessCache.set(userId, result);
        }

        return result;
    } catch (e) {
        console.error("Error fetching access:", e);
        return null;
    }
}

/**
 * Saves a video to user's watch history
 * @param {string} userId - Firebase user UID
 * @param {string} id - YouTube video ID
 * @param {string} title - Video title
 * @returns {Promise<void>}
 * @throws {Error} If userId or videoId format is invalid
 */
export async function saveWatchHistory(userId, id, title) {
    if (!isValidUserId(userId)) {
        console.error("Invalid user ID format:", userId);
        return;
    }

    if (!isValidVideoId(id)) {
        console.error("Invalid video ID format:", id);
        return;
    }

    try {
        await retryOperation(async () => {
            await setDoc(doc(db, "users", userId, "watchHistory", id), {
                videoId: id,
                title,
                timestamp: serverTimestamp()
            });
        });
    } catch(e) {
        console.error("Error saving history:", e);
    }
}

/**
 * Loads user's watch history ordered by most recent first
 * @param {string} userId - Firebase user UID
 * @param {number} limitCount - Maximum number of history items to fetch (default: 10)
 * @returns {Promise<Array>} Array of watch history items, or empty array on error
 * @throws {Error} If userId format is invalid
 */
export async function loadWatchHistory(userId, limitCount = 10) {
    if (!isValidUserId(userId)) {
        console.error("Invalid user ID format:", userId);
        return [];
    }

    try {
        return await retryOperation(async () => {
            const snap = await getDocs(
                query(
                    collection(db, "users", userId, "watchHistory"),
                    orderBy('timestamp', 'desc'),
                    limit(limitCount)
                )
            );
            return snap.docs.map(d => d.data());
        });
    } catch (e) {
        console.error("Error loading history:", e);
        return [];
    }
}
