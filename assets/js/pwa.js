// LADDER - PWA Utilities Module
// Handles Progressive Web App functionality, service worker, and offline detection

// Service Worker Registration with Auto-Update Detection
export function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then((registration) => {
                    console.log('SW registered: ', registration);
                    
                    // Check for updates every 60 seconds
                    setInterval(() => {
                        registration.update();
                    }, 60000);
                    
                    // Listen for new service worker
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        console.log('New service worker found, updating...');
                        
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // New version available, reload automatically
                                console.log('New version available, reloading...');
                                window.location.reload();
                            }
                        });
                    });
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

// Viewport Height Management for iOS Safari and PWA Fullscreen
export function setupViewportHeight() {
    function setViewportHeight() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        
        // Handle fullscreen PWA mode
        if (window.navigator.standalone || window.matchMedia('(display-mode: fullscreen)').matches) {
            document.body.classList.add('pwa-fullscreen');
        }
    }
    
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);
    setViewportHeight();
}

// PWA Display Mode Detection
export function setupPWAMode() {
    // Detect if running as PWA
    const isStandalone = window.navigator.standalone || 
                        window.matchMedia('(display-mode: standalone)').matches ||
                        window.matchMedia('(display-mode: fullscreen)').matches;
    
    if (isStandalone) {
        document.body.classList.add('pwa-mode');
        console.log('Running as PWA');
    }
    
    // Handle status bar styling in PWA
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor && isStandalone) {
        // Ensure theme color is applied
        metaThemeColor.setAttribute('content', '#6aaa64');
    }
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
    setupPWAMode();
    setupConnectionMonitoring();
    
    console.log('PWA features initialized');
}