// Simple service worker for PWA support
self.addEventListener('install', (event) => {
    console.log('Service Worker installing.');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activating.');
    return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // Let the browser handle all fetch requests normally
    // This is a minimal service worker just to enable PWA installation
});
