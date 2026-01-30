import { createClient } from '@supabase/supabase-js';

// @ts-ignore - Vite env variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// @ts-ignore - Vite env variables
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials missing. Please check your .env file.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);
