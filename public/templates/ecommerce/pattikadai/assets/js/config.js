/**
 * Organic Store — Retail Storefront — Runtime-configurable SmartSeyali template.
 *
 * When loaded inside /store/:slug (SaaS), config values come from URL query
 * params (company_id, supabase_url, anon_key, overrides).
 *
 * When opened standalone (preview/template mode), the defaults below apply.
 * companyId is intentionally null so no company data is pre-loaded.
 */

(function () {
  // ── 1. Parse query params (runtime config from SaaS) ────────────
  const qs = new URLSearchParams(window.location.search);
  const qsCompanyId   = qs.get('company_id');
  const qsSupabaseUrl = qs.get('supabase_url');
  const qsAnonKey     = qs.get('anon_key');
  let qsOverrides = {};
  try {
    const raw = qs.get('overrides');
    if (raw) qsOverrides = JSON.parse(decodeURIComponent(raw));
  } catch (_) { qsOverrides = {}; }

  // ── 2. Defaults (used when running in standalone/preview mode) ──
  const DEFAULTS = {
    supabaseUrl: 'https://supabase.smartseyali.tech',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzc1MjAwNTc2LCJleHAiOjIwOTA1NjA1NzZ9.AdbwGkMtZ-aOXM4wlIQ_ZzRTFsJV3i_bIGoTvGb_iDo',
    companyId: null,       // null = no data loaded in standalone/preview mode
    razorpayKey: '',

    storeName: 'Organic Store',
    storeTagline: 'Fresh & Natural Products',
    logoUrl: '',
    currency: '₹',

    contactPhone: '',
    contactEmail: '',
    contactAddress: '',
    whatsappNumber: '',

    facebookUrl: '#',
    youtubeUrl: '#',
    instagramUrl: '#',

    delivery: {
      freeDeliveryAbove: 999,
      defaultItemWeight: 250,
      unserviceablePincodes: [],
    },

    productsPerPage: 12,
    cartStorageKey: 'organic_cart',
    wishlistStorageKey: 'organic_wishlist',
    authStorageKey: 'organic_auth',
  };

  // ── 3. Merge: query-param overrides win over defaults ───────────
  const STORE_CONFIG = Object.assign({}, DEFAULTS, qsOverrides);

  if (qsSupabaseUrl) STORE_CONFIG.supabaseUrl = qsSupabaseUrl;
  if (qsAnonKey)     STORE_CONFIG.supabaseAnonKey = qsAnonKey;
  if (qsCompanyId)   STORE_CONFIG.companyId = Number(qsCompanyId) || qsCompanyId;

  // Namespace cart/wishlist by company to prevent cross-tenant bleed.
  if (qsCompanyId) {
    STORE_CONFIG.cartStorageKey = `ss_cart_${qsCompanyId}`;
    STORE_CONFIG.wishlistStorageKey = `ss_wishlist_${qsCompanyId}`;
    STORE_CONFIG.authStorageKey = `ss_auth_${qsCompanyId}`;
  }

  window.STORE_CONFIG = STORE_CONFIG;
  if (typeof globalThis !== 'undefined') globalThis.STORE_CONFIG = STORE_CONFIG;
})();
