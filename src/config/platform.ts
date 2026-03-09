/**
 * ═══════════════════════════════════════════════════════════════
 *  Unified SaaS Platform — Core Configuration
 * ═══════════════════════════════════════════════════════════════
 * This file centralizes all platform-level identities and settings.
 * It allows the application to be portable across different hosting
 * environments (Supabase, Hostinger VPS, AWS, etc.) without
 * hardcoding sensitive or environment-specific values in components.
 */

export const PLATFORM_CONFIG = {
    // 1. Platform Identity
    name: "Smartseyali",
    tagline: "Business Platform",
    version: "1.0.0",

    // 2. Core Administration
    // This email bypasses standard tenant checks and provides full access to the platform.
    superAdminEmail: "nateshraja1999@gmail.com",

    // 3. Database & Connection Knowledge
    // This helps the application know how it's communicating with the backend.
    dbProvider: (import.meta.env.VITE_DB_PROVIDER as 'supabase' | 'postgres' | 'api') || 'supabase',

    // 4. API Endpoints (If using a custom backend instead of Supabase client directly)
    apiUrl: import.meta.env.VITE_API_URL || "",

    // 5. Environment Helpers
    isSupabase: () => PLATFORM_CONFIG.dbProvider === 'supabase',
    isProduction: import.meta.env.PROD,
};

export default PLATFORM_CONFIG;
