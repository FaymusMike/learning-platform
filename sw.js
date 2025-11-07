// Service Worker for PWA functionality
const CACHE_NAME = 'learnhub-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/auth.html',
  '/teacher-dashboard.html',
  '/student-dashboard.html',
  '/about.html',
  '/css/style.css',
  '/css/responsive.css',
  '/js/main.js',
  '/js/auth.js',
  '/js/teacher.js',
  '/js/student.js',
  '/js/firebase-config.js',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap'
];

// Install event
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

// Skip waiting for existing service workers
self.addEventListener('install', function(event) {
    self.skipWaiting();
});

// Take control immediately
self.addEventListener('activate', function(event) {
    event.waitUntil(self.clients.claim());
});

// Fetch event
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Activate event
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});