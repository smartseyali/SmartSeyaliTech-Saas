-- Migration 18: Security Consolidation & Policy Standardization
-- Resets all RLS policies and applies strict multi-tenant isolation across all tables.

-- 1. Ensure Helper Functions Exist
CREATE OR REPLACE FUNCTION public.get_my_companies()
RETURNS SETOF BIGINT AS $$
    -- Members of the company
    SELECT company_id FROM public.company_users WHERE user_id = auth.uid()
    UNION
    -- The owner of the company
    SELECT id FROM public.companies WHERE user_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND is_super_admin = true
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 2. Cleanup & Standardize All Tables
DO $$ 
DECLARE
    r_table RECORD;
    r_policy RECORD;
    has_company_id BOOLEAN;
    is_public BOOLEAN;
    is_platform BOOLEAN;
BEGIN
    -- Iterate through all tables in public schema
    FOR r_table IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        
        -- Enable RLS
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r_table.tablename);

        -- DROP ALL EXISTING POLICIES on this table
        FOR r_policy IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = r_table.tablename) LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r_policy.policyname, r_table.tablename);
        END LOOP;

        -- Identify if table has company_id
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = r_table.tablename 
            AND column_name = 'company_id'
        ) INTO has_company_id;

        -- Platform tables (Universal read for authenticated, super admin manage)
        is_platform := r_table.tablename IN (
            'system_modules', 'subscription_plans', 'ecom_templates', 
            'industries', 'industry_modules', 'platform_settings'
        );

        -- Publicly accessible tables for storefront
        is_public := r_table.tablename IN (
            'products', 'product_variants', 'ecom_categories', 'categories', 'brands', 
            'ecom_banners', 'ecom_pages', 'ecom_menus', 'ecom_gallery_images', 
            'ecom_gallery_videos', 'product_reviews', 'offers', 'collections', 
            'ecom_blog', 'ecom_settings', 'shipping_zones',
            'edu_courses', 'edu_lessons', 'edu_course_sections'
        );

        -- A. PLATFORM TABLES POLICY
        IF is_platform THEN
            EXECUTE format('
                CREATE POLICY "Platform Read" ON public.%I FOR SELECT TO authenticated USING (true);
                CREATE POLICY "Platform Super Admin" ON public.%I FOR ALL TO authenticated USING (public.is_super_admin());
            ', r_table.tablename, r_table.tablename);
        END IF;

        -- B. TENANT ISOLATION POLICY (For tables with company_id)
        IF has_company_id AND r_table.tablename NOT IN ('companies', 'users', 'company_users') THEN
            EXECUTE format('
                CREATE POLICY "Tenant Isolation" ON public.%I
                FOR ALL TO authenticated
                USING (user_id = auth.uid() OR company_id IN (SELECT public.get_my_companies()) OR public.is_super_admin())
                WITH CHECK (company_id IN (SELECT public.get_my_companies()) OR public.is_super_admin());
            ', r_table.tablename);
        END IF;

        -- C. PUBLIC READ POLICY (For Storefront)
        IF is_public THEN
            EXECUTE format('
                CREATE POLICY "Storefront Public Read" ON public.%I
                FOR SELECT TO public
                USING (true);
            ', r_table.tablename);
        END IF;

    END LOOP;
END $$;

-- 3. Specific table overrides for Core Identity tables

-- COMPANIES table
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Companies are visible to members" ON public.companies;
CREATE POLICY "Companies are visible to members" ON public.companies
FOR ALL TO authenticated
USING (id IN (SELECT public.get_my_companies()) OR user_id = auth.uid() OR public.is_super_admin())
WITH CHECK (id IN (SELECT public.get_my_companies()) OR user_id = auth.uid() OR public.is_super_admin());

DROP POLICY IF EXISTS "Public Company Detail" ON public.companies;
CREATE POLICY "Public Company Detail" ON public.companies
FOR SELECT TO public
USING (true); -- Needed for storefront to verify company exists/subdomain

-- USERS table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users self profile" ON public.users;
CREATE POLICY "Users self profile" ON public.users
FOR ALL TO authenticated
USING (id = auth.uid() OR public.is_super_admin());

-- COMPANY_USERS table
ALTER TABLE public.company_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Member view" ON public.company_users;
CREATE POLICY "Member view" ON public.company_users
FOR ALL TO authenticated
USING (user_id = auth.uid() OR company_id IN (SELECT public.get_my_companies()) OR public.is_super_admin());

-- 4. Clean up any broad policies that might have slipped through
-- Done in the loop above (DROP ALL EXISTING POLICIES)

-- 5. Helper function for set_updated_at if missing
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
