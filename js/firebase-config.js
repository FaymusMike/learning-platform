// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAZQrPWExzsRK8Use3QLrt0CKPxUgsxmes",
  authDomain: "blockvote-bf739.firebaseapp.com",
  projectId: "blockvote-bf739",
  storageBucket: "blockvote-bf739.firebasestorage.app",
  messagingSenderId: "801871592271",
  appId: "1:801871592271:web:db3c8768ea41b52ccbe33a"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Firestore
const auth = firebase.auth();
const db = firebase.firestore();

const YOUTUBE_API_KEY = 'AIzaSyA9Tzxs4nrdkflcGKslXo00lhlMP9EIIug';

// Export for use in other files
window.auth = auth;
window.db = db;