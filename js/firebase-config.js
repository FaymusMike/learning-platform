// Firebase configuration - COMPLETE VERSION
console.log("Loading Firebase configuration...");

const firebaseConfig = {
  apiKey: "AIzaSyAZQrPWExzsRK8Use3QLrt0CKPxUgsxmes",
  authDomain: "blockvote-bf739.firebaseapp.com",
  projectId: "blockvote-bf739",
  storageBucket: "blockvote-bf739.firebasestorage.app",
  messagingSenderId: "801871592271",
  appId: "1:801871592271:web:db3c8768ea41b52ccbe33a"
};

// Check if Firebase is available
if (typeof firebase === 'undefined') {
  console.error('Firebase SDK not loaded!');
} else {
  try {
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    
    // Initialize services
    const auth = firebase.auth();
    const db = firebase.firestore();
    
    // Make available globally
    window.auth = auth;
    window.db = db;
    
    console.log('Firebase initialized successfully!');
    console.log('Project:', firebaseConfig.projectId);
    
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}