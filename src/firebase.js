import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDk5PRsHGgO-i_dIEjOw-j_BjPO9kn--GI", // مفاتيحك
    authDomain: "thuraya-platform.firebaseapp.com",
    projectId: "thuraya-platform",
    storageBucket: "thuraya-platform.firebasestorage.app",
    messagingSenderId: "1055940030867",
    appId: "1:1055940030867:web:d96f6a69a342e98c6d7866",
    measurementId: "G-2QKJEQR322"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
