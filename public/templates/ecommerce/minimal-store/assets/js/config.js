/**
 * Minimal Store — Runtime-configurable Smartseyali template.
 */
(function () {
  const qs = new URLSearchParams(window.location.search);
  const qsCompanyId   = qs.get('company_id');
  const qsSupabaseUrl = qs.get('supabase_url');
  const qsAnonKey     = qs.get('anon_key');
  let qsOverrides = {};
  try { const raw = qs.get('overrides'); if (raw) qsOverrides = JSON.parse(decodeURIComponent(raw)); } catch (_) {}

  const DEFAULTS = {
    supabaseUrl: 'https://supabase.smartseyali.tech',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzc1MjAwNTc2LCJleHAiOjIwOTA1NjA1NzZ9.AdbwGkMtZ-aOXM4wlIQ_ZzRTFsJV3i_bIGoTvGb_iDo',
    companyId: 0,
    storeName: 'Your Shop',
    storeTagline: 'A small catalog, done right',
    currency: '₹',
    cartStorageKey: 'minimal_cart',
    contactPhone: '',
    whatsappNumber: '',
  };
  const STORE_CONFIG = Object.assign({}, DEFAULTS, qsOverrides);
  if (qsSupabaseUrl) STORE_CONFIG.supabaseUrl = qsSupabaseUrl;
  if (qsAnonKey)     STORE_CONFIG.supabaseAnonKey = qsAnonKey;
  if (qsCompanyId) {
    STORE_CONFIG.companyId = Number(qsCompanyId) || qsCompanyId;
    STORE_CONFIG.cartStorageKey = `ss_cart_${qsCompanyId}`;
  }
  window.STORE_CONFIG = STORE_CONFIG;
})();
