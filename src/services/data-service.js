// Firestore Data Service
import { db } from "../config/firebase.js";
import { getDoc, doc, setDoc, getDocs, collection, query, limit, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

export async function fetchUserAccess(userId) {
    try {
        const userSnap = await getDoc(doc(db, "users", userId));
        if (userSnap.exists()) return { purchasedCourses: userSnap.data().purchasedCourses || {} };
    } catch (e) {
        console.error("Error fetching access:", e);
    } 
    return null;
}

export async function saveWatchHistory(userId, id, title) {
    try { 
        await setDoc(doc(db, "users", userId, "watchHistory", id), { 
            videoId: id, 
            title, 
            timestamp: serverTimestamp() 
        }); 
    } catch(e) { 
        console.error("Error saving history:", e); 
    }
}

export async function loadWatchHistory(userId, limitCount = 10) {
    try {
        const snap = await getDocs(query(collection(db, "users", userId, "watchHistory"), limit(limitCount)));
        return snap.docs.map(d => d.data());
    } catch (e) {
        console.error("Error loading history:", e);
        return [];
    }
}
