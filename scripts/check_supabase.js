
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jayhkbnjeroberonvthj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpheWhrYm5qZXJvYmVyb252dGhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxNDk1NTMsImV4cCI6MjA4MzcyNTU1M30.9aRHuRjQk7Gz26-3wrpPxg1ZZVnOD4qLa0U0hqfxOUM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const tables = [
    'users',
    'companies',
    'partners',
    'applications',
    'notifications',
    'frameworks',
    'collaborations',
    'messages'
];

async function checkTables() {
    console.log('--- Supabase Health Check ---');
    for (const table of tables) {
        try {
            const { data, error, count } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });
            
            if (error) {
                console.log(`[✖] Table "${table}": ${error.message}`);
            } else {
                console.log(`[✔] Table "${table}": Accessible (Count: ${count})`);
            }
        } catch (err) {
            console.log(`[✖] Table "${table}": Unexpected error - ${err.message}`);
        }
    }
}

checkTables();
