// LADDER - Supabase Configuration
// Database connection settings for production

// Note: In production, use environment variables for sensitive data
const supabaseUrl = 'https://btonnmoeaandberyszsm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0b25ubW9lYWFuZGJlcnlzenNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MzA5MzMsImV4cCI6MjA2OTQwNjkzM30.hNwKiVxvGum9QFLEWeJM_Ip30PBAmgBAi0nAR6KydZo';

// Initialize Supabase client (will be imported via CDN in index.html)
// The actual client creation happens in index.html with window.supabase
export const supabaseConfig = {
    url: supabaseUrl,
    anonKey: supabaseAnonKey
};

// This will be set by the main application after Supabase loads
export let supabase = null;

export function setSupabaseClient(client) {
    supabase = client;
} 