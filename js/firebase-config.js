// Firebase configuration
console.log("Loading Firebase configuration...");

const firebaseConfig = {
  apiKey: "AIzaSyAZQrPWExzsRK8Use3QLrt0CKPxUgsxmes",
  authDomain: "blockvote-bf739.firebaseapp.com",
  projectId: "blockvote-bf739",
  storageBucket: "blockvote-bf739.firebasestorage.app",
  messagingSenderId: "801871592271",
  appId: "1:801871592271:web:db3c8768ea41b52ccbe33a"
};

// Wait for Firebase to load
function initializeFirebase() {
  if (typeof firebase !== 'undefined') {
    try {
      // Initialize Firebase
      const app = firebase.initializeApp(firebaseConfig);
      
      // Initialize services
      const auth = firebase.auth();
      const db = firebase.firestore();
      
      // Make available globally
      window.auth = auth;
      window.db = db;
      
      console.log('Firebase initialized successfully!');
      console.log('Project:', firebaseConfig.projectId);
      
      // Firestore settings for better offline support
      db.settings({
        cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
      });
      
      // Enable persistence
      db.enablePersistence()
        .catch((err) => {
          console.log('Firestore persistence failed: ', err);
        });
        
    } catch (error) {
      console.error('Firebase initialization error:', error);
    }
  } else {
    console.error('Firebase SDK not loaded yet');
  }
}

// Initialize when Firebase is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeFirebase);
} else {
  initializeFirebase();
}