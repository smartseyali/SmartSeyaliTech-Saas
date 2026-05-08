import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Browser-side Supabase client. null when env vars are not configured —
 * all callers must guard against null (hydration is optional/additive).
 */
export const supabase = url && key ? createClient(url, key) : null;
