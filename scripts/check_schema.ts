
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('Checking Companies Table Schema...');
  const { data: companies, error: companyError } = await supabase
    .from('companies')
    .select('*')
    .limit(1);

  if (companyError) {
    console.error('Error fetching companies:', companyError);
  } else if (companies && companies.length > 0) {
    console.log('Company keys:', Object.keys(companies[0]));
  } else {
    console.log('No companies found to check schema.');
  }

  console.log('\nChecking Partners Table Schema...');
  const { data: partners, error: partnerError } = await supabase
    .from('partners')
    .select('*')
    .limit(1);

  if (partnerError) {
    console.error('Error fetching partners:', partnerError);
  } else if (partners && partners.length > 0) {
    console.log('Partner keys:', Object.keys(partners[0]));
  } else {
    console.log('No partners found to check schema.');
  }
}

checkSchema();
