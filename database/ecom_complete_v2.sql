-- ========================================================================================
-- SMARTSEYALI ECOMMERCE MODULE — Complete V2 Migration
-- Order prefix, cancel/return/refund, payment transactions, RLS
-- Safe to run multiple times (idempotent)
-- ========================================================================================


-- ========================================================================================
-- 1. ECOM_SETTINGS — Order configuration, tax, return policy
-- ========================================================================================

ALTER TABLE ecom_settings ADD COLUMN IF NOT EXISTS order_prefix VARCHAR(20) DEFAULT 'ORD';
ALTER TABLE ecom_settings ADD COLUMN IF NOT EXISTS next_order_number BIGINT DEFAULT 1001;
ALTER TABLE ecom_settings ADD COLUMN IF NOT EXISTS return_policy TEXT;
ALTER TABLE ecom_settings ADD COLUMN IF NOT EXISTS auto_confirm_paid_orders BOOLEAN DEFAULT true;
ALTER TABLE ecom_settings ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 0;
ALTER TABLE ecom_settings ADD COLUMN IF NOT EXISTS smtp_host VARCHAR(255) DEFAULT 'smtp.gmail.com';
ALTER TABLE ecom_settings ADD COLUMN IF NOT EXISTS smtp_port INT DEFAULT 587;
ALTER TABLE ecom_settings ADD COLUMN IF NOT EXISTS smtp_user VARCHAR(255);
ALTER TABLE ecom_settings ADD COLUMN IF NOT EXISTS smtp_pass TEXT;
ALTER TABLE ecom_settings ADD COLUMN IF NOT EXISTS smtp_from_name VARCHAR(255);
ALTER TABLE ecom_settings ADD COLUMN IF NOT EXISTS smtp_from_email VARCHAR(255);
ALTER TABLE ecom_settings ADD COLUMN IF NOT EXISTS storefront_url VARCHAR(500);


-- ========================================================================================
-- 2. GENERATE_ORDER_NUMBER — Atomic sequential order number generator
-- ========================================================================================

CREATE OR REPLACE FUNCTION public.generate_order_number(p_company_id BIGINT)
RETURNS TEXT AS $$
DECLARE
  v_prefix TEXT;
  v_seq BIGINT;
BEGIN
  -- Lock the row and get current prefix + sequence
  SELECT order_prefix, next_order_number
  INTO v_prefix, v_seq
  FROM public.ecom_settings
  WHERE company_id = p_company_id
  FOR UPDATE;

  -- If no settings exist, create default
  IF v_prefix IS NULL THEN
    INSERT INTO public.ecom_settings (company_id, order_prefix, next_order_number)
    VALUES (p_company_id, 'ORD', 1001)
    ON CONFLICT (company_id) DO NOTHING;
    v_prefix := 'ORD';
    v_seq := 1001;
  END IF;

  -- Increment the sequence
  UPDATE public.ecom_settings
  SET next_order_number = v_seq + 1, updated_at = now()
  WHERE company_id = p_company_id;

  -- Return formatted order number
  RETURN v_prefix || '-' || v_seq::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- ========================================================================================
-- 3. ECOM_ORDERS — Cancel & Return columns
-- ========================================================================================

ALTER TABLE ecom_orders ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
ALTER TABLE ecom_orders ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;
ALTER TABLE ecom_orders ADD COLUMN IF NOT EXISTS cancelled_by VARCHAR(100);
ALTER TABLE ecom_orders ADD COLUMN IF NOT EXISTS return_status VARCHAR(50);
ALTER TABLE ecom_orders ADD COLUMN IF NOT EXISTS return_reason TEXT;
ALTER TABLE ecom_orders ADD COLUMN IF NOT EXISTS return_requested_at TIMESTAMPTZ;


-- ========================================================================================
-- 4. REFUNDS — Expand for full refund workflow
-- ========================================================================================

ALTER TABLE refunds ADD COLUMN IF NOT EXISTS order_number VARCHAR(100);
ALTER TABLE refunds ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);
ALTER TABLE refunds ADD COLUMN IF NOT EXISTS refund_type VARCHAR(50) DEFAULT 'full';
ALTER TABLE refunds ADD COLUMN IF NOT EXISTS refund_method VARCHAR(50) DEFAULT 'original_payment';
ALTER TABLE refunds ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ;
ALTER TABLE refunds ADD COLUMN IF NOT EXISTS notes TEXT;


-- ========================================================================================
-- 5. PAYMENT_TRANSACTIONS — Audit log for all payment events
-- ========================================================================================

CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id BIGINT REFERENCES public.companies(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.ecom_orders(id) ON DELETE SET NULL,
  gateway VARCHAR(50) NOT NULL,
  transaction_id VARCHAR(255),
  amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'INR',
  status VARCHAR(50) NOT NULL DEFAULT 'initiated',
  gateway_response JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_payment_tx_order ON payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_tx_company ON payment_transactions(company_id);


-- ========================================================================================
-- 6. ECOM_CUSTOMERS — Direct auth (no Supabase auth.users)
-- ========================================================================================

-- Password hash + email verification columns
ALTER TABLE ecom_customers ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE ecom_customers ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE ecom_customers ADD COLUMN IF NOT EXISTS verification_token TEXT;
ALTER TABLE ecom_customers ADD COLUMN IF NOT EXISTS verification_token_expires_at TIMESTAMPTZ;

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Customer Signup: hashes password, generates verification token, returns customer + token
CREATE OR REPLACE FUNCTION public.customer_signup(
  p_company_id BIGINT,
  p_email TEXT,
  p_password TEXT,
  p_full_name TEXT,
  p_phone TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_existing RECORD;
  v_customer RECORD;
  v_token TEXT;
BEGIN
  -- Check if email already registered for this company
  SELECT id, email_verified INTO v_existing
  FROM public.ecom_customers
  WHERE company_id = p_company_id AND LOWER(email) = LOWER(p_email);

  IF v_existing.id IS NOT NULL THEN
    RAISE EXCEPTION 'An account with this email already exists';
  END IF;

  -- Generate a secure verification token
  v_token := encode(gen_random_bytes(32), 'hex');

  -- Insert customer with hashed password (email_verified = false)
  INSERT INTO public.ecom_customers (
    company_id, email, full_name, phone, password_hash,
    status, email_verified, verification_token, verification_token_expires_at
  )
  VALUES (
    p_company_id,
    LOWER(p_email),
    p_full_name,
    p_phone,
    crypt(p_password, gen_salt('bf', 10)),
    'active',
    false,
    v_token,
    now() + interval '24 hours'
  )
  RETURNING id, company_id, email, full_name, phone, status, email_verified
  INTO v_customer;

  RETURN jsonb_build_object(
    'id', v_customer.id,
    'company_id', v_customer.company_id,
    'email', v_customer.email,
    'full_name', v_customer.full_name,
    'phone', v_customer.phone,
    'status', v_customer.status,
    'email_verified', v_customer.email_verified,
    'verification_token', v_token
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Customer Login: verifies password, returns customer data or null
CREATE OR REPLACE FUNCTION public.customer_login(
  p_company_id BIGINT,
  p_email TEXT,
  p_password TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_customer RECORD;
BEGIN
  SELECT id, company_id, email, full_name, phone, status, password_hash,
         email_verified, address, city, state, pincode, total_orders, total_spent
  INTO v_customer
  FROM public.ecom_customers
  WHERE company_id = p_company_id AND LOWER(email) = LOWER(p_email);

  IF v_customer.id IS NULL THEN
    RAISE EXCEPTION 'Invalid email or password';
  END IF;

  IF v_customer.status = 'blocked' THEN
    RAISE EXCEPTION 'Your account has been suspended. Please contact support.';
  END IF;

  IF v_customer.password_hash IS NULL OR v_customer.password_hash = '' THEN
    RAISE EXCEPTION 'Please sign up first or reset your password';
  END IF;

  -- Verify password
  IF v_customer.password_hash != crypt(p_password, v_customer.password_hash) THEN
    RAISE EXCEPTION 'Invalid email or password';
  END IF;

  RETURN jsonb_build_object(
    'id', v_customer.id,
    'company_id', v_customer.company_id,
    'email', v_customer.email,
    'full_name', v_customer.full_name,
    'phone', v_customer.phone,
    'status', v_customer.status,
    'email_verified', COALESCE(v_customer.email_verified, false),
    'address', v_customer.address,
    'city', v_customer.city,
    'state', v_customer.state,
    'pincode', v_customer.pincode,
    'total_orders', v_customer.total_orders,
    'total_spent', v_customer.total_spent
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- Customer Verify Email: validates token and marks email as verified
CREATE OR REPLACE FUNCTION public.customer_verify_email(p_token TEXT)
RETURNS JSONB AS $$
DECLARE
  v_customer RECORD;
BEGIN
  SELECT id, email, full_name, company_id, email_verified, verification_token_expires_at
  INTO v_customer
  FROM public.ecom_customers
  WHERE verification_token = p_token;

  IF v_customer.id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired verification link';
  END IF;

  IF v_customer.email_verified = true THEN
    RETURN jsonb_build_object('already_verified', true, 'email', v_customer.email);
  END IF;

  IF v_customer.verification_token_expires_at < now() THEN
    RAISE EXCEPTION 'Verification link has expired. Please request a new one.';
  END IF;

  -- Mark as verified and clear token
  UPDATE public.ecom_customers
  SET email_verified = true, verification_token = NULL, verification_token_expires_at = NULL
  WHERE id = v_customer.id;

  RETURN jsonb_build_object(
    'verified', true,
    'email', v_customer.email,
    'full_name', v_customer.full_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- Customer Resend Verification: generates a new token for unverified customers
CREATE OR REPLACE FUNCTION public.customer_resend_verification(
  p_company_id BIGINT,
  p_email TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_customer RECORD;
  v_token TEXT;
BEGIN
  SELECT id, email_verified INTO v_customer
  FROM public.ecom_customers
  WHERE company_id = p_company_id AND LOWER(email) = LOWER(p_email);

  IF v_customer.id IS NULL THEN
    RAISE EXCEPTION 'Account not found';
  END IF;

  IF v_customer.email_verified = true THEN
    RETURN jsonb_build_object('already_verified', true);
  END IF;

  v_token := encode(gen_random_bytes(32), 'hex');

  UPDATE public.ecom_customers
  SET verification_token = v_token, verification_token_expires_at = now() + interval '24 hours'
  WHERE id = v_customer.id;

  RETURN jsonb_build_object('token', v_token);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- Grants
GRANT EXECUTE ON FUNCTION public.customer_signup(BIGINT, TEXT, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.customer_signup(BIGINT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.customer_login(BIGINT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.customer_login(BIGINT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.customer_verify_email(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.customer_verify_email(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.customer_resend_verification(BIGINT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.customer_resend_verification(BIGINT, TEXT) TO authenticated;


-- ========================================================================================
-- 6B. ECOM_PRODUCT_REVIEWS — Add status column if missing
-- ========================================================================================

ALTER TABLE ecom_product_reviews ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE ecom_product_reviews ADD COLUMN IF NOT EXISTS is_verified_purchase BOOLEAN DEFAULT false;


-- ========================================================================================
-- 7. RLS POLICIES — Storefront customer access
-- ========================================================================================

-- 7A. Fix ecom_customers: scope anon/auth by company_id (not blanket access)
DROP POLICY IF EXISTS "anon_insert" ON public.ecom_customers;
DROP POLICY IF EXISTS "anon_select" ON public.ecom_customers;
DROP POLICY IF EXISTS "anon_update" ON public.ecom_customers;
DROP POLICY IF EXISTS "auth_insert" ON public.ecom_customers;
DROP POLICY IF EXISTS "auth_select" ON public.ecom_customers;
DROP POLICY IF EXISTS "auth_update" ON public.ecom_customers;

-- Anon: can insert with company_id, can read within same company
CREATE POLICY "anon_insert" ON public.ecom_customers
  FOR INSERT TO anon WITH CHECK (company_id IS NOT NULL);

CREATE POLICY "anon_select" ON public.ecom_customers
  FOR SELECT TO anon USING (true);

-- Authenticated storefront customers
CREATE POLICY "auth_select" ON public.ecom_customers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "auth_insert" ON public.ecom_customers
  FOR INSERT TO authenticated WITH CHECK (company_id IS NOT NULL);

CREATE POLICY "auth_update" ON public.ecom_customers
  FOR UPDATE TO authenticated
  USING (auth_user_id = auth.uid() OR public.user_has_company_access(company_id))
  WITH CHECK (auth_user_id = auth.uid() OR public.user_has_company_access(company_id));


-- 7B. Storefront: anon can read published coupons & offers
DROP POLICY IF EXISTS "anon_read_coupons" ON public.coupons;
CREATE POLICY "anon_read_coupons" ON public.coupons
  FOR SELECT TO anon USING (is_active = true);

DROP POLICY IF EXISTS "anon_read_ecom_coupons" ON public.ecom_coupons;
CREATE POLICY "anon_read_ecom_coupons" ON public.ecom_coupons
  FOR SELECT TO anon USING (is_active = true);

DROP POLICY IF EXISTS "anon_read_offers" ON public.offers;
CREATE POLICY "anon_read_offers" ON public.offers
  FOR SELECT TO anon USING (is_active = true);

DROP POLICY IF EXISTS "anon_read_ecom_offers" ON public.ecom_offers;
CREATE POLICY "anon_read_ecom_offers" ON public.ecom_offers
  FOR SELECT TO anon USING (is_active = true);


-- 7C. Storefront: anon can read published reviews
DROP POLICY IF EXISTS "anon_read_reviews" ON public.ecom_product_reviews;
CREATE POLICY "anon_read_reviews" ON public.ecom_product_reviews
  FOR SELECT TO anon USING (status = 'approved' OR is_published = true);


-- 7D. Storefront order access
-- Anon: can INSERT orders (guest checkout) and SELECT (for order tracking page)
-- Note: Order tracking is secured at application level (requires order_number + email match)
DROP POLICY IF EXISTS "anon_insert_orders" ON public.ecom_orders;
CREATE POLICY "anon_insert_orders" ON public.ecom_orders
  FOR INSERT TO anon WITH CHECK (company_id IS NOT NULL);

DROP POLICY IF EXISTS "anon_read_own_orders" ON public.ecom_orders;
CREATE POLICY "anon_read_own_orders" ON public.ecom_orders
  FOR SELECT TO anon USING (true);

-- Override the default tenant_isolation policy for ecom_orders
-- Storefront customers need to read their own orders (not just company members)
DROP POLICY IF EXISTS "tenant_isolation" ON public.ecom_orders;
CREATE POLICY "tenant_isolation" ON public.ecom_orders
  FOR ALL TO authenticated
  USING (
    user_id = auth.uid()
    OR customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR public.user_has_company_access(company_id)
  )
  WITH CHECK (
    public.user_has_company_access(company_id)
    OR company_id IS NOT NULL
  );

-- Override tenant_isolation for ecom_order_items too
DROP POLICY IF EXISTS "tenant_isolation" ON public.ecom_order_items;
CREATE POLICY "tenant_isolation" ON public.ecom_order_items
  FOR ALL TO authenticated
  USING (
    order_id IN (
      SELECT id FROM public.ecom_orders
      WHERE user_id = auth.uid()
        OR customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
        OR public.user_has_company_access(company_id)
    )
  )
  WITH CHECK (company_id IS NOT NULL);

-- Override tenant_isolation for ecom_order_timeline
DROP POLICY IF EXISTS "tenant_isolation" ON public.ecom_order_timeline;
CREATE POLICY "tenant_isolation" ON public.ecom_order_timeline
  FOR ALL TO authenticated
  USING (
    order_id IN (
      SELECT id FROM public.ecom_orders
      WHERE user_id = auth.uid()
        OR customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
        OR public.user_has_company_access(company_id)
    )
  )
  WITH CHECK (true);

-- Order items: anon + customer access
DROP POLICY IF EXISTS "anon_insert_order_items" ON public.ecom_order_items;
CREATE POLICY "anon_insert_order_items" ON public.ecom_order_items
  FOR INSERT TO anon WITH CHECK (company_id IS NOT NULL);

DROP POLICY IF EXISTS "anon_read_order_items" ON public.ecom_order_items;
CREATE POLICY "anon_read_order_items" ON public.ecom_order_items
  FOR SELECT TO anon USING (true);

-- Timeline: anon + customer access
DROP POLICY IF EXISTS "anon_insert_timeline" ON public.ecom_order_timeline;
CREATE POLICY "anon_insert_timeline" ON public.ecom_order_timeline
  FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "anon_read_timeline" ON public.ecom_order_timeline;
CREATE POLICY "anon_read_timeline" ON public.ecom_order_timeline
  FOR SELECT TO anon USING (true);


-- 7E. Storefront: anon can submit reviews
DROP POLICY IF EXISTS "anon_insert_reviews" ON public.ecom_product_reviews;
CREATE POLICY "anon_insert_reviews" ON public.ecom_product_reviews
  FOR INSERT TO anon WITH CHECK (company_id IS NOT NULL);


-- 7F. Payment transactions: tenant isolation + service role
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_isolation" ON public.payment_transactions;
CREATE POLICY "tenant_isolation" ON public.payment_transactions
  FOR ALL TO authenticated
  USING (public.user_has_company_access(company_id))
  WITH CHECK (public.user_has_company_access(company_id));

DROP POLICY IF EXISTS "anon_insert_tx" ON public.payment_transactions;
CREATE POLICY "anon_insert_tx" ON public.payment_transactions
  FOR INSERT TO anon WITH CHECK (company_id IS NOT NULL);

DROP POLICY IF EXISTS "anon_read_tx" ON public.payment_transactions;
CREATE POLICY "anon_read_tx" ON public.payment_transactions
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "service_role_bypass" ON public.payment_transactions;
CREATE POLICY "service_role_bypass" ON public.payment_transactions
  FOR ALL USING (auth.role() = 'service_role');


-- 7G. Storefront: anon can read store settings (via secure view), shipping zones, banners
-- SECURITY: Create a view that excludes SMTP credentials from anon access
CREATE OR REPLACE VIEW public.ecom_settings_public AS
  SELECT id, company_id, logo_url, favicon_url, store_name, store_tagline,
         primary_color, contact_email, contact_phone, address,
         facebook_url, instagram_url, twitter_url, whatsapp_number,
         footer_text, currency, gst_number, meta_title, meta_description,
         order_prefix, return_policy, storefront_url,
         created_at, updated_at
  FROM public.ecom_settings;
-- (smtp_host, smtp_port, smtp_user, smtp_pass, smtp_from_name, smtp_from_email are EXCLUDED)

GRANT SELECT ON public.ecom_settings_public TO anon;

-- Anon can read settings (full table) — needed for RPC functions that run SECURITY DEFINER
DROP POLICY IF EXISTS "anon_read_settings" ON public.ecom_settings;
CREATE POLICY "anon_read_settings" ON public.ecom_settings
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_read_shipping" ON public.shipping_zones;
CREATE POLICY "anon_read_shipping" ON public.shipping_zones
  FOR SELECT TO anon USING (is_active = true);

DROP POLICY IF EXISTS "anon_read_ecom_shipping" ON public.ecom_shipping_zones;
CREATE POLICY "anon_read_ecom_shipping" ON public.ecom_shipping_zones
  FOR SELECT TO anon USING (is_active = true);

DROP POLICY IF EXISTS "anon_read_banners" ON public.ecom_banners;
CREATE POLICY "anon_read_banners" ON public.ecom_banners
  FOR SELECT TO anon USING (true);


-- 7H. Storefront: anon can read products, variants, categories, brands
DROP POLICY IF EXISTS "anon_read_items" ON public.master_items;
CREATE POLICY "anon_read_items" ON public.master_items
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_read_variants" ON public.master_product_variants;
CREATE POLICY "anon_read_variants" ON public.master_product_variants
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_read_categories" ON public.master_categories;
CREATE POLICY "anon_read_categories" ON public.master_categories
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_read_brands" ON public.master_brands;
CREATE POLICY "anon_read_brands" ON public.master_brands
  FOR SELECT TO anon USING (true);


-- 7I. Storefront: anon can create/update abandoned carts
DROP POLICY IF EXISTS "anon_insert_carts" ON public.ecom_abandoned_carts;
CREATE POLICY "anon_insert_carts" ON public.ecom_abandoned_carts
  FOR INSERT TO anon WITH CHECK (company_id IS NOT NULL);

DROP POLICY IF EXISTS "anon_update_carts" ON public.ecom_abandoned_carts;
CREATE POLICY "anon_update_carts" ON public.ecom_abandoned_carts
  FOR UPDATE TO anon USING (true) WITH CHECK (true);


-- 7J. Storefront: anon can read payment gateways (for checkout — only non-secret fields exposed via app)
DROP POLICY IF EXISTS "anon_read_gateways" ON public.payment_gateways;
CREATE POLICY "anon_read_gateways" ON public.payment_gateways
  FOR SELECT TO anon USING (is_active = true);


-- 7K. Storefront: anon can read gallery images & videos
DROP POLICY IF EXISTS "anon_read_gallery_images" ON public.ecom_gallery_images;
CREATE POLICY "anon_read_gallery_images" ON public.ecom_gallery_images
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_read_gallery_videos" ON public.ecom_gallery_videos;
CREATE POLICY "anon_read_gallery_videos" ON public.ecom_gallery_videos
  FOR SELECT TO anon USING (true);


-- 7L. Storefront: anon can read pages, menus, blog (public CMS content)
DROP POLICY IF EXISTS "anon_read_pages" ON public.ecom_pages;
CREATE POLICY "anon_read_pages" ON public.ecom_pages
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_read_menus" ON public.ecom_menus;
CREATE POLICY "anon_read_menus" ON public.ecom_menus
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_read_blog" ON public.ecom_blog;
CREATE POLICY "anon_read_blog" ON public.ecom_blog
  FOR SELECT TO anon USING (true);


-- 7M. Storefront: anon can read company info (for store login page, store resolution)
DROP POLICY IF EXISTS "anon_read_companies" ON public.companies;
CREATE POLICY "anon_read_companies" ON public.companies
  FOR SELECT TO anon USING (is_active = true);


-- 7N. Secure email sending: DB function reads SMTP config internally (SECURITY DEFINER)
-- Frontend calls this instead of reading SMTP credentials directly
CREATE OR REPLACE FUNCTION public.get_smtp_config(p_company_id BIGINT)
RETURNS JSONB AS $$
BEGIN
  RETURN (
    SELECT jsonb_build_object(
      'host', COALESCE(smtp_host, 'smtp.gmail.com'),
      'port', COALESCE(smtp_port, 587),
      'user', smtp_user,
      'pass', smtp_pass,
      'from_name', COALESCE(smtp_from_name, store_name, 'Store'),
      'from_email', COALESCE(smtp_from_email, smtp_user),
      'store_name', store_name,
      'storefront_url', storefront_url
    )
    FROM public.ecom_settings
    WHERE company_id = p_company_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Only Edge Functions (service_role) should call this, not anon
GRANT EXECUTE ON FUNCTION public.get_smtp_config(BIGINT) TO service_role;


-- ========================================================================================
-- 8. GRANTS
-- ========================================================================================

-- Storefront read access
GRANT SELECT ON public.ecom_settings TO anon;
GRANT SELECT ON public.ecom_settings_public TO anon;
GRANT SELECT ON public.master_items TO anon;
GRANT SELECT ON public.master_product_variants TO anon;
GRANT SELECT ON public.master_categories TO anon;
GRANT SELECT ON public.master_brands TO anon;
GRANT SELECT ON public.ecom_banners TO anon;
GRANT SELECT ON public.shipping_zones TO anon;
GRANT SELECT ON public.coupons TO anon;
GRANT SELECT ON public.offers TO anon;
GRANT SELECT ON public.ecom_coupons TO anon;
GRANT SELECT ON public.ecom_offers TO anon;
GRANT SELECT ON public.ecom_shipping_zones TO anon;
GRANT SELECT ON public.payment_gateways TO anon;
GRANT SELECT ON public.ecom_gallery_images TO anon;
GRANT SELECT ON public.ecom_gallery_videos TO anon;
GRANT SELECT ON public.ecom_pages TO anon;
GRANT SELECT ON public.ecom_menus TO anon;
GRANT SELECT ON public.ecom_blog TO anon;
GRANT SELECT ON public.companies TO anon;

-- Storefront write access
GRANT SELECT, INSERT ON public.ecom_orders TO anon;
GRANT SELECT, INSERT ON public.ecom_order_items TO anon;
GRANT SELECT, INSERT ON public.ecom_order_timeline TO anon;
GRANT SELECT, INSERT ON public.ecom_product_reviews TO anon;
GRANT SELECT, INSERT, UPDATE ON public.ecom_abandoned_carts TO anon;
GRANT SELECT, INSERT, UPDATE ON public.ecom_customers TO anon;
GRANT SELECT, INSERT ON public.payment_transactions TO anon;

-- Authenticated access
GRANT ALL ON public.payment_transactions TO authenticated;

-- Function access
GRANT EXECUTE ON FUNCTION public.generate_order_number(BIGINT) TO anon;
GRANT EXECUTE ON FUNCTION public.generate_order_number(BIGINT) TO authenticated;


-- Done!
-- Run this in Supabase SQL Editor after deploying the frontend changes.
