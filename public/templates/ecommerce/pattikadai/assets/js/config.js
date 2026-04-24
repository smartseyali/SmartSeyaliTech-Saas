/**
 * Pattikadai Storefront — Runtime-configurable Smartseyali template.
 *
 * When loaded inside /store/:slug (SaaS), config values come from URL query
 * params (company_id, supabase_url, anon_key, overrides).
 *
 * When opened standalone (preview/demo), the hard-coded defaults below apply.
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

  // ── 2. Defaults (used when running standalone) ──────────────────
  const DEFAULTS = {
    supabaseUrl: 'https://supabase.smartseyali.tech',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzc1MjAwNTc2LCJleHAiOjIwOTA1NjA1NzZ9.AdbwGkMtZ-aOXM4wlIQ_ZzRTFsJV3i_bIGoTvGb_iDo',
    companyId: 16,
    razorpayKey: 'rzp_test_Scr7jEl5ILW9Rz',

    storeName: 'Pattikadai',
    storeTagline: 'A Brand of Thandatti Foods',
    logoUrl: 'assets/img/logo/logo.gif',
    currency: '₹',

    contactPhone: '+91 9150444595',
    contactEmail: 'pattikadaiofficial@gmail.com',
    contactAddress: 'No.206, V.G.V Garden, Kangeyam Road, Rakkiyapalayam, Tiruppur, Tamil Nadu, 641606',
    whatsappNumber: '919150444595',

    facebookUrl: 'https://www.facebook.com/share/19riyqAvB9/?mibextid=wwXIfr',
    youtubeUrl: 'https://youtube.com/@countryfoodcooking2613?si=mj0BeUdac_IQElB3',
    instagramUrl: 'https://www.instagram.com/countryfoodcooking?igsh=bDNod2JyM2x6OTk1',

    delivery: {
      freeDeliveryAbove: 999,
      defaultItemWeight: 250,
      unserviceablePincodes: [],
    },

    productsPerPage: 12,
    cartStorageKey: 'pattikadai_cart',
    wishlistStorageKey: 'pattikadai_wishlist',
    authStorageKey: 'pattikadai_auth',
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

  // Legacy top-level const kept for any inline <script> that references it
  // before window.STORE_CONFIG is assigned.
  window.STORE_CONFIG = STORE_CONFIG;
  if (typeof globalThis !== 'undefined') globalThis.STORE_CONFIG = STORE_CONFIG;
})();
