-- ═══════════════════════════════════════════════════════════
-- Fix: Contacts RLS + ecom_customers tenant isolation
-- ═══════════════════════════════════════════════════════════

-- Step 1: Ensure the user_has_company_access function exists
CREATE OR REPLACE FUNCTION public.user_has_company_access(check_company_id BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Super admins have access to ALL companies
  IF EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND is_super_admin = true
  ) THEN
    RETURN true;
  END IF;

  -- Regular users: check company_users mapping or direct ownership
  RETURN EXISTS (
    SELECT 1 FROM public.company_users WHERE user_id = auth.uid() AND company_id = check_company_id
  ) OR EXISTS (
    SELECT 1 FROM public.companies WHERE user_id = auth.uid() AND id = check_company_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Step 2: Fix contacts table RLS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_isolation" ON public.contacts;
CREATE POLICY "tenant_isolation" ON public.contacts
  FOR ALL TO authenticated
  USING (public.user_has_company_access(company_id))
  WITH CHECK (public.user_has_company_access(company_id));

DROP POLICY IF EXISTS "service_role_bypass" ON public.contacts;
CREATE POLICY "service_role_bypass" ON public.contacts
  FOR ALL USING (auth.role() = 'service_role');

-- Step 3: Fix ecom_customers - add proper tenant isolation for admins
-- Keep anon access for storefront, but add tenant isolation for authenticated
ALTER TABLE public.ecom_customers ENABLE ROW LEVEL SECURITY;

-- Drop overly permissive auth policies
DROP POLICY IF EXISTS "auth_select" ON public.ecom_customers;
DROP POLICY IF EXISTS "auth_insert" ON public.ecom_customers;
DROP POLICY IF EXISTS "auth_update" ON public.ecom_customers;
DROP POLICY IF EXISTS "tenant_isolation" ON public.ecom_customers;

-- Authenticated users: tenant-scoped access
CREATE POLICY "tenant_isolation" ON public.ecom_customers
  FOR ALL TO authenticated
  USING (public.user_has_company_access(company_id))
  WITH CHECK (public.user_has_company_access(company_id));

-- Keep anon access for storefront registration/login
DROP POLICY IF EXISTS "anon_insert" ON public.ecom_customers;
CREATE POLICY "anon_insert" ON public.ecom_customers
  FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "anon_select" ON public.ecom_customers;
CREATE POLICY "anon_select" ON public.ecom_customers
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_update" ON public.ecom_customers;
CREATE POLICY "anon_update" ON public.ecom_customers
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_bypass" ON public.ecom_customers;
CREATE POLICY "service_role_bypass" ON public.ecom_customers
  FOR ALL USING (auth.role() = 'service_role');

-- Step 4: Verify your admin user has a company_users record
-- Run this SELECT to check (replace with your actual user email):
-- SELECT u.id, u.username, u.is_super_admin, cu.company_id, cu.role
-- FROM users u
-- LEFT JOIN company_users cu ON cu.user_id = u.id
-- WHERE u.username ILIKE '%your-email%';
--
-- If company_users row is MISSING, insert it:
-- INSERT INTO company_users (company_id, user_id, role)
-- SELECT c.id, u.id, 'admin'
-- FROM companies c, users u
-- WHERE c.user_id = u.id
-- AND NOT EXISTS (SELECT 1 FROM company_users cu WHERE cu.user_id = u.id AND cu.company_id = c.id);
