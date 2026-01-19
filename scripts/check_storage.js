
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jayhkbnjeroberonvthj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpheWhrYm5qZXJvYmVyb252dGhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxNDk1NTMsImV4cCI6MjA4MzcyNTU1M30.9aRHuRjQk7Gz26-3wrpPxg1ZZVnOD4qLa0U0hqfxOUM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkStorage() {
    console.log('--- Supabase Storage Check ---');
    const buckets = ['avatars', 'logos', 'documents'];
    for (const bucket of buckets) {
        const { data, error } = await supabase.storage.getBucket(bucket);
        if (error) {
            console.log(`[✖] Bucket "${bucket}": ${error.message} (Likely missing or private)`);
        } else {
            console.log(`[✔] Bucket "${bucket}": Found and Accessible`);
        }
    }
}

checkStorage();
