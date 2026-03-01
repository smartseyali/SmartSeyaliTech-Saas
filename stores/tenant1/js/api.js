
/**
 * API Integration Layer for Storefront
 * Handles Supabase communication and tenant scoping
 */

const SUPABASE_URL = "https://vxwjfonhadjjbdmkdrjc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4d2pmb25oYWRqamJkbWtkcmpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NTg0OTIsImV4cCI6MjA4NzIzNDQ5Mn0.lKrOXOLQtHDBhRgH6kz_t8admjaA_WR1bs_pIIwq0wM";

// Use an IIFE to scope variables and avoid redeclaration errors
(function () {
    // Check if API already exists to avoid redundant execution
    if (window.API) return;

    // Use window.supabaseClient for shared instance
    if (!window.supabaseClient && window.supabase) {
        window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }

    // Fallback if client creation failed or for easy referencing
    const client = window.supabaseClient;

    window.API = {
        tenant: null,

        /**
         * Set the current tenant based on subdomain/slug
         */
        async setTenant(slug) {
            if (!slug || !client) return null;
            try {
                const { data, error } = await client
                    .from('companies')
                    .select('*')
                    .eq('subdomain', slug)
                    .single();

                if (error) throw error;
                this.tenant = data;
                return data;
            } catch (err) {
                console.error("Error setting tenant:", err);
                return null;
            }
        },

        /**
         * Fetch dynamic content for a specific section
         */
        async getDynamicContent(sectionId) {
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
                } else if (sectionId === "offer_zone") {
                    query = query.eq("is_active", true).order("created_at", { ascending: false });
                } else if (sectionId === "top_selling") {
                    query = query.eq("is_ecommerce", true).eq("status", "active").limit(8);
                } else if (sectionId === "top_categories") {
                    query = query.eq("is_active", true).limit(12);
                }

                const { data, error } = await query;
                if (error) throw error;
                return data || [];
            } catch (err) {
                console.error(`Error fetching ${sectionId}:`, err);
                return [];
            }
        },

        /**
         * Get product details
         */
        async getProduct(id) {
            if (!this.tenant || !client) return null;
            try {
                const { data, error } = await client
                    .from('products')
                    .select('*')
                    .eq('id', id)
                    .eq('company_id', this.tenant.id)
                    .single();
                if (error) throw error;
                return data;
            } catch (err) {
                console.error("Error fetching product:", err);
                return null;
            }
        },

        /**
         * Get all products (with filters)
         */
        async getProducts(category = null) {
            if (!this.tenant || !client) return [];
            try {
                let query = client.from('products').select('*').eq('company_id', this.tenant.id).eq('status', 'active');
                if (category) {
                    query = query.eq('category_name', category);
                }
                const { data, error } = await query;
                if (error) throw error;
                return data || [];
            } catch (err) {
                console.error("Error fetching products:", err);
                return [];
            }
        },

        /**
         * Create a new order in Supabase
         */
        async placeOrder(orderData) {
            if (!this.tenant || !client) return { error: "Client or Tenant not initialized" };
            try {
                const { data, error } = await client
                    .from('ecom_orders')
                    .insert([{
                        ...orderData,
                        company_id: this.tenant.id,
                        status: 'pending',
                        payment_status: 'pending',
                        created_at: new Date().toISOString()
                    }])
                    .select()
                    .single();

                if (error) throw error;
                return { data };
            } catch (err) {
                console.error("Error placing order:", err);
                return { error: err.message };
            }
        }
    };
})();
