// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAZQrPWExzsRK8Use3QLrt0CKPxUgsxmes",
  authDomain: "blockvote-bf739.firebaseapp.com",
  projectId: "blockvote-bf739",
  storageBucket: "blockvote-bf739.firebasestorage.app",
  messagingSenderId: "801871592271",
  appId: "1:801871592271:web:db3c8768ea41b52ccbe33a"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    
    // Initialize Firebase services
    const auth = firebase.auth();
    const db = firebase.firestore();
    
    // Export for use in other files
    window.auth = auth;
    window.db = db;
    
    console.log("Firebase initialized successfully!");
} catch (error) {
    console.error("Firebase initialization error:", error);
}