// LADDER - Profile Page Controller
// Manages profile page UI and interactions

import { UserService } from '../services/user.js';
import { AuthService } from '../services/auth.js';

export class ProfileController {
    constructor() {
        this.userService = new UserService();
        this.authService = new AuthService();
        this.currentUser = null;
    }

    async initialize() {
        this.currentUser = await this.authService.getCurrentUser();
        
        if (!this.currentUser) {
            // Redirect to auth if not logged in
            this.showAuth();
            return;
        }

        await this.loadProfileData();
        this.setupEventListeners();
    }

    async loadProfileData() {
        // Load profile
        const profileResult = await this.userService.getUserProfile(this.currentUser.id);
        if (profileResult.success) {
            this.displayProfile(profileResult.profile);
        }

        // Load stats
        const statsResult = await this.userService.getUserStats(this.currentUser.id);
        if (statsResult.success) {
            this.displayStats(statsResult.stats);
        }

        // Load recent sessions
        const sessionsResult = await this.userService.getRecentSessions(this.currentUser.id);
        if (sessionsResult.success) {
            this.displayRecentActivity(sessionsResult.sessions);
            
            // Calculate and display achievements
            const achievements = this.userService.calculateAchievements(
                statsResult.stats || [], 
                sessionsResult.sessions || []
            );
            this.displayAchievements(achievements);
        }
    }

    displayProfile(profile) {
        document.getElementById('profile-name').textContent = profile.full_name || 'Anonymous Player';
        document.getElementById('profile-username').textContent = `@${profile.username || 'player'}`;
        
        const avatar = document.getElementById('profile-avatar');
        avatar.textContent = this.userService.getUserInitials(profile.full_name);
    }

    displayStats(stats) {
        const latestStats = stats[0] || {};
        
        document.getElementById('total-puzzles').textContent = latestStats.total_puzzles_completed || 0;
        document.getElementById('current-streak').textContent = latestStats.current_streak || 0;
        document.getElementById('best-time').textContent = 
            this.userService.formatTime(latestStats.best_completion_time);
        document.getElementById('avg-time').textContent = 
            this.userService.formatTime(latestStats.average_completion_time);
    }

    displayAchievements(achievements) {
        const achievementGrid = document.getElementById('achievement-grid');
        achievementGrid.innerHTML = '';

        const achievementList = [
            { key: 'firstPuzzle', icon: '🎯', title: 'First Steps' },
            { key: 'streakWeek', icon: '🔥', title: '7 Day Streak' },
            { key: 'streakMonth', icon: '🏆', title: '30 Day Streak' },
            { key: 'speedDemon', icon: '⚡', title: 'Speed Demon' },
            { key: 'perfectDay', icon: '💎', title: 'Perfect Game' },
            { key: 'dedicated', icon: '🎖️', title: 'Dedicated Player' },
            { key: 'earlyBird', icon: '🌅', title: 'Early Bird' },
            { key: 'nightOwl', icon: '🦉', title: 'Night Owl' }
        ];

        achievementList.forEach(achievement => {
            const badge = document.createElement('div');
            badge.className = `achievement-badge ${achievements[achievement.key] ? 'earned' : ''}`;
            badge.textContent = achievement.icon;
            badge.title = achievement.title;
            achievementGrid.appendChild(badge);
        });
    }

    displayRecentActivity(sessions) {
        const activityList = document.getElementById('activity-list');
        activityList.innerHTML = '';

        if (sessions.length === 0) {
            activityList.innerHTML = '<p>No recent activity</p>';
            return;
        }

        sessions.slice(0, 10).forEach(session => {
            const item = document.createElement('div');
            item.className = 'activity-item';
            
            const completed = session.completed_at ? 'Completed' : 'Started';
            const time = session.completion_time ? 
                ` in ${this.userService.formatTime(session.completion_time)}` : '';
            
            item.innerHTML = `
                <div class="activity-description">
                    ${completed} Puzzle #${session.puzzle_number}${time}
                </div>
                <div class="activity-time">
                    ${this.formatRelativeTime(session.created_at)}
                </div>
            `;
            
            activityList.appendChild(item);
        });
    }

    setupEventListeners() {
        // Add event listeners for profile interactions
    }

    formatRelativeTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        
        return date.toLocaleDateString();
    }

    showAuth() {
        // Navigate to auth page
        window.location.hash = '#auth';
    }

    showGame() {
        // Navigate back to game
        window.location.hash = '#game';
    }

    showSettings() {
        // Show settings modal or page
        console.log('Settings not implemented yet');
    }
}

// Global functions for HTML onclick handlers
window.showGame = () => {
    window.location.hash = '#game';
};

window.showSettings = () => {
    console.log('Settings not implemented yet');
};