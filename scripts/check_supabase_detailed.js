
import { createClient } from '@supabase/supabase-js';

import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

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
