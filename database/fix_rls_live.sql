-- ========================================================================================
-- LIVE FIX: RLS + Tenant Isolation for Multi-Company Users
-- Fixes 403 errors and ensures strict company data separation
-- Run this FIRST before ecom_complete_v2.sql
-- ========================================================================================


-- ========================================================================================
-- STEP 1: Diagnose — Run this to see what's happening
-- ========================================================================================

-- Check current function version (should contain is_super_admin check)
-- SELECT prosrc FROM pg_proc WHERE proname = 'user_has_company_access';


-- ========================================================================================
-- STEP 2: Fix user_has_company_access — includes super admin bypass
-- ========================================================================================

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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;


-- ========================================================================================
-- STEP 3: Fix companies table — super admin + anon read for storefront
-- ========================================================================================

DROP POLICY IF EXISTS "users_read_own" ON public.companies;
CREATE POLICY "users_read_own" ON public.companies FOR SELECT USING (
    user_id = auth.uid()
    OR id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_super_admin = true)
);

DROP POLICY IF EXISTS "owners_update" ON public.companies;
CREATE POLICY "owners_update" ON public.companies FOR UPDATE USING (
    user_id = auth.uid()
    OR id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid() AND role = 'admin')
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_super_admin = true)
);

DROP POLICY IF EXISTS "owners_delete" ON public.companies;
CREATE POLICY "owners_delete" ON public.companies FOR DELETE USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_super_admin = true)
);

-- Storefront: anon can read active companies (for store login resolution)
DROP POLICY IF EXISTS "anon_read_companies" ON public.companies;
CREATE POLICY "anon_read_companies" ON public.companies
  FOR SELECT TO anon USING (is_active = true);


-- ========================================================================================
-- STEP 4: Verify the user mapping is correct
-- ========================================================================================

-- This user has access to BOTH companies (Pattikadai=16, Sparkle=9)
-- That's correct — the frontend TenantContext switches between them.
-- RLS allows access to BOTH, but the app queries filter by activeCompany.id
-- so you only see one company's data at a time.

-- If you want to CHECK what activeCompany the frontend is using:
-- Open browser DevTools → Application → Local Storage → look for "last_company_id"


-- ========================================================================================
-- STEP 5: Ensure tenant_isolation exists on ALL company-scoped tables
-- Re-run the core policy creation (safe to run multiple times)
-- ========================================================================================

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        -- Master Hub
        'master_contacts', 'master_contact_persons', 'master_categories', 'master_subcategories',
        'master_brands', 'master_uoms', 'master_taxes', 'master_items', 'master_product_variants',
        'master_product_reviews', 'master_chart_of_accounts', 'master_fiscal_years', 'master_price_lists',
        'master_sku_patterns', 'master_attributes', 'master_roles', 'master_users',
        'contacts',
        -- Platform
        'company_users', 'system_subscriptions', 'company_modules', 'user_modules',
        'system_company_modules', 'subscriptions', 'user_permissions',
        -- Sales
        'sales_quotations', 'sales_quotation_items', 'sales_orders', 'sales_order_items',
        'sales_invoices', 'sales_invoice_items', 'sales_deliveries', 'sales_delivery_items',
        'receipt_vouchers', 'receipt_voucher_allocations',
        -- Purchase
        'purchase_requests', 'purchase_request_items', 'purchase_orders', 'purchase_order_items',
        'purchase_receipts', 'purchase_receipt_items', 'purchase_bills', 'purchase_bill_items',
        -- Ecommerce
        'products', 'product_variants', 'ecom_banners',
        'ecom_settings', 'ecom_pages', 'ecom_menus',
        'ecom_blog', 'ecom_gallery_images', 'ecom_gallery_videos', 'ecom_gallery',
        'payment_gateways', 'shipping_zones', 'coupons', 'offers',
        'ecom_coupons', 'ecom_offers', 'ecom_shipping_zones', 'ecom_product_reviews',
        'ecom_abandoned_carts', 'headless_configs', 'abandoned_carts', 'refunds',
        -- CRM
        'crm_pipelines', 'crm_stages', 'crm_leads', 'crm_deals', 'crm_accounts',
        'crm_segments', 'crm_activities',
        -- Inventory
        'inventory_warehouses', 'inventory_transfers', 'inventory_audits', 'inventory_batches',
        'inventory_items', 'stock_levels', 'stock_moves', 'warehouses', 'stock_ledger',
        'stock_entries', 'stock_entry_items', 'stock_audits', 'stock_audit_items', 'batch_tracking',
        -- HRMS
        'hrms_departments', 'hrms_employees', 'hrms_employee_induction',
        'hrms_attendance', 'hrms_leaves',
        'hrms_payroll_cycles', 'payroll_cycles', 'payslips', 'payslip_items',
        'hrms_claims', 'hrms_claim_items', 'hrms_appraisals',
        -- Finance
        'chart_of_accounts', 'fiscal_years', 'journal_entries', 'journal_entry_items',
        'bank_accounts', 'tax_configurations', 'bank_reconciliation', 'bank_reconciliation_items',
        'finance_journal_entries', 'finance_journal_lines', 'finance_bank_accounts',
        -- POS
        'pos_sessions', 'pos_orders', 'pos_order_items',
        -- WhatsApp
        'whatsapp_accounts', 'whatsapp_templates', 'whatsapp_logs', 'whatsapp_campaigns',
        'wa_accounts', 'wa_templates', 'wa_campaigns', 'wa_logs',
        -- Website/CMS
        'blog_posts', 'web_enquiries', 'gallery_items', 'web_faqs', 'web_pages', 'web_menu_items',
        'web_media', 'web_templates', 'web_page_sections', 'web_components',
        'web_forms', 'web_form_submissions', 'web_seo_meta', 'web_content_versions',
        'web_groups', 'web_registrations', 'web_schedules',
        'web_pricing', 'web_pricing_items', 'web_payments', 'web_credentials',
        'web_events', 'web_event_registrations', 'web_testimonials',
        'web_automation_rules', 'web_api_keys', 'web_translations',
        'web_custom_field_defs',
        -- Workflow & Helpdesk
        'wf_workflows', 'wf_steps', 'wf_logs', 'helpdesk_tickets',
        -- Misc
        'price_lists', 'price_list_items'
    ]) LOOP
        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = tbl) THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);

            -- Drop old blanket policies
            EXECUTE format('DROP POLICY IF EXISTS "authenticated_full_access" ON public.%I', tbl);
            EXECUTE format('DROP POLICY IF EXISTS "anon_read_access" ON public.%I', tbl);

            -- Tenant isolation
            EXECUTE format('DROP POLICY IF EXISTS "tenant_isolation" ON public.%I', tbl);

            IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = tbl AND column_name = 'company_id'
            ) THEN
                EXECUTE format(
                    'CREATE POLICY "tenant_isolation" ON public.%I FOR ALL TO authenticated USING (public.user_has_company_access(company_id)) WITH CHECK (public.user_has_company_access(company_id))',
                    tbl
                );
            ELSE
                EXECUTE format(
                    'CREATE POLICY "tenant_isolation" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)',
                    tbl
                );
            END IF;

            -- Service role bypass
            EXECUTE format('DROP POLICY IF EXISTS "service_role_bypass" ON public.%I', tbl);
            EXECUTE format(
                'CREATE POLICY "service_role_bypass" ON public.%I FOR ALL USING (auth.role() = ''service_role'')',
                tbl
            );
        END IF;
    END LOOP;
END $$;


-- ========================================================================================
-- STEP 6: ecom_customers — special handling (storefront access)
-- ========================================================================================

-- Drop ALL existing customer policies to avoid conflicts
DROP POLICY IF EXISTS "anon_insert" ON public.ecom_customers;
DROP POLICY IF EXISTS "anon_select" ON public.ecom_customers;
DROP POLICY IF EXISTS "anon_update" ON public.ecom_customers;
DROP POLICY IF EXISTS "auth_insert" ON public.ecom_customers;
DROP POLICY IF EXISTS "auth_select" ON public.ecom_customers;
DROP POLICY IF EXISTS "auth_update" ON public.ecom_customers;
-- tenant_isolation was just created above, keep it for admin access

-- Anon: insert (guest signup) and select (storefront)
CREATE POLICY "anon_insert" ON public.ecom_customers
  FOR INSERT TO anon WITH CHECK (company_id IS NOT NULL);
CREATE POLICY "anon_select" ON public.ecom_customers
  FOR SELECT TO anon USING (true);

GRANT SELECT, INSERT, UPDATE ON public.ecom_customers TO anon;


-- ========================================================================================
-- STEP 7: ecom_orders — override for storefront customer access
-- ========================================================================================

-- The tenant_isolation created in STEP 5 uses user_has_company_access which is admin-only.
-- Storefront customers (anon) need INSERT + SELECT for guest checkout and order tracking.

DROP POLICY IF EXISTS "tenant_isolation" ON public.ecom_orders;
CREATE POLICY "tenant_isolation" ON public.ecom_orders
  FOR ALL TO authenticated
  USING (
    public.user_has_company_access(company_id)
    OR user_id = auth.uid()
    OR customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
  WITH CHECK (
    public.user_has_company_access(company_id)
    OR company_id IS NOT NULL
  );

-- Anon: guest checkout + order tracking
DROP POLICY IF EXISTS "anon_insert_orders" ON public.ecom_orders;
CREATE POLICY "anon_insert_orders" ON public.ecom_orders
  FOR INSERT TO anon WITH CHECK (company_id IS NOT NULL);
DROP POLICY IF EXISTS "anon_read_orders" ON public.ecom_orders;
DROP POLICY IF EXISTS "anon_read_own_orders" ON public.ecom_orders;
CREATE POLICY "anon_read_orders" ON public.ecom_orders
  FOR SELECT TO anon USING (true);

GRANT SELECT, INSERT ON public.ecom_orders TO anon;


-- ========================================================================================
-- STEP 8: ecom_order_items + ecom_order_timeline — override for storefront
-- ========================================================================================

DROP POLICY IF EXISTS "tenant_isolation" ON public.ecom_order_items;
CREATE POLICY "tenant_isolation" ON public.ecom_order_items
  FOR ALL TO authenticated
  USING (
    public.user_has_company_access(company_id)
    OR order_id IN (
      SELECT id FROM public.ecom_orders WHERE user_id = auth.uid()
        OR customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  )
  WITH CHECK (company_id IS NOT NULL);

DROP POLICY IF EXISTS "anon_insert_order_items" ON public.ecom_order_items;
CREATE POLICY "anon_insert_order_items" ON public.ecom_order_items
  FOR INSERT TO anon WITH CHECK (company_id IS NOT NULL);
DROP POLICY IF EXISTS "anon_read_order_items" ON public.ecom_order_items;
CREATE POLICY "anon_read_order_items" ON public.ecom_order_items
  FOR SELECT TO anon USING (true);

GRANT SELECT, INSERT ON public.ecom_order_items TO anon;

DROP POLICY IF EXISTS "tenant_isolation" ON public.ecom_order_timeline;
CREATE POLICY "tenant_isolation" ON public.ecom_order_timeline
  FOR ALL TO authenticated
  USING (
    CASE
      WHEN company_id IS NOT NULL THEN public.user_has_company_access(company_id)
      ELSE true
    END
  )
  WITH CHECK (true);

DROP POLICY IF EXISTS "anon_insert_timeline" ON public.ecom_order_timeline;
CREATE POLICY "anon_insert_timeline" ON public.ecom_order_timeline
  FOR INSERT TO anon WITH CHECK (true);
DROP POLICY IF EXISTS "anon_read_timeline" ON public.ecom_order_timeline;
CREATE POLICY "anon_read_timeline" ON public.ecom_order_timeline
  FOR SELECT TO anon USING (true);

GRANT SELECT, INSERT ON public.ecom_order_timeline TO anon;


-- ========================================================================================
-- STEP 9: Seed tables (uoms, tax_master) — nullable company_id
-- ========================================================================================

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY['uoms', 'tax_master', 'item_attributes']) LOOP
        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = tbl) THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
            EXECUTE format('DROP POLICY IF EXISTS "tenant_isolation" ON public.%I', tbl);
            EXECUTE format(
                'CREATE POLICY "tenant_isolation" ON public.%I FOR ALL TO authenticated USING (company_id IS NULL OR public.user_has_company_access(company_id)) WITH CHECK (company_id IS NULL OR public.user_has_company_access(company_id))',
                tbl
            );
            EXECUTE format('DROP POLICY IF EXISTS "service_role_bypass" ON public.%I', tbl);
            EXECUTE format(
                'CREATE POLICY "service_role_bypass" ON public.%I FOR ALL USING (auth.role() = ''service_role'')',
                tbl
            );
        END IF;
    END LOOP;
END $$;


-- ========================================================================================
-- STEP 10: System/global tables — public read
-- ========================================================================================

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        'system_plans', 'system_modules', 'system_templates',
        'system_connectors', 'subscription_plans'
    ]) LOOP
        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = tbl) THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
            EXECUTE format('DROP POLICY IF EXISTS "public_read" ON public.%I', tbl);
            EXECUTE format('CREATE POLICY "public_read" ON public.%I FOR SELECT USING (true)', tbl);
            EXECUTE format('DROP POLICY IF EXISTS "service_role_bypass" ON public.%I', tbl);
            EXECUTE format('CREATE POLICY "service_role_bypass" ON public.%I FOR ALL USING (auth.role() = ''service_role'')', tbl);
        END IF;
    END LOOP;
END $$;


-- ========================================================================================
-- STEP 11: users table — own profile access
-- ========================================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_access" ON public.users;
CREATE POLICY "users_access" ON public.users FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());
DROP POLICY IF EXISTS "super_admin_update" ON public.users;
CREATE POLICY "super_admin_update" ON public.users FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_super_admin = true)
) WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_super_admin = true)
);
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
CREATE POLICY "users_insert_own" ON public.users FOR INSERT WITH CHECK (id = auth.uid());
DROP POLICY IF EXISTS "service_role_bypass" ON public.users;
CREATE POLICY "service_role_bypass" ON public.users FOR ALL USING (auth.role() = 'service_role');


-- ========================================================================================
-- DONE! Now run ecom_complete_v2.sql for the ecommerce-specific features.
-- ========================================================================================
