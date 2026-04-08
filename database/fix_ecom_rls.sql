-- ═══════════════════════════════════════════════════════════
-- Fix: Add missing tenant isolation RLS policies for ecom tables
-- These were accidentally dropped from fix_rls_live.sql
-- ═══════════════════════════════════════════════════════════

DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'ecom_orders',
    'ecom_order_items',
    'ecom_order_timeline',
    'ecom_customers'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    -- Drop existing tenant_isolation policy if any
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I', tbl);

    -- Create the tenant isolation policy for authenticated users
    -- This allows admins to read/write orders for their company
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON %I
       FOR ALL
       TO authenticated
       USING (company_id IN (
         SELECT cu.company_id FROM company_users cu WHERE cu.user_id = auth.uid()
         UNION
         SELECT c.id FROM companies c WHERE c.user_id = auth.uid()
       ))
       WITH CHECK (company_id IN (
         SELECT cu.company_id FROM company_users cu WHERE cu.user_id = auth.uid()
         UNION
         SELECT c.id FROM companies c WHERE c.user_id = auth.uid()
       ))',
      tbl
    );

    RAISE NOTICE 'Created tenant_isolation policy on %', tbl;
  END LOOP;
END;
$$;
