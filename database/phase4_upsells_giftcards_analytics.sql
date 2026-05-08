-- ═══════════════════════════════════════════════════════════════════════════
--  Phase 4 — F13: Upsells/Cross-sells, F14: Gift Cards, F19: Analytics
-- ═══════════════════════════════════════════════════════════════════════════

-- ── F13: Product relations ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ecom_product_relations (
  id                 BIGSERIAL PRIMARY KEY,
  company_id         INTEGER NOT NULL,
  product_id         INTEGER NOT NULL,
  related_product_id INTEGER NOT NULL,
  relation_type      VARCHAR(50) DEFAULT 'cross_sell', -- 'cross_sell','upsell','frequently_bought'
  sort_order         INTEGER DEFAULT 0,
  created_at         TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, product_id, related_product_id, relation_type)
);

CREATE INDEX IF NOT EXISTS idx_product_relations_product ON ecom_product_relations(company_id, product_id);

ALTER TABLE ecom_product_relations ENABLE ROW LEVEL SECURITY;
CREATE POLICY product_relations_company ON ecom_product_relations
  FOR ALL USING (company_id IN (SELECT cu.company_id FROM company_users cu WHERE cu.user_id = auth.uid()));
CREATE POLICY product_relations_anon_read ON ecom_product_relations FOR SELECT USING (true);

-- Frequently bought together (auto-calculated from order history)
CREATE TABLE IF NOT EXISTS public.ecom_product_cooccurrence (
  company_id      INTEGER NOT NULL,
  product_id_a    INTEGER NOT NULL,
  product_id_b    INTEGER NOT NULL,
  cooccurrence_count INTEGER DEFAULT 1,
  updated_at      TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY(company_id, product_id_a, product_id_b)
);

ALTER TABLE ecom_product_cooccurrence ENABLE ROW LEVEL SECURITY;
CREATE POLICY cooccurrence_anon_read ON ecom_product_cooccurrence FOR SELECT USING (true);
CREATE POLICY cooccurrence_service ON ecom_product_cooccurrence FOR ALL USING (true);

CREATE OR REPLACE FUNCTION public.refresh_product_cooccurrence(p_company_id INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM ecom_product_cooccurrence WHERE company_id = p_company_id;
  INSERT INTO ecom_product_cooccurrence(company_id, product_id_a, product_id_b, cooccurrence_count)
  SELECT p_company_id,
         a.product_id::INTEGER,
         b.product_id::INTEGER,
         COUNT(*)
  FROM ecom_order_items a
  JOIN ecom_order_items b ON a.order_id = b.order_id
    AND a.product_id < b.product_id
  WHERE a.company_id = p_company_id
  GROUP BY a.product_id, b.product_id
  HAVING COUNT(*) >= 2;
END;
$$;

GRANT EXECUTE ON FUNCTION public.refresh_product_cooccurrence TO authenticated;

-- ── F14: Gift Cards ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ecom_gift_cards (
  id                   BIGSERIAL PRIMARY KEY,
  company_id           INTEGER NOT NULL,
  code                 VARCHAR(32) NOT NULL,
  initial_value        DECIMAL(10,2) NOT NULL,
  remaining_value      DECIMAL(10,2) NOT NULL,
  currency             VARCHAR(10) DEFAULT 'INR',
  purchased_by_email   TEXT,
  sent_to_email        TEXT,
  sent_to_name         TEXT,
  message              TEXT,
  purchase_order_id    BIGINT REFERENCES ecom_orders(id) ON DELETE SET NULL,
  is_active            BOOLEAN DEFAULT true,
  expires_at           TIMESTAMPTZ,
  created_at           TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, code)
);

CREATE TABLE IF NOT EXISTS public.ecom_gift_card_redemptions (
  id            BIGSERIAL PRIMARY KEY,
  gift_card_id  BIGINT NOT NULL REFERENCES ecom_gift_cards(id) ON DELETE CASCADE,
  order_id      BIGINT REFERENCES ecom_orders(id) ON DELETE SET NULL,
  amount_used   DECIMAL(10,2) NOT NULL,
  redeemed_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ecom_gift_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY gift_cards_anon_read ON ecom_gift_cards FOR SELECT USING (is_active = true);
CREATE POLICY gift_cards_company ON ecom_gift_cards
  FOR ALL USING (company_id IN (SELECT cu.company_id FROM company_users cu WHERE cu.user_id = auth.uid()));

ALTER TABLE ecom_gift_card_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY gift_card_redemptions_insert ON ecom_gift_card_redemptions FOR INSERT WITH CHECK (true);

-- Gift card columns on orders
ALTER TABLE ecom_orders
  ADD COLUMN IF NOT EXISTS gift_card_code     VARCHAR(32),
  ADD COLUMN IF NOT EXISTS gift_card_discount DECIMAL(10,2) DEFAULT 0;

-- Gift card validation function
CREATE OR REPLACE FUNCTION public.validate_gift_card(
  p_company_id INTEGER,
  p_code       TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_card RECORD;
BEGIN
  SELECT * INTO v_card FROM ecom_gift_cards
  WHERE company_id = p_company_id
    AND UPPER(code) = UPPER(p_code)
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
    AND remaining_value > 0;

  IF v_card.id IS NULL THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Invalid or expired gift card');
  END IF;

  RETURN jsonb_build_object(
    'valid',           true,
    'gift_card_id',    v_card.id,
    'remaining_value', v_card.remaining_value
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.validate_gift_card TO anon;
GRANT EXECUTE ON FUNCTION public.validate_gift_card TO authenticated;

-- Redeem gift card (service role only)
CREATE OR REPLACE FUNCTION public.redeem_gift_card(
  p_gift_card_id BIGINT,
  p_order_id     BIGINT,
  p_amount       DECIMAL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_card RECORD;
BEGIN
  SELECT * INTO v_card FROM ecom_gift_cards WHERE id = p_gift_card_id FOR UPDATE;
  IF v_card.remaining_value < p_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance');
  END IF;
  UPDATE ecom_gift_cards SET remaining_value = remaining_value - p_amount WHERE id = p_gift_card_id;
  INSERT INTO ecom_gift_card_redemptions(gift_card_id, order_id, amount_used) VALUES(p_gift_card_id, p_order_id, p_amount);
  RETURN jsonb_build_object('success', true, 'new_balance', v_card.remaining_value - p_amount);
END;
$$;

GRANT EXECUTE ON FUNCTION public.redeem_gift_card TO service_role;

-- ── F19: Analytics ────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW public.v_ecom_analytics AS
SELECT
  company_id,
  DATE_TRUNC('day', created_at) AS date,
  COUNT(*) FILTER (WHERE status != 'cancelled') AS orders_count,
  COALESCE(SUM(grand_total) FILTER (WHERE status != 'cancelled'), 0) AS revenue,
  COALESCE(AVG(grand_total) FILTER (WHERE status != 'cancelled'), 0) AS avg_order_value,
  COUNT(DISTINCT customer_email) FILTER (WHERE status != 'cancelled') AS unique_customers,
  COUNT(*) FILTER (WHERE payment_method = 'cod' AND status != 'cancelled') AS cod_orders,
  COUNT(*) FILTER (WHERE payment_method = 'razorpay' AND status != 'cancelled') AS online_orders,
  COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled_orders
FROM ecom_orders
GROUP BY company_id, DATE_TRUNC('day', created_at);

-- Page views for conversion funnel
CREATE TABLE IF NOT EXISTS public.ecom_page_views (
  id          BIGSERIAL PRIMARY KEY,
  company_id  INTEGER,
  page_type   VARCHAR(50),  -- 'home','product','category','cart','checkout','order_success'
  page_slug   VARCHAR(255),
  session_id  TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_views_company_date ON ecom_page_views(company_id, created_at);

ALTER TABLE ecom_page_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY page_views_insert ON ecom_page_views FOR INSERT WITH CHECK (true);
CREATE POLICY page_views_company ON ecom_page_views FOR SELECT USING (
  company_id IN (SELECT cu.company_id FROM company_users cu WHERE cu.user_id = auth.uid())
);
