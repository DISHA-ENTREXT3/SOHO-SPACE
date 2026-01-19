
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

async function checkDetailed() {
    let report = 'SUPABASE HEALTH REPORT\n======================\n\n';
    
    for (const table of tables) {
        try {
            const { data, error, count } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });
            
            if (error) {
                report += `[FAIL] Table "${table}": ${error.message}\n`;
            } else {
                report += `[OK]   Table "${table}": Accessible. Row Count: ${count}\n`;
                
                // Try to get a sample row to check columns
                const { data: sample } = await supabase.from(table).select('*').limit(1);
                if (sample && sample.length > 0) {
                    report += `       Columns detected: ${Object.keys(sample[0]).join(', ')}\n`;
                }
            }
        } catch (err) {
            report += `[ERR]  Table "${table}": ${err.message}\n`;
        }
        report += '\n';
    }
    
    console.log(report);
}

checkDetailed();
