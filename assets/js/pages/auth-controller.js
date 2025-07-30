// LADDER - Authentication Page Controller
// Manages login/signup UI and interactions

import { AuthService } from '../services/auth.js';

export class AuthController {
    constructor() {
        this.authService = new AuthService();
        this.currentView = 'login'; // 'login' or 'signup'
    }

    initialize() {
        this.setupEventListeners();
        this.showLogin(); // Start with login view
    }

    setupEventListeners() {
        // Login form
        const loginButton = document.getElementById('login-button');
        const loginForm = document.getElementById('login-form');
        
        if (loginButton) {
            loginButton.addEventListener('click', (e) => this.handleLogin(e));
        }
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Signup form
        const signupButton = document.getElementById('signup-button');
        const signupForm = document.getElementById('signup-form');
        
        if (signupButton) {
            signupButton.addEventListener('click', (e) => this.handleSignup(e));
        }
        
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        }

        // Password strength checker
        const passwordField = document.getElementById('signup-password');
        if (passwordField) {
            passwordField.addEventListener('input', (e) => this.updatePasswordStrength(e.target.value));
        }

        // Enter key handling
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                if (this.currentView === 'login') {
                    this.handleLogin(e);
                } else if (this.currentView === 'signup') {
                    this.handleSignup(e);
                }
            }
        });
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const button = document.getElementById('login-button');

        if (!email || !password) {
            this.showError('Please fill in all fields');
            return;
        }

        // Show loading state
        const originalText = button.textContent;
        button.textContent = 'Signing In...';
        button.disabled = true;

        try {
            const result = await this.authService.signIn(email, password);
            
            if (result.success) {
                this.showSuccess('Signed in successfully!');
                // Redirect to game after short delay
                setTimeout(() => {
                    this.showGame();
                }, 1000);
            } else {
                this.showError(result.error || 'Sign in failed');
            }
        } catch (error) {
            this.showError('An unexpected error occurred');
        } finally {
            button.textContent = originalText;
            button.disabled = false;
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm').value;
        const button = document.getElementById('signup-button');

        // Validation
        if (!email || !password || !confirmPassword) {
            this.showError('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            this.showError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            this.showError('Password must be at least 6 characters');
            return;
        }

        // Show loading state
        const originalText = button.textContent;
        button.textContent = 'Creating Account...';
        button.disabled = true;

        try {
            const result = await this.authService.signUp(email, password);
            
            if (result.success) {
                this.showSuccess('Account created! Check your email to verify.');
                // Switch to login view after short delay
                setTimeout(() => {
                    this.showLogin();
                }, 2000);
            } else {
                this.showError(result.error || 'Account creation failed');
            }
        } catch (error) {
            this.showError('An unexpected error occurred');
        } finally {
            button.textContent = originalText;
            button.disabled = false;
        }
    }

    updatePasswordStrength(password) {
        const strengthFill = document.getElementById('password-strength-fill');
        const strengthText = document.getElementById('password-strength-text');
        
        if (!strengthFill || !strengthText) return;

        let strength = 0;
        let strengthLabel = 'Weak';

        if (password.length >= 6) strength++;
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
        if (password.match(/\d/)) strength++;
        if (password.match(/[^a-zA-Z\d]/)) strength++;

        // Update visual indicator
        strengthFill.className = 'password-strength-fill';
        
        if (strength === 0) {
            strengthLabel = 'Too weak';
        } else if (strength === 1) {
            strengthLabel = 'Weak';
            strengthFill.classList.add('weak');
        } else if (strength === 2) {
            strengthLabel = 'Fair';
            strengthFill.classList.add('fair');
        } else if (strength === 3) {
            strengthLabel = 'Good';
            strengthFill.classList.add('good');
        } else if (strength === 4) {
            strengthLabel = 'Strong';
            strengthFill.classList.add('strong');
        }

        strengthText.textContent = strengthLabel;
    }

    showLogin() {
        this.currentView = 'login';
        document.getElementById('auth-page').style.display = 'flex';
        document.getElementById('signup-page').style.display = 'none';
        
        // Clear forms
        this.clearForms();
        
        // Focus email field
        setTimeout(() => {
            document.getElementById('login-email')?.focus();
        }, 100);
    }

    showSignup() {
        this.currentView = 'signup';
        document.getElementById('auth-page').style.display = 'none';
        document.getElementById('signup-page').style.display = 'flex';
        
        // Clear forms
        this.clearForms();
        
        // Focus email field
        setTimeout(() => {
            document.getElementById('signup-email')?.focus();
        }, 100);
    }

    showForgotPassword() {
        const email = prompt('Enter your email address:');
        if (email) {
            this.authService.resetPassword(email).then(result => {
                if (result.success) {
                    this.showSuccess('Password reset email sent!');
                } else {
                    this.showError(result.error || 'Failed to send reset email');
                }
            });
        }
    }

    clearForms() {
        // Clear all form fields
        const inputs = document.querySelectorAll('#auth-page input, #signup-page input');
        inputs.forEach(input => input.value = '');
        
        // Clear error messages
        this.hideMessages();
    }

    showError(message) {
        this.showToast(message, 'error');
    }

    showSuccess(message) {
        this.showToast(message, 'success');
    }

    showToast(message, type = 'info') {
        // Remove existing toasts
        const existingToasts = document.querySelectorAll('.toast');
        existingToasts.forEach(toast => toast.remove());

        // Create new toast
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        // Show toast
        setTimeout(() => toast.classList.add('show'), 100);

        // Hide toast after 4 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    hideMessages() {
        const toasts = document.querySelectorAll('.toast');
        toasts.forEach(toast => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        });
    }

    showGame() {
        // Navigate back to game
        window.location.hash = '#game';
    }
}

// Global functions for HTML onclick handlers
window.showSignup = () => {
    const authController = window.authController;
    if (authController) {
        authController.showSignup();
    }
};

window.showLogin = () => {
    const authController = window.authController;
    if (authController) {
        authController.showLogin();
    }
};

window.showForgotPassword = () => {
    const authController = window.authController;
    if (authController) {
        authController.showForgotPassword();
    }
};

window.showGame = () => {
    window.location.hash = '#game';
};