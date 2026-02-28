-- DANGER: DATA DESTRUCTION SCRIPT
-- This will wipe all tables and policies to allow for a clean fresh start.

-- 1. Drop Policies (Optional but good for cleanliness)
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- 2. Drop Tables (in reverse dependency order)
DROP TABLE IF EXISTS public.headless_configs CASCADE;
DROP TABLE IF EXISTS public.payment_gateways CASCADE;
DROP TABLE IF EXISTS public.ecom_settings CASCADE;
DROP TABLE IF EXISTS public.ecom_activities CASCADE;
DROP TABLE IF EXISTS public.ecom_menus CASCADE;
DROP TABLE IF EXISTS public.ecom_pages CASCADE;
DROP TABLE IF EXISTS public.ecom_order_timeline CASCADE;
DROP TABLE IF EXISTS public.ecom_order_items CASCADE;
DROP TABLE IF EXISTS public.ecom_orders CASCADE;
DROP TABLE IF EXISTS public.ecom_banners CASCADE;
DROP TABLE IF EXISTS public.product_variants CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.company_modules CASCADE;
DROP TABLE IF EXISTS public.system_modules CASCADE;
DROP TABLE IF EXISTS public.company_users CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;

-- 3. Reset Sequences if needed (optional)
-- TRUNCATE TABLE public.companies RESTART IDENTITY CASCADE;

console.log('✅ DATABASE NUKED SUCCESSFULLY. Schema is now empty.');
