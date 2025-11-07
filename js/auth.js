// Authentication functionality
document.addEventListener('DOMContentLoaded', function() {
    // Wait for Firebase to be initialized
    function waitForFirebase() {
        if (window.auth && window.db) {
            initializeAuth();
        } else {
            setTimeout(waitForFirebase, 100);
        }
    }
    
    waitForFirebase();
});

function initializeAuth() {
    // DOM Elements
    const loginForm = document.getElementById('loginFormElement');
    const signupForm = document.getElementById('signupFormElement');
    const showSignupLink = document.getElementById('showSignup');
    const showLoginLink = document.getElementById('showLogin');
    const loginFormContainer = document.getElementById('loginForm');
    const signupFormContainer = document.getElementById('signupForm');
    const roleCards = document.querySelectorAll('.role-card');
    const googleSignInBtn = document.getElementById('googleSignIn');

    let selectedRole = 'student'; // Default role
    
    // Role selection - FIXED: Set initial active state
    roleCards.forEach(card => {
        // Set student as default active
        if (card.getAttribute('data-role') === 'student') {
            card.classList.add('active');
        }
        
        card.addEventListener('click', function() {
            // Remove active class from all cards
            roleCards.forEach(c => c.classList.remove('active'));
            // Add active class to clicked card
            this.classList.add('active');
            // Set selected role
            selectedRole = this.getAttribute('data-role');
            console.log('Selected role:', selectedRole);
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
        
        if (!email || !password) {
            alert('Please fill in all fields');
            return;
        }
        
        console.log('Logging in as:', selectedRole);
        
        // Firebase authentication
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed in
                const user = userCredential.user;
                
                // Get user role from Firestore
                return db.collection('users').doc(user.uid).get();
            })
            .then((doc) => {
                if (doc.exists) {
                    const userData = doc.data();
                    const userRole = userData.role;
                    
                    // Store user data in localStorage
                    localStorage.setItem('currentUser', JSON.stringify({
                        uid: auth.currentUser.uid,
                        email: auth.currentUser.email,
                        firstName: userData.firstName,
                        lastName: userData.lastName,
                        role: userRole
                    }));
                    
                    console.log('User role from Firestore:', userRole);
                    
                    // Redirect based on actual role from Firestore
                    if (userRole === 'teacher') {
                        window.location.href = 'teacher-dashboard.html';
                    } else {
                        window.location.href = 'student-dashboard.html';
                    }
                } else {
                    alert('User data not found. Please contact administrator.');
                }
            })
            .catch((error) => {
                console.error('Login error:', error);
                alert(`Login failed: ${error.message}`);
            });
    });
    
    // Signup form submission - FIXED: Proper role saving
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
        
        if (!firstName || !lastName || !email || !password) {
            alert('Please fill in all fields');
            return;
        }
        
        console.log('Signing up as:', selectedRole);
        
        // Firebase authentication
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed up
                const user = userCredential.user;
                
                // Create user document in Firestore with selected role
                return db.collection('users').doc(user.uid).set({
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    role: selectedRole, // This is the FIX - using selectedRole
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
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
                
                console.log('User created with role:', selectedRole);
                
                // Redirect based on selected role
                if (selectedRole === 'teacher') {
                    window.location.href = 'teacher-dashboard.html';
                } else {
                    window.location.href = 'student-dashboard.html';
                }
            })
            .catch((error) => {
                console.error('Signup error:', error);
                alert(`Signup failed: ${error.message}`);
            });
    });
    
    // Google Sign-In - FIXED: Role handling
    googleSignInBtn.addEventListener('click', function() {
        const provider = new firebase.auth.GoogleAuthProvider();
        
        auth.signInWithPopup(provider)
            .then((result) => {
                const user = result.user;
                
                // Check if user exists in Firestore
                return db.collection('users').doc(user.uid).get();
            })
            .then((doc) => {
                if (doc.exists) {
                    // User exists, get their role
                    const userData = doc.data();
                    const userRole = userData.role;
                    
                    // Update last login
                    return db.collection('users').doc(auth.currentUser.uid).update({
                        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                    }).then(() => userRole);
                } else {
                    // New user, create document with selected role
                    return db.collection('users').doc(auth.currentUser.uid).set({
                        firstName: auth.currentUser.displayName.split(' ')[0],
                        lastName: auth.currentUser.displayName.split(' ')[1] || '',
                        email: auth.currentUser.email,
                        role: selectedRole,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                    }).then(() => selectedRole);
                }
            })
            .then((userRole) => {
                // Store user data in localStorage
                localStorage.setItem('currentUser', JSON.stringify({
                    uid: auth.currentUser.uid,
                    email: auth.currentUser.email,
                    firstName: auth.currentUser.displayName.split(' ')[0],
                    lastName: auth.currentUser.displayName.split(' ')[1] || '',
                    role: userRole
                }));
                
                // Redirect based on role
                if (userRole === 'teacher') {
                    window.location.href = 'teacher-dashboard.html';
                } else {
                    window.location.href = 'student-dashboard.html';
                }
            })
            .catch((error) => {
                console.error('Google Sign-In error:', error);
                alert(`Google Sign-In failed: ${error.message}`);
            });
    });
    
    // Check if user is already logged in
    auth.onAuthStateChanged((user) => {
        if (user) {
            // User is signed in, check their role
            db.collection('users').doc(user.uid).get()
                .then((doc) => {
                    if (doc.exists) {
                        const userData = doc.data();
                        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                        
                        if (currentUser && currentUser.role) {
                            if (currentUser.role === 'teacher') {
                                window.location.href = 'teacher-dashboard.html';
                            } else {
                                window.location.href = 'student-dashboard.html';
                            }
                        }
                    }
                })
                .catch((error) => {
                    console.error('Error checking user role:', error);
                });
        }
    });
}