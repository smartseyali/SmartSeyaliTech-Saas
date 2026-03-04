import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

const lib = window.supabase;
if (!lib) {
    console.error('Supabase library not found! Ensure the CDN script is loaded.');
}

export const supabase = lib ? lib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
