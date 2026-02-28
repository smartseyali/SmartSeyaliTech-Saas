-- 08_SAAS_AUDIT_LOGS.sql
-- Enforces standard audit columns across the entire database for compliance and traceability.

-- 1. Create Universal Update Trigger Function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Audit Blueprint: Add Columns to All Relevant Tables
DO $$ 
DECLARE 
    tbl TEXT;
BEGIN
    -- We target every table in the public schema
    FOR tbl IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        -- Add 'created_by' (Who made it)
        -- We don't add to 'users' table itself as it's the root of identity
        IF tbl != 'users' THEN
            EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id) ON DELETE SET NULL', tbl);
        END IF;

        -- Add 'updated_by' (Who last touched it)
        IF tbl != 'users' THEN
            EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL', tbl);
        END IF;

        -- Add 'updated_at' (When it was last changed)
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()', tbl);

        -- Attach the auto-update trigger
        EXECUTE format('DROP TRIGGER IF EXISTS trg_set_updated_at ON public.%I', tbl);
        EXECUTE format('CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()', tbl);
    END LOOP;
END $$;

-- 3. Data Migration (Optional but good for consistency)
-- If tables have 'user_id', we default 'created_by' to that value to prevent empty audit trails
DO $$ 
DECLARE 
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN ('products', 'ecom_banners', 'ecom_orders', 'ecom_pages', 'ecom_menus')
    LOOP
        EXECUTE format('UPDATE public.%I SET created_by = user_id WHERE created_by IS NULL AND user_id IS NOT NULL', tbl);
    END LOOP;
END $$;
