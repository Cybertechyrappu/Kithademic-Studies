# CLAUDE.md - Kithademic Studies Development Guide

## Project Overview

**Kithademic Studies** is a Progressive Web Application (PWA) for Islamic and Academic education, built with vanilla JavaScript, HTML5, and CSS3. The platform provides course management, video lessons, user authentication, and a premium subscription system with WhatsApp-based enrollment.

**Tech Stack:**
- Frontend: HTML5, CSS3 (Glassmorphism), Vanilla JavaScript ES6 Modules
- Backend: Firebase (Authentication + Cloud Firestore)
- Video: YouTube Iframe API via Plyr.js
- PWA: Service Worker + Web App Manifest

---

## Code Style & Conventions

### 1. Naming Conventions

**JavaScript:**
```javascript
// Functions and variables: camelCase
const renderCourses = () => { };
let currentUser = null;

// Constants (exported data): camelCase
export const courses = [ ];
export const basicVideos = [ ];

// Classes (if used): PascalCase
class VideoPlayer { }

// Private/internal: underscore prefix (optional)
let _internalState = null;
```

**Files:**
```
kebab-case.js          ✓ Correct
auth-manager.js        ✓ Correct
dataService.js         ✗ Avoid
auth_manager.js        ✗ Avoid
```

**HTML IDs and Selectors:**
```html
<!-- IDs: camelCase -->
<div id="courseList"></div>
<div id="authModal"></div>

<!-- Classes: kebab-case -->
<div class="course-card"></div>
<button class="btn-primary"></button>
```

---

### 2. Module Structure

**Standard Module Pattern:**
```javascript
// 1. Imports at the top
import { service } from "./path.js";
import { helperA, helperB } from "../utils/helpers.js";

// 2. Module-scoped private variables
let privateState = null;
const INTERNAL_CONSTANT = 100;

// 3. Exported functions (named exports preferred)
export const publicFunction = async () => {
    // Implementation
};

export function anotherPublicFunction() {
    // Implementation
}

// 4. Internal helper functions (not exported)
function internalHelper() {
    // Implementation
}
```

**Import Path Conventions:**
- Use relative paths with `.js` extension
- Always include file extension in imports
- Group imports logically (external, internal, utilities)

---

### 3. Async/Await Patterns

**Preferred: async/await**
```javascript
// ✓ Correct
export const fetchData = async () => {
    try {
        const doc = await getDoc(ref);
        return doc.data();
    } catch (error) {
        console.error("Error fetching:", error);
        return null;
    }
};

// ✗ Avoid Promise chaining
export const fetchData = () => {
    return getDoc(ref)
        .then(doc => doc.data())
        .catch(error => {
            console.error("Error:", error);
            return null;
        });
};
```

**Error Handling:**
```javascript
// Standard error handling pattern
try {
    const result = await riskyOperation();
    if (!result) {
        console.error("Operation failed");
        return null;
    }
    return result;
} catch (error) {
    console.error("Descriptive error message:", error);
    // Graceful degradation
    return null; // or default value
}
```

---

### 4. Firebase Patterns

**Configuration Loading:**
```javascript
// Always use window.APP_CONFIG first, fallback to defaults
const firebaseConfig = window.APP_CONFIG?.firebaseConfig || {
    // Fallback configuration (for development only)
};
```

**Firestore Operations:**
```javascript
// Use async/await
const userRef = doc(db, "users", userId);
const userSnap = await getDoc(userRef);

if (userSnap.exists()) {
    const data = userSnap.data();
    // Process data
}

// Use serverTimestamp() for timestamps
await setDoc(docRef, {
    field: value,
    timestamp: serverTimestamp()
});
```

**Authentication:**
```javascript
// Listen to auth state changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
    } else {
        // User is signed out
    }
});
```

---

### 5. DOM Manipulation

**Element Creation:**
```javascript
// Standard pattern for dynamic content
const div = document.createElement('div');
div.className = 'class-name';
div.innerHTML = `
    <h3>${title}</h3>
    <p>${description}</p>
`;
div.onclick = () => handleClick();
container.appendChild(div);
```

**Querying Elements:**
```javascript
// Cache DOM queries when used multiple times
const modal = document.getElementById('authModal');

// Use querySelector for complex selectors
const activeBtn = document.querySelector('.nav-item.active');

// Use querySelectorAll for multiple elements
document.querySelectorAll('.page').forEach(el => {
    el.classList.add('hidden');
});
```

**Class Manipulation:**
```javascript
// Preferred: classList methods
element.classList.add('hidden');
element.classList.remove('hidden');
element.classList.toggle('active');

// For multiple classes
element.classList.add('class-a', 'class-b');
```

---

### 6. Event Handling

**Two Acceptable Patterns:**

**Pattern 1: Global window bindings (for HTML onclick):**
```javascript
// In main.js
window.switchTab = switchTab;
window.handleGoogleAuth = handleGoogleAuth;

// In HTML
<button onclick="handleGoogleAuth()">Login</button>
```

**Pattern 2: addEventListener (for dynamic elements):**
```javascript
// For dynamically created elements
document.querySelectorAll('.course-btn').forEach(btn => {
    btn.onclick = () => openCourse(btn.dataset.id);
});

// For single-use listeners, use onclick property
button.onclick = () => handler();

// For multiple listeners, use addEventListener
button.addEventListener('click', handler);
```

---

### 7. CSS Patterns

**CSS Variables:**
```css
/* Always use defined CSS variables */
:root {
    --primary-green: #022c22;
    --deep-bg: #001a14;
    --accent-gold: #eebb5d;
    --text-light: #ffffff;
    --glass-bg: rgba(255, 255, 255, 0.05);
    --glass-border: rgba(255, 255, 255, 0.1);
    --glass-blur: 16px;
}

/* Use them in components */
.component {
    background: var(--glass-bg);
    color: var(--text-light);
    border: 1px solid var(--glass-border);
}
```

**Glassmorphism Pattern:**
```css
/* Standard glass card effect */
.glass-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}
```

**Button Classes:**
```css
.btn-gold      /* Primary action - gold gradient */
.btn-primary   /* Secondary action - outlined gold */
.btn-buy       /* Purchase actions */
.btn-cancel    /* Cancel/dismiss actions */
```

**Responsive Design:**
```css
/* Mobile-first approach */
@media (max-width: 768px) {
    /* Single column layouts */
    /* Reduced padding/margins */
    /* Larger tap targets (min 44px) */
}
```

---

### 8. Component Patterns

**Modal System:**
```javascript
// Show modal
export const openModal = () => {
    document.getElementById('modalId').classList.remove('hidden');
};

// Close modal
export const closeModal = () => {
    document.getElementById('modalId').classList.add('hidden');
};
```

**Page Navigation:**
```javascript
// Hide all pages, show target
export const showPage = (pageId) => {
    document.querySelectorAll('.page').forEach(el => {
        el.classList.add('hidden');
    });
    const target = document.getElementById(pageId);
    if (target) {
        target.classList.remove('hidden');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
};
```

**Reusable Dialog:**
```javascript
// Alert pattern
export const showCustomAlert = (title, message) => {
    dialogTitle.innerText = title;
    dialogMessage.innerText = message;
    dialogButtons.innerHTML = `<button class="btn-gold" id="confirmBtn">OK</button>`;
    document.getElementById('confirmBtn').onclick = closeDialog;
    dialogModal.classList.remove('hidden');
};

// Confirm pattern
export const showCustomConfirm = (title, message, onConfirm) => {
    // Title and message
    dialogTitle.innerText = title;
    dialogMessage.innerText = message;

    // Buttons
    dialogButtons.innerHTML = `
        <button class="btn-cancel" id="cancelBtn">Cancel</button>
        <button class="btn-gold" id="confirmBtn">Confirm</button>
    `;

    // Event handlers
    document.getElementById('cancelBtn').onclick = closeDialog;
    document.getElementById('confirmBtn').onclick = () => {
        closeDialog();
        if (onConfirm) onConfirm();
    };

    dialogModal.classList.remove('hidden');
};
```

---

### 9. Data Structures

**Course Object:**
```javascript
{
    id: "c_01",              // Unique identifier
    title: "Course Name",    // Display name
    price: "200",            // String! "0" for free courses
    isPurchasable: true,     // Boolean - enrollment open/closed
    desc: "Description",     // Course description
    features: [              // Array of feature strings
        "Feature 1",
        "Feature 2"
    ]
}
```

**Course Content:**
```javascript
{
    "c_01": [
        {
            title: "Lesson 1: Introduction",
            videoId: "YouTube_Video_ID"
        },
        {
            title: "Lesson 2: Basics",
            videoId: "Another_YouTube_ID"
        }
    ]
}
```

**User Document (Firestore):**
```javascript
{
    displayName: "User Name",
    email: "user@example.com",
    uid: "firebase_uid",
    purchasedCourses: {
        "c_01": "2024-12-31T00:00:00.000Z",  // ISO 8601 expiry date
        "c_02": "2024-11-30T00:00:00.000Z"
    }
}
```

**Watch History (Subcollection):**
```javascript
// /users/{uid}/watchHistory/{videoId}
{
    videoId: "YouTube_ID",
    title: "Video Title",
    timestamp: serverTimestamp()
}
```

---

### 10. Code Comments

**JSDoc Style (Preferred):**
```javascript
/**
 * Fetches user access data from Firestore
 * @param {string} userId - Firebase user UID
 * @returns {Promise<Object|null>} User access data or null on error
 */
export async function fetchUserAccess(userId) {
    try {
        const userSnap = await getDoc(doc(db, "users", userId));
        if (userSnap.exists()) {
            return {
                purchasedCourses: userSnap.data().purchasedCourses || {}
            };
        }
    } catch (e) {
        console.error("Error fetching access:", e);
    }
    return null;
}
```

**Inline Comments:**
```javascript
// Use inline comments for complex logic
if (new Date(expiryStr) > new Date()) {
    // Course access is valid - expiry date is in the future
    hasAccess = true;
} else {
    // Course access expired
    isExpired = true;
}
```

**Section Comments:**
```javascript
// ============================================
// Authentication Functions
// ============================================

export const handleGoogleAuth = async () => { };
export const handleSignOut = () => { };
```

---

## Project-Specific Patterns

### 11. Video Player Management

**Plyr.js Integration:**
```javascript
// Single global player instance
let plyrInstance = null;

// Initialize player (first video)
if (!plyrInstance) {
    wrapper.innerHTML = `
        <div id="player"
             data-plyr-provider="youtube"
             data-plyr-embed-id="${videoId}">
        </div>
    `;
    plyrInstance = new Plyr('#player', {
        controls: ['play-large', 'play', 'progress', 'current-time',
                   'mute', 'volume', 'captions', 'settings', 'pip',
                   'airplay', 'fullscreen'],
        youtube: {
            noCookie: true,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            modestbranding: 1
        }
    });
}

// Switch video (subsequent videos)
else {
    plyrInstance.source = {
        type: 'video',
        sources: [{ src: videoId, provider: 'youtube' }]
    };
}

// Cleanup on page leave
export const destroyPlayer = () => {
    if (plyrInstance) {
        plyrInstance.destroy();
        plyrInstance = null;
    }
};
```

**Auto-play Pattern:**
```javascript
// Use Plyr ready event, not setTimeout
plyrInstance.on('ready', () => {
    plyrInstance.play();
});
```

---

### 12. Access Control

**Check Course Access:**
```javascript
// Standard access check pattern
export const checkCourseAccess = async (courseId, userId) => {
    const course = courses.find(c => c.id === courseId);

    // Free courses - always accessible
    if (parseInt(course.price) === 0) {
        return { granted: true };
    }

    // Paid courses - check expiry
    const accessData = await fetchUserAccess(userId);
    const expiryStr = accessData?.purchasedCourses[courseId];

    if (!expiryStr) {
        return { granted: false, reason: 'not_purchased' };
    }

    if (new Date(expiryStr) < new Date()) {
        return { granted: false, reason: 'expired' };
    }

    return { granted: true };
};
```

---

### 13. WhatsApp Integration

**Generate Enrollment Request:**
```javascript
export const buyCourse = (courseId, isRenewal = false) => {
    // Validation
    if (!auth.currentUser) {
        showCustomAlert("Required", "Sign in to enroll.");
        openAuthModal();
        return;
    }

    if (!adminPhone) {
        showCustomAlert("Error", "Admin contact not configured.");
        return;
    }

    const course = courses.find(c => c.id === courseId);

    // Format message
    const reqType = isRenewal ? "🔄 *Renewal Request*" : "🎓 *New Enrollment*";
    const msg = `${reqType}%0a%0a` +
                `Hello Admin,%0a` +
                `I'd like to pay for 1 month of:%0a` +
                `*Course:* ${course.title}%0a` +
                `*Course ID:* ${course.id}%0a` +
                `*Price:* ₹${course.price}%0a%0a` +
                `*My UID:* ${auth.currentUser.uid}%0a%0a` +
                `Please send UPI details.`;

    // Open WhatsApp
    window.open(`https://wa.me/${adminPhone}?text=${msg}`, '_blank');
};
```

---

### 14. Service Worker

**Cache Strategy:**
```javascript
// Network-first for API calls, cache-first for static assets
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Firebase API - network-first
    if (url.hostname.includes('firebase')) {
        event.respondWith(
            fetch(request)
                .catch(() => caches.match(request))
        );
        return;
    }

    // Static assets - cache-first
    event.respondWith(
        caches.match(request)
            .then(response => response || fetch(request))
    );
});
```

---

## Security Best Practices

### 15. Sensitive Data

**Configuration:**
```javascript
// ✓ Correct - Use window.APP_CONFIG
const firebaseConfig = window.APP_CONFIG?.firebaseConfig || {};

// ✗ Never commit config.js
// ✗ Never hardcode production credentials
```

**User Data:**
```javascript
// ✓ Always validate user owns the data
const userRef = doc(db, "users", auth.currentUser.uid);

// ✗ Never trust client-side access checks alone
// Always implement Firestore Security Rules
```

---

### 16. Input Validation

**Always validate user input:**
```javascript
/**
 * Validates course ID format
 * @param {string} courseId - Course identifier
 * @returns {boolean} True if valid
 */
export const isValidCourseId = (courseId) => {
    if (!courseId || typeof courseId !== 'string') {
        return false;
    }
    // Course IDs follow pattern: c_XX
    return /^c_\d{2}$/.test(courseId);
};

// Use before database operations
if (!isValidCourseId(courseId)) {
    console.error("Invalid course ID");
    return null;
}
```

---

## Performance Guidelines

### 17. Optimization Patterns

**Lazy Loading:**
```javascript
// Use Intersection Observer for images
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            observer.unobserve(img);
        }
    });
});

// Apply to thumbnails
document.querySelectorAll('img[data-src]').forEach(img => {
    observer.observe(img);
});
```

**Debouncing:**
```javascript
// Debounce expensive operations
const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

// Usage
const debouncedSearch = debounce(searchCourses, 300);
searchInput.addEventListener('input', (e) => {
    debouncedSearch(e.target.value);
});
```

**Rate Limiting:**
```javascript
// Client-side rate limiting
const rateLimiter = (func, limit) => {
    let lastCall = 0;
    return (...args) => {
        const now = Date.now();
        if (now - lastCall >= limit) {
            lastCall = now;
            return func(...args);
        }
    };
};

// Limit API calls to once per second
const limitedFetch = rateLimiter(fetchData, 1000);
```

---

## Testing Guidelines

### 18. Manual Testing Checklist

**Before committing code, test:**

1. **Authentication Flow**
   - [ ] Google Sign-In works
   - [ ] Sign-Out works
   - [ ] Profile data displays correctly
   - [ ] Watch history saves and displays

2. **Course Access**
   - [ ] Free courses open without login prompt
   - [ ] Paid courses require purchase
   - [ ] Expired courses show renewal prompt
   - [ ] Active subscriptions grant access

3. **Video Player**
   - [ ] Videos load and play correctly
   - [ ] Playlist navigation works
   - [ ] Back button returns to course list
   - [ ] Watch history updates

4. **Purchase Flow**
   - [ ] WhatsApp link generates correctly
   - [ ] All required info included in message
   - [ ] Link opens in new tab

5. **Responsive Design**
   - [ ] Mobile layout displays correctly
   - [ ] Bottom nav works on all screens
   - [ ] Modals are scrollable on small screens
   - [ ] Video player adjusts to screen size

6. **PWA Functionality**
   - [ ] Install prompt appears
   - [ ] App installs successfully
   - [ ] Offline caching works for app shell
   - [ ] Service worker updates correctly

---

## Git Workflow

### 19. Commit Message Format

**Standard Format:**
```
type(scope): Short description

Longer description if needed, explaining:
- Why the change was made
- What problem it solves
- Any breaking changes

Closes #issue_number
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `perf:` Performance improvements
- `test:` Adding tests
- `chore:` Maintenance tasks

**Examples:**
```
feat(auth): Add Google Sign-In integration

Implements Firebase Authentication with Google OAuth provider.
Users can now sign in with their Google account to access premium courses.

Closes #15

---

fix(player): Prevent race condition on video load

Replaced setTimeout with Plyr ready event to ensure player
is fully initialized before attempting autoplay.

Fixes #23

---

refactor(courses): Extract access control logic

Moved course access validation into reusable function
to improve code maintainability and testability.
```

---

### 20. Branch Strategy

**Main Branch:**
- Always deployable
- Protected - require PR reviews
- All tests must pass

**Feature Branches:**
```bash
# Create feature branch
git checkout -b feat/feature-name

# Naming convention
feat/feature-name
fix/bug-description
refactor/component-name
docs/documentation-update
```

---

## Deployment Checklist

### 21. Pre-Deployment Steps

- [ ] Remove all `console.log` statements (keep `console.error` only)
- [ ] Verify `config.example.js` is up to date
- [ ] Test with production Firebase project
- [ ] Verify all environment variables are set
- [ ] Test PWA install process
- [ ] Check responsive design on multiple devices
- [ ] Verify video playback on different browsers
- [ ] Test course purchase flow end-to-end
- [ ] Update service worker cache version
- [ ] Check Firestore Security Rules are deployed

---

## Troubleshooting

### 22. Common Issues

**Issue: Firebase not initializing**
```javascript
// Check: Is config.js loaded?
console.log(window.APP_CONFIG); // Should not be undefined

// Check: Are credentials correct?
// Verify against Firebase Console

// Check: Network tab for 403/401 errors
```

**Issue: Videos not playing**
```javascript
// Check: Is Plyr.js loaded?
console.log(typeof Plyr); // Should be "function"

// Check: Is videoId valid?
// Test URL: https://www.youtube.com/watch?v={videoId}

// Check: Console for YouTube API errors
```

**Issue: Service worker not updating**
```javascript
// Force update
navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(reg => reg.update());
});

// Clear cache
caches.keys().then(keys => {
    keys.forEach(key => caches.delete(key));
});
```

---

## Admin Panel Specific

### 23. Admin Patterns

**Authentication:**
```javascript
// Admin uses email/password, not Google
signInWithEmailAndPassword(auth, email, password);

// Verify admin role
const ADMIN_EMAIL = "admin@kithademic.com";
if (user.email !== ADMIN_EMAIL) {
    showCustomAlert("Access Denied", "Admin only");
    signOut(auth);
}
```

**Student Management:**
```javascript
// Grant course access
await updateDoc(doc(db, "users", studentUid), {
    [`purchasedCourses.${courseId}`]: expiryDate.toISOString()
});

// Revoke access
await updateDoc(doc(db, "users", studentUid), {
    [`purchasedCourses.${courseId}`]: deleteField()
});
```

---

## Resources

### 24. External Documentation

**Firebase:**
- [Firebase Auth Docs](https://firebase.google.com/docs/auth)
- [Firestore Docs](https://firebase.google.com/docs/firestore)
- [Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)

**Plyr.js:**
- [Plyr Documentation](https://github.com/sampotts/plyr)
- [YouTube Provider Options](https://github.com/sampotts/plyr#youtube)

**PWA:**
- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

---

## Final Notes

- **Keep it simple:** Vanilla JS is intentional - don't add frameworks without discussion
- **Performance matters:** Users may have slow connections
- **Mobile-first:** Most users access via mobile devices
- **Security first:** Never commit sensitive data
- **Accessibility:** Use semantic HTML and ARIA labels
- **Offline support:** App shell should work offline

When in doubt, check existing code for patterns and stay consistent with the established architecture.

---

**Last Updated:** 2024 (Update this date when making significant changes)
**Maintained By:** Kithademic Studies Development Team
