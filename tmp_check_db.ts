import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
    const { data, error } = await supabase.from('system_modules').select('*').limit(1);
    if (error) {
        console.error('Error fetching modules:', error);
        return;
    }
    if (data && data.length > 0) {
        console.log('Columns in system_modules:', Object.keys(data[0]));
    } else {
        console.log('No data in system_modules to check columns.');
    }
}

checkSchema();
