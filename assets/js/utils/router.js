// LADDER - Simple Router for Single Page Application
// Handles navigation between game, profile, and auth views

import { LadderGame } from '../game.js';
import { ProfileController } from '../pages/profile-controller.js';
import { AuthController } from '../pages/auth-controller.js';

export class Router {
    constructor() {
        this.currentPage = null;
        this.controllers = {};
        this.setupRoutes();
        this.setupEventListeners();
    }

    setupRoutes() {
        this.routes = {
            'game': {
                element: 'game-page',
                controller: null, // Will be set when game starts
                requiresAuth: false
            },
            'profile': {
                element: 'profile-page',
                controller: ProfileController,
                requiresAuth: true
            },
            'auth': {
                element: 'auth-page',
                controller: AuthController,
                requiresAuth: false
            },
            'landing': {
                element: 'landing-page',
                controller: null,
                requiresAuth: false
            }
        };
    }

    setupEventListeners() {
        // Handle browser back/forward
        window.addEventListener('popstate', () => {
            this.handleRoute();
        });

        // Handle hash changes
        window.addEventListener('hashchange', () => {
            this.handleRoute();
        });
    }

    async handleRoute() {
        const hash = window.location.hash.slice(1) || 'landing';
        const route = this.routes[hash];

        if (!route) {
            // Unknown route, redirect to landing
            this.navigate('landing');
            return;
        }

        // Check authentication if required
        if (route.requiresAuth) {
            const authService = new (await import('../services/auth.js')).AuthService();
            const user = await authService.getCurrentUser();
            
            if (!user) {
                // Not authenticated, redirect to auth
                this.navigate('auth');
                return;
            }
        }

        // Hide all pages
        this.hideAllPages();

        // Show target page
        const pageElement = document.getElementById(route.element);
        if (pageElement) {
            pageElement.style.display = route.element === 'game-page' ? 'flex' : 'block';
        }

        // Initialize controller if needed
        if (route.controller && !this.controllers[hash]) {
            this.controllers[hash] = new route.controller();
            await this.controllers[hash].initialize();
        } else if (this.controllers[hash]) {
            // Reinitialize if needed
            if (this.controllers[hash].reinitialize) {
                await this.controllers[hash].reinitialize();
            }
        }

        this.currentPage = hash;
    }

    hideAllPages() {
        Object.values(this.routes).forEach(route => {
            const element = document.getElementById(route.element);
            if (element) {
                element.style.display = 'none';
            }
        });
    }

    navigate(page) {
        if (this.routes[page]) {
            window.location.hash = `#${page}`;
        }
    }

    // Initialize router and handle initial route
    async init() {
        // If no hash, start with landing page
        if (!window.location.hash) {
            window.location.hash = '#landing';
        }
        
        await this.handleRoute();
    }

    // Special method to register game controller when game starts
    setGameController(gameController) {
        this.controllers.game = gameController;
    }

    // Get current page
    getCurrentPage() {
        return this.currentPage;
    }

    // Check if we're on a specific page
    isCurrentPage(page) {
        return this.currentPage === page;
    }

    // Navigation helpers
    showLanding() {
        this.navigate('landing');
    }

    showGame() {
        this.navigate('game');
    }

    showProfile() {
        this.navigate('profile');
    }

    showAuth() {
        this.navigate('auth');
    }
}

// Create global router instance
export const router = new Router();