/**
 * Authentication Module for Storefront
 *
 * Uses ecom_customers table for customer profiles (NOT users table).
 * Supabase Auth handles session/JWT only.
 * The handle_new_user trigger is skipped via signup_type='storefront' metadata.
 *
 * Flow:
 *   Register → auth.signUp (signup_type=storefront) → INSERT ecom_customers → sync master_contacts
 *   Login    → auth.signIn → fetch ecom_customers profile
 *   Session  → stored customer in localStorage for quick access
 */

const Auth = {
  _customerKey: (STORE_CONFIG.cartStorageKey || 'store') + '_customer',
  _userPromise: null,
  _userCacheExpiry: 0,

  // Get current Supabase auth user (for session check).
  // Deduplicates concurrent calls to avoid Supabase auth-token lock contention.
  async getUser() {
    const now = Date.now();
    if (this._userPromise && now < this._userCacheExpiry) {
      return this._userPromise;
    }
    this._userCacheExpiry = now + 5000; // cache for 5s
    this._userPromise = getSupabase().auth.getUser()
      .then(({ data }) => data.user)
      .catch(() => null);
    return this._userPromise;
  },

  // Get customer profile from ecom_customers.
  // Returns cached data first. Only queries DB if cache misses.
  // Accepts optional user to avoid redundant getUser() calls.
  async getCustomer(existingUser) {
    const user = existingUser || await this.getUser();
    if (!user) return null;

    // Try cache first — avoids DB call (and possible 403 from RLS)
    const cached = localStorage.getItem(this._customerKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.auth_user_id === user.id) return parsed;
      } catch (e) { /* ignore bad cache */ }
    }

    // Fetch from DB (may fail with 403 if RLS policy is missing)
    try {
      const sb = getSupabase();
      const { data, error } = await sb
        .from('ecom_customers')
        .select('*')
        .eq('company_id', STORE_CONFIG.companyId)
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (error) return null; // Silently fail — UI uses auth metadata as fallback
      if (data) {
        localStorage.setItem(this._customerKey, JSON.stringify(data));
        return data;
      }
    } catch (e) {
      // Network or RLS error — not critical
    }
    return null;
  },

  async isLoggedIn() {
    const user = await this.getUser();
    return !!user;
  },

  // Login: Supabase Auth + fetch ecom_customers profile
  async login(email, password) {
    const sb = getSupabase();
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;

    // Fetch customer profile for this company
    if (data.user) {
      const { data: customer } = await sb
        .from('ecom_customers')
        .select('*')
        .eq('company_id', STORE_CONFIG.companyId)
        .eq('auth_user_id', data.user.id)
        .maybeSingle();

      if (customer) {
        localStorage.setItem(this._customerKey, JSON.stringify(customer));
      }
    }

    return data;
  },

  // Register: Supabase Auth (with storefront flag) + create ecom_customers row
  async register(email, password, metadata = {}) {
    const sb = getSupabase();

    // 1. Create auth account (signup_type=storefront skips users table trigger)
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: {
        data: {
          ...metadata,
          signup_type: 'storefront',
          company_id: STORE_CONFIG.companyId,
        }
      },
    });
    if (error) throw error;

    const authUser = data.user;
    if (!authUser) return data;

    // 2. Create customer profile in ecom_customers
    const fullName = metadata.full_name || `${metadata.first_name || ''} ${metadata.last_name || ''}`.trim() || email.split('@')[0];
    try {
      await sb.from('ecom_customers').insert([{
        company_id: STORE_CONFIG.companyId,
        auth_user_id: authUser.id,
        full_name: fullName,
        email: email.toLowerCase(),
        phone: metadata.phone || null,
        status: 'active',
      }]);

      // Fetch back for local cache
      const { data: customer } = await sb
        .from('ecom_customers')
        .select('*')
        .eq('company_id', STORE_CONFIG.companyId)
        .eq('email', email.toLowerCase())
        .maybeSingle();

      if (customer) {
        localStorage.setItem(this._customerKey, JSON.stringify(customer));
      }
    } catch (e) {
      console.warn('Customer profile creation deferred:', e);
    }

    // 3. Sync to master_contacts (for Master Hub visibility)
    try {
      await sb.from('master_contacts').insert([{
        company_id: STORE_CONFIG.companyId,
        full_name: fullName,
        type: 'Customer',
        email: email.toLowerCase(),
        phone: metadata.phone || null,
        status: 'Active',
      }]);
    } catch (e) {
      console.warn('Master contact sync skipped:', e);
    }

    return data;
  },

  // Ensure ecom_customers profile exists for current auth user.
  async ensureCustomer() {
    const user = await this.getUser();
    if (!user) return null;

    const sb = getSupabase();
    // Force bypass local cache to ensure ID exists in DB
    const { data: existing, error } = await sb
      .from('ecom_customers')
      .select('id, auth_user_id')
      .eq('company_id', STORE_CONFIG.companyId)
      .eq('auth_user_id', user.id)
      .maybeSingle();

    if (existing) {
      localStorage.setItem(this._customerKey, JSON.stringify(existing));
      return existing;
    }

    // Create missing profile
    const meta = user.user_metadata || {};
    const fullName = meta.full_name || `${meta.first_name || ''} ${meta.last_name || ''}`.trim() || user.email.split('@')[0];
    
    const { data: created, error: createError } = await sb
      .from('ecom_customers')
      .insert([{
        company_id: STORE_CONFIG.companyId,
        auth_user_id: user.id,
        full_name: fullName,
        email: user.email.toLowerCase(),
        phone: meta.phone || null,
        status: 'active',
      }])
      .select()
      .maybeSingle();

    if (created) {
      localStorage.setItem(this._customerKey, JSON.stringify(created));
      return created;
    }
    
    console.error('Failed to ensure ecom_customers profile:', createError);
    return null;
  },

  async logout() {
    const sb = getSupabase();
    await sb.auth.signOut();
    this._userPromise = null;
    this._userCacheExpiry = 0;
    localStorage.removeItem(this._customerKey);
    localStorage.removeItem(STORE_CONFIG.wishlistStorageKey);
    window.location.href = '/';
  },

  async resetPassword(email) {
    const sb = getSupabase();
    const { error } = await sb.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },

  // Listen for auth state changes
  onAuthChange(callback) {
    const sb = getSupabase();
    sb.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  },

  // Update UI elements based on auth state.
  // Does NOT hit ecom_customers — uses auth user metadata + localStorage cache for display name.
  async updateAuthUI() {
    const user = await this.getUser();

    // Get display name from cache or auth metadata (no DB call)
    let displayName = '';
    if (user) {
      const cached = localStorage.getItem(this._customerKey);
      if (cached) {
        try { displayName = JSON.parse(cached).full_name || ''; } catch (e) {}
      }
      if (!displayName) {
        displayName = user.user_metadata?.full_name || user.email || '';
      }
    }

    const loginLinks = document.querySelectorAll('.auth-login-link');
    const logoutLinks = document.querySelectorAll('.auth-logout-link');
    const profileLinks = document.querySelectorAll('.auth-profile-link');
    const userNameEls = document.querySelectorAll('.auth-user-name');

    const headerUserLink = document.getElementById('header-user-link');
    const bottomUserLink = document.getElementById('bottom-user-link');
    const bottomUserLabel = document.getElementById('bottom-user-label');

    if (user) {
      loginLinks.forEach(el => el.style.display = 'none');
      logoutLinks.forEach(el => el.style.display = '');
      profileLinks.forEach(el => el.style.display = '');
      userNameEls.forEach(el => {
        el.textContent = displayName;
      });
      if (headerUserLink) headerUserLink.href = 'user-profile.html';
      if (bottomUserLink) bottomUserLink.href = 'user-profile.html';
      if (bottomUserLabel) bottomUserLabel.textContent = 'Profile';
    } else {
      loginLinks.forEach(el => el.style.display = '');
      logoutLinks.forEach(el => el.style.display = 'none');
      profileLinks.forEach(el => el.style.display = 'none');
      if (headerUserLink) headerUserLink.href = 'login.html';
      if (bottomUserLink) bottomUserLink.href = 'login.html';
      if (bottomUserLabel) bottomUserLabel.textContent = 'Login';
    }
  },
};
