const SUPABASE_URL = "http://localhost:54321";
const SUPABASE_ANON_KEY = "your_anon_key";
const urlParams = new URLSearchParams(window.location.search);
const COMPANY_ID = parseInt(urlParams.get('company_id')) || 1;

export { SUPABASE_URL, SUPABASE_ANON_KEY, COMPANY_ID };
