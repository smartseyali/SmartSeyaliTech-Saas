// auth.js — Customer auth module for EcomSuite static storefront
import { supabase } from './supabaseClient.js';
import { COMPANY_ID } from './config.js';

const auth = {

    // ── Get current session ─────────────────────────────────
    async getSession() {
        if (!supabase) return null;
        const { data: { session } } = await supabase.auth.getSession();
        return session;
    },

    // ── Get current user ────────────────────────────────────
    async getUser() {
        const session = await this.getSession();
        return session?.user || null;
    },

    // ── Require login — redirect to login page if not authed ─
    async requireAuth(redirectBack = true) {
        if (!supabase) {
            console.error('Auth unavailable: Supabase not initialized');
            return null;
        }
        const session = await this.getSession();
        if (!session) {
            const next = redirectBack ? encodeURIComponent(location.href) : '';
            window.location.href = `login.html${next ? '?next=' + next : ''}`;
            return null;
        }
        return session;
    },

    // ── Sign Up ─────────────────────────────────────────────
    async signUp(email, password, fullName) {
        const { data, error } = await supabase.auth.signUp({
            email, password,
            options: { data: { full_name: fullName, company_id: COMPANY_ID } }
        });
        if (error) throw error;

        // Register in ecom_customers
        if (data.user) {
            await supabase.from('ecom_customers').upsert({
                company_id: COMPANY_ID,
                user_id: data.user.id,
                name: fullName,
                email: email
            }, { onConflict: 'user_id' }).select().maybeSingle();
        }
        return data;
    },

    // ── Sign In ─────────────────────────────────────────────
    async signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    },

    // ── Forgot Password (send reset email) ──────────────────
    async forgotPassword(email) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${location.origin}/login.html?mode=reset`
        });
        if (error) throw error;
    },

    // ── Update Password (after reset link click) ─────────────
    async updatePassword(newPassword) {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
    },

    // ── Sign Out ─────────────────────────────────────────────
    async signOut() {
        await supabase.auth.signOut();
        window.location.href = 'index.html';
    },

    // ── Is logged in? ────────────────────────────────────────
    async isLoggedIn() {
        const s = await this.getSession();
        return !!s;
    }
};

export default auth;
