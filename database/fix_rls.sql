-- ========================================================================================
-- FIX RLS — Open access for all authenticated users on ALL tables
-- ========================================================================================
-- Run this in Supabase SQL Editor to fix "violates row-level security policy" errors.
-- This gives full CRUD access to any authenticated user on all tables.
-- For production, replace with tenant-scoped policies using user_has_company_access().
-- ========================================================================================

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN (
        SELECT tablename FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename NOT IN ('spatial_ref_sys')
    ) LOOP
        -- Enable RLS
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);

        -- Drop existing restrictive policies
        EXECUTE format('DROP POLICY IF EXISTS "tenant_isolation" ON public.%I', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "service_role_bypass" ON public.%I', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Global Full Access" ON public.%I', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "all_access" ON public.%I', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "users_access" ON public.%I', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "public_read_published" ON public.%I', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "public_read" ON public.%I', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "public_read_active" ON public.%I', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "public_insert" ON public.%I', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "public_read_offerings" ON public.%I', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "public_read_testimonials" ON public.%I', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "public_insert_form_submissions" ON public.%I', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "public_insert_event_registrations" ON public.%I', tbl);

        -- Create open policy for authenticated users (full CRUD)
        EXECUTE format(
            'CREATE POLICY "authenticated_full_access" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)',
            tbl
        );

        -- Create open policy for anon users (read-only + insert for forms/enquiries)
        EXECUTE format(
            'CREATE POLICY "anon_read_access" ON public.%I FOR SELECT TO anon USING (true)',
            tbl
        );

    END LOOP;
END $$;

-- Allow anon INSERT on public-facing tables (enquiries, form submissions, event registrations)
DROP POLICY IF EXISTS "anon_insert_enquiries" ON public.web_enquiries;
CREATE POLICY "anon_insert_enquiries" ON public.web_enquiries
    FOR INSERT TO anon WITH CHECK (true);

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'web_form_submissions') THEN
        EXECUTE 'DROP POLICY IF EXISTS "anon_insert_form_submissions" ON public.web_form_submissions';
        EXECUTE 'CREATE POLICY "anon_insert_form_submissions" ON public.web_form_submissions FOR INSERT TO anon WITH CHECK (true)';
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'web_event_registrations') THEN
        EXECUTE 'DROP POLICY IF EXISTS "anon_insert_event_registrations" ON public.web_event_registrations';
        EXECUTE 'CREATE POLICY "anon_insert_event_registrations" ON public.web_event_registrations FOR INSERT TO anon WITH CHECK (true)';
    END IF;
END $$;

-- ========================================================================================
-- DONE. All tables now allow:
--   - Authenticated users: Full CRUD (select, insert, update, delete)
--   - Anonymous users: Read all tables + insert enquiries/form submissions
-- ========================================================================================
