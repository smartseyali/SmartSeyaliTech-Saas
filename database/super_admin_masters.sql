-- ═══════════════════════════════════════════════════════════════════════════
--  Super Admin Master Data — Platform-wide reference tables
--  Run once (idempotent). Requires pgcrypto for gen_random_uuid().
-- ═══════════════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── Currencies ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS system_currencies (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code           text NOT NULL UNIQUE,
  name           text NOT NULL,
  symbol         text NOT NULL,
  exchange_rate  numeric(18,6) DEFAULT 1,
  decimals       int DEFAULT 2,
  is_default     boolean DEFAULT false,
  is_active      boolean DEFAULT true,
  sort_order     int DEFAULT 0,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_system_currencies_code ON system_currencies(code);
CREATE INDEX IF NOT EXISTS idx_system_currencies_active ON system_currencies(is_active);

-- ── Countries ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS system_countries (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code          text NOT NULL UNIQUE,            -- ISO-2
  name          text NOT NULL,
  calling_code  text,
  currency_code text,
  is_active     boolean DEFAULT true,
  sort_order    int DEFAULT 0,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_system_countries_code ON system_countries(code);
CREATE INDEX IF NOT EXISTS idx_system_countries_active ON system_countries(is_active);

-- ── Languages ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS system_languages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code        text NOT NULL UNIQUE,
  name        text NOT NULL,
  native_name text,
  direction   text DEFAULT 'ltr',   -- ltr | rtl
  is_default  boolean DEFAULT false,
  is_active   boolean DEFAULT true,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_system_languages_code ON system_languages(code);

-- ── Industries ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS system_industries (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text NOT NULL UNIQUE,
  name        text NOT NULL,
  description text,
  icon        text,
  sort_order  int DEFAULT 0,
  is_active   boolean DEFAULT true,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_system_industries_slug ON system_industries(slug);

-- ── Tax Rates ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS system_tax_rates (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  rate         numeric(6,3) NOT NULL DEFAULT 0,
  tax_type     text DEFAULT 'gst',             -- gst | vat | sales | service | custom
  country_code text,
  is_default   boolean DEFAULT false,
  is_active    boolean DEFAULT true,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_system_tax_rates_country ON system_tax_rates(country_code);

-- ── Email Templates ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS system_email_templates (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key        text NOT NULL UNIQUE,
  name       text NOT NULL,
  subject    text NOT NULL,
  body_html  text,
  body_text  text,
  variables  jsonb,
  is_active  boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_system_email_templates_key ON system_email_templates(key);

-- ── Announcements ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS system_announcements (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title      text NOT NULL,
  body       text,
  severity   text DEFAULT 'info',   -- info | warning | critical | success
  audience   text DEFAULT 'all',    -- all | admins | super_admins
  is_active  boolean DEFAULT true,
  starts_at  timestamptz,
  ends_at    timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_system_announcements_active ON system_announcements(is_active);

-- ── Feature Flags ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS system_feature_flags (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key         text NOT NULL UNIQUE,
  name        text NOT NULL,
  description text,
  is_enabled  boolean DEFAULT false,
  rollout_pct int DEFAULT 0 CHECK (rollout_pct BETWEEN 0 AND 100),
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_system_feature_flags_key ON system_feature_flags(key);

-- ── Audit Logs ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS system_audit_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_email text,
  action      text NOT NULL,
  entity      text,
  entity_id   text,
  metadata    jsonb,
  ip_address  text,
  created_at  timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_system_audit_logs_actor ON system_audit_logs(actor_email);
CREATE INDEX IF NOT EXISTS idx_system_audit_logs_entity ON system_audit_logs(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_system_audit_logs_created ON system_audit_logs(created_at DESC);

-- ═══════════════════════════════════════════════════════════════════════════
--  RLS — super admin only
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE system_currencies      ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_countries       ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_languages       ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_industries      ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_tax_rates       ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_announcements   ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_feature_flags   ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_audit_logs      ENABLE ROW LEVEL SECURITY;

-- Helper: current user is super admin?
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND is_super_admin = true
  );
$$;

-- Read: any authenticated user can read currencies/countries/languages/industries/tax_rates
-- (these are reference data used across the app).
-- Write: super admin only.
DO $$
DECLARE
  t text;
  readable_tables text[] := ARRAY[
    'system_currencies','system_countries','system_languages',
    'system_industries','system_tax_rates'
  ];
  sa_only_tables text[] := ARRAY[
    'system_email_templates','system_announcements',
    'system_feature_flags','system_audit_logs'
  ];
BEGIN
  FOREACH t IN ARRAY readable_tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I_read ON %I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS %I_write ON %I', t, t);
    EXECUTE format('CREATE POLICY %I_read ON %I FOR SELECT USING (true)', t, t);
    EXECUTE format('CREATE POLICY %I_write ON %I FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin())', t, t);
  END LOOP;

  FOREACH t IN ARRAY sa_only_tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I_sa ON %I', t, t);
    EXECUTE format('CREATE POLICY %I_sa ON %I FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin())', t, t);
  END LOOP;
END$$;

-- Announcements are readable by everyone (shown in-app)
DROP POLICY IF EXISTS system_announcements_read ON system_announcements;
CREATE POLICY system_announcements_read ON system_announcements
  FOR SELECT USING (is_active = true);

-- ═══════════════════════════════════════════════════════════════════════════
--  Seed data
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO system_currencies (code, name, symbol, is_default, sort_order) VALUES
  ('INR', 'Indian Rupee', '₹', true,  1),
  ('USD', 'US Dollar',    '$', false, 2),
  ('EUR', 'Euro',         '€', false, 3),
  ('GBP', 'British Pound','£', false, 4),
  ('AED', 'UAE Dirham',   'د.إ', false, 5)
ON CONFLICT (code) DO NOTHING;

INSERT INTO system_countries (code, name, calling_code, currency_code, sort_order) VALUES
  ('IN', 'India',          '+91',  'INR', 1),
  ('US', 'United States',  '+1',   'USD', 2),
  ('GB', 'United Kingdom', '+44',  'GBP', 3),
  ('AE', 'United Arab Emirates', '+971', 'AED', 4),
  ('SG', 'Singapore',      '+65',  'SGD', 5)
ON CONFLICT (code) DO NOTHING;

INSERT INTO system_languages (code, name, native_name, direction, is_default) VALUES
  ('en', 'English', 'English', 'ltr', true),
  ('ta', 'Tamil',   'தமிழ்',   'ltr', false),
  ('hi', 'Hindi',   'हिन्दी',    'ltr', false),
  ('ar', 'Arabic',  'العربية',  'rtl', false)
ON CONFLICT (code) DO NOTHING;

INSERT INTO system_industries (slug, name, icon, sort_order) VALUES
  ('retail',        'Retail & Commerce',     'ShoppingBag', 1),
  ('education',     'Education & Training',  'GraduationCap', 2),
  ('healthcare',    'Healthcare',            'Heart', 3),
  ('services',      'Professional Services', 'Briefcase', 4),
  ('manufacturing', 'Manufacturing',         'Factory', 5),
  ('technology',    'Technology',            'Cpu', 6),
  ('real_estate',   'Real Estate',           'Building2', 7),
  ('food',          'Food & Beverage',       'UtensilsCrossed', 8)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO system_tax_rates (name, rate, tax_type, country_code, is_default) VALUES
  ('GST 0%',  0,  'gst', 'IN', false),
  ('GST 5%',  5,  'gst', 'IN', false),
  ('GST 12%', 12, 'gst', 'IN', false),
  ('GST 18%', 18, 'gst', 'IN', true),
  ('GST 28%', 28, 'gst', 'IN', false)
ON CONFLICT DO NOTHING;

INSERT INTO system_email_templates (key, name, subject, body_html, body_text) VALUES
  ('welcome', 'Welcome Email', 'Welcome to {{platform_name}}',
   '<p>Hi {{name}},</p><p>Welcome aboard! Your account is ready.</p>',
   'Hi {{name}},\n\nWelcome aboard! Your account is ready.'),
  ('verify_email', 'Email Verification', 'Verify your email',
   '<p>Hi {{name}},</p><p>Click to verify: <a href="{{verify_url}}">Verify Email</a></p>',
   'Hi {{name}},\n\nVerify your email: {{verify_url}}'),
  ('reset_password', 'Password Reset', 'Reset your password',
   '<p>Click to reset your password: <a href="{{reset_url}}">Reset Password</a></p>',
   'Reset your password: {{reset_url}}'),
  ('invoice_sent', 'Invoice Notification', 'Invoice {{invoice_no}} from {{company_name}}',
   '<p>Your invoice {{invoice_no}} for {{amount}} is attached.</p>',
   'Your invoice {{invoice_no}} for {{amount}} is attached.')
ON CONFLICT (key) DO NOTHING;

INSERT INTO system_feature_flags (key, name, description, is_enabled) VALUES
  ('enable_new_dashboard',   'New Dashboard Layout',   'Show the redesigned dashboard', true),
  ('enable_ai_suggestions',  'AI Suggestions',         'Surface AI-powered recommendations', false),
  ('enable_whatsapp_bot',    'WhatsApp Bot',           'Enable the WhatsApp auto-reply bot', true),
  ('enable_multi_currency',  'Multi-Currency Support', 'Allow tenants to configure multiple currencies', true)
ON CONFLICT (key) DO NOTHING;
