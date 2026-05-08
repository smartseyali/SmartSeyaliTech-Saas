import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null | undefined;

/**
 * Build-time Supabase client — server only, never sent to the browser.
 * Prefers SUPABASE_* (service role / anon, no NEXT_PUBLIC_ prefix) so the
 * service-role key stays out of the client bundle.
 * Falls back to the NEXT_PUBLIC_ variants if the server-only vars are absent.
 */
export function getServerSupabase(): SupabaseClient | null {
  if (_client !== undefined) return _client;

  const url =
    process.env.SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  _client =
    url && key
      ? createClient(url, key, {
          auth: { persistSession: false, autoRefreshToken: false },
        })
      : null;

  return _client;
}
