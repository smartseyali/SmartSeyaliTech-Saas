
/**
 * Professional API Integration Layer
 * Robust Supabase & Tenant Intelligence
 */

(function () {
    const SUPABASE_URL = "https://vxwjfonhadjjbdmkdrjc.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4d2pmb25oYWRqamJkbWtkcmpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NTg0OTIsImV4cCI6MjA4NzIzNDQ5Mn0.lKrOXOLQtHDBhRgH6kz_t8admjaA_WR1bs_pIIwq0wM";

    function getClient() {
        if (window.supabaseClient) return window.supabaseClient;
        if (!window.supabase) return null;
        window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        return window.supabaseClient;
    }

    window.API = {
        tenant: null,

        async setTenant(slug) {
            const client = getClient();
            if (!slug || !client) return null;
            try {
                const { data, error } = await client.from('companies').select('*').eq('subdomain', slug).single();
                if (error || !data) throw error || new Error("Tenant Not Found");
                this.tenant = data;
                return data;
            } catch (err) {
                console.error("🏙️ API: Tenant Resolution Failed", err);
                return null;
            }
        },

        async getDynamicContent(sectionId) {
            const client = getClient();
            if (!this.tenant || !client) return [];

            const tableMap = {
                'hero_banners': 'ecom_banners',
                'site_highlights': 'ecom_settings',
                'top_categories': 'ecom_categories',
                'offer_zone': 'offers',
                'top_selling': 'products',
                'bottom_banners': 'ecom_banners'
            };

            const tableName = tableMap[sectionId];
            if (!tableName) return [];

            try {
                let query = client.from(tableName).select("*").eq("company_id", this.tenant.id);
                if (sectionId === "hero_banners") {
                    query = query.eq("is_active", true).in("position", ["hero", "full_width", "slider"]).order("display_order", { ascending: true });
                } else if (sectionId === "top_selling") {
                    query = query.eq("is_ecommerce", true).eq("status", "active").limit(8);
                }
                const { data, error } = await query;
                if (error) throw error;
                return data || [];
            } catch (err) {
                return [];
            }
        },

        async signIn(email, password) {
            const client = getClient();
            if (!client) return { error: { message: "Supabase client not initialized" } };
            const { data, error } = await client.auth.signInWithPassword({ email, password });
            if (!error && data.user) await this.syncCustomer(data.user);
            return { data, error };
        },

        async signUp(email, password, metadata = {}) {
            const client = getClient();
            if (!client) return { error: "Client null" };
            const { data, error } = await client.auth.signUp({
                email, password, options: { data: { ...metadata, company_id: this.tenant?.id } }
            });
            if (!error && data.user) await this.syncCustomer(data.user);
            return { data, error };
        },

        async syncCustomer(user) {
            const client = getClient();
            if (!user || !this.tenant || !client) return;
            try {
                await client.from('ecom_customers').upsert([{
                    id: user.id, user_id: user.id, company_id: this.tenant.id,
                    email: user.email, full_name: user.user_metadata?.full_name || 'Authorized User',
                    last_login: new Date().toISOString()
                }]);
            } catch (err) { /* Silent fail */ }
        },

        async getUser() {
            const client = getClient();
            if (!client) return null;
            const { data: { user } } = await client.auth.getUser();
            return user;
        },

        async signOut() {
            const client = getClient();
            if (!client) return;
            return await client.auth.signOut();
        },

        async getProducts(category = null) {
            const client = getClient();
            if (!this.tenant || !client) return [];
            try {
                let query = client.from('products').select('*').eq('company_id', this.tenant.id).eq('status', 'active');
                if (category) query = query.eq('category_name', category);
                const { data, error } = await query;
                if (error) throw error;
                return data || [];
            } catch (err) {
                return [];
            }
        },

        async getProduct(id) {
            const client = getClient();
            if (!this.tenant || !client) return null;
            const { data } = await client.from('products').select('*').eq('id', id).single();
            return data;
        },

        async placeOrder(orderData) {
            const client = getClient();
            if (!this.tenant || !client) return { error: "Tenant null" };
            const { data, error } = await client.from('ecom_orders').insert([{
                ...orderData, company_id: this.tenant.id, status: 'pending'
            }]).select().single();
            return { data, error };
        },

        async getOrders() {
            const client = getClient();
            const user = await this.getUser();
            if (!user || !this.tenant || !client) return [];
            const { data } = await client.from('ecom_orders').select('*').eq('company_id', this.tenant.id).eq('customer_email', user.email).order('created_at', { ascending: false });
            return data || [];
        }
    };
})();
