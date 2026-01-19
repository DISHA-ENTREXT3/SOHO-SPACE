import { createClient } from '@supabase/supabase-js';

// @ts-ignore - Vite env variables
const rawUrl = import.meta.env.VITE_SUPABASE_URL;
// @ts-ignore - Vite env variables
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isPlaceholder = (val?: string) => !val || val === 'your_supabase_url_here' || val === 'your_supabase_anon_key_here';

const supabaseUrl = !isPlaceholder(rawUrl) ? rawUrl : 'https://jayhkbnjeroberonvthj.supabase.co';
const supabaseAnonKey = !isPlaceholder(rawKey) ? rawKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpheWhrYm5qZXJvYmVyb252dGhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxNDk1NTMsImV4cCI6MjA4MzcyNTU1M30.9aRHuRjQk7Gz26-3wrpPxg1ZZVnOD4qLa0U0hqfxOUM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
