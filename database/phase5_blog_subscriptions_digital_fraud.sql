-- ═══════════════════════════════════════════════════════════════════════════
--  Phase 5 — F15: Subscriptions, F16: Digital Products, F17: Multi-currency,
--             F18: Blog, F20: Fraud Detection
-- ═══════════════════════════════════════════════════════════════════════════

-- ── F18: Blog ─────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ecom_blog') THEN
    CREATE TABLE public.ecom_blog (
      id               BIGSERIAL PRIMARY KEY,
      company_id       INTEGER NOT NULL,
      title            VARCHAR(500) NOT NULL,
      slug             VARCHAR(255),
      category         VARCHAR(100),
      author_name      VARCHAR(255),
      image_url        TEXT,
      content          JSONB DEFAULT '{}'::jsonb,
      meta_description TEXT,
      tags             TEXT[] DEFAULT '{}',
      read_time        INTEGER,
      is_published     BOOLEAN DEFAULT false,
      published_at     TIMESTAMPTZ,
      created_at       TIMESTAMPTZ DEFAULT now(),
      updated_at       TIMESTAMPTZ DEFAULT now()
    );
  ELSE
    ALTER TABLE ecom_blog
      ADD COLUMN IF NOT EXISTS slug             VARCHAR(255),
      ADD COLUMN IF NOT EXISTS company_id       INTEGER,
      ADD COLUMN IF NOT EXISTS author_name      VARCHAR(255),
      ADD COLUMN IF NOT EXISTS meta_description TEXT,
      ADD COLUMN IF NOT EXISTS tags             TEXT[] DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS read_time        INTEGER,
      ADD COLUMN IF NOT EXISTS published_at     TIMESTAMPTZ;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_blog_company_slug ON ecom_blog(company_id, slug) WHERE is_published = true;
ALTER TABLE ecom_blog ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'blog_anon_read' AND tablename = 'ecom_blog') THEN
    CREATE POLICY blog_anon_read ON ecom_blog FOR SELECT USING (is_published = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'blog_company_all' AND tablename = 'ecom_blog') THEN
    CREATE POLICY blog_company_all ON ecom_blog FOR ALL USING (
      company_id IN (SELECT cu.company_id FROM company_users cu WHERE cu.user_id = auth.uid())
    );
  END IF;
END $$;

-- ── F15: Subscription Plans + Subscriptions ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.ecom_subscription_plans (
  id                BIGSERIAL PRIMARY KEY,
  company_id        INTEGER NOT NULL,
  product_id        INTEGER,
  name              VARCHAR(255) NOT NULL,
  interval          VARCHAR(20) NOT NULL,  -- 'weekly','monthly','quarterly','yearly'
  interval_count    INTEGER DEFAULT 1,
  price             DECIMAL(10,2) NOT NULL,
  razorpay_plan_id  VARCHAR(255),
  discount_percent  DECIMAL(5,2) DEFAULT 0,
  is_active         BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ecom_subscriptions (
  id                      BIGSERIAL PRIMARY KEY,
  company_id              INTEGER NOT NULL,
  customer_id             BIGINT,
  customer_email          TEXT,
  plan_id                 BIGINT REFERENCES ecom_subscription_plans(id),
  razorpay_subscription_id VARCHAR(255),
  status                  VARCHAR(50) DEFAULT 'active', -- 'active','paused','cancelled','completed'
  next_billing_date       TIMESTAMPTZ,
  total_count             INTEGER DEFAULT 0,
  paid_count              INTEGER DEFAULT 0,
  created_at              TIMESTAMPTZ DEFAULT now(),
  updated_at              TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ecom_subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecom_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY sub_plans_anon_read ON ecom_subscription_plans FOR SELECT USING (is_active = true);
CREATE POLICY sub_plans_company ON ecom_subscription_plans FOR ALL USING (
  company_id IN (SELECT cu.company_id FROM company_users cu WHERE cu.user_id = auth.uid()));
CREATE POLICY subscriptions_company ON ecom_subscriptions FOR ALL USING (
  company_id IN (SELECT cu.company_id FROM company_users cu WHERE cu.user_id = auth.uid()));
CREATE POLICY subscriptions_insert ON ecom_subscriptions FOR INSERT WITH CHECK (true);

-- ── F16: Digital Products ──────────────────────────────────────────────────
ALTER TABLE master_items
  ADD COLUMN IF NOT EXISTS is_digital      BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS download_url    TEXT,
  ADD COLUMN IF NOT EXISTS download_limit  INTEGER DEFAULT 3;

CREATE TABLE IF NOT EXISTS public.ecom_download_tokens (
  id             BIGSERIAL PRIMARY KEY,
  company_id     INTEGER,
  order_id       BIGINT REFERENCES ecom_orders(id) ON DELETE CASCADE,
  item_id        INTEGER,
  token          TEXT NOT NULL UNIQUE,
  download_count INTEGER DEFAULT 0,
  max_downloads  INTEGER DEFAULT 3,
  expires_at     TIMESTAMPTZ DEFAULT (now() + interval '30 days'),
  created_at     TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ecom_download_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY download_tokens_anon_select ON ecom_download_tokens FOR SELECT USING (true);

-- ── F17: Multi-currency ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ecom_currency_rates (
  id            BIGSERIAL PRIMARY KEY,
  company_id    INTEGER,
  from_currency VARCHAR(10) DEFAULT 'INR',
  to_currency   VARCHAR(10) NOT NULL,
  rate          DECIMAL(15,6) NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, from_currency, to_currency)
);

ALTER TABLE ecom_currency_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY currency_rates_anon_read ON ecom_currency_rates FOR SELECT USING (true);
CREATE POLICY currency_rates_company ON ecom_currency_rates FOR ALL USING (
  company_id IN (SELECT cu.company_id FROM company_users cu WHERE cu.user_id = auth.uid()));

ALTER TABLE ecom_settings ADD COLUMN IF NOT EXISTS supported_currencies TEXT[] DEFAULT '{"INR"}';

-- ── F20: Fraud Detection ───────────────────────────────────────────────────
ALTER TABLE ecom_orders
  ADD COLUMN IF NOT EXISTS risk_score   INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS risk_factors JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS is_flagged   BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_ecom_orders_flagged ON ecom_orders(company_id, is_flagged) WHERE is_flagged = true;
