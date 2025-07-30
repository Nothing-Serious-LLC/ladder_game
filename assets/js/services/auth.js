// LADDER - Authentication Service
// Handles user authentication, registration, and session management

import { supabase } from '../../../config/supabase-config.js';

export class AuthService {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
    }

    // Sign up new user
    async signUp(email, password) {
        try {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
            });

            if (error) throw error;
            
            return { success: true, user: data.user };
        } catch (error) {
            console.error('Signup error:', error);
            return { success: false, error: error.message };
        }
    }

    // Sign in existing user
    async signIn(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) throw error;
            
            this.currentUser = data.user;
            this.isAuthenticated = true;
            
            return { success: true, user: data.user };
        } catch (error) {
            console.error('Signin error:', error);
            return { success: false, error: error.message };
        }
    }

    // Sign out user
    async signOut() {
        try {
            const { error } = await supabase.auth.signOut();
            
            if (error) throw error;
            
            this.currentUser = null;
            this.isAuthenticated = false;
            
            return { success: true };
        } catch (error) {
            console.error('Signout error:', error);
            return { success: false, error: error.message };
        }
    }

    // Get current user session
    async getCurrentUser() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (user) {
                this.currentUser = user;
                this.isAuthenticated = true;
            }
            
            return user;
        } catch (error) {
            console.error('Get user error:', error);
            return null;
        }
    }

    // Reset password
    async resetPassword(email) {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email);
            
            if (error) throw error;
            
            return { success: true };
        } catch (error) {
            console.error('Reset password error:', error);
            return { success: false, error: error.message };
        }
    }

    // Listen for auth state changes
    onAuthStateChange(callback) {
        return supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                this.currentUser = session.user;
                this.isAuthenticated = true;
            } else {
                this.currentUser = null;
                this.isAuthenticated = false;
            }
            
            callback(event, session);
        });
    }

    // Check if user is authenticated
    get authenticated() {
        return this.isAuthenticated;
    }

    // Get current user
    get user() {
        return this.currentUser;
    }
}