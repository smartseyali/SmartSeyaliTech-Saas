/**
 * Sparkle Institute — Runtime-configurable Smartseyali template.
 *
 * When loaded inside /store/:slug (SaaS), config values come from URL query
 * params (company_id, supabase_url, anon_key, overrides).
 *
 * When opened standalone (preview/demo), the hard-coded defaults below apply.
 *
 * Note: historically this template used `subscriberId` as the tenant scope.
 * We now prefer `companyId` (matches Smartseyali platform) but keep
 * `subscriberId` as an alias so existing page code continues to work.
 */

(function () {
  const qs = new URLSearchParams(window.location.search);
  const qsCompanyId   = qs.get('company_id');
  const qsSupabaseUrl = qs.get('supabase_url');
  const qsAnonKey     = qs.get('anon_key');
  let qsOverrides = {};
  try {
    const raw = qs.get('overrides');
    if (raw) qsOverrides = JSON.parse(decodeURIComponent(raw));
  } catch (_) { qsOverrides = {}; }

  const DEFAULTS = {
    supabaseUrl: 'https://supabase.smartseyali.tech',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzc1MjAwNTc2LCJleHAiOjIwOTA1NjA1NzZ9.AdbwGkMtZ-aOXM4wlIQ_ZzRTFsJV3i_bIGoTvGb_iDo',
    companyId: '9',
    subscriberId: '9',
  };

  const config = Object.assign({}, DEFAULTS, qsOverrides);
  if (qsSupabaseUrl) config.supabaseUrl = qsSupabaseUrl;
  if (qsAnonKey)     config.supabaseKey = qsAnonKey;
  if (qsCompanyId) {
    config.companyId = qsCompanyId;
    config.subscriberId = qsCompanyId;
  }

  window.SPARKLE_CONFIG = config;
})();
