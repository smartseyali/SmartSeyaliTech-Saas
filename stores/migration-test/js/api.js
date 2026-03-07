import { supabase } from './supabaseClient.js';
import { COMPANY_ID } from './config.js';

const api = {

    // ── Store settings ──────────────────────────────────────
    async getSettings() {
        const { data, error } = await supabase
            .from('ecom_settings')
            .select('*')
            .eq('company_id', COMPANY_ID)
            .maybeSingle();           // maybeSingle: returns null instead of throwing on 0 rows
        if (error) console.warn('getSettings error:', error.message);
        return data || {};
    },

    // ── Categories ──────────────────────────────────────────
    async getCategories() {
        const { data, error } = await supabase
            .from('ecom_categories')  // ✅ correct table
            .select('id, name, image_url, description')
            .eq('company_id', COMPANY_ID)
            .order('name');
        if (error) console.warn('getCategories error:', error.message);
        return data || [];
    },

    // ── Banners ─────────────────────────────────────────────
    async getBanners() {
        const { data, error } = await supabase
            .from('ecom_banners')
            .select('id, title, subtitle, image_url, badge_text, position, display_order')
            .eq('company_id', COMPANY_ID)
            .eq('is_active', true)
            .order('display_order', { ascending: true });
        if (error) console.warn('getBanners error:', error.message);
        return data || [];
    },

    // ── Products ─────────────────────────────────────────────
    async getProducts(filters = {}) {
        let query = supabase
            .from('products')
            .select('id, name, price, rate, image_url, is_featured, is_best_seller, category_id, product_variants(id, name, price, stock_qty)')
            .eq('company_id', COMPANY_ID)
            .eq('status', 'active')
            .eq('is_ecommerce', true);

        if (filters.is_featured) query = query.eq('is_featured', true);
        if (filters.is_best_seller) query = query.eq('is_best_seller', true);
        if (filters.category_id) query = query.eq('category_id', filters.category_id);
        if (filters.search) query = query.ilike('name', `%${filters.search}%`);

        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) console.warn('getProducts error:', error.message);
        return data || [];
    },

    // ── Single product ───────────────────────────────────────
    async getProductDetails(productId) {
        // Fetch product + variants (FK exists → PostgREST join works)
        const { data: product, error } = await supabase
            .from('products')
            .select('*, product_variants(id, name, price, stock_qty, attributes_summary)')
            .eq('company_id', COMPANY_ID)
            .eq('id', productId)
            .maybeSingle();

        if (error) console.warn('getProductDetails error:', error.message);
        if (!product) return null;

        // Fetch reviews separately (avoids PostgREST schema cache issues)
        // Correct columns: review, customer_name, rating, status, created_at
        const { data: reviews } = await supabase
            .from('product_reviews')
            .select('id, rating, review, customer_name, status, created_at')
            .eq('company_id', COMPANY_ID)
            .eq('product_id', productId)
            .eq('status', 'approved')
            .order('created_at', { ascending: false });

        return { ...product, product_reviews: reviews || [] };
    },

    // ── Offers / Coupons ─────────────────────────────────────
    async getActiveOffers() {
        const now = new Date().toISOString();
        const { data, error } = await supabase
            .from('offers')
            .select('id, title, image_url, badge_label, discount_type, discount_value, starts_at, ends_at')
            .eq('company_id', COMPANY_ID)
            .eq('is_active', true)
            .lte('starts_at', now)
            .gte('ends_at', now)
            .order('created_at', { ascending: false });
        if (error) console.warn('getActiveOffers error:', error.message);
        return data || [];
    },

    async getCoupons() {
        const now = new Date().toISOString();
        const { data, error } = await supabase
            .from('coupons')
            .select('*')
            .eq('company_id', COMPANY_ID)
            .eq('is_active', true)
            .lte('valid_from', now)
            .gte('valid_until', now)
            .order('created_at', { ascending: false });
        if (error) console.warn('getCoupons error:', error.message);
        return data || [];
    },

    // ── Coupon validation ────────────────────────────────────
    async validateCoupon(code, cartTotal) {
        const now = new Date().toISOString();
        const { data, error } = await supabase
            .from('coupons')
            .select('*')
            .eq('company_id', COMPANY_ID)
            .eq('code', code.toUpperCase().trim())
            .eq('is_active', true)
            .lte('valid_from', now)
            .gte('valid_until', now)
            .maybeSingle();

        if (error || !data) return { valid: false, message: 'Invalid or expired coupon.' };
        if (data.usage_limit && data.usage_count >= data.usage_limit)
            return { valid: false, message: 'Coupon usage limit reached.' };
        if (cartTotal < (data.min_order_amount || 0))
            return { valid: false, message: `Minimum order ₹${data.min_order_amount} required.` };

        let discount = 0;
        if (data.type === 'percentage') {
            discount = Math.min(cartTotal * data.value / 100, data.max_discount || Infinity);
        } else {
            discount = Math.min(data.value, cartTotal);
        }

        return { valid: true, coupon: data, discount };
    },

    // ── Shipping zone by pincode ──────────────────────────────
    async getShippingZone(pincode, state) {
        const { data, error } = await supabase
            .from('shipping_zones')
            .select('id, name, base_rate, free_above, estimated_days, pincodes, states')
            .eq('company_id', COMPANY_ID)
            .eq('is_active', true);

        if (error || !data?.length) return null;

        // Priority: pincode match → state match → first zone (default)
        const byPin = data.find(z => z.pincodes?.includes(pincode));
        const byState = data.find(z => z.states?.includes(state));
        return byPin || byState || data[0];
    },

    // ── Place order ──────────────────────────────────────────
    async createOrder(orderData) {
        const { data, error } = await supabase
            .from('ecom_orders')
            .insert([{ ...orderData, company_id: COMPANY_ID }])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // ── Get order by ID ──────────────────────────────────────
    async getOrder(orderId) {
        const { data, error } = await supabase
            .from('ecom_orders')
            .select('*, ecom_order_items(*), ecom_order_timeline(status, note, created_at)')
            .eq('company_id', COMPANY_ID)
            .eq('id', orderId)
            .maybeSingle();
        if (error) console.warn('getOrder error:', error.message);
        return data;
    },

    // ── Customer orders (by user_id) ──────────────────────────
    async getMyOrders(userId) {
        const { data, error } = await supabase
            .from('ecom_orders')
            .select('id, order_number, grand_total, status, payment_status, created_at')
            .eq('company_id', COMPANY_ID)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (error) console.warn('getMyOrders error:', error.message);
        return data || [];
    }
};

export default api;
