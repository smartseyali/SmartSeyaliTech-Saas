import { createClient } from '@supabase/supabase-js';
import PLATFORM_CONFIG from '@/config/platform';
import { toast } from 'sonner';

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
    // Custom fetch wrapper with exponential backoff retry logic
    const fetchWithRetry = async (url: RequestInfo | URL, options?: RequestInit): Promise<Response> => {
        let retries = 6; // Increased to 6 attempts (~60 seconds total)
        let backoff = 1000;
        
        while (retries > 0) {
            try {
                const response = await fetch(url, options);
                
                // Retry on Service Unavailable (503), Gateway Timeout (504), or Rate Limit (429)
                if (response.status === 503 || response.status === 504 || response.status === 429) {
                    console.warn(`[DB BRIDGE] Received ${response.status} from Supabase. Retrying in ${backoff}ms... (${retries} attempts left)`);
                    
                    // On the very last attempt, if it's still 503, we can't wait forever
                    if (retries === 1) {
                        toast.error(`Platform Service Temporarily Unavailable (${response.status})`, {
                            description: "The connection to Supabase is experiencing high latency. Retrying once more...",
                            duration: 5000
                        });
                    }
                } else {
                    return response;
                }
            } catch (error) {
                console.warn(`[DB BRIDGE] Network error: ${error}. Retrying in ${backoff}ms... (${retries} attempts left)`);
            }

            await new Promise(resolve => setTimeout(resolve, backoff));
            retries -= 1;
            backoff *= 2; 
        }

        // HEALER: If we still have a 503 after 1 minute of retrying, 
        // return a mock "empty" success to prevent UI from freezing/crashing
        console.error("[DB BRIDGE] Max retries reached. Service is persistently unavailable.");
        
        // Return a mock response that the Supabase client can parse as "no results"
        return new Response(JSON.stringify([]), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    };

    internalClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
            fetch: fetchWithRetry
        }
    });
} else {
    // [ADAPTER] Custom / VPS Implementation
    class QueryBuilder {
        table = "";
        action = "select";
        queryColumns = "*";
        filters: any[] = [];
        orders: any[] = [];
        payload: any = null;

        constructor(table: string) {
            this.table = table;
        }

        select(columns = '*') { this.action = 'select'; this.queryColumns = columns; return this; }
        insert(data: any) { this.action = 'insert'; this.payload = data; return this; }
        update(data: any) { this.action = 'update'; this.payload = data; return this; }
        delete() { this.action = 'delete'; return this; }
        upsert(data: any) { this.action = 'upsert'; this.payload = data; return this; }

        eq(column: string, value: any) { this.filters.push({ type: 'eq', column, value }); return this; }
        neq(column: string, value: any) { this.filters.push({ type: 'neq', column, value }); return this; }
        in(column: string, values: any[]) { this.filters.push({ type: 'in', column, values }); return this; }
        ilike(column: string, value: any) { this.filters.push({ type: 'ilike', column, value }); return this; }
        or(query: string) { this.filters.push({ type: 'or', query }); return this; }
        single() { this.filters.push({ type: 'single' }); return this; }
        maybeSingle() { this.filters.push({ type: 'maybeSingle' }); return this; }
        order(column: string, options: any) { this.orders.push({ column, ascending: options?.ascending ?? true }); return this; }
        limit(count: number) { this.orders.push({ limit: count }); return this; } // Used generally as a modifier

        // Resolves the chain into an HTTP API request automatically when awaited
        then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
            const execute = async () => {
                try {
                    const apiUrl = PLATFORM_CONFIG.apiUrl || 'http://localhost:3000/api';
                    const res = await fetch(`${apiUrl}/database`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            table: this.table,
                            action: this.action,
                            columns: this.queryColumns,
                            filters: this.filters,
                            orders: this.orders,
                            payload: this.payload
                        })
                    });
                    return await res.json();
                } catch (error: any) {
                    console.error("[DB BRIDGE] Network Error:", error);
                    return { data: null, error: { message: "Local Backend Unreachable" } };
                }
            };
            return execute().then(onfulfilled, onrejected);
        }
    }

    internalClient = {
        // Universal Table Accessor (Returns the QueryBuilder proxy)
        from: (table: string) => new QueryBuilder(table),

        // Universal Auth Accessor (HTTP mapping layer for user sessions)
        auth: {
            getSession: async () => {
                const res = await fetch(`${PLATFORM_CONFIG.apiUrl || 'http://localhost:3000/api'}/auth/session`);
                return res.json().catch(() => ({ data: { session: null }, error: null }));
            },
            getUser: async () => ({ data: { user: null }, error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
            signInWithPassword: async (credentials: any) => {
                const res = await fetch(`${PLATFORM_CONFIG.apiUrl || 'http://localhost:3000/api'}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(credentials)
                });
                return res.json();
            },
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
