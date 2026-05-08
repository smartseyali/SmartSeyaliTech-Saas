-- ═══════════════════════════════════════════════════════════════════════════
--  Phase 2 — F7: GST Calculation + F8: Customer Accounts
-- ═══════════════════════════════════════════════════════════════════════════

-- ── GST columns on ecom_orders ───────────────────────────────────────────
ALTER TABLE ecom_orders
  ADD COLUMN IF NOT EXISTS cgst_amount      DECIMAL(15,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sgst_amount      DECIMAL(15,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS igst_amount      DECIMAL(15,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS customer_state   VARCHAR(100),
  ADD COLUMN IF NOT EXISTS is_interstate    BOOLEAN DEFAULT false;

ALTER TABLE ecom_order_items
  ADD COLUMN IF NOT EXISTS gst_rate   DECIMAL(5,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gst_amount DECIMAL(15,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS hsn_code   VARCHAR(50);

-- GST rate on products (if not already present)
ALTER TABLE master_items ADD COLUMN IF NOT EXISTS gst_rate DECIMAL(5,2) DEFAULT 0;
ALTER TABLE master_items ADD COLUMN IF NOT EXISTS hsn_code VARCHAR(50);

-- ── calculate_order_gst: callable by anon key ────────────────────────────
CREATE OR REPLACE FUNCTION public.calculate_order_gst(
  p_company_id     INTEGER,
  p_items          JSONB,    -- [{product_id, quantity, unit_price}]
  p_customer_state TEXT,
  p_company_state  TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item       JSONB;
  v_gst_rate   DECIMAL;
  v_item_total DECIMAL;
  v_gst_total  DECIMAL := 0;
  v_interstate BOOLEAN;
BEGIN
  v_interstate := LOWER(TRIM(p_customer_state)) != LOWER(TRIM(p_company_state));

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT COALESCE(gst_rate, 0) INTO v_gst_rate
    FROM master_items
    WHERE id = (v_item->>'product_id')::INTEGER
      AND company_id = p_company_id;

    v_gst_rate  := COALESCE(v_gst_rate, 0);
    v_item_total := (v_item->>'quantity')::DECIMAL * (v_item->>'unit_price')::DECIMAL;
    -- GST is already included in price (tax-inclusive pricing common in India)
    -- Extract GST: gst = price * gst_rate / (100 + gst_rate)
    v_gst_total := v_gst_total + (v_item_total * v_gst_rate / (100 + v_gst_rate));
  END LOOP;

  v_gst_total := ROUND(v_gst_total, 2);

  RETURN jsonb_build_object(
    'total_gst',     v_gst_total,
    'is_interstate', v_interstate,
    'cgst',  CASE WHEN v_interstate THEN 0 ELSE ROUND(v_gst_total / 2, 2) END,
    'sgst',  CASE WHEN v_interstate THEN 0 ELSE ROUND(v_gst_total / 2, 2) END,
    'igst',  CASE WHEN v_interstate THEN v_gst_total ELSE 0 END
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.calculate_order_gst TO anon;
GRANT EXECUTE ON FUNCTION public.calculate_order_gst TO authenticated;

-- ── ecom_settings: company_state for interstate GST ─────────────────────
ALTER TABLE ecom_settings ADD COLUMN IF NOT EXISTS company_state VARCHAR(100);
ALTER TABLE ecom_settings ADD COLUMN IF NOT EXISTS gst_number    VARCHAR(20);

-- ── Customer Sessions (for F8 storefront login) ──────────────────────────
CREATE TABLE IF NOT EXISTS public.ecom_customer_sessions (
  id          BIGSERIAL PRIMARY KEY,
  customer_id BIGINT NOT NULL,
  company_id  INTEGER NOT NULL,
  token       TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days'),
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_sessions_token ON ecom_customer_sessions(token);
CREATE INDEX IF NOT EXISTS idx_customer_sessions_customer ON ecom_customer_sessions(customer_id);

ALTER TABLE ecom_customer_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY customer_sessions_insert ON ecom_customer_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY customer_sessions_select ON ecom_customer_sessions FOR SELECT USING (true);
CREATE POLICY customer_sessions_delete ON ecom_customer_sessions FOR DELETE USING (true);

-- Extend ecom_customers for full account support
ALTER TABLE ecom_customers
  ADD COLUMN IF NOT EXISTS password_hash      TEXT,
  ADD COLUMN IF NOT EXISTS verification_token TEXT,
  ADD COLUMN IF NOT EXISTS is_verified        BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS reset_token        TEXT,
  ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS full_name          VARCHAR(255);

-- customer_signup: create customer account
CREATE OR REPLACE FUNCTION public.customer_signup(
  p_company_id INTEGER,
  p_email      TEXT,
  p_password   TEXT,
  p_name       TEXT,
  p_phone      TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_customer RECORD;
  v_hash     TEXT;
  v_token    TEXT;
BEGIN
  -- Check duplicate
  SELECT id INTO v_customer FROM ecom_customers
  WHERE company_id = p_company_id AND LOWER(email) = LOWER(p_email);

  IF v_customer.id IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'An account with this email already exists');
  END IF;

  v_hash  := crypt(p_password, gen_salt('bf'));
  v_token := encode(gen_random_bytes(32), 'hex');

  INSERT INTO ecom_customers(company_id, email, name, full_name, phone, password_hash, verification_token, is_verified)
  VALUES(p_company_id, LOWER(p_email), p_name, p_name, p_phone, v_hash, v_token, false)
  RETURNING * INTO v_customer;

  RETURN jsonb_build_object(
    'success',            true,
    'customer_id',        v_customer.id,
    'email',              v_customer.email,
    'name',               v_customer.name,
    'verification_token', v_token
  );
END;
$$;

-- customer_login: authenticate + return session token
CREATE OR REPLACE FUNCTION public.customer_login(
  p_company_id INTEGER,
  p_email      TEXT,
  p_password   TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_customer RECORD;
  v_token    TEXT;
BEGIN
  SELECT * INTO v_customer FROM ecom_customers
  WHERE company_id = p_company_id AND LOWER(email) = LOWER(p_email);

  IF v_customer.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No account found with this email');
  END IF;

  IF v_customer.password_hash IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Password not set. Use forgot password to create one.');
  END IF;

  IF v_customer.password_hash != crypt(p_password, v_customer.password_hash) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Incorrect password');
  END IF;

  v_token := encode(gen_random_bytes(48), 'hex');

  INSERT INTO ecom_customer_sessions(customer_id, company_id, token)
  VALUES(v_customer.id, p_company_id, v_token);

  RETURN jsonb_build_object(
    'success',     true,
    'token',       v_token,
    'customer_id', v_customer.id,
    'email',       v_customer.email,
    'name',        COALESCE(v_customer.full_name, v_customer.name)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.customer_signup TO anon;
GRANT EXECUTE ON FUNCTION public.customer_login  TO anon;
GRANT EXECUTE ON FUNCTION public.customer_signup TO authenticated;
GRANT EXECUTE ON FUNCTION public.customer_login  TO authenticated;
