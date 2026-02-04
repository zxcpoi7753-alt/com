import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDk5PRsHGgO-i_dIEjOw-j_BjPO9kn--GI",
    authDomain: "thuraya-platform.firebaseapp.com",
    projectId: "thuraya-platform",
    storageBucket: "thuraya-platform.firebasestorage.app",
    messagingSenderId: "1055940030867",
    appId: "1:1055940030867:web:d96f6a69a342e98c6d7866",
    measurementId: "G-2QKJEQR322"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// تفعيل الأوفلاين (Persistence)
try { enableIndexedDbPersistence(db); } catch (err) { console.log("Persistence failed", err); }

// تثبيت المتغيرات في النافذة العامة ليتمكن ملف التطبيق من رؤيتها
window.db = db;
window.auth = auth;
