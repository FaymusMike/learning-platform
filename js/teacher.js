// Teacher Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'teacher') {
        window.location.href = 'auth.html';
        return;
    }
    
    // DOM Elements
    const teacherNameElement = document.getElementById('teacherName');
    const logoutBtn = document.getElementById('logoutBtn');
    const tabLinks = document.querySelectorAll('[data-tab]');
    const tabs = document.querySelectorAll('.dashboard-tab');
    
    const createLessonBtn = document.getElementById('createLessonBtn');
    const createQuizBtn = document.getElementById('createQuizBtn');
    const addLessonBtn = document.getElementById('addLessonBtn');
    const addQuizBtn = document.getElementById('addQuizBtn');
    
    const createLessonModal = new bootstrap.Modal(document.getElementById('createLessonModal'));
    const createQuizModal = new bootstrap.Modal(document.getElementById('createQuizModal'));
    
    const lessonForm = document.getElementById('lessonForm');
    const saveLessonBtn = document.getElementById('saveLessonBtn');
    const lessonsContainer = document.getElementById('lessonsContainer');
    
    const quizForm = document.getElementById('quizForm');
    const saveQuizBtn = document.getElementById('saveQuizBtn');
    const addQuestionBtn = document.getElementById('addQuestionBtn');
    const quizQuestionsContainer = document.getElementById('quizQuestionsContainer');
    const quizzesContainer = document.getElementById('quizzesContainer');
    
    const totalLessonsElement = document.getElementById('totalLessons');
    const totalQuizzesElement = document.getElementById('totalQuizzes');
    const totalStudentsElement = document.getElementById('totalStudents');
    const avgScoreElement = document.getElementById('avgScore');
    const recentActivityElement = document.getElementById('recentActivity');
    
    const quickCreateLesson = document.getElementById('quickCreateLesson');
    const quickCreateQuiz = document.getElementById('quickCreateQuiz');
    const quickViewStudents = document.getElementById('quickViewStudents');

    const YOUTUBE_API_KEY = 'AIzaSyA9Tzxs4nrdkflcGKslXo00lhlMP9EIIug';
    
    // Set teacher name
    if (currentUser.firstName) {
        teacherNameElement.textContent = currentUser.firstName;
    }
    
    // Tab navigation
    tabLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all tabs and links
            tabs.forEach(tab => tab.classList.add('d-none'));
            tabLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to current tab and link
            const tabId = this.getAttribute('data-tab') + 'Tab';
            document.getElementById(tabId).classList.remove('d-none');
            this.classList.add('active');
            
            // Load tab-specific data
            switch(this.getAttribute('data-tab')) {
                case 'lessons':
                    loadLessons();
                    break;
                case 'quizzes':
                    loadQuizzes();
                    break;
                case 'students':
                    loadStudents();
                    break;
                case 'discussions':
                    loadDiscussions();
                    break;
            }
        });
    });
    
    // Logout functionality
    logoutBtn.addEventListener('click', function() {
        auth.signOut().then(() => {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    });
    
    // Modal triggers
    createLessonBtn.addEventListener('click', showCreateLessonModal);
    createQuizBtn.addEventListener('click', showCreateQuizModal);
    addLessonBtn.addEventListener('click', showCreateLessonModal);
    addQuizBtn.addEventListener('click', showCreateQuizModal);
    quickCreateLesson.addEventListener('click', showCreateLessonModal);
    quickCreateQuiz.addEventListener('click', showCreateQuizModal);
    quickViewStudents.addEventListener('click', function() {
        document.querySelector('[data-tab="students"]').click();
    });
    
    // Add question to quiz
    addQuestionBtn.addEventListener('click', addQuestionToQuiz);
    
    // Save lesson
    saveLessonBtn.addEventListener('click', saveLesson);
    
    // Save quiz
    saveQuizBtn.addEventListener('click', saveQuiz);
    
    // Load initial data
    loadDashboardData();
    
    // Functions
    function showCreateLessonModal() {
        lessonForm.reset();
        createLessonModal.show();
    }
    
    function showCreateQuizModal() {
        quizForm.reset();
        quizQuestionsContainer.innerHTML = '';
        addQuestionToQuiz(); // Add one question by default
        createQuizModal.show();
    }
    
    function addQuestionToQuiz() {
        const questionIndex = quizQuestionsContainer.children.length;
        const questionHtml = `
            <div class="quiz-question mb-3 p-3 border rounded" data-index="${questionIndex}">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h6 class="mb-0">Question ${questionIndex + 1}</h6>
                    <button type="button" class="btn btn-sm btn-outline-danger remove-question" ${questionIndex === 0 ? 'disabled' : ''}>
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="mb-3">
                    <label class="form-label">Question Text</label>
                    <input type="text" class="form-control question-text" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">Question Type</label>
                    <select class="form-select question-type">
                        <option value="multiple">Multiple Choice</option>
                        <option value="truefalse">True/False</option>
                        <option value="short">Short Answer</option>
                    </select>
                </div>
                <div class="question-options">
                    <label class="form-label">Options</label>
                    <div class="option-group mb-2">
                        <div class="input-group">
                            <div class="input-group-text">
                                <input class="form-check-input correct-answer" type="radio" name="correct-${questionIndex}" value="0" required>
                            </div>
                            <input type="text" class="form-control option-text" placeholder="Option 1" required>
                        </div>
                    </div>
                    <div class="option-group mb-2">
                        <div class="input-group">
                            <div class="input-group-text">
                                <input class="form-check-input correct-answer" type="radio" name="correct-${questionIndex}" value="1" required>
                            </div>
                            <input type="text" class="form-control option-text" placeholder="Option 2" required>
                        </div>
                    </div>
                    <div class="option-group mb-2">
                        <div class="input-group">
                            <div class="input-group-text">
                                <input class="form-check-input correct-answer" type="radio" name="correct-${questionIndex}" value="2" required>
                            </div>
                            <input type="text" class="form-control option-text" placeholder="Option 3" required>
                        </div>
                    </div>
                    <div class="option-group mb-2">
                        <div class="input-group">
                            <div class="input-group-text">
                                <input class="form-check-input correct-answer" type="radio" name="correct-${questionIndex}" value="3" required>
                            </div>
                            <input type="text" class="form-control option-text" placeholder="Option 4" required>
                        </div>
                    </div>
                </div>
            </div>
        `;
        quizQuestionsContainer.insertAdjacentHTML('beforeend', questionHtml);
        
        // Add event listener to remove button
        const removeBtn = quizQuestionsContainer.lastElementChild.querySelector('.remove-question');
        if (removeBtn) {
            removeBtn.addEventListener('click', function() {
                this.closest('.quiz-question').remove();
                // Reindex questions
                const questions = quizQuestionsContainer.querySelectorAll('.quiz-question');
                questions.forEach((q, index) => {
                    q.setAttribute('data-index', index);
                    q.querySelector('h6').textContent = `Question ${index + 1}`;
                });
            });
        }
        
        // Add event listener for question type change
        const typeSelect = quizQuestionsContainer.lastElementChild.querySelector('.question-type');
        typeSelect.addEventListener('change', function() {
            const questionDiv = this.closest('.quiz-question');
            const optionsDiv = questionDiv.querySelector('.question-options');
            
            if (this.value === 'short') {
                optionsDiv.innerHTML = '<p class="text-muted">Short answer questions do not have predefined options.</p>';
            } else if (this.value === 'truefalse') {
                optionsDiv.innerHTML = `
                    <div class="option-group mb-2">
                        <div class="input-group">
                            <div class="input-group-text">
                                <input class="form-check-input correct-answer" type="radio" name="correct-${questionIndex}" value="0" required>
                            </div>
                            <input type="text" class="form-control option-text" value="True" readonly>
                        </div>
                    </div>
                    <div class="option-group mb-2">
                        <div class="input-group">
                            <div class="input-group-text">
                                <input class="form-check-input correct-answer" type="radio" name="correct-${questionIndex}" value="1" required>
                            </div>
                            <input type="text" class="form-control option-text" value="False" readonly>
                        </div>
                    </div>
                `;
            } else {
                optionsDiv.innerHTML = `
                    <label class="form-label">Options</label>
                    <div class="option-group mb-2">
                        <div class="input-group">
                            <div class="input-group-text">
                                <input class="form-check-input correct-answer" type="radio" name="correct-${questionIndex}" value="0" required>
                            </div>
                            <input type="text" class="form-control option-text" placeholder="Option 1" required>
                        </div>
                    </div>
                    <div class="option-group mb-2">
                        <div class="input-group">
                            <div class="input-group-text">
                                <input class="form-check-input correct-answer" type="radio" name="correct-${questionIndex}" value="1" required>
                            </div>
                            <input type="text" class="form-control option-text" placeholder="Option 2" required>
                        </div>
                    </div>
                    <div class="option-group mb-2">
                        <div class="input-group">
                            <div class="input-group-text">
                                <input class="form-check-input correct-answer" type="radio" name="correct-${questionIndex}" value="2" required>
                            </div>
                            <input type="text" class="form-control option-text" placeholder="Option 3" required>
                        </div>
                    </div>
                    <div class="option-group mb-2">
                        <div class="input-group">
                            <div class="input-group-text">
                                <input class="form-check-input correct-answer" type="radio" name="correct-${questionIndex}" value="3" required>
                            </div>
                            <input type="text" class="form-control option-text" placeholder="Option 4" required>
                        </div>
                    </div>
                `;
            }
        });
    }
    
    function saveLesson() {
        const title = document.getElementById('lessonTitle').value;
        const topic = document.getElementById('lessonTopic').value;
        const content = document.getElementById('lessonContent').value;
        const videoLink = document.getElementById('videoLink').value;
        const resourceLinks = document.getElementById('resourceLinks').value;
        
        if (!title || !topic || !content) {
            alert('Please fill in all required fields');
            return;
        }
        
        const lessonData = {
            title: title,
            topic: topic,
            content: content,
            videoLink: videoLink || '',
            resourceLinks: resourceLinks ? resourceLinks.split('\n') : [],
            teacherId: currentUser.uid,
            teacherName: currentUser.firstName + ' ' + currentUser.lastName,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Save to Firestore
        db.collection('lessons').add(lessonData)
            .then((docRef) => {
                console.log('Lesson saved with ID: ', docRef.id);
                createLessonModal.hide();
                loadLessons();
                loadDashboardData();
                
                // Add to recent activity
                addRecentActivity(`Created lesson: ${title}`);
            })
            .catch((error) => {
                console.error('Error saving lesson: ', error);
                alert('Error saving lesson. Please try again.');
            });
    }
    
    function saveQuiz() {
        const title = document.getElementById('quizTitle').value;
        const description = document.getElementById('quizDescription').value;
        
        if (!title) {
            alert('Please enter a quiz title');
            return;
        }
        
        const questions = [];
        const questionElements = quizQuestionsContainer.querySelectorAll('.quiz-question');
        
        if (questionElements.length === 0) {
            alert('Please add at least one question to the quiz');
            return;
        }
        
        let isValid = true;
        
        questionElements.forEach((qElement, index) => {
            const questionText = qElement.querySelector('.question-text').value;
            const questionType = qElement.querySelector('.question-type').value;
            
            if (!questionText) {
                isValid = false;
                return;
            }
            
            const question = {
                text: questionText,
                type: questionType,
                options: [],
                correctAnswer: null
            };
            
            if (questionType === 'multiple' || questionType === 'truefalse') {
                const optionInputs = qElement.querySelectorAll('.option-text');
                const correctRadio = qElement.querySelector('.correct-answer:checked');
                
                if (!correctRadio) {
                    isValid = false;
                    return;
                }
                
                optionInputs.forEach((input, optIndex) => {
                    question.options.push(input.value);
                    if (optIndex === parseInt(correctRadio.value)) {
                        question.correctAnswer = input.value;
                    }
                });
            }
            
            questions.push(question);
        });
        
        if (!isValid) {
            alert('Please fill in all question fields and select correct answers');
            return;
        }
        
        const quizData = {
            title: title,
            description: description,
            questions: questions,
            teacherId: currentUser.uid,
            teacherName: currentUser.firstName + ' ' + currentUser.lastName,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Save to Firestore
        db.collection('quizzes').add(quizData)
            .then((docRef) => {
                console.log('Quiz saved with ID: ', docRef.id);
                createQuizModal.hide();
                loadQuizzes();
                loadDashboardData();
                
                // Add to recent activity
                addRecentActivity(`Created quiz: ${title}`);
            })
            .catch((error) => {
                console.error('Error saving quiz: ', error);
                alert('Error saving quiz. Please try again.');
            });
    }
    
    function loadDashboardData() {
        // Load lessons count
        db.collection('lessons')
            .where('teacherId', '==', currentUser.uid)
            .get()
            .then((querySnapshot) => {
                totalLessonsElement.textContent = querySnapshot.size;
            });
        
        // Load quizzes count
        db.collection('quizzes')
            .where('teacherId', '==', currentUser.uid)
            .get()
            .then((querySnapshot) => {
                totalQuizzesElement.textContent = querySnapshot.size;
            });
        
        // Load students count (simplified - in a real app, you'd have a proper relationship)
        db.collection('users')
            .where('role', '==', 'student')
            .get()
            .then((querySnapshot) => {
                totalStudentsElement.textContent = querySnapshot.size;
            });
        
        // Load recent activity
        loadRecentActivity();
    }
    
    function loadLessons() {
        lessonsContainer.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-primary" role="status"></div></div>';
        
        db.collection('lessons')
            .where('teacherId', '==', currentUser.uid)
            .orderBy('createdAt', 'desc')
            .get()
            .then((querySnapshot) => {
                lessonsContainer.innerHTML = '';
                
                if (querySnapshot.empty) {
                    lessonsContainer.innerHTML = `
                        <div class="col-12">
                            <div class="card">
                                <div class="card-body text-center py-5">
                                    <i class="fas fa-book fa-3x text-muted mb-3"></i>
                                    <h5 class="card-title">No Lessons Yet</h5>
                                    <p class="card-text">Create your first lesson to get started.</p>
                                    <button class="btn btn-primary" id="addFirstLesson">Create Lesson</button>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    document.getElementById('addFirstLesson').addEventListener('click', showCreateLessonModal);
                    return;
                }
                
                querySnapshot.forEach((doc) => {
                    const lesson = doc.data();
                    const lessonId = doc.id;
                    
                    const lessonCard = `
                        <div class="col-md-6 col-lg-4">
                            <div class="card lesson-card h-100">
                                <div class="card-body">
                                    <h5 class="card-title">${lesson.title}</h5>
                                    <p class="card-text text-muted">${lesson.topic}</p>
                                    <p class="card-text">${lesson.content.substring(0, 100)}...</p>
                                    <div class="d-flex justify-content-between align-items-center">
                                        <small class="text-muted">${formatDate(lesson.createdAt)}</small>
                                        <div>
                                            <button class="btn btn-sm btn-outline-primary view-lesson" data-id="${lessonId}">View</button>
                                            <button class="btn btn-sm btn-outline-danger delete-lesson" data-id="${lessonId}">Delete</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    lessonsContainer.insertAdjacentHTML('beforeend', lessonCard);
                });
                
                // Add event listeners to view and delete buttons
                document.querySelectorAll('.view-lesson').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const lessonId = this.getAttribute('data-id');
                        viewLesson(lessonId);
                    });
                });
                
                document.querySelectorAll('.delete-lesson').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const lessonId = this.getAttribute('data-id');
                        deleteLesson(lessonId);
                    });
                });
            })
            .catch((error) => {
                console.error('Error loading lessons: ', error);
                lessonsContainer.innerHTML = '<div class="col-12"><div class="alert alert-danger">Error loading lessons</div></div>';
            });
    }
    
    function loadQuizzes() {
        quizzesContainer.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-primary" role="status"></div></div>';
        
        db.collection('quizzes')
            .where('teacherId', '==', currentUser.uid)
            .orderBy('createdAt', 'desc')
            .get()
            .then((querySnapshot) => {
                quizzesContainer.innerHTML = '';
                
                if (querySnapshot.empty) {
                    quizzesContainer.innerHTML = `
                        <div class="col-12">
                            <div class="card">
                                <div class="card-body text-center py-5">
                                    <i class="fas fa-question-circle fa-3x text-muted mb-3"></i>
                                    <h5 class="card-title">No Quizzes Yet</h5>
                                    <p class="card-text">Create your first quiz to get started.</p>
                                    <button class="btn btn-primary" id="addFirstQuiz">Create Quiz</button>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    document.getElementById('addFirstQuiz').addEventListener('click', showCreateQuizModal);
                    return;
                }
                
                querySnapshot.forEach((doc) => {
                    const quiz = doc.data();
                    const quizId = doc.id;
                    
                    const quizCard = `
                        <div class="col-md-6 col-lg-4">
                            <div class="card quiz-card h-100">
                                <div class="card-body">
                                    <h5 class="card-title">${quiz.title}</h5>
                                    <p class="card-text">${quiz.description || 'No description'}</p>
                                    <p class="card-text"><small class="text-muted">${quiz.questions.length} questions</small></p>
                                    <div class="d-flex justify-content-between align-items-center">
                                        <small class="text-muted">${formatDate(quiz.createdAt)}</small>
                                        <div>
                                            <button class="btn btn-sm btn-outline-primary view-quiz" data-id="${quizId}">View</button>
                                            <button class="btn btn-sm btn-outline-danger delete-quiz" data-id="${quizId}">Delete</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    quizzesContainer.insertAdjacentHTML('beforeend', quizCard);
                });
                
                // Add event listeners to view and delete buttons
                document.querySelectorAll('.view-quiz').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const quizId = this.getAttribute('data-id');
                        viewQuiz(quizId);
                    });
                });
                
                document.querySelectorAll('.delete-quiz').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const quizId = this.getAttribute('data-id');
                        deleteQuiz(quizId);
                    });
                });
            })
            .catch((error) => {
                console.error('Error loading quizzes: ', error);
                quizzesContainer.innerHTML = '<div class="col-12"><div class="alert alert-danger">Error loading quizzes</div></div>';
            });
    }
    
    function loadStudents() {
        // This would typically load student data and progress
        // For now, we'll just show a placeholder
        document.getElementById('studentsTable').innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status"></div>
                    <p class="mt-2">Loading student data...</p>
                </td>
            </tr>
        `;
        
        // In a real application, you would fetch student data and their progress
        // This is a simplified version
        setTimeout(() => {
            document.getElementById('studentsTable').innerHTML = `
                <tr>
                    <td>John Doe</td>
                    <td>john@example.com</td>
                    <td>5/10</td>
                    <td>85%</td>
                    <td>2 days ago</td>
                </tr>
                <tr>
                    <td>Jane Smith</td>
                    <td>jane@example.com</td>
                    <td>8/10</td>
                    <td>92%</td>
                    <td>1 day ago</td>
                </tr>
                <tr>
                    <td>Mike Johnson</td>
                    <td>mike@example.com</td>
                    <td>3/10</td>
                    <td>67%</td>
                    <td>5 days ago</td>
                </tr>
            `;
            
            // Initialize chart
            initProgressChart();
        }, 1000);
    }
    
    function loadDiscussions() {
        // This would load discussion data
        // For now, we'll show a placeholder
        document.getElementById('discussionsContainer').innerHTML = `
            <div class="text-center py-4">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="mt-2">Loading discussions...</p>
            </div>
        `;
        
        // In a real application, you would fetch discussion data
        setTimeout(() => {
            document.getElementById('discussionsContainer').innerHTML = `
                <div class="discussion-item">
                    <h6>Question about Lesson 1</h6>
                    <p class="mb-2">I'm having trouble understanding the concept in lesson 1. Can you explain it further?</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">By: John Doe • 2 days ago</small>
                        <button class="btn btn-sm btn-outline-primary">Reply</button>
                    </div>
                </div>
                <div class="discussion-item">
                    <h6>Clarification on Quiz 2</h6>
                    <p class="mb-2">For question 3, I thought the answer was B but the correct answer is marked as C. Can you clarify?</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">By: Jane Smith • 1 day ago</small>
                        <button class="btn btn-sm btn-outline-primary">Reply</button>
                    </div>
                </div>
            `;
        }, 1000);
    }
    
    function loadRecentActivity() {
        // This would load recent activity from Firestore
        // For now, we'll use some sample data
        const sampleActivities = [
            { type: 'lesson', text: 'Created lesson: Introduction to JavaScript', time: '2 hours ago' },
            { type: 'quiz', text: 'Created quiz: JavaScript Basics', time: '1 day ago' },
            { type: 'student', text: 'Graded assignments for 5 students', time: '2 days ago' },
            { type: 'lesson', text: 'Updated lesson: Advanced CSS Techniques', time: '3 days ago' }
        ];
        
        recentActivityElement.innerHTML = '';
        
        sampleActivities.forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item d-flex';
            
            let icon = '';
            let color = '';
            
            switch(activity.type) {
                case 'lesson':
                    icon = 'fa-book';
                    color = 'primary';
                    break;
                case 'quiz':
                    icon = 'fa-question-circle';
                    color = 'success';
                    break;
                case 'student':
                    icon = 'fa-user-graduate';
                    color = 'info';
                    break;
                default:
                    icon = 'fa-bell';
                    color = 'secondary';
            }
            
            activityItem.innerHTML = `
                <div class="flex-shrink-0">
                    <i class="fas ${icon} text-${color} me-3"></i>
                </div>
                <div class="flex-grow-1">
                    <p class="mb-1">${activity.text}</p>
                    <small class="text-muted">${activity.time}</small>
                </div>
            `;
            
            recentActivityElement.appendChild(activityItem);
        });
    }
    
    function addRecentActivity(text) {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item d-flex';
        
        activityItem.innerHTML = `
            <div class="flex-shrink-0">
                <i class="fas fa-bell text-primary me-3"></i>
            </div>
            <div class="flex-grow-1">
                <p class="mb-1">${text}</p>
                <small class="text-muted">Just now</small>
            </div>
        `;
        
        recentActivityElement.insertBefore(activityItem, recentActivityElement.firstChild);
        
        // Limit to 5 activities
        if (recentActivityElement.children.length > 5) {
            recentActivityElement.removeChild(recentActivityElement.lastChild);
        }
    }
    
    function viewLesson(lessonId) {
        // This would open a modal or navigate to a lesson view page
        alert(`View lesson with ID: ${lessonId}`);
    }
    
    function deleteLesson(lessonId) {
        if (confirm('Are you sure you want to delete this lesson?')) {
            db.collection('lessons').doc(lessonId).delete()
                .then(() => {
                    loadLessons();
                    loadDashboardData();
                    addRecentActivity('Deleted a lesson');
                })
                .catch((error) => {
                    console.error('Error deleting lesson: ', error);
                    alert('Error deleting lesson. Please try again.');
                });
        }
    }
    
    function viewQuiz(quizId) {
        // This would open a modal or navigate to a quiz view page
        alert(`View quiz with ID: ${quizId}`);
    }
    
    function deleteQuiz(quizId) {
        if (confirm('Are you sure you want to delete this quiz?')) {
            db.collection('quizzes').doc(quizId).delete()
                .then(() => {
                    loadQuizzes();
                    loadDashboardData();
                    addRecentActivity('Deleted a quiz');
                })
                .catch((error) => {
                    console.error('Error deleting quiz: ', error);
                    alert('Error deleting quiz. Please try again.');
                });
        }
    }
    
    function initProgressChart() {
        const ctx = document.getElementById('progressChart').getContext('2d');
        const progressChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['John Doe', 'Jane Smith', 'Mike Johnson'],
                datasets: [{
                    label: 'Quiz Scores (%)',
                    data: [85, 92, 67],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(255, 99, 132, 0.7)'
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 99, 132, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }
    
    // Add this function to both student.js and teacher.js
    function formatDate(timestamp) {
        if (!timestamp) return 'Unknown date';
        
        try {
            const date = timestamp.toDate();
            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                return '1 day ago';
            } else if (diffDays < 7) {
                return `${diffDays} days ago`;
            } else {
                return date.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                });
            }
        } catch (error) {
            return 'Unknown date';
        }
    }
});