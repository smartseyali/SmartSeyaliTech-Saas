-- ═══════════════════════════════════════════════════════════
-- Fix RLS on ecom_customer_addresses for storefront customers
-- v3 — Uses per-operation policies (same pattern as ecom_orders)
--
-- The FOR ALL + subquery approach fails because the subquery on
-- ecom_customers is subject to nested RLS evaluation.
-- Fix: permissive INSERT (like ecom_orders), restricted SELECT/UPDATE/DELETE.
--
-- RUN THIS IN SUPABASE SQL EDITOR
-- ═══════════════════════════════════════════════════════════

-- Step 1: Nuke ALL existing policies
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'ecom_customer_addresses' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.ecom_customer_addresses', pol.policyname);
  END LOOP;
END $$;

-- Step 2: Ensure RLS is enabled
ALTER TABLE public.ecom_customer_addresses ENABLE ROW LEVEL SECURITY;

-- Step 3: Admin/staff — full CRUD via company_users
CREATE POLICY "admin_all" ON public.ecom_customer_addresses
  FOR ALL TO authenticated
  USING (
    company_id IN (
      SELECT cu.company_id FROM public.company_users cu WHERE cu.user_id = auth.uid()
      UNION
      SELECT c.id FROM public.companies c WHERE c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT cu.company_id FROM public.company_users cu WHERE cu.user_id = auth.uid()
      UNION
      SELECT c.id FROM public.companies c WHERE c.user_id = auth.uid()
    )
  );

-- Step 4: Storefront customer — INSERT (permissive, like ecom_orders)
CREATE POLICY "customer_insert" ON public.ecom_customer_addresses
  FOR INSERT TO authenticated
  WITH CHECK (company_id IS NOT NULL);

-- Step 5: Storefront customer — SELECT own addresses
CREATE POLICY "customer_select_own" ON public.ecom_customer_addresses
  FOR SELECT TO authenticated
  USING (
    customer_id IN (
      SELECT id FROM public.ecom_customers
      WHERE auth_user_id = auth.uid()
         OR user_id = auth.uid()
    )
  );

-- Step 6: Storefront customer — UPDATE own addresses
CREATE POLICY "customer_update_own" ON public.ecom_customer_addresses
  FOR UPDATE TO authenticated
  USING (
    customer_id IN (
      SELECT id FROM public.ecom_customers
      WHERE auth_user_id = auth.uid()
         OR user_id = auth.uid()
    )
  )
  WITH CHECK (
    customer_id IN (
      SELECT id FROM public.ecom_customers
      WHERE auth_user_id = auth.uid()
         OR user_id = auth.uid()
    )
  );

-- Step 7: Storefront customer — DELETE own addresses
CREATE POLICY "customer_delete_own" ON public.ecom_customer_addresses
  FOR DELETE TO authenticated
  USING (
    customer_id IN (
      SELECT id FROM public.ecom_customers
      WHERE auth_user_id = auth.uid()
         OR user_id = auth.uid()
    )
  );

-- Step 8: Service role bypass
CREATE POLICY "service_role_bypass" ON public.ecom_customer_addresses
  FOR ALL USING (auth.role() = 'service_role');

-- Step 9: Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ecom_customer_addresses TO authenticated;
GRANT SELECT ON public.ecom_customer_addresses TO anon;

-- ═══════════════════════════════════════════════════════════
-- Verify:
-- SELECT policyname, cmd, roles FROM pg_policies
--   WHERE tablename = 'ecom_customer_addresses' ORDER BY policyname;
-- Expected: admin_all, customer_delete_own, customer_insert,
--           customer_select_own, customer_update_own, service_role_bypass
-- ═══════════════════════════════════════════════════════════
