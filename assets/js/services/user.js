// LADDER - User Service
// Handles user profile data, statistics, and social features

import { supabase } from '../../../config/supabase-config.js';

export class UserService {
    constructor() {
        this.userProfile = null;
        this.userStats = null;
    }

    // Get user profile
    async getUserProfile(userId) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;

            this.userProfile = data;
            return { success: true, profile: data };
        } catch (error) {
            console.error('Get profile error:', error);
            return { success: false, error: error.message };
        }
    }

    // Update user profile
    async updateUserProfile(userId, updates) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;

            this.userProfile = data;
            return { success: true, profile: data };
        } catch (error) {
            console.error('Update profile error:', error);
            return { success: false, error: error.message };
        }
    }

    // Get user statistics
    async getUserStats(userId) {
        try {
            const { data, error } = await supabase
                .from('daily_stats')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            this.userStats = data;
            return { success: true, stats: data };
        } catch (error) {
            console.error('Get stats error:', error);
            return { success: false, error: error.message };
        }
    }

    // Get user's recent game sessions
    async getRecentSessions(userId, limit = 10) {
        try {
            const { data, error } = await supabase
                .from('game_sessions')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;

            return { success: true, sessions: data };
        } catch (error) {
            console.error('Get sessions error:', error);
            return { success: false, error: error.message };
        }
    }

    // Calculate user achievements
    calculateAchievements(stats, sessions) {
        const achievements = {
            firstPuzzle: sessions.length > 0,
            streakWeek: stats.some(s => s.current_streak >= 7),
            streakMonth: stats.some(s => s.current_streak >= 30),
            speedDemon: sessions.some(s => s.completion_time < 60), // Under 1 minute
            perfectDay: sessions.some(s => s.attempts_used === 1),
            dedicated: sessions.length >= 100,
            earlyBird: sessions.some(s => {
                const hour = new Date(s.created_at).getHours();
                return hour >= 5 && hour <= 8;
            }),
            nightOwl: sessions.some(s => {
                const hour = new Date(s.created_at).getHours();
                return hour >= 22 || hour <= 2;
            })
        };

        return achievements;
    }

    // Get leaderboard data
    async getLeaderboard(timeframe = 'all', limit = 50) {
        try {
            let query = supabase
                .from('daily_stats')
                .select(`
                    user_id,
                    profiles:user_id (username, full_name),
                    total_puzzles_completed,
                    average_completion_time,
                    current_streak,
                    best_streak
                `)
                .order('total_puzzles_completed', { ascending: false })
                .limit(limit);

            // Add time filtering if needed
            if (timeframe === 'week') {
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                query = query.gte('updated_at', oneWeekAgo.toISOString());
            } else if (timeframe === 'month') {
                const oneMonthAgo = new Date();
                oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                query = query.gte('updated_at', oneMonthAgo.toISOString());
            }

            const { data, error } = await query;

            if (error) throw error;

            return { success: true, leaderboard: data };
        } catch (error) {
            console.error('Get leaderboard error:', error);
            return { success: false, error: error.message };
        }
    }

    // Search for friends
    async searchUsers(searchTerm) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, username, full_name')
                .or(`username.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
                .limit(20);

            if (error) throw error;

            return { success: true, users: data };
        } catch (error) {
            console.error('Search users error:', error);
            return { success: false, error: error.message };
        }
    }

    // Format time for display
    formatTime(seconds) {
        if (!seconds) return '--';
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // Get user initials for avatar
    getUserInitials(name) {
        if (!name) return '?';
        
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }
}