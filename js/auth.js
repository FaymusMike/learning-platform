// Authentication functionality
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginForm = document.getElementById('loginFormElement');
    const signupForm = document.getElementById('signupFormElement');
    const showSignupLink = document.getElementById('showSignup');
    const showLoginLink = document.getElementById('showLogin');
    const loginFormContainer = document.getElementById('loginForm');
    const signupFormContainer = document.getElementById('signupForm');
    const roleCards = document.querySelectorAll('.role-card');
    const googleSignInBtn = document.getElementById('googleSignIn');

    const YOUTUBE_API_KEY = 'AIzaSyA9Tzxs4nrdkflcGKslXo00lhlMP9EIIug';
    
    let selectedRole = 'student'; // Default role
    
    // Role selection
    roleCards.forEach(card => {
        card.addEventListener('click', function() {
            // Remove active class from all cards
            roleCards.forEach(c => c.classList.remove('active'));
            // Add active class to clicked card
            this.classList.add('active');
            // Set selected role
            selectedRole = this.getAttribute('data-role');
        });
    });
    
    // Toggle between login and signup forms
    showSignupLink.addEventListener('click', function(e) {
        e.preventDefault();
        loginFormContainer.classList.add('d-none');
        signupFormContainer.classList.remove('d-none');
    });
    
    showLoginLink.addEventListener('click', function(e) {
        e.preventDefault();
        signupFormContainer.classList.add('d-none');
        loginFormContainer.classList.remove('d-none');
    });
    
    // Login form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // Firebase authentication
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed in
                const user = userCredential.user;
                
                // Store user data in localStorage
                localStorage.setItem('currentUser', JSON.stringify({
                    uid: user.uid,
                    email: user.email,
                    role: selectedRole
                }));
                
                // Redirect based on role
                if (selectedRole === 'teacher') {
                    window.location.href = 'teacher-dashboard.html';
                } else {
                    window.location.href = 'student-dashboard.html';
                }
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                alert(`Login failed: ${errorMessage}`);
            });
    });
    
    // Signup form submission
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validate passwords match
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        
        // Firebase authentication
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed up
                const user = userCredential.user;
                
                // Create user document in Firestore
                return db.collection('users').doc(user.uid).set({
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    role: selectedRole,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            })
            .then(() => {
                // Store user data in localStorage
                localStorage.setItem('currentUser', JSON.stringify({
                    uid: auth.currentUser.uid,
                    email: email,
                    firstName: firstName,
                    lastName: lastName,
                    role: selectedRole
                }));
                
                // Redirect based on role
                if (selectedRole === 'teacher') {
                    window.location.href = 'teacher-dashboard.html';
                } else {
                    window.location.href = 'student-dashboard.html';
                }
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                alert(`Signup failed: ${errorMessage}`);
            });
    });
    
    // Google Sign-In
    googleSignInBtn.addEventListener('click', function() {
        const provider = new firebase.auth.GoogleAuthProvider();
        
        auth.signInWithPopup(provider)
            .then((result) => {
                // This gives you a Google Access Token
                const credential = result.credential;
                const token = credential.accessToken;
                const user = result.user;
                
                // Check if user exists in Firestore
                return db.collection('users').doc(user.uid).get();
            })
            .then((doc) => {
                if (doc.exists) {
                    // User exists, get their role
                    const userData = doc.data();
                    selectedRole = userData.role;
                } else {
                    // New user, create document with selected role
                    return db.collection('users').doc(auth.currentUser.uid).set({
                        firstName: auth.currentUser.displayName.split(' ')[0],
                        lastName: auth.currentUser.displayName.split(' ')[1] || '',
                        email: auth.currentUser.email,
                        role: selectedRole,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
            })
            .then(() => {
                // Store user data in localStorage
                localStorage.setItem('currentUser', JSON.stringify({
                    uid: auth.currentUser.uid,
                    email: auth.currentUser.email,
                    firstName: auth.currentUser.displayName.split(' ')[0],
                    lastName: auth.currentUser.displayName.split(' ')[1] || '',
                    role: selectedRole
                }));
                
                // Redirect based on role
                if (selectedRole === 'teacher') {
                    window.location.href = 'teacher-dashboard.html';
                } else {
                    window.location.href = 'student-dashboard.html';
                }
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                alert(`Google Sign-In failed: ${errorMessage}`);
            });
    });
    
    // Check if user is already logged in
    auth.onAuthStateChanged((user) => {
        if (user) {
            // User is signed in
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser) {
                if (currentUser.role === 'teacher') {
                    window.location.href = 'teacher-dashboard.html';
                } else {
                    window.location.href = 'student-dashboard.html';
                }
            }
        }
    });
});