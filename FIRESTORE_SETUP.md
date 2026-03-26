# Firestore Setup Instructions

## Critical: Deploy Security Rules

The app requires Firestore Security Rules to be deployed to allow public access to course and video data.

### Option 1: Deploy via Firebase Console (Easiest)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your **kithademic-studies** project
3. Click **Firestore Database** in the left sidebar
4. Click the **Rules** tab at the top
5. Copy the contents of `firestore.rules` from this repository
6. Paste into the Firebase Console Rules editor
7. Click **Publish**

### Option 2: Deploy via Firebase CLI

If you have Firebase CLI installed:

```bash
# Install Firebase CLI (if not installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in this project
firebase init firestore

# Deploy the rules
firebase deploy --only firestore:rules
```

## What These Rules Do

```javascript
// Public access (no auth required)
- Read courses (/courses/{id})
- Read lessons (/courses/{id}/lessons/{id})
- Read basic videos (/basicVideos/{id})

// Private access (auth required, user can only access their own data)
- Read/Write user data (/users/{userId})
- Read/Write watch history (/users/{userId}/watchHistory/{id})

// Admin access (only via Firebase Console)
- Create/Update/Delete courses
- Create/Update/Delete lessons
- Create/Update/Delete basic videos
```

## Migration: Populate Firestore with Initial Data

After deploying security rules, populate your database:

1. Open your deployed site
2. Navigate to: `https://your-domain.vercel.app/admin/scripts/migrate-to-firestore.html`
3. Click **"Start Migration"**
4. Wait for completion (creates courses, lessons, and basic videos)
5. Refresh your main site - courses and videos should now load!

## Verify Rules Are Working

Test in Firebase Console:

1. Go to Firestore Database
2. Click **Rules** tab
3. Click **Rules playground** (if available)
4. Test read access to `/courses/c_01` - should succeed
5. Test write access to `/courses/c_01` - should fail (public can't write)

## Common Issues

### Issue: "Missing or insufficient permissions"

**Cause:** Security rules not deployed yet

**Fix:** Follow Option 1 or Option 2 above to deploy rules

### Issue: "No courses found" after deploying rules

**Cause:** Database is empty

**Fix:** Run the migration script at `/admin/scripts/migrate-to-firestore.html`

### Issue: Videos still not loading

**Cause:** Browser cache showing old data

**Fix:** Hard refresh (Ctrl+Shift+R or Cmd+Shift+R) or open in incognito mode

## Security Notes

- Course/video data is public (read-only)
- User data is private (each user can only access their own)
- Admin operations must be done via Firebase Console or admin panel
- Never share Firebase credentials publicly
- The API key in config.js is safe to commit (it's for client-side only and restricted by Firebase security rules)

## Admin Panel Access

To use the admin panel for managing courses:

1. Go to: `https://your-domain.vercel.app/admin/`
2. Enter admin password (set during admin setup)
3. Click **Courses** tab
4. Create/manage courses and lessons
5. All changes are immediately reflected on the main site

No code changes needed to add/edit/delete courses after setup!
