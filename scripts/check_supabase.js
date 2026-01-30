
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
