// LADDER - PWA Utilities Module
// Handles Progressive Web App functionality, service worker, and offline detection

// Service Worker Registration
export function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('SW registered: ', registration);
                })
                .catch((registrationError) => {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }
}

// Install Prompt Management
let deferredPrompt;
export function setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        // You could show a custom install button here
    });
}

// Viewport Height Management for iOS Safari
export function setupViewportHeight() {
    function setViewportHeight() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);
    setViewportHeight();
}

// Online/Offline Status Management
export function setupConnectionMonitoring() {
    window.addEventListener('online', () => {
        console.log('Connection restored');
        // Hide offline notice if showing
        document.getElementById('offline-notice').classList.remove('show');
    });
    
    window.addEventListener('offline', () => {
        console.log('Connection lost');
        // Show offline notice if user tries to interact
    });
}

// Show offline notice function
export function showOfflineNotice() {
    // Show landing page if hidden
    document.getElementById('landing-page').style.display = 'flex';
    document.getElementById('game-page').style.display = 'none';
    
    // Show offline notice
    document.getElementById('offline-notice').classList.add('show');
}

// Initialize all PWA features
export function initializePWA() {
    registerServiceWorker();
    setupInstallPrompt();
    setupViewportHeight();
    setupConnectionMonitoring();
    
    console.log('PWA features initialized');
}