import { db } from "../config/firebase.js";
import { collection, doc, getDocs, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

export const getStudents = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const students = [];
        querySnapshot.forEach((docSnap) => {
            students.push({ id: docSnap.id, ...docSnap.data() });
        });
        return students;
    } catch (e) {
        console.error("Fetch Students Error:", e);
        throw e;
    }
};

export const getStudentHistory = async (uid) => {
    try {
        const snapshot = await getDocs(collection(db, "users", uid, "watchHistory"));
        const history = [];
        snapshot.forEach(doc => history.push(doc.data()));
        return history.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
    } catch (e) {
        console.error("Fetch History Error:", e);
        throw e;
    }
};

export const approveCourse = async (uid, courseId, days = 30) => {
    try {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        if(!userSnap.exists()) throw new Error("Student UID not found."); 
        
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + days);
        
        await updateDoc(userRef, {
            [`purchasedCourses.${courseId}`]: expiryDate.toISOString()
        });
        return { success: true };
    } catch (e) {
        console.error("Approve Course Error:", e);
        return { success: false, error: e.message };
    }
};
