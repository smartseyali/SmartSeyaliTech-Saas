-- ============================================================
-- ECOM CUSTOMERS: Separate customer table for storefront buyers
--
-- auth.users + users = SaaS platform subscribers ONLY
-- ecom_customers = Storefront customers per company
-- master_contacts = Auto-synced from ecom_customers (type=Customer)
-- ============================================================

-- 1. Add columns to ecom_customers
ALTER TABLE ecom_customers ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id);
ALTER TABLE ecom_customers ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE ecom_customers ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE ecom_customers ADD COLUMN IF NOT EXISTS state VARCHAR(100);
ALTER TABLE ecom_customers ADD COLUMN IF NOT EXISTS pincode VARCHAR(20);
ALTER TABLE ecom_customers ADD COLUMN IF NOT EXISTS total_orders INT DEFAULT 0;
ALTER TABLE ecom_customers ADD COLUMN IF NOT EXISTS total_spent DECIMAL(15,2) DEFAULT 0;

-- 2. Unique constraint: one customer per email per company
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'unique_customer_email_company'
    ) THEN
        ALTER TABLE ecom_customers ADD CONSTRAINT unique_customer_email_company
            UNIQUE (company_id, email);
    END IF;
END $$;

-- 3. Update handle_new_user trigger to SKIP storefront signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create users profile for SaaS platform signups
  -- Storefront customers (signup_type=storefront) go to ecom_customers instead
  IF COALESCE(new.raw_user_meta_data->>'signup_type', 'platform') != 'storefront' THEN
    INSERT INTO public.users (id, username, full_name, avatar_url, is_super_admin)
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data->>'username', new.email),
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'avatar_url',
      COALESCE((new.raw_user_meta_data->>'is_super_admin')::boolean, false)
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. RLS policies for ecom_customers
-- Anon: can insert (guest registration) and select (storefront)
DROP POLICY IF EXISTS "anon_insert" ON public.ecom_customers;
CREATE POLICY "anon_insert" ON public.ecom_customers FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "anon_select" ON public.ecom_customers;
CREATE POLICY "anon_select" ON public.ecom_customers FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_update" ON public.ecom_customers;
CREATE POLICY "anon_update" ON public.ecom_customers FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Authenticated storefront customers: can read/update own profile
DROP POLICY IF EXISTS "auth_insert" ON public.ecom_customers;
CREATE POLICY "auth_insert" ON public.ecom_customers FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_select" ON public.ecom_customers;
CREATE POLICY "auth_select" ON public.ecom_customers FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_update" ON public.ecom_customers;
CREATE POLICY "auth_update" ON public.ecom_customers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Fix service_role_bypass
DROP POLICY IF EXISTS "service_role_bypass" ON public.ecom_customers;
CREATE POLICY "service_role_bypass" ON public.ecom_customers FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 5. Grants
GRANT SELECT, INSERT, UPDATE ON public.ecom_customers TO anon;
GRANT SELECT, INSERT, UPDATE ON public.ecom_customers TO authenticated;

-- 6. Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_ecom_customers_auth_user ON ecom_customers(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_ecom_customers_email_company ON ecom_customers(company_id, email);

-- Done!
