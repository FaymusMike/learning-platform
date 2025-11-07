// Main JavaScript for common functionality across all pages
document.addEventListener('DOMContentLoaded', function() {
    // Contact form handling (for about page)
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // In a real application, you would send this data to a server
            // For now, we'll just show a success message
            alert('Thank you for your message! We will get back to you soon.');
            contactForm.reset();
        });
    }
    
    const YOUTUBE_API_KEY = 'AIzaSyA9Tzxs4nrdkflcGKslXo00lhlMP9EIIug';

    // Theme toggle functionality (dark/light mode)
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        // Check for saved theme preference or default to light
        const currentTheme = localStorage.getItem('theme') || 'light';
        
        // Apply the saved theme
        if (currentTheme === 'dark') {
            document.body.classList.add('dark-theme');
            themeToggle.checked = true;
        }
        
        // Toggle theme when switch is clicked
        themeToggle.addEventListener('change', function() {
            if (this.checked) {
                document.body.classList.add('dark-theme');
                localStorage.setItem('theme', 'dark');
            } else {
                document.body.classList.remove('dark-theme');
                localStorage.setItem('theme', 'light');
            }
        });
    }
    
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    const tooltipList = tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Add CSS for dark theme
    if (!document.querySelector('#dark-theme-styles')) {
        const darkThemeStyles = document.createElement('style');
        darkThemeStyles.id = 'dark-theme-styles';
        darkThemeStyles.textContent = `
            .dark-theme {
                background-color: #121212;
                color: #e0e0e0;
            }
            
            .dark-theme .card {
                background-color: #1e1e1e;
                color: #e0e0e0;
                border-color: #333;
            }
            
            .dark-theme .navbar {
                background-color: #1a1a1a !important;
            }
            
            .dark-theme .table {
                color: #e0e0e0;
            }
            
            .dark-theme .table-hover tbody tr:hover {
                background-color: #2a2a2a;
                color: #e0e0e0;
            }
            
            .dark-theme .form-control, 
            .dark-theme .form-select {
                background-color: #2a2a2a;
                border-color: #444;
                color: #e0e0e0;
            }
            
            .dark-theme .form-control:focus, 
            .dark-theme .form-select:focus {
                background-color: #2a2a2a;
                border-color: #0d6efd;
                color: #e0e0e0;
            }
            
            .dark-theme .modal-content {
                background-color: #1e1e1e;
                color: #e0e0e0;
            }
            
            .dark-theme .modal-header,
            .dark-theme .modal-footer {
                border-color: #333;
            }
            
            .dark-theme .btn-close {
                filter: invert(1);
            }
        `;
        document.head.appendChild(darkThemeStyles);
    }
    
    // Text-to-speech functionality
    window.textToSpeech = function(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.8;
            utterance.pitch = 1;
            window.speechSynthesis.speak(utterance);
        } else {
            alert('Text-to-speech is not supported in your browser');
        }
    };
    
    // Add text-to-speech buttons to lesson content
    const addTTSButtons = function() {
        const lessonContents = document.querySelectorAll('.lesson-content');
        lessonContents.forEach(content => {
            if (!content.querySelector('.tts-button')) {
                const ttsButton = document.createElement('button');
                ttsButton.className = 'btn btn-sm btn-outline-secondary tts-button';
                ttsButton.innerHTML = '<i class="fas fa-volume-up"></i>';
                ttsButton.title = 'Read aloud';
                ttsButton.addEventListener('click', function() {
                    window.textToSpeech(content.textContent);
                });
                content.parentNode.insertBefore(ttsButton, content);
            }
        });
    };
    
    // Initialize when DOM is ready
    addTTSButtons();
    
    // Service Worker registration for PWA
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/sw.js')
                .then(function(registration) {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                })
                .catch(function(error) {
                    console.log('ServiceWorker registration failed: ', error);
                });
        });
    }
    
    // Offline functionality
    window.addEventListener('online', function() {
        document.body.classList.remove('offline');
        // Show online notification
        showNotification('You are back online', 'success');
    });
    
    window.addEventListener('offline', function() {
        document.body.classList.add('offline');
        // Show offline notification
        showNotification('You are offline. Some features may not work.', 'warning');
    });
    
    // Notification function
    function showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 1050; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    // Service Worker registration for PWA
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/sw.js')  // Root path
                .then(function(registration) {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                })
                .catch(function(error) {
                    console.log('ServiceWorker registration failed: ', error);
                });
        });
    }
    
    // Add CSS for offline mode
    const offlineStyles = document.createElement('style');
    offlineStyles.textContent = `
        .offline .online-only {
            opacity: 0.5;
            pointer-events: none;
        }
        
        .offline::before {
            content: 'Offline';
            position: fixed;
            top: 10px;
            left: 10px;
            background: #ffc107;
            color: #000;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 1060;
        }
    `;
    document.head.appendChild(offlineStyles);
});