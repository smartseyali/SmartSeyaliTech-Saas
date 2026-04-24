/**
 * Supabase Client Initialization
 * Loaded via CDN in HTML pages, this file initializes the client
 */

let _supabase = null;

function getSupabase() {
  if (!_supabase) {
    if (!window.supabase) {
      console.error('Supabase CDN not loaded. Add the script tag before this file.');
      return null;
    }
    _supabase = window.supabase.createClient(
      STORE_CONFIG.supabaseUrl,
      STORE_CONFIG.supabaseAnonKey
    );
  }
  return _supabase;
}
