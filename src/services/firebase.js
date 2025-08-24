// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    onAuthStateChanged,
    signInWithPopup,
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
} from 'firebase/auth';
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    collection,
    onSnapshot,
    addDoc,
    deleteDoc,
    updateDoc,
    query,
    where,
    getDocs,
    runTransaction,
    Timestamp
} from 'firebase/firestore';
// Note: Firebase Storage intentionally not used

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBdqmXcj8QJxsS7RFbgL3zv6jqYOUrEIfg",
  authDomain: "hostel-canteen-app.firebaseapp.com",
  projectId: "hostel-canteen-app",
  storageBucket: "hostel-canteen-app.firebasestorage.app",
  messagingSenderId: "360421932587",
  appId: "1:360421932587:web:901bd8df43cb657351f46e",
  measurementId: "G-6WQCEESMRD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
// No storage export - using external links for assets

// Auth providers
export const googleProvider = new GoogleAuthProvider();

// Export commonly used functions
export {
    onAuthStateChanged,
    signInWithPopup,
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    doc,
    setDoc,
    getDoc,
    collection,
    onSnapshot,
    addDoc,
    deleteDoc,
    updateDoc,
    query,
    where,
    getDocs,
    runTransaction,
    Timestamp
};
