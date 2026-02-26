 
# 🕌 Kithademic Studies - Learning Platform

A modern, fast, and responsive web application built for **Kithademic Studies**, offering excellence in Islamic & Academic education. This platform allows students to browse courses, watch video lessons, track their progress, and seamlessly request premium course enrollments.

## ✨ Features

* **📱 PWA Ready:** Fully installable as a Progressive Web App on mobile and desktop devices.
* **🔐 Seamless Authentication:** Integrated Google Sign-In via Firebase Authentication.
* **📚 Course Catalog:** Categorized learning paths with dedicated tabs for **Premium** and **Free** courses.
* **🎬 Basic Videos Section:** A standalone section for free, high-quality YouTube-embedded basic classes.
* **🎓 Dynamic Classroom:** An embedded video player with a dynamic, clickable syllabus and playlist tracking.
* **📊 User Dashboard:** Students can view their profile, access their most recently watched videos, and manage their account.
* **💬 WhatsApp Enrollment Flow:** Generates a pre-formatted, professional enrollment request sent directly to the Admin's WhatsApp for UPI payment processing.
* **⏳ Monthly Subscriptions:** Automatically detects expired 30-day course access and prompts users to renew.

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3 (Glassmorphism, Flexbox/Grid), Vanilla JavaScript (ES6 Modules)
* **Backend / BaaS:** Firebase Authentication & Cloud Firestore
* **Media:** YouTube Iframe API integrations

## 🚀 Setup & Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/yourusername/Kithademic-Studies-main.git](https://github.com/yourusername/Kithademic-Studies-main.git)
    cd Kithademic-Studies-main
    ```

2.  **Configure Firebase:**
    Open `app.js` and replace the `firebaseConfig` object with your Firebase project credentials. Ensure Firestore rules are set up to allow authenticated users to read/write their own documents.

3.  **Set Admin WhatsApp Number:**
    In `app.js`, locate the `adminPhone` variable (around line 21) and insert your business WhatsApp number with the country code (e.g., `"919876543210"`).

4.  **Run the App:**
    Serve the files using any local web server (e.g., VS Code Live Server, Python HTTP server).
    ```bash
    npx serve .
    ```

## 📂 Project Structure

* `index.html`: The main Single Page Application (SPA) structure.
* `style.css`: Custom styling, CSS variables, animations, and responsive UI.
* `app.js`: Core logic, Firebase integration, UI state management, and mock course data.
* `manifest.json` & `sw.js`: Service worker and manifest for PWA functionality.
