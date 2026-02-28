-- 09_SAAS_EXTENDED_SCHEMA.sql
-- Adds advanced enterprise-grade columns required for robust multi-tenant ecommerce operations.

-- 1. Order Refinements
ALTER TABLE public.ecom_orders 
ADD COLUMN IF NOT EXISTS discount_code TEXT,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR',
ADD COLUMN IF NOT EXISTS billing_address JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS internal_notes TEXT;

-- 2. Product & Inventory Refinements
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS cost_price DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS compare_at_price DECIMAL(12,2), -- For "Strike-through" pricing
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS weight DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS weight_unit TEXT DEFAULT 'kg';

-- 3. Banner & CMS Refinements
ALTER TABLE public.ecom_banners 
ADD COLUMN IF NOT EXISTS link_url TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- 4. General Soft-Delete & Flexibility (Applied to all relevant data tables)
DO $$ 
DECLARE 
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN ('products', 'product_variants', 'ecom_banners', 'ecom_categories', 'brands', 'ecom_pages', 'ecom_menus')
    LOOP
        -- Add soft delete support
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false', tbl);
        
        -- Add metadata for future-proofing
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT %L', tbl, '{}');
    END LOOP;
END $$;

-- 5. Fix discrepancy: ecom_order_items should have company_id and variant context
-- (Already mostly present, but ensuring consistency)
ALTER TABLE public.ecom_order_items 
ADD COLUMN IF NOT EXISTS sku TEXT,
ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- 6. Product Variant Enhancements
ALTER TABLE public.product_variants
ADD COLUMN IF NOT EXISTS image_url TEXT;
