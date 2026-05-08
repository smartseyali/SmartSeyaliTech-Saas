-- ═══════════════════════════════════════════════════════════════════════════
--  Phase 1 — F4: Coupon Redemption Log + validate_coupon() RPC
--  ecom_coupons table already exists. This adds the redemption log and
--  the atomic validation function callable from the storefront anon key.
-- ═══════════════════════════════════════════════════════════════════════════

-- Extend ecom_coupons with missing columns
ALTER TABLE ecom_coupons
  ADD COLUMN IF NOT EXISTS free_shipping     BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS first_order_only  BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS applicable_to     VARCHAR(50) DEFAULT 'all',
  ADD COLUMN IF NOT EXISTS discount_type     VARCHAR(50), -- alias for 'type' used by validate fn
  ADD COLUMN IF NOT EXISTS discount_value    DECIMAL(15,2), -- alias for 'value'
  ADD COLUMN IF NOT EXISTS max_discount_amount DECIMAL(15,2),
  ADD COLUMN IF NOT EXISTS used_count        INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS valid_to          DATE;

-- Sync legacy column names → new names for the validate function
-- (keep old names for admin back-compat)
UPDATE ecom_coupons SET
  discount_type  = type,
  discount_value = value,
  max_discount_amount = max_discount,
  valid_to = valid_until::DATE
WHERE discount_type IS NULL;

-- Redemption log
CREATE TABLE IF NOT EXISTS public.ecom_coupon_redemptions (
  id             BIGSERIAL PRIMARY KEY,
  company_id     INTEGER NOT NULL,
  coupon_id      BIGINT NOT NULL,
  order_id       BIGINT,
  customer_email TEXT NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  redeemed_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_coupon ON ecom_coupon_redemptions(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_email  ON ecom_coupon_redemptions(customer_email);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_company ON ecom_coupon_redemptions(company_id);

ALTER TABLE ecom_coupon_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY coupon_redemptions_anon_insert ON ecom_coupon_redemptions
  FOR INSERT WITH CHECK (true);
CREATE POLICY coupon_redemptions_company_read ON ecom_coupon_redemptions
  FOR SELECT USING (
    company_id IN (SELECT cu.company_id FROM company_users cu WHERE cu.user_id = auth.uid())
  );

-- ── validate_coupon: callable by anon key via supabase.rpc() ─────────────
-- Returns {valid, discount_amount, coupon_id, free_shipping, error}
CREATE OR REPLACE FUNCTION public.validate_coupon(
  p_company_id   INTEGER,
  p_code         TEXT,
  p_order_total  DECIMAL,
  p_customer_email TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_coupon   RECORD;
  v_uses     INTEGER;
  v_discount DECIMAL;
BEGIN
  SELECT * INTO v_coupon
  FROM ecom_coupons
  WHERE company_id = p_company_id
    AND UPPER(code) = UPPER(p_code)
    AND is_active = true
    AND (valid_from  IS NULL OR valid_from  <= CURRENT_DATE)
    AND (COALESCE(valid_to, valid_until::DATE) IS NULL
         OR COALESCE(valid_to, valid_until::DATE) >= CURRENT_DATE);

  IF v_coupon.id IS NULL THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Invalid or expired coupon code');
  END IF;

  IF v_coupon.usage_limit IS NOT NULL
     AND COALESCE(v_coupon.used_count, 0) >= v_coupon.usage_limit THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Coupon usage limit reached');
  END IF;

  IF p_order_total < COALESCE(v_coupon.min_order_amount, 0) THEN
    RETURN jsonb_build_object('valid', false,
      'error', 'Minimum order ₹' || COALESCE(v_coupon.min_order_amount, 0)::TEXT || ' required');
  END IF;

  -- Per-user limit check
  SELECT COUNT(*) INTO v_uses
  FROM ecom_coupon_redemptions
  WHERE coupon_id = v_coupon.id AND LOWER(customer_email) = LOWER(p_customer_email);

  IF v_coupon.per_user_limit IS NOT NULL AND v_uses >= v_coupon.per_user_limit THEN
    RETURN jsonb_build_object('valid', false, 'error', 'You have already used this coupon');
  END IF;

  -- First-order-only check
  IF COALESCE(v_coupon.first_order_only, false) THEN
    SELECT COUNT(*) INTO v_uses
    FROM ecom_orders
    WHERE company_id = p_company_id
      AND LOWER(customer_email) = LOWER(p_customer_email)
      AND status != 'cancelled';
    IF v_uses > 0 THEN
      RETURN jsonb_build_object('valid', false, 'error', 'This coupon is for first orders only');
    END IF;
  END IF;

  -- Calculate discount
  v_discount := CASE COALESCE(v_coupon.discount_type, v_coupon.type)
    WHEN 'percentage' THEN
      LEAST(
        p_order_total * COALESCE(v_coupon.discount_value, v_coupon.value) / 100,
        COALESCE(v_coupon.max_discount_amount, v_coupon.max_discount, p_order_total)
      )
    WHEN 'free_shipping' THEN 0
    ELSE COALESCE(v_coupon.discount_value, v_coupon.value, 0)
  END;

  RETURN jsonb_build_object(
    'valid',           true,
    'discount_amount', ROUND(v_discount, 2),
    'coupon_id',       v_coupon.id,
    'free_shipping',   COALESCE(v_coupon.free_shipping, v_coupon.type = 'free_shipping', false),
    'discount_type',   COALESCE(v_coupon.discount_type, v_coupon.type)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.validate_coupon TO anon;
GRANT EXECUTE ON FUNCTION public.validate_coupon TO authenticated;
