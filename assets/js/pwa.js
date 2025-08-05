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

// Push Notification Management
export async function setupPushNotifications() {
    // Check if push notifications are supported
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.log('Push notifications not supported');
        return false;
    }

    try {
        // Get service worker registration
        const registration = await navigator.serviceWorker.ready;
        
        // Check if already subscribed
        const existingSubscription = await registration.pushManager.getSubscription();
        
        if (existingSubscription) {
            console.log('Already subscribed to push notifications');
            return true;
        }

        // Request permission
        const permission = await Notification.requestPermission();
        
        if (permission !== 'granted') {
            console.log('Push notification permission denied');
            
            // Track permission denial
            if (typeof gtag !== 'undefined') {
                gtag('event', 'notification_permission_denied', {
                    event_category: 'PWA_Notifications',
                    event_label: 'Permission_Denied'
                });
            }
            return false;
        }

        // Subscribe to push notifications
        // Note: In production, you'll need a VAPID public key from your push service
        // For now, we'll set up the subscription framework
        console.log('Push notification permission granted');
        
        // Track permission granted
        if (typeof gtag !== 'undefined') {
            gtag('event', 'notification_permission_granted', {
                event_category: 'PWA_Notifications',
                event_label: 'Permission_Granted'
            });
        }

        return true;
    } catch (error) {
        console.error('Error setting up push notifications:', error);
        return false;
    }
}

// Show daily reminder permission request
export function showDailyReminderPrompt() {
    // Only show if PWA is installed
    const isPWA = window.navigator.standalone || 
                  window.matchMedia('(display-mode: standalone)').matches;
    
    if (!isPWA) {
        return;
    }

    // Check if user already made a decision
    const reminderDecision = localStorage.getItem('daily_reminder_decision');
    if (reminderDecision) {
        return;
    }

    // Show custom prompt (you can style this to match your theme)
    const shouldEnable = confirm(
        "🧩 Would you like daily puzzle reminders?\n\n" +
        "Get notified when each new LADDER puzzle is ready to solve!"
    );

    if (shouldEnable) {
        setupPushNotifications();
        localStorage.setItem('daily_reminder_decision', 'enabled');
        
        // Track opt-in
        if (typeof gtag !== 'undefined') {
            gtag('event', 'daily_reminder_opted_in', {
                event_category: 'PWA_Notifications',
                event_label: 'User_Opted_In'
            });
        }
    } else {
        localStorage.setItem('daily_reminder_decision', 'disabled');
        
        // Track opt-out
        if (typeof gtag !== 'undefined') {
            gtag('event', 'daily_reminder_opted_out', {
                event_category: 'PWA_Notifications',
                event_label: 'User_Opted_Out'
            });
        }
    }
}

// Test notification function (for development)
export async function sendTestNotification() {
    if (!('serviceWorker' in navigator)) {
        console.log('Service worker not supported');
        return;
    }

    const registration = await navigator.serviceWorker.ready;
    
    const options = {
        title: 'LADDER - Test Notification 🧩',
        body: 'This is a test notification for daily puzzle reminders!',
        icon: './assets/icons/icon-192.png',
        badge: './assets/icons/icon-192.png',
        tag: 'test-notification',
        requireInteraction: false,
        actions: [
            {
                action: 'play',
                title: 'Play Now'
            },
            {
                action: 'dismiss',
                title: 'Later'
            }
        ]
    };

    registration.showNotification(options.title, options);
    
    // Track test notification
    if (typeof gtag !== 'undefined') {
        gtag('event', 'test_notification_sent', {
            event_category: 'PWA_Notifications',
            event_label: 'Test_Notification'
        });
    }
}

// Initialize all PWA features
export function initializePWA() {
    registerServiceWorker();
    setupInstallPrompt();
    setupViewportHeight();
    setupPWAMode();
    setupConnectionMonitoring();
    
    // Set up push notifications for PWA users after a delay
    setTimeout(() => {
        showDailyReminderPrompt();
    }, 3000); // Wait 3 seconds after app load
    
    console.log('PWA features initialized');
}