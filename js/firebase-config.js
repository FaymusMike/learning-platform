// Firebase configuration using COMPAT version for your existing code
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js";

const firebaseConfig = {
  apiKey: "AIzaSyAZQrPWExzsRK8Use3QLrt0CKPxUgsxmes",
  authDomain: "blockvote-bf739.firebaseapp.com",
  projectId: "blockvote-bf739",
  storageBucket: "blockvote-bf739.firebasestorage.app",
  messagingSenderId: "801871592271",
  appId: "1:801871592271:web:db3c8768ea41b52ccbe33a"
};

// Initialize Firebase with compatability
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

// Export for use in other files
window.auth = auth;
window.db = db;
console.log("Firebase initialized successfully!");