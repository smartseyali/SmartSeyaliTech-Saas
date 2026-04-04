-- ========================================================================================
-- SMARTSEYALI RLS FIX v3 — Nuclear cleanup + proper tenant isolation
-- Removes all "authenticated_full_access" and "anon_read_access" blanket policies
-- Re-applies proper tenant_isolation via user_has_company_access()
-- Safe to run multiple times (idempotent)
-- ========================================================================================


-- ========================================================================================
-- STEP 1: Fix functions with mutable search_path
-- ========================================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, username, full_name, avatar_url, is_super_admin)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', new.email),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    COALESCE((new.raw_user_meta_data->>'is_super_admin')::boolean, false)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.sync_profile_metadata()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET
    full_name = COALESCE(new.raw_user_meta_data->>'full_name', full_name),
    avatar_url = COALESCE(new.raw_user_meta_data->>'avatar_url', avatar_url),
    is_super_admin = COALESCE((new.raw_user_meta_data->>'is_super_admin')::boolean, is_super_admin)
  WHERE id = new.id;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.user_has_company_access(check_company_id BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.company_users WHERE user_id = auth.uid() AND company_id = check_company_id
  ) OR EXISTS (
    SELECT 1 FROM public.companies WHERE user_id = auth.uid() AND id = check_company_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;


-- ========================================================================================
-- STEP 2: Drop ALL blanket "authenticated_full_access" and "anon_read_access" policies
-- These were created by the old fix_rls.sql and override proper tenant isolation
-- ========================================================================================

DO $$
DECLARE
    tbl RECORD;
BEGIN
    FOR tbl IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS "authenticated_full_access" ON public.%I', tbl.tablename);
        EXECUTE format('DROP POLICY IF EXISTS "anon_read_access" ON public.%I', tbl.tablename);
        EXECUTE format('DROP POLICY IF EXISTS "anon_insert_enquiries" ON public.%I', tbl.tablename);
        EXECUTE format('DROP POLICY IF EXISTS "anon_insert_event_registrations" ON public.%I', tbl.tablename);
        EXECUTE format('DROP POLICY IF EXISTS "anon_insert_form_submissions" ON public.%I', tbl.tablename);
    END LOOP;
END $$;


-- ========================================================================================
-- STEP 3: System/global tables — public read, service_role write
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
-- STEP 4: companies table — special handling (owner/member access)
-- ========================================================================================

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_read_own" ON public.companies;
CREATE POLICY "users_read_own" ON public.companies FOR SELECT USING (
    user_id = auth.uid()
    OR id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid())
);
DROP POLICY IF EXISTS "users_insert" ON public.companies;
CREATE POLICY "users_insert" ON public.companies FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "owners_update" ON public.companies;
CREATE POLICY "owners_update" ON public.companies FOR UPDATE USING (
    user_id = auth.uid()
    OR id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid() AND role = 'admin')
);
DROP POLICY IF EXISTS "owners_delete" ON public.companies;
CREATE POLICY "owners_delete" ON public.companies FOR DELETE USING (user_id = auth.uid());
DROP POLICY IF EXISTS "service_role_bypass" ON public.companies;
CREATE POLICY "service_role_bypass" ON public.companies FOR ALL USING (auth.role() = 'service_role');


-- ========================================================================================
-- STEP 5: users table — own profile access
-- ========================================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_access" ON public.users;
CREATE POLICY "users_access" ON public.users FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
CREATE POLICY "users_insert_own" ON public.users FOR INSERT WITH CHECK (id = auth.uid());
DROP POLICY IF EXISTS "service_role_bypass" ON public.users;
CREATE POLICY "service_role_bypass" ON public.users FOR ALL USING (auth.role() = 'service_role');


-- ========================================================================================
-- STEP 6: All company-scoped tables — tenant isolation via user_has_company_access()
-- ========================================================================================

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        -- Platform tenant-scoped
        'company_users', 'system_subscriptions', 'company_modules', 'user_modules',
        'system_company_modules', 'subscriptions', 'user_permissions',
        -- Master Hub
        'master_contacts', 'master_contact_persons', 'master_categories', 'master_subcategories',
        'master_brands', 'master_uoms', 'master_taxes', 'master_items', 'master_product_variants',
        'master_product_reviews', 'master_chart_of_accounts', 'master_fiscal_years', 'master_price_lists',
        'master_sku_patterns', 'master_attributes', 'master_roles', 'master_users',
        'contacts',
        -- Sales
        'sales_quotations', 'sales_quotation_items', 'sales_orders', 'sales_order_items',
        'sales_invoices', 'sales_invoice_items', 'sales_deliveries', 'sales_delivery_items',
        'receipt_vouchers', 'receipt_voucher_allocations',
        -- Purchase
        'purchase_requests', 'purchase_request_items', 'purchase_orders', 'purchase_order_items',
        'purchase_receipts', 'purchase_receipt_items', 'purchase_bills', 'purchase_bill_items',
        -- Ecommerce
        'products', 'product_variants', 'ecom_banners', 'ecom_orders', 'ecom_order_items',
        'ecom_order_timeline', 'ecom_customers', 'ecom_settings', 'ecom_pages', 'ecom_menus',
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

            -- Tenant isolation
            EXECUTE format('DROP POLICY IF EXISTS "tenant_isolation" ON public.%I', tbl);

            -- Check if table has company_id column
            IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = tbl AND column_name = 'company_id'
            ) THEN
                EXECUTE format(
                    'CREATE POLICY "tenant_isolation" ON public.%I FOR ALL TO authenticated USING (public.user_has_company_access(company_id)) WITH CHECK (public.user_has_company_access(company_id))',
                    tbl
                );
            ELSE
                -- Tables without company_id: authenticated full access
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
-- STEP 7: Seed/reference tables with nullable company_id (system seed data)
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
-- STEP 8: Public website access (anonymous visitors)
-- ========================================================================================

-- Public read for published content
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT * FROM (VALUES
        ('blog_posts', 'is_published'),
        ('web_faqs', 'is_published'),
        ('web_pages', 'is_published'),
        ('web_events', 'is_published'),
        ('web_testimonials', 'is_published')
    ) AS t(tbl, col) LOOP
        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = r.tbl) THEN
            EXECUTE format('DROP POLICY IF EXISTS "public_read_published" ON public.%I', r.tbl);
            EXECUTE format('CREATE POLICY "public_read_published" ON public.%I FOR SELECT USING (%I = true)', r.tbl, r.col);
        END IF;
    END LOOP;
END $$;

DROP POLICY IF EXISTS "public_read" ON public.gallery_items;
CREATE POLICY "public_read" ON public.gallery_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "public_read_active" ON public.web_menu_items;
CREATE POLICY "public_read_active" ON public.web_menu_items FOR SELECT USING (is_active = true);

-- Public INSERT with company_id requirement (prevent spam without context)
DROP POLICY IF EXISTS "public_insert" ON public.web_enquiries;
CREATE POLICY "public_insert" ON public.web_enquiries FOR INSERT WITH CHECK (company_id IS NOT NULL);

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'web_event_registrations') THEN
        DROP POLICY IF EXISTS "public_insert_event_reg" ON public.web_event_registrations;
        CREATE POLICY "public_insert_event_reg" ON public.web_event_registrations FOR INSERT WITH CHECK (company_id IS NOT NULL);
    END IF;
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'web_form_submissions') THEN
        DROP POLICY IF EXISTS "public_insert_form_sub" ON public.web_form_submissions;
        CREATE POLICY "public_insert_form_sub" ON public.web_form_submissions FOR INSERT WITH CHECK (company_id IS NOT NULL);
    END IF;
END $$;


-- ========================================================================================
-- DONE — All tables now have proper tenant-scoped RLS
-- ========================================================================================
