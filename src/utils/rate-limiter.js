// Client-Side Rate Limiting Utilities

/**
 * Creates a rate-limited version of a function
 * Limits how often the function can be called within a time window
 * @param {Function} func - Function to rate limit
 * @param {number} limitMs - Minimum time between calls in milliseconds
 * @returns {Function} Rate-limited function
 */
export const rateLimiter = (func, limitMs) => {
    let lastCall = 0;
    let pendingTimeout = null;

    return (...args) => {
        const now = Date.now();
        const timeSinceLastCall = now - lastCall;

        if (timeSinceLastCall >= limitMs) {
            // Enough time has passed, execute immediately
            lastCall = now;
            return func(...args);
        } else {
            // Too soon, ignore the call
            console.warn(`Rate limit: Function called too soon. Please wait ${limitMs - timeSinceLastCall}ms`);
            return null;
        }
    };
};

/**
 * Creates a throttled version of a function
 * Ensures function is called at most once per time window
 * Executes the first call immediately, then ignores subsequent calls until window expires
 * @param {Function} func - Function to throttle
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, windowMs) => {
    let isThrottled = false;

    return (...args) => {
        if (isThrottled) {
            return null;
        }

        func(...args);
        isThrottled = true;

        setTimeout(() => {
            isThrottled = false;
        }, windowMs);
    };
};

/**
 * Creates a debounced version of a function
 * Delays function execution until after a specified time has passed since last call
 * Useful for input handlers and search functionality
 * @param {Function} func - Function to debounce
 * @param {number} delayMs - Delay in milliseconds
 * @returns {Function} Debounced function with a cancel method
 */
export const debounce = (func, delayMs) => {
    let timeoutId;

    const debouncedFunc = (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delayMs);
    };

    // Add cancel method to clear pending execution
    debouncedFunc.cancel = () => {
        clearTimeout(timeoutId);
    };

    return debouncedFunc;
};

/**
 * Creates a rate limiter with request queue
 * Limits API calls per time window, queuing excess calls
 * @param {number} maxRequests - Maximum requests per window
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Object} Rate limiter with execute method
 */
export const createRateLimiter = (maxRequests, windowMs) => {
    const queue = [];
    const timestamps = [];

    /**
     * Executes a function respecting rate limits
     * @param {Function} func - Function to execute
     * @returns {Promise<*>} Result of the function
     */
    const execute = async (func) => {
        return new Promise((resolve, reject) => {
            const tryExecute = () => {
                const now = Date.now();

                // Remove timestamps outside current window
                while (timestamps.length > 0 && timestamps[0] <= now - windowMs) {
                    timestamps.shift();
                }

                // Check if we can execute now
                if (timestamps.length < maxRequests) {
                    timestamps.push(now);
                    func()
                        .then(resolve)
                        .catch(reject);
                } else {
                    // Need to wait - schedule for later
                    const oldestTimestamp = timestamps[0];
                    const waitTime = windowMs - (now - oldestTimestamp) + 10;

                    setTimeout(tryExecute, waitTime);
                }
            };

            tryExecute();
        });
    };

    return { execute };
};

/**
 * Creates a simple request cache with time-to-live
 * Useful for caching API responses to reduce redundant calls
 * @param {number} ttlMs - Time to live in milliseconds
 * @returns {Object} Cache with get, set, and clear methods
 */
export const createRequestCache = (ttlMs) => {
    const cache = new Map();

    return {
        /**
         * Gets cached value if not expired
         * @param {string} key - Cache key
         * @returns {*} Cached value or undefined if expired/not found
         */
        get: (key) => {
            const entry = cache.get(key);
            if (!entry) return undefined;

            const now = Date.now();
            if (now - entry.timestamp > ttlMs) {
                cache.delete(key);
                return undefined;
            }

            return entry.value;
        },

        /**
         * Sets cached value with current timestamp
         * @param {string} key - Cache key
         * @param {*} value - Value to cache
         */
        set: (key, value) => {
            cache.set(key, {
                value,
                timestamp: Date.now()
            });
        },

        /**
         * Clears all cached entries
         */
        clear: () => {
            cache.clear();
        },

        /**
         * Gets cache size
         * @returns {number} Number of cached entries
         */
        size: () => cache.size
    };
};
