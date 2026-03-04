-- Migration 16: Strict Multi-Tenant Isolation
-- Enforces that all records are filtered by company and user ownership.

-- 1. Helper Function: Get companies the current authenticated user belongs to
CREATE OR REPLACE FUNCTION public.get_my_companies()
RETURNS SETOF BIGINT AS $$
    SELECT company_id 
    FROM public.company_users 
    WHERE user_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 2. Helper Function: Check if current user is Super Admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND is_super_admin = true
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 3. Policy Reset & Strict Enforcement
DO $$ 
DECLARE
    tbl TEXT;
    has_company_id BOOLEAN;
    is_public BOOLEAN;
BEGIN
    FOR tbl IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        
        -- Check if table has company_id column
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = tbl 
            AND column_name = 'company_id'
        ) INTO has_company_id;

        -- Identify if the table should be readable by anonymous storefront users
        is_public := tbl IN ('products', 'product_variants', 'ecom_categories', 'brands', 'ecom_banners', 'ecom_pages', 'ecom_menus');

        -- We only enforce this on business tables
        IF has_company_id AND tbl NOT IN ('companies', 'users') THEN
            
            -- Drop permissive policies
            EXECUTE format('DROP POLICY IF EXISTS "Global Full Access" ON public.%I', tbl);
            EXECUTE format('DROP POLICY IF EXISTS "Global Public Read" ON public.%I', tbl);
            EXECUTE format('DROP POLICY IF EXISTS "Tenant Isolation" ON public.%I', tbl);
            EXECUTE format('DROP POLICY IF EXISTS "Storefront Public Read" ON public.%I', tbl);

            -- 1. Merchant/Staff Access: Strict isolation by company membership
            EXECUTE format('
                CREATE POLICY "Tenant Isolation" ON public.%I
                FOR ALL TO authenticated
                USING (
                    company_id IN (SELECT public.get_my_companies())
                    OR public.is_super_admin()
                )
                WITH CHECK (
                    company_id IN (SELECT public.get_my_companies())
                    OR public.is_super_admin()
                )
            ', tbl);

            -- 2. Storefront Access: Anonymous Public Read (Selective)
            IF is_public THEN
                EXECUTE format('
                    CREATE POLICY "Storefront Public Read" ON public.%I
                    FOR SELECT TO anon
                    USING (true)
                ', tbl);
            END IF;

        END IF;
    END LOOP;
END $$;

-- 4. Specific Security for company_users table
DROP POLICY IF EXISTS "Global Full Access" ON public.company_users;
CREATE POLICY "Strict Member View" ON public.company_users
FOR ALL TO authenticated
USING (
    company_id IN (SELECT public.get_my_companies())
    OR public.is_super_admin()
);

-- 5. specific Security for users table (self profile only)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can see own profile" ON public.users;
CREATE POLICY "Users can see own profile" ON public.users
FOR ALL TO authenticated
USING (id = auth.uid() OR public.is_super_admin());
