// Student Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'student') {
        window.location.href = 'auth.html';
        return;
    }
    
    // DOM Elements
    const studentNameElement = document.getElementById('studentName');
    const logoutBtn = document.getElementById('logoutBtn');
    const tabLinks = document.querySelectorAll('[data-tab]');
    const tabs = document.querySelectorAll('.dashboard-tab');
    
    const enrolledCoursesElement = document.getElementById('enrolledCourses');
    const completedLessonsElement = document.getElementById('completedLessons');
    const takenQuizzesElement = document.getElementById('takenQuizzes');
    const avgQuizScoreElement = document.getElementById('avgQuizScore');
    
    const completionPercentageElement = document.getElementById('completionPercentage');
    const completionProgressElement = document.getElementById('completionProgress');
    const quizScorePercentageElement = document.getElementById('quizScorePercentage');
    const quizScoreProgressElement = document.getElementById('quizScoreProgress');
    
    const coursesContainer = document.getElementById('coursesContainer');
    const quizzesContainer = document.getElementById('quizzesContainer');
    const recentActivityElement = document.getElementById('recentActivity');
    const recommendedCoursesElement = document.getElementById('recommendedCourses');
    const progressTableElement = document.getElementById('progressTable');
    
    const courseDetailModal = new bootstrap.Modal(document.getElementById('courseDetailModal'));
    const quizModal = new bootstrap.Modal(document.getElementById('quizModal'));
    
    const newDiscussionForm = document.getElementById('newDiscussionForm');
    const discussionsContainer = document.getElementById('discussionsContainer');

    const YOUTUBE_API_KEY = 'AIzaSyA9Tzxs4nrdkflcGKslXo00lhlMP9EIIug';
    
    // Set student name
    if (currentUser.firstName) {
        studentNameElement.textContent = currentUser.firstName;
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
                case 'courses':
                    loadCourses();
                    break;
                case 'quizzes':
                    loadQuizzes();
                    break;
                case 'progress':
                    loadProgress();
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
    
    // New discussion form submission
    if (newDiscussionForm) {
        newDiscussionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('discussionTitle').value;
            const content = document.getElementById('discussionContent').value;
            
            if (!title || !content) {
                alert('Please fill in all fields');
                return;
            }
            
            const discussionData = {
                title: title,
                content: content,
                studentId: currentUser.uid,
                studentName: currentUser.firstName + ' ' + currentUser.lastName,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                replies: []
            };
            
            // Save to Firestore
            db.collection('discussions').add(discussionData)
                .then((docRef) => {
                    console.log('Discussion saved with ID: ', docRef.id);
                    newDiscussionForm.reset();
                    loadDiscussions();
                    
                    // Add to recent activity
                    addRecentActivity(`Posted discussion: ${title}`);
                })
                .catch((error) => {
                    console.error('Error saving discussion: ', error);
                    alert('Error saving discussion. Please try again.');
                });
        });
    }
    
    // Load initial data
    loadDashboardData();
    
    // Functions
    function loadDashboardData() {
        // Load courses count
        db.collection('lessons').get()
            .then((querySnapshot) => {
                enrolledCoursesElement.textContent = querySnapshot.size;
            });
        
        // Load completed lessons count (simplified)
        // In a real app, you'd track which lessons each student has completed
        completedLessonsElement.textContent = '3';
        
        // Load quizzes taken count (simplified)
        takenQuizzesElement.textContent = '2';
        
        // Load average quiz score (simplified)
        avgQuizScoreElement.textContent = '85%';
        
        // Update progress bars
        completionPercentageElement.textContent = '30%';
        completionProgressElement.style.width = '30%';
        
        quizScorePercentageElement.textContent = '85%';
        quizScoreProgressElement.style.width = '85%';
        
        // Load recent activity
        loadRecentActivity();
        
        // Load recommended courses
        loadRecommendedCourses();
    }
    
    function loadCourses() {
        coursesContainer.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-primary" role="status"></div></div>';
        
        db.collection('lessons')
            .orderBy('createdAt', 'desc')
            .get()
            .then((querySnapshot) => {
                coursesContainer.innerHTML = '';
                
                if (querySnapshot.empty) {
                    coursesContainer.innerHTML = `
                        <div class="col-12">
                            <div class="card">
                                <div class="card-body text-center py-5">
                                    <i class="fas fa-book fa-3x text-muted mb-3"></i>
                                    <h5 class="card-title">No Courses Available</h5>
                                    <p class="card-text">Check back later for new courses.</p>
                                </div>
                            </div>
                        </div>
                    `;
                    return;
                }
                
                querySnapshot.forEach((doc) => {
                    const lesson = doc.data();
                    const lessonId = doc.id;
                    
                    // Check if lesson is completed (simplified)
                    const completed = Math.random() > 0.7;
                    
                    const courseCard = `
                        <div class="col-md-6 col-lg-4">
                            <div class="card course-card h-100">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-start mb-2">
                                        <h5 class="card-title">${lesson.title}</h5>
                                        ${completed ? '<span class="badge bg-success">Completed</span>' : ''}
                                    </div>
                                    <p class="card-text text-muted">${lesson.topic}</p>
                                    <p class="card-text">${lesson.content.substring(0, 100)}...</p>
                                    <div class="d-flex justify-content-between align-items-center">
                                        <small class="text-muted">By: ${lesson.teacherName}</small>
                                        <button class="btn btn-sm btn-primary view-course" data-id="${lessonId}">View</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    coursesContainer.insertAdjacentHTML('beforeend', courseCard);
                });
                
                // Add event listeners to view buttons
                document.querySelectorAll('.view-course').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const courseId = this.getAttribute('data-id');
                        viewCourse(courseId);
                    });
                });
            })
            .catch((error) => {
                console.error('Error loading courses: ', error);
                coursesContainer.innerHTML = '<div class="col-12"><div class="alert alert-danger">Error loading courses</div></div>';
            });
    }
    
    function loadQuizzes() {
        quizzesContainer.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-primary" role="status"></div></div>';
        
        db.collection('quizzes')
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
                                    <h5 class="card-title">No Quizzes Available</h5>
                                    <p class="card-text">Check back later for new quizzes.</p>
                                </div>
                            </div>
                        </div>
                    `;
                    return;
                }
                
                querySnapshot.forEach((doc) => {
                    const quiz = doc.data();
                    const quizId = doc.id;
                    
                    // Check if quiz is taken (simplified)
                    const taken = Math.random() > 0.5;
                    const score = taken ? Math.floor(Math.random() * 30) + 70 : null;
                    
                    const quizCard = `
                        <div class="col-md-6 col-lg-4">
                            <div class="card quiz-card h-100">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-start mb-2">
                                        <h5 class="card-title">${quiz.title}</h5>
                                        ${taken ? `<span class="badge bg-info">Score: ${score}%</span>` : ''}
                                    </div>
                                    <p class="card-text">${quiz.description || 'No description'}</p>
                                    <p class="card-text"><small class="text-muted">${quiz.questions.length} questions</small></p>
                                    <div class="d-flex justify-content-between align-items-center">
                                        <small class="text-muted">By: ${quiz.teacherName}</small>
                                        <button class="btn btn-sm btn-primary take-quiz" data-id="${quizId}" ${taken ? 'disabled' : ''}>
                                            ${taken ? 'Completed' : 'Take Quiz'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    quizzesContainer.insertAdjacentHTML('beforeend', quizCard);
                });
                
                // Add event listeners to take quiz buttons
                document.querySelectorAll('.take-quiz').forEach(btn => {
                    if (!btn.disabled) {
                        btn.addEventListener('click', function() {
                            const quizId = this.getAttribute('data-id');
                            takeQuiz(quizId);
                        });
                    }
                });
            })
            .catch((error) => {
                console.error('Error loading quizzes: ', error);
                quizzesContainer.innerHTML = '<div class="col-12"><div class="alert alert-danger">Error loading quizzes</div></div>';
            });
    }
    
    function loadProgress() {
        // Initialize charts
        initProgressCharts();
        
        // Load progress table (simplified)
        progressTableElement.innerHTML = `
            <tr>
                <td>Introduction to JavaScript</td>
                <td>5</td>
                <td>10</td>
                <td>50%</td>
                <td>2 days ago</td>
            </tr>
            <tr>
                <td>CSS Fundamentals</td>
                <td>8</td>
                <td>8</td>
                <td>100%</td>
                <td>1 day ago</td>
            </tr>
            <tr>
                <td>HTML Basics</td>
                <td>3</td>
                <td>5</td>
                <td>60%</td>
                <td>5 days ago</td>
            </tr>
        `;
    }
    
    function loadDiscussions() {
        discussionsContainer.innerHTML = '<div class="text-center py-4"><div class="spinner-border text-primary" role="status"></div><p class="mt-2">Loading discussions...</p></div>';
        
        db.collection('discussions')
            .orderBy('createdAt', 'desc')
            .limit(10)
            .get()
            .then((querySnapshot) => {
                discussionsContainer.innerHTML = '';
                
                if (querySnapshot.empty) {
                    discussionsContainer.innerHTML = `
                        <div class="text-center py-4">
                            <i class="fas fa-comments fa-3x text-muted mb-3"></i>
                            <h5>No Discussions Yet</h5>
                            <p class="text-muted">Be the first to start a discussion!</p>
                        </div>
                    `;
                    return;
                }
                
                querySnapshot.forEach((doc) => {
                    const discussion = doc.data();
                    const discussionId = doc.id;
                    
                    const discussionItem = document.createElement('div');
                    discussionItem.className = 'discussion-item';
                    
                    discussionItem.innerHTML = `
                        <h6>${discussion.title}</h6>
                        <p class="mb-2">${discussion.content}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">By: ${discussion.studentName} • ${formatDate(discussion.createdAt)}</small>
                            <button class="btn btn-sm btn-outline-primary reply-discussion" data-id="${discussionId}">Reply</button>
                        </div>
                        ${discussion.replies && discussion.replies.length > 0 ? `
                            <div class="discussion-replies mt-3">
                                ${discussion.replies.map(reply => `
                                    <div class="discussion-reply">
                                        <p class="mb-1">${reply.content}</p>
                                        <small class="text-muted">By: ${reply.teacherName || reply.studentName} • ${formatDate(reply.createdAt)}</small>
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    `;
                    
                    discussionsContainer.appendChild(discussionItem);
                });
                
                // Add event listeners to reply buttons
                document.querySelectorAll('.reply-discussion').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const discussionId = this.getAttribute('data-id');
                        // In a real app, this would open a reply form
                        alert(`Reply to discussion with ID: ${discussionId}`);
                    });
                });
            })
            .catch((error) => {
                console.error('Error loading discussions: ', error);
                discussionsContainer.innerHTML = '<div class="alert alert-danger">Error loading discussions</div>';
            });
    }
    
    function loadRecentActivity() {
        // This would load recent activity from Firestore
        // For now, we'll use some sample data
        const sampleActivities = [
            { type: 'lesson', text: 'Completed lesson: Introduction to JavaScript', time: '2 hours ago' },
            { type: 'quiz', text: 'Scored 85% on JavaScript Basics quiz', time: '1 day ago' },
            { type: 'lesson', text: 'Started lesson: Advanced CSS Techniques', time: '2 days ago' },
            { type: 'discussion', text: 'Posted a question in discussions', time: '3 days ago' }
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
                case 'discussion':
                    icon = 'fa-comments';
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
    
    function loadRecommendedCourses() {
        // This would load recommended courses based on student's progress and interests
        // For now, we'll use some sample data
        const sampleCourses = [
            { title: 'Advanced JavaScript', topic: 'Programming', teacher: 'Dr. Smith' },
            { title: 'Responsive Web Design', topic: 'Web Development', teacher: 'Prof. Johnson' },
            { title: 'Database Fundamentals', topic: 'Computer Science', teacher: 'Dr. Williams' }
        ];
        
        recommendedCoursesElement.innerHTML = '';
        
        sampleCourses.forEach(course => {
            const courseItem = document.createElement('div');
            courseItem.className = 'mb-3 pb-3 border-bottom';
            
            courseItem.innerHTML = `
                <h6 class="mb-1">${course.title}</h6>
                <p class="mb-1 text-muted small">${course.topic}</p>
                <p class="mb-0 small">By: ${course.teacher}</p>
            `;
            
            recommendedCoursesElement.appendChild(courseItem);
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
        
        if (recentActivityElement.firstChild) {
            recentActivityElement.insertBefore(activityItem, recentActivityElement.firstChild);
        } else {
            recentActivityElement.appendChild(activityItem);
        }
        
        // Limit to 5 activities
        if (recentActivityElement.children.length > 5) {
            recentActivityElement.removeChild(recentActivityElement.lastChild);
        }
    }
    
    function viewCourse(courseId) {
        db.collection('lessons').doc(courseId).get()
            .then((doc) => {
                if (doc.exists) {
                    const lesson = doc.data();
                    
                    document.getElementById('courseModalTitle').textContent = lesson.title;
                    
                    let resourcesHtml = '';
                    if (lesson.resourceLinks && lesson.resourceLinks.length > 0) {
                        resourcesHtml = `
                            <h6>Resources:</h6>
                            <ul>
                                ${lesson.resourceLinks.map(link => `<li><a href="${link}" target="_blank">${link}</a></li>`).join('')}
                            </ul>
                        `;
                    }
                    
                    let videoHtml = '';
                    if (lesson.videoLink) {
                        videoHtml = `
                            <div class="mb-4">
                                <h6>Video Lesson:</h6>
                                <div class="ratio ratio-16x9">
                                    <iframe src="${embedYouTubeUrl(lesson.videoLink)}" allowfullscreen></iframe>
                                </div>
                            </div>
                        `;
                    }
                    
                    document.getElementById('courseModalContent').innerHTML = `
                        <div class="mb-3">
                            <h6>Topic:</h6>
                            <p>${lesson.topic}</p>
                        </div>
                        ${videoHtml}
                        <div class="mb-3">
                            <h6>Content:</h6>
                            <p>${lesson.content}</p>
                        </div>
                        ${resourcesHtml}
                    `;
                    
                    // Update mark complete button
                    const markCompleteBtn = document.getElementById('markCompleteBtn');
                    markCompleteBtn.setAttribute('data-id', courseId);
                    markCompleteBtn.onclick = function() {
                        markLessonComplete(courseId);
                    };
                    
                    courseDetailModal.show();
                } else {
                    alert('Course not found');
                }
            })
            .catch((error) => {
                console.error('Error loading course: ', error);
                alert('Error loading course. Please try again.');
            });
    }
    
    function markLessonComplete(lessonId) {
        // In a real app, you would save this to Firestore
        // For now, we'll just show a confirmation
        alert(`Marked lesson as complete!`);
        courseDetailModal.hide();
        
        // Update dashboard
        const currentCompleted = parseInt(completedLessonsElement.textContent);
        completedLessonsElement.textContent = currentCompleted + 1;
        
        // Update progress
        const newCompletion = Math.min(100, Math.floor((currentCompleted + 1) / 10 * 100));
        completionPercentageElement.textContent = `${newCompletion}%`;
        completionProgressElement.style.width = `${newCompletion}%`;
        
        // Add to recent activity
        addRecentActivity('Completed a lesson');
    }
    
    function takeQuiz(quizId) {
        db.collection('quizzes').doc(quizId).get()
            .then((doc) => {
                if (doc.exists) {
                    const quiz = doc.data();
                    
                    document.getElementById('quizModalTitle').textContent = quiz.title;
                    
                    let questionsHtml = '';
                    quiz.questions.forEach((question, index) => {
                        let optionsHtml = '';
                        
                        if (question.type === 'multiple' || question.type === 'truefalse') {
                            optionsHtml = question.options.map((option, optIndex) => `
                                <div class="form-check mb-2">
                                    <input class="form-check-input" type="radio" name="question-${index}" id="q${index}-opt${optIndex}" value="${option}">
                                    <label class="form-check-label" for="q${index}-opt${optIndex}">
                                        ${option}
                                    </label>
                                </div>
                            `).join('');
                        } else if (question.type === 'short') {
                            optionsHtml = `
                                <div class="mb-2">
                                    <textarea class="form-control" name="question-${index}" rows="2" placeholder="Your answer..."></textarea>
                                </div>
                            `;
                        }
                        
                        questionsHtml += `
                            <div class="quiz-question mb-4 p-3 border rounded">
                                <h6>Question ${index + 1}</h6>
                                <p class="mb-3">${question.text}</p>
                                ${optionsHtml}
                            </div>
                        `;
                    });
                    
                    document.getElementById('quizModalContent').innerHTML = questionsHtml;
                    
                    // Update submit button
                    const submitQuizBtn = document.getElementById('submitQuizBtn');
                    submitQuizBtn.setAttribute('data-id', quizId);
                    submitQuizBtn.onclick = function() {
                        submitQuiz(quizId, quiz.questions);
                    };
                    
                    quizModal.show();
                } else {
                    alert('Quiz not found');
                }
            })
            .catch((error) => {
                console.error('Error loading quiz: ', error);
                alert('Error loading quiz. Please try again.');
            });
    }
    
    function submitQuiz(quizId, questions) {
        let score = 0;
        const totalQuestions = questions.length;
        
        questions.forEach((question, index) => {
            const answerElement = document.querySelector(`input[name="question-${index}"]:checked`);
            const answerTextarea = document.querySelector(`textarea[name="question-${index}"]`);
            
            if (question.type === 'multiple' || question.type === 'truefalse') {
                if (answerElement && answerElement.value === question.correctAnswer) {
                    score++;
                }
            } else if (question.type === 'short') {
                // For short answers, we'd need a more sophisticated checking mechanism
                // For now, we'll give points for any non-empty answer
                if (answerTextarea && answerTextarea.value.trim() !== '') {
                    score++;
                }
            }
        });
        
        const percentage = Math.round((score / totalQuestions) * 100);
        
        // In a real app, you would save the quiz result to Firestore
        // For now, we'll just show the result
        quizModal.hide();
        alert(`Quiz submitted! Your score: ${percentage}%`);
        
        // Update dashboard
        const currentTaken = parseInt(takenQuizzesElement.textContent);
        takenQuizzesElement.textContent = currentTaken + 1;
        
        // Update average score (simplified)
        const currentAvg = parseInt(avgQuizScoreElement.textContent);
        const newAvg = Math.round((currentAvg + percentage) / 2);
        avgQuizScoreElement.textContent = `${newAvg}%`;
        
        // Update progress
        quizScorePercentageElement.textContent = `${newAvg}%`;
        quizScoreProgressElement.style.width = `${newAvg}%`;
        
        // Add to recent activity
        addRecentActivity(`Scored ${percentage}% on a quiz`);
        
        // Reload quizzes to update the UI
        loadQuizzes();
    }
    
    function initProgressCharts() {
        // Course Progress Chart
        const courseProgressCtx = document.getElementById('courseProgressChart').getContext('2d');
        const courseProgressChart = new Chart(courseProgressCtx, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'In Progress', 'Not Started'],
                datasets: [{
                    data: [30, 20, 50],
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(255, 205, 86, 0.7)',
                        'rgba(255, 99, 132, 0.7)'
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 205, 86, 1)',
                        'rgba(255, 99, 132, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                    },
                    title: {
                        display: true,
                        text: 'Course Completion'
                    }
                }
            }
        });
        
        // Quiz Performance Chart
        const quizPerformanceCtx = document.getElementById('quizPerformanceChart').getContext('2d');
        const quizPerformanceChart = new Chart(quizPerformanceCtx, {
            type: 'line',
            data: {
                labels: ['Quiz 1', 'Quiz 2', 'Quiz 3', 'Quiz 4', 'Quiz 5'],
                datasets: [{
                    label: 'Quiz Scores',
                    data: [75, 85, 70, 90, 80],
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Quiz Performance Over Time'
                    }
                }
            }
        });
    }
    
    function embedYouTubeUrl(url) {
        // Simple function to convert YouTube URL to embed URL
        // This is a basic implementation - a real app would need more robust handling
        if (url.includes('youtube.com/watch?v=')) {
            const videoId = url.split('v=')[1];
            const ampersandPosition = videoId.indexOf('&');
            if (ampersandPosition !== -1) {
                return `https://www.youtube.com/embed/${videoId.substring(0, ampersandPosition)}`;
            }
            return `https://www.youtube.com/embed/${videoId}`;
        } else if (url.includes('youtu.be/')) {
            const videoId = url.split('youtu.be/')[1];
            return `https://www.youtube.com/embed/${videoId}`;
        }
        return url;
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