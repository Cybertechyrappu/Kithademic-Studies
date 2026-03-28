# Kithademic Studies — Learning Platform

## Overview
A Progressive Web App (PWA) for Kithademic Studies offering Islamic & Academic education. Students can browse courses, watch video lessons, track progress, and request premium course enrollments.

## Tech Stack
- **Frontend:** Pure HTML5, CSS3, Vanilla JavaScript (ES6 Modules) — no build step required
- **Backend/BaaS:** Firebase Authentication & Cloud Firestore
- **Media:** YouTube Iframe API via Plyr.js
- **Serving:** `serve` static file server (npm global package)

## Animation Architecture
All animation logic lives in `src/animations.js`:
- `initSplash()` / `hideSplash()` — Manages the branded splash screen lifecycle
- `animatedShowPage(pageId)` — Smooth fade+slide page transitions
- `setupScrollReveal()` — IntersectionObserver scroll-reveal for cards
- `animateHero()` — Staggered entrance for hero section elements
- `animateNavIn()` / `animateTopBrandIn()` — Entrance animations for chrome elements

## Project Structure
```
index.html          — Main SPA entry, splash screen markup
style.css           — All styles + keyframe animations
config.js           — Firebase configuration (window.APP_CONFIG)
manifest.json       — PWA manifest
sw.js               — Service worker
src/
  main.js           — App init, wires everything together
  animations.js     — All animation utilities
  auth/
    auth-manager.js — Firebase Auth (sign in/up/out, modal animations)
  config/
    firebase.js     — Firebase SDK initialization
  services/
    data-service.js — Firestore data fetching
  ui/
    navigation.js   — Tab switching with animated transitions
    rendering.js    — Course/video/history rendering + skeleton loaders
    player.js       — Plyr video player + classroom logic
    dialogs.js      — Animated alert/confirm dialogs
  utils/
    constants.js    — App-wide constants
    rate-limiter.js — Debounce utility
    validators.js   — Input validation
admin/              — Admin panel
flutter_app/        — Flutter mobile app source
```

## Running the App
```
serve . -l 5000
```
Access at port 5000.

## Deployment
- Target: Static deployment
- Public directory: `.` (project root)
- No build step required

## Firebase Configuration
- Project: `kithademic-studies`
- Auth: Email/Password
- Database: Cloud Firestore
- Config lives in `config.js` (loaded as `window.APP_CONFIG`)
