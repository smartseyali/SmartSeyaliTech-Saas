-- ═══════════════════════════════════════════════════════════════════════════
--  Phase 3 — F9: Reviews, F10: Abandoned Cart, F12: Shipping Integration
-- ═══════════════════════════════════════════════════════════════════════════

-- ── ecom_product_reviews: add product_slug + helpful_count ──────────────
ALTER TABLE ecom_product_reviews
  ADD COLUMN IF NOT EXISTS product_slug  VARCHAR(255),
  ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS admin_reply   TEXT,
  ADD COLUMN IF NOT EXISTS verified_purchase BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_reviews_slug_status
  ON ecom_product_reviews(product_slug, status)
  WHERE status = 'approved';

-- ── Abandoned carts: extend existing table ───────────────────────────────
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ecom_abandoned_carts') THEN
    ALTER TABLE ecom_abandoned_carts
      ADD COLUMN IF NOT EXISTS recovery_token        TEXT,
      ADD COLUMN IF NOT EXISTS recovery_token_expires TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS recovery_email_sent_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS recovery_email_count   INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS recovered_at           TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS recovered_order_id     BIGINT REFERENCES ecom_orders(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS coupon_code            TEXT;
  ELSE
    CREATE TABLE public.ecom_abandoned_carts (
      id                    BIGSERIAL PRIMARY KEY,
      company_id            INTEGER NOT NULL,
      customer_email        TEXT,
      customer_name         TEXT,
      customer_phone        TEXT,
      cart_items            JSONB DEFAULT '[]',
      cart_value            DECIMAL(15,2) DEFAULT 0,
      recovery_token        TEXT,
      recovery_token_expires TIMESTAMPTZ,
      recovery_email_sent_at TIMESTAMPTZ,
      recovery_email_count  INTEGER DEFAULT 0,
      recovered_at          TIMESTAMPTZ,
      recovered_order_id    BIGINT REFERENCES ecom_orders(id) ON DELETE SET NULL,
      coupon_code           TEXT,
      created_at            TIMESTAMPTZ DEFAULT now(),
      updated_at            TIMESTAMPTZ DEFAULT now()
    );

    CREATE INDEX idx_abandoned_carts_email ON ecom_abandoned_carts(customer_email, company_id);
    CREATE INDEX idx_abandoned_carts_token ON ecom_abandoned_carts(recovery_token);

    ALTER TABLE ecom_abandoned_carts ENABLE ROW LEVEL SECURITY;
    CREATE POLICY abandoned_carts_insert ON ecom_abandoned_carts FOR INSERT WITH CHECK (true);
    CREATE POLICY abandoned_carts_update ON ecom_abandoned_carts FOR UPDATE USING (true);
    CREATE POLICY abandoned_carts_company_select ON ecom_abandoned_carts FOR SELECT USING (
      company_id IN (SELECT cu.company_id FROM company_users cu WHERE cu.user_id = auth.uid())
    );
  END IF;
END $$;

-- ── Shipping integration tables ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ecom_webhook_events (
  id           BIGSERIAL PRIMARY KEY,
  company_id   INTEGER,
  provider     VARCHAR(50) NOT NULL,
  event_type   VARCHAR(100),
  order_id     BIGINT REFERENCES ecom_orders(id) ON DELETE SET NULL,
  payload      JSONB,
  processed    BOOLEAN DEFAULT false,
  error        TEXT,
  received_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_company ON ecom_webhook_events(company_id);

ALTER TABLE ecom_webhook_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY webhook_events_company ON ecom_webhook_events
  FOR SELECT USING (
    company_id IN (SELECT cu.company_id FROM company_users cu WHERE cu.user_id = auth.uid())
  );
CREATE POLICY webhook_events_insert ON ecom_webhook_events FOR INSERT WITH CHECK (true);

-- Shipping provider credentials per company
ALTER TABLE ecom_settings
  ADD COLUMN IF NOT EXISTS shipping_provider       VARCHAR(50),
  ADD COLUMN IF NOT EXISTS shipping_api_key        TEXT,
  ADD COLUMN IF NOT EXISTS shipping_api_secret     TEXT,
  ADD COLUMN IF NOT EXISTS shiprocket_channel_id   INTEGER,
  ADD COLUMN IF NOT EXISTS shiprocket_email        TEXT,
  ADD COLUMN IF NOT EXISTS shiprocket_password     TEXT;
