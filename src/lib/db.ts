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
    // Custom lock fallback: navigator.locks is flaky in mobile WebViews,
    // Gmail's in-app browser, and some Android Chrome custom-tab embeddings,
    // causing "Navigator LockManager lock timed out" errors during signup /
    // verification flows. We try navigator.locks first, but fall back to a
    // simple in-memory mutex per lock-name when it's unavailable or hangs.
    const memoryLocks: Record<string, Promise<unknown>> = {};
    const safeLock = async <R,>(name: string, acquireTimeout: number, fn: () => Promise<R>): Promise<R> => {
        const useNavigatorLocks =
            typeof navigator !== "undefined" &&
            typeof (navigator as any).locks?.request === "function";

        if (useNavigatorLocks) {
            try {
                // Race the lock against a timeout slightly shorter than supabase-js's
                // own internal timeout, so we degrade to memory lock instead of throwing.
                const timeoutMs = Math.max(1000, Math.min(acquireTimeout, 8000));
                const acquire = (navigator as any).locks.request(name, { mode: "exclusive" }, fn);
                const timeout = new Promise<R>((_, reject) =>
                    setTimeout(() => reject(new Error("nav-lock-timeout")), timeoutMs),
                );
                return (await Promise.race([acquire, timeout])) as R;
            } catch {
                // Fall through to memory lock
            }
        }

        // Memory mutex per lock name (single-tab safe; multi-tab will run sequentially within this tab)
        const previous = memoryLocks[name] || Promise.resolve();
        let release!: () => void;
        const current = new Promise<void>((res) => { release = res; });
        memoryLocks[name] = previous.then(() => current);
        try {
            await previous;
            return await fn();
        } finally {
            release();
            if (memoryLocks[name] === current) delete memoryLocks[name];
        }
    };

    internalClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            // NOTE: not overriding storageKey or flowType so existing sessions
            // and password-reset/OAuth flows keep working.
            // Safe lock implementation (handles WebView / in-app browser cases)
            lock: safeLock,
        },
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
