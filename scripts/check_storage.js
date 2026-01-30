
import { createClient } from '@supabase/supabase-js';

import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

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
