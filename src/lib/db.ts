import { createClient } from '@supabase/supabase-js';
import PLATFORM_CONFIG from '@/config/platform';

/**
 * ═══════════════════════════════════════════════════════════════
 *  Unified SaaS Platform — Unified Database Bridge
 * ═══════════════════════════════════════════════════════════════
 * This file acts as a generic proxy for all database and auth 
 * interactions. It detects the provider from PLATFORM_CONFIG.
 * 
 * Future-proofing: By using this bridge, we can switch from 
 * Supabase to a custom VPS backend by simply swapping the 
 * adapter implementation below.
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Detect Primary Provider
const provider = PLATFORM_CONFIG.dbProvider;

// ── ADAPTER LOGIC ──────────────────────────────────────────────

let internalClient: any;

if (provider === 'supabase') {
    internalClient = createClient(supabaseUrl, supabaseAnonKey);
} else {
    // [ADAPTER] Custom / VPS Implementation
    // This is where you'd write the fetch calls to your VPS API
    internalClient = {
        // Universal Table Accessor
        from: (table: string) => ({
            select: (columns: string = '*') => {
                console.info(`[DB BRIDGE] fetching from ${table}...`);
                // Implementation: return fetch(`${PLATFORM_CONFIG.apiUrl}/${table}?select=${columns}`);
                return { data: [], error: null };
            },
            insert: (data: any) => ({ data: null, error: null }),
            update: (data: any) => ({ data: null, error: null }),
            delete: () => ({ error: null }),
            upsert: () => ({ error: null }),
            eq: () => internalClient.from(table), // Chainable mock
            maybeSingle: () => ({ data: null, error: null }),
            single: () => ({ data: null, error: null }),
        }),

        // Universal Auth Accessor
        auth: {
            getSession: async () => ({ data: { session: null } }),
            getUser: async () => ({ data: { user: null } }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
            signInWithPassword: async () => ({ data: null, error: null }),
            signOut: async () => ({ error: null }),
            resetPasswordForEmail: async () => ({ data: null, error: null }),
        }
    };
}

// ── EXPORTS ───────────────────────────────────────────────────

/**
 * The 'db' export is the recommended entry point for all new 
 * database and authentication operations.
 */
export const db = internalClient;

/**
 * The 'supabase' alias ensures backward compatibility with all 
 * existing 'await supabase.' hardcoded calls.
 */
export const supabase = internalClient;

export default db;
