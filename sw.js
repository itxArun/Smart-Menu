self.addEventListener('install', (e) => {
    console.log('[NextPlate] Service Worker Installed');
});

self.addEventListener('fetch', (e) => {
    // Bas basic fetch logic taaki browser isko installable PWA maan le
});

