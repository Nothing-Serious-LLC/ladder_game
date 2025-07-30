import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://btonnmoeaandberyszsm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0b25ubW9lYWFuZGJlcnlzenNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MzA5MzMsImV4cCI6MjA2OTQwNjkzM30.hNwKiVxvGum9QFLEWeJM_Ip30PBAmgBAi0nAR6KydZo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 