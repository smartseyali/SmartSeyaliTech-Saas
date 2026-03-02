-- ECOMMERCE SUITE: FRESH START SCRIPT
-- RUN THIS IN SUPABASE SQL EDITOR TO WIPE ALL DATA EXCEPT SUPER ADMIN

-- 1. Disable triggers to avoid foreign key constraints during wipe
SET session_replication_role = 'replica';

-- 2. Truncate all identity-based tables (This resets IDs to 1)
TRUNCATE TABLE 
    public.headless_configs,
    public.payment_gateways,
    public.ecom_settings,
    public.ecom_activities,
    public.ecom_menus,
    public.ecom_pages,
    public.ecom_order_timeline,
    public.ecom_order_items,
    public.ecom_orders,
    public.ecom_banners,
    public.product_variants,
    public.products,
    public.brands,
    public.ecom_categories,
    public.company_modules,
    public.company_users,
    public.system_modules,
    public.companies
RESTART IDENTITY CASCADE;

-- 3. Scrub Users (Keep only Super Admin)
-- Replace the UUID if the super admin changes, but based on the current state:
DELETE FROM public.users WHERE is_super_admin IS NOT TRUE;

-- 4. Re-seed Core Modules
INSERT INTO public.system_modules (name, is_core) VALUES 
('Ecommerce', true),
('CRM', false),
('Inventory', false),
('Website Manager', true);

-- 5. Re-enable triggers
SET session_replication_role = 'origin';

-- 6. Verification
SELECT 'DATABASE RESET SUCCESSFUL. LOG IN WITH SUPER ADMIN TO BEGIN.' as status;
