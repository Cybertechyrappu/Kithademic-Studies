// Input Validation Utilities

/**
 * Validates course ID format
 * Course IDs should follow the pattern: c_XX where XX is a two-digit number
 * @param {string} courseId - Course identifier to validate
 * @returns {boolean} True if valid course ID format
 */
export const isValidCourseId = (courseId) => {
    if (!courseId || typeof courseId !== 'string') {
        return false;
    }
    // Course IDs follow pattern: c_XX (e.g., c_01, c_02, etc.)
    return /^c_\d{2}$/.test(courseId);
};

/**
 * Validates Firebase user ID format
 * @param {string} userId - Firebase user UID to validate
 * @returns {boolean} True if valid user ID format
 */
export const isValidUserId = (userId) => {
    if (!userId || typeof userId !== 'string') {
        return false;
    }
    // Firebase UIDs are typically 28 characters alphanumeric
    // Allow for some flexibility in length (20-128 chars)
    return userId.length >= 20 && userId.length <= 128 && /^[a-zA-Z0-9]+$/.test(userId);
};

/**
 * Validates YouTube video ID format
 * @param {string} videoId - YouTube video ID to validate
 * @returns {boolean} True if valid YouTube video ID format
 */
export const isValidVideoId = (videoId) => {
    if (!videoId || typeof videoId !== 'string') {
        return false;
    }
    // YouTube video IDs are 11 characters: letters, numbers, hyphens, and underscores
    return /^[a-zA-Z0-9_-]{11}$/.test(videoId);
};

/**
 * Validates email format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid email format
 */
export const isValidEmail = (email) => {
    if (!email || typeof email !== 'string') {
        return false;
    }
    // Basic email regex pattern
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Validates phone number format (Indian format with country code)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone number format
 */
export const isValidPhoneNumber = (phone) => {
    if (!phone || typeof phone !== 'string') {
        return false;
    }
    // Indian phone number with country code: 91XXXXXXXXXX (10 digits after 91)
    return /^91\d{10}$/.test(phone);
};

/**
 * Validates ISO 8601 date string format
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid ISO 8601 date format
 */
export const isValidISODate = (dateString) => {
    if (!dateString || typeof dateString !== 'string') {
        return false;
    }
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Sanitizes user input to prevent XSS attacks
 * Removes potentially dangerous characters
 * @param {string} input - User input to sanitize
 * @returns {string} Sanitized string
 */
export const sanitizeInput = (input) => {
    if (!input || typeof input !== 'string') {
        return '';
    }
    // Remove HTML tags and dangerous characters
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};

/**
 * Validates course price format
 * @param {string|number} price - Price to validate
 * @returns {boolean} True if valid price format (non-negative number)
 */
export const isValidPrice = (price) => {
    const numPrice = typeof price === 'string' ? parseInt(price, 10) : price;
    return !isNaN(numPrice) && numPrice >= 0;
};
