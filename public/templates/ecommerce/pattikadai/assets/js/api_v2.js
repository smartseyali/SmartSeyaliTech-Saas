/**
 * API Layer - Fetches data from Supabase tables
 * All queries are scoped by STORE_CONFIG.companyId
 *
 * Table mapping (SaaS Master Hub + Ecom tables):
 *   Products     → master_items (item_name, item_code, selling_price, mrp, featured, is_live)
 *   Categories   → master_categories (name, is_active, sort_order)
 *   Variants     → master_product_variants (item_id, price_adjustment)
 *   Contacts     → master_contacts (full_name, type, email, phone — single source for customers/vendors)
 *   Banners      → ecom_banners (position, display_order)
 *   Settings     → ecom_settings
 *   Orders       → ecom_orders + ecom_order_items + ecom_order_timeline
 *   Reviews      → ecom_product_reviews (rating, comment, is_published)
 *   Coupons      → ecom_coupons (discount_type, discount_value, valid_to)
 */

const API = {
  // ─── Products (master_items) ──────────────────────────
  async getProducts(options = {}) {
    const sb = getSupabase();
    let query = sb
      .from('master_items')
      .select('*, master_categories(id, name), master_product_variants(id, name, selling_price, mrp, price_adjustment, stock_qty, is_active)')
      .eq('company_id', STORE_CONFIG.companyId)
      .eq('status', 'Active');

    if (options.isLive !== false) query = query.eq('is_live', true);
    if (options.isFeatured) query = query.eq('featured', true);
    // User requested: list by most selling records, not by master boolean field
    // if (options.isBestSeller) query = query.eq('is_best_seller', true);
    if (options.categoryId) query = query.eq('category_id', options.categoryId);
    if (options.limit) query = query.limit(options.limit);
    if (options.orderBy) {
      query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending ?? false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;
    if (error) { console.error('Error fetching products:', error); return []; }
    return data || [];
  },

  async getProductById(id) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('master_items')
      .select('*, master_categories(id, name)')
      .eq('id', id)
      .eq('company_id', STORE_CONFIG.companyId)
      .maybeSingle();
    if (error) { console.error('Error fetching product:', error); return null; }
    return data;
  },

  async getProductVariants(productId) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('master_product_variants')
      .select('*')
      .eq('item_id', productId)
      .eq('company_id', STORE_CONFIG.companyId);
    if (error) { console.error('Error fetching variants:', error); return []; }
    return data || [];
  },

  async searchProducts(query) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('master_items')
      .select('*, master_categories(id, name)')
      .eq('company_id', STORE_CONFIG.companyId)
      .eq('status', 'Active')
      .eq('is_live', true)
      .ilike('item_name', `%${query}%`);
    if (error) { console.error('Error searching products:', error); return []; }
    return data || [];
  },

  // ─── Categories (master_categories) ───────────────────
  async getCategories() {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('master_categories')
      .select('*')
      .eq('company_id', STORE_CONFIG.companyId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (error) { console.error('Error fetching categories:', error); return []; }
    return data || [];
  },

  // ─── Banners (ecom_banners) ───────────────────────────
  async getBanners(position) {
    const sb = getSupabase();
    let query = sb
      .from('ecom_banners')
      .select('*')
      .eq('company_id', STORE_CONFIG.companyId)
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    if (position) query = query.eq('position', position);
    const { data, error } = await query;
    if (error) { console.error('Error fetching banners:', error); return []; }
    return data || [];
  },

  // ─── Store Settings (ecom_settings) ───────────────────
  async getStoreSettings() {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('ecom_settings')
      .select('*')
      .eq('company_id', STORE_CONFIG.companyId)
      .maybeSingle();
    if (error) { console.error('Error fetching store settings:', error); return null; }
    return data;
  },

  // ─── Reviews (ecom_product_reviews) ───────────────────
  async getProductReviews(productId) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('ecom_product_reviews')
      .select('*')
      .eq('item_id', productId)
      .eq('company_id', STORE_CONFIG.companyId)
      .order('created_at', { ascending: false });
    if (error) { console.error('Error fetching reviews:', error); return []; }
    return data || [];
  },

  async createReview(reviewData) {
    const sb = getSupabase();
    const { error } = await sb
      .from('ecom_product_reviews')
      .insert([{
        ...reviewData,
        company_id: STORE_CONFIG.companyId,
        status: 'published',
      }]);
    if (error) { console.error('Error creating review:', error); return null; }
    return true;
  },

  // ─── Customer Sync → Master Hub (master_contacts) ─────
  // Creates or updates a contact in Master Hub when an order is placed.
  // This is the SINGLE source of truth for all customer/vendor data.
  async syncCustomerToMasterHub(customerData) {
    const sb = getSupabase();
    const email = (customerData.email || '').trim().toLowerCase();
    if (!email) return null;

    try {
      // Check if contact already exists for this company
      const { data: existing } = await sb
        .from('master_contacts')
        .select('id')
        .eq('company_id', STORE_CONFIG.companyId)
        .eq('email', email)
        .maybeSingle();

      if (existing) {
        // Update existing contact with latest info
        await sb.from('master_contacts').update({
          full_name: customerData.name || undefined,
          phone: customerData.phone || undefined,
          shipping_address: customerData.shipping_address || undefined,
        }).eq('id', existing.id);
      } else {
        // Create new contact in Master Hub
        await sb.from('master_contacts').insert([{
          company_id: STORE_CONFIG.companyId,
          full_name: customerData.name || email.split('@')[0],
          type: 'Customer',
          email: email,
          phone: customerData.phone || null,
          shipping_address: customerData.shipping_address || null,
          status: 'Active',
        }]);
      }
    } catch (e) {
      console.warn('Master Hub customer sync skipped:', e);
    }
  },

  // ─── Orders (ecom_orders) ─────────────────────────────
  async createOrder(orderData) {
    const sb = getSupabase();

    // Sequential order number: ORD-1001, ORD-1002, ...
    // Fetch the latest order number for this company to determine next sequence
    const orderNumber = await this._nextOrderNumber(sb);

    // Generate UUID client-side so we always have the order ID
    // (avoids SELECT fetch-back which can fail due to RLS)
    const orderId = crypto.randomUUID();

    // Get current user if logged in
    const { data: { session } } = await sb.auth.getSession();
    const userId = session?.user?.id || null;

    const payload = {
      id: orderId,
      ...orderData,
      company_id: STORE_CONFIG.companyId,
      order_number: orderNumber,
      status: 'pending',
      payment_status: orderData.payment_status || 'pending',
      payment_id: orderData.payment_id || null,
      user_id: userId,
    };

    const { error } = await sb.from('ecom_orders').insert([payload]);
    if (error) { console.error('Error creating order:', error); return null; }

    // Auto-sync customer to Master Hub contacts
    const addr = orderData.shipping_address || {};
    this.syncCustomerToMasterHub({
      name: orderData.customer_name,
      email: orderData.customer_email,
      phone: orderData.customer_phone,
      shipping_address: [addr.line1, addr.city, addr.state, addr.pincode].filter(Boolean).join(', '),
    });

    return { id: orderId, order_number: orderNumber, grand_total: orderData.grand_total, status: 'pending' };
  },

  // Get next sequential order number (ORD-1001, ORD-1002, ...)
  async _nextOrderNumber(sb) {
    const START = 1001;
    try {
      const { data } = await sb
        .from('ecom_orders')
        .select('order_number')
        .eq('company_id', STORE_CONFIG.companyId)
        .like('order_number', 'ORD-%')
        .order('created_at', { ascending: false })
        .limit(50);

      let max = START - 1;
      if (data) {
        for (const row of data) {
          const num = parseInt((row.order_number || '').replace('ORD-', ''), 10);
          if (!isNaN(num) && num > max) max = num;
        }
      }
      return 'ORD-' + (max + 1);
    } catch (e) {
      console.warn('Could not fetch order sequence, using fallback:', e);
      return 'ORD-' + (START + Date.now() % 10000);
    }
  },

  async createOrderItems(items) {
    const sb = getSupabase();
    const { error } = await sb
      .from('ecom_order_items')
      .insert(items.map(item => ({
        ...item,
        company_id: STORE_CONFIG.companyId,
      })));
    if (error) { console.error('Error creating order items:', error); return null; }
    return items;
  },

  async createOrderTimeline(entry) {
    const sb = getSupabase();
    const { error } = await sb
      .from('ecom_order_timeline')
      .insert([{ ...entry, company_id: STORE_CONFIG.companyId }]);
    if (error) { console.error('Error creating timeline entry:', error); return null; }
    return entry;
  },

  async getUserOrders() {
    const sb = getSupabase();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return [];
    // Query by user_id (RLS policy allows user_id = auth.uid())
    const { data, error } = await sb
      .from('ecom_orders')
      .select('*, ecom_order_items(*), ecom_order_timeline(*)')
      .eq('company_id', STORE_CONFIG.companyId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) { console.error('Error fetching orders:', error); return []; }
    return data || [];
  },

  async getOrderById(id) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('ecom_orders')
      .select('*, ecom_order_items(*), ecom_order_timeline(*)')
      .eq('id', id)
      .eq('company_id', STORE_CONFIG.companyId)
      .maybeSingle();
    if (error) { console.error('Error fetching order:', error); return null; }
    return data;
  },

  // ─── Wishlist (localStorage based) ────────────────────
  getWishlist() {
    const items = localStorage.getItem(STORE_CONFIG.wishlistStorageKey);
    return items ? JSON.parse(items) : [];
  },

  addToWishlist(product) {
    const items = this.getWishlist();
    if (!items.find(i => i.id === product.id)) {
      items.push({
        id: product.id,
        item_name: product.item_name || product.name,
        image_url: product.image_url,
        selling_price: product.selling_price,
        mrp: product.mrp,
      });
      localStorage.setItem(STORE_CONFIG.wishlistStorageKey, JSON.stringify(items));
    }
    return items;
  },

  removeFromWishlist(productId) {
    let items = this.getWishlist();
    items = items.filter(i => i.id !== productId);
    localStorage.setItem(STORE_CONFIG.wishlistStorageKey, JSON.stringify(items));
    return items;
  },

  // ─── Delivery Charges ─────────────────────────────────
  // Parses a variant label (e.g. "250g", "1kg", "500ml", "1L") into grams/ml.
  // Falls back to liquid detection from the product title, then to defaultG.
  _parseItemUnit(unitStr, title, defaultG) {
    const str = String(unitStr || '').toLowerCase().trim();
    const num = parseFloat(str.replace(/[^\d.]/g, '')) || 0;

    if (/ml|liter|litre/.test(str) || /^\d+(\.\d+)?l$/.test(str)) {
      if (/liter|litre|^\d+(\.\d+)?l$/.test(str)) return { grams: 0, ml: num * 1000 };
      return { grams: 0, ml: num || 1000 };
    }
    if (title && /oil|juice|liquid|syrup|shampoo|lotion/i.test(title) && num > 0) {
      return { grams: 0, ml: num };
    }
    if (/kg/.test(str)) return { grams: num * 1000, ml: 0 };
    return { grams: num || defaultG, ml: 0 };
  },

  // Calls the DB-backed calc_shipping RPC. Zones/slabs/tariffs are managed
  // in the SaaS admin under Ecommerce → Shipping Zones (company-scoped).
  async calculateDelivery(state, cartItems, pincode = '', paymentMethod = 'prepaid') {
    const config = STORE_CONFIG.delivery || {};
    const subtotal = Cart.getSubtotal();

    // Optional client-side free-shipping override (skips RPC).
    if (config.freeDeliveryAbove > 0 && subtotal >= config.freeDeliveryAbove) {
      return { charge: 0, zone: 'FREE', freeDelivery: true, serviceable: true };
    }

    const defaultG = config.defaultItemWeight || 250;
    let totalGrams = 0, totalMl = 0, totalQty = 0;
    for (const item of (cartItems || [])) {
      const qty = item.quantity || 1;
      const { grams, ml } = this._parseItemUnit(
        item.variant_name || item.weight || '',
        item.name || item.item_name || '',
        defaultG
      );
      totalGrams += grams * qty;
      totalMl += ml * qty;
      totalQty += qty;
    }

    try {
      const sb = getSupabase();
      const { data, error } = await sb.rpc('calc_shipping', {
        p_company_id: STORE_CONFIG.companyId,
        p_state: state || '',
        p_pincode: pincode || '',
        p_weight_kg: Math.ceil(totalGrams),   // param name kept for back-compat; value is grams
        p_qty: totalQty,
        p_order_value: subtotal,
        p_volume_cm3: Math.ceil(totalMl),      // param name kept for back-compat; value is ml
        p_payment_method: paymentMethod,
      });
      if (error || !data) {
        console.error('calc_shipping RPC error:', error);
        return { charge: 0, zone: 'ERROR', freeDelivery: false, serviceable: false };
      }
      return {
        charge: Number(data.shipping_charge) || 0,
        zone: data.zone || 'UNKNOWN',
        freeDelivery: !!data.free_shipping,
        serviceable: true,
      };
    } catch (err) {
      console.error('calc_shipping call failed:', err);
      return { charge: 0, zone: 'ERROR', freeDelivery: false, serviceable: false };
    }
  },

  checkPincodeServiceability(pincode) {
    const config = STORE_CONFIG.delivery;
    if (!config || !config.unserviceablePincodes || config.unserviceablePincodes.length === 0) {
      return true;
    }
    return !config.unserviceablePincodes.includes(pincode);
  },

  // ─── Coupons (ecom_coupons) ───────────────────────────
  async validateCoupon(code) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('ecom_coupons')
      .select('*')
      .eq('company_id', STORE_CONFIG.companyId)
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .maybeSingle();
    if (error || !data) return null;
    if (data.valid_to && new Date(data.valid_to) < new Date()) return null;
    return data;
  },

  // ─── User Addresses (ecom_customer_addresses) ──────────────
  async getUserAddresses() {
    const sb = getSupabase();
    const customer = await Auth.getCustomer();
    if (!customer) return [];
    
    const { data, error } = await sb
      .from('ecom_customer_addresses')
      .select('*')
      .eq('customer_id', customer.id)
      .eq('company_id', STORE_CONFIG.companyId)
      .order('created_at', { ascending: false });
    
    if (error) { console.error('Error fetching addresses:', error); return []; }
    return data || [];
  },
 
  async saveAddress(addressData) {
    const sb = getSupabase();
    // Ensure customer profile exists in ecom_customers first
    const customer = await Auth.ensureCustomer();
    if (!customer) return null;
 
    const payload = {
      customer_id: customer.id,
      company_id: STORE_CONFIG.companyId,
      full_name: addressData.name,
      phone: addressData.phone,
      address_line1: addressData.address,
      city: addressData.city,
      state: addressData.state,
      pincode: addressData.pincode,
      country: addressData.country || 'India',
      label: 'Home'
    };
 
    const { data, error } = await sb
      .from('ecom_customer_addresses')
      .insert([payload]);
    
    if (error) { 
      console.error('Error saving address:', error); 
      // If RLS insert policy failed, return null to prompt user
      return null; 
    }
    // Return payload with dummy ID if insert succeeded but we couldn't select
    return { ...payload, id: 'temp-' + Date.now() };
  },
 
  async deleteAddress(id) {
    const sb = getSupabase();
    const { error } = await sb
      .from('ecom_customer_addresses')
      .delete()
      .eq('id', id);
    if (error) { console.error('Error deleting address:', error); return false; }
    return true;
  },

  // ─── Shipping Zones (ecom_shipping_zones) ────────────────
  async getShippingZones() {
    const sb = getSupabase();
    console.error('DEBUG: Fetching shipping zones for company:', STORE_CONFIG.companyId);
    
    // Try primary table name
    let { data, error } = await sb
      .from('ecom_shipping_zones')
      .select('*')
      .eq('company_id', STORE_CONFIG.companyId);
    
    // If empty or error, try the master hub alternative
    if (error || !data || data.length === 0) {
      console.error('DEBUG: ecom_shipping_zones failed or empty, trying master_shipping_zones...');
      const { data: masterData, error: masterError } = await sb
        .from('master_shipping_zones')
        .select('*')
        .eq('company_id', STORE_CONFIG.companyId);
      
      if (!masterError && masterData && masterData.length > 0) {
        console.error('DEBUG: Data found in master_shipping_zones:', masterData);
        return masterData;
      }
      
      // If still no data, try ecom_shipping_rules
      console.error('DEBUG: Searching ecom_shipping_rules...');
      const { data: rulesData, error: rulesError } = await sb
        .from('ecom_shipping_rules')
        .select('*')
        .eq('company_id', STORE_CONFIG.companyId);
        
      if (!rulesError && rulesData && rulesData.length > 0) {
        console.error('DEBUG: Data found in ecom_shipping_rules:', rulesData);
        return rulesData;
      }

      console.error('CRITICAL: All shipping zone table attempts failed (ecom_shipping_zones, master_shipping_zones, ecom_shipping_rules).');
      if (error) console.error('Error 1:', error.message);
      if (masterError) console.error('Error 2:', masterError.message);
      if (rulesError) console.error('Error 3:', rulesError.message);
    } else {
      console.error('DEBUG: Data found in ecom_shipping_zones:', data);
    }
    
    return data || [];
  }
};
