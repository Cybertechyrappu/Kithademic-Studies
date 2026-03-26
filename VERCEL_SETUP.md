# Vercel Deployment Setup

This guide explains how to deploy Kithademic Studies to Vercel with environment variables.

## Environment Variables Required

Add these environment variables in your Vercel project settings:

### Firebase Configuration
- `VITE_FIREBASE_API_KEY` - Your Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Your Firebase auth domain (e.g., `kithademic-studies.firebaseapp.com`)
- `VITE_FIREBASE_PROJECT_ID` - Your Firebase project ID (e.g., `kithademic-studies`)
- `VITE_FIREBASE_STORAGE_BUCKET` - Your Firebase storage bucket (e.g., `kithademic-studies.firebasestorage.app`)
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Your Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID` - Your Firebase app ID
- `VITE_FIREBASE_MEASUREMENT_ID` - Your Firebase measurement ID (optional, for Analytics)

### Application Configuration
- `VITE_ADMIN_PHONE` - Admin WhatsApp phone number (without +, e.g., `919544268849`)

## How to Add Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable listed above
4. Set environment to: **Production**, **Preview**, and **Development** (or as needed)
5. Click **Save**

## Build Settings

The app will automatically:
1. Run `node generate-config.js` during build to create `env-config.js` from environment variables
2. Use `env-config.js` in production (generated from env vars)
3. Fall back to `config.js` in local development

## Build Command (Optional)

If Vercel doesn't automatically run the generation script, update your build command:

```bash
node generate-config.js && echo "Config generated"
```

## Verifying Deployment

After deployment:
1. Visit your Vercel URL
2. The app should load without showing the "Configuration Missing" screen
3. Try signing in with Google or email/password to verify Firebase connection

## Troubleshooting

**Problem:** "Configuration Missing" error on Vercel
- **Solution:** Check that all environment variables are set correctly in Vercel dashboard
- **Solution:** Redeploy the project after adding environment variables

**Problem:** Firebase authentication not working
- **Solution:** Verify `VITE_FIREBASE_API_KEY` and `VITE_FIREBASE_AUTH_DOMAIN` are correct
- **Solution:** Check Firebase Console that your domain is authorized

**Problem:** Build fails
- **Solution:** Ensure `generate-config.js` is committed to the repository
- **Solution:** Check build logs in Vercel dashboard for specific errors

## Local Development

For local development, you still use `config.js`:

1. Copy `config.example.js` to `config.js`
2. Add your Firebase credentials
3. The app will automatically fall back to `config.js` when `env-config.js` doesn't exist

## Security Notes

✅ `config.js` is git ignored (contains secrets)
✅ `env-config.js` is git ignored (generated at build time)
✅ `generate-config.js` is committed (build script)
✅ `env-config.template.js` is committed (template only)

Never commit actual Firebase credentials to git!
