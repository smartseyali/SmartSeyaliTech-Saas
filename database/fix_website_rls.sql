-- ========================================================================================
-- SPARKLE WEBSITE RLS FIX — Allow anonymous access for public website
-- Run this AFTER fix_rls_v3.sql
-- Safe to run multiple times (idempotent)
-- ========================================================================================


-- ========================================================================================
-- STEP 1: Grant table-level permissions to anon role
-- ========================================================================================

DO $$
DECLARE
    tbl TEXT;
BEGIN
    -- Tables that need anonymous READ access (website frontend)
    FOR tbl IN SELECT unnest(ARRAY[
        'master_items',
        'master_categories',
        'master_brands',
        'blog_posts',
        'gallery_items',
        'web_faqs',
        'web_pages',
        'web_menu_items',
        'web_events',
        'web_testimonials',
        'web_enquiries',
        'web_event_registrations',
        'web_form_submissions'
    ]) LOOP
        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = tbl) THEN
            EXECUTE format('GRANT SELECT ON public.%I TO anon', tbl);
        END IF;
    END LOOP;

    -- Tables that need anonymous INSERT access (forms)
    FOR tbl IN SELECT unnest(ARRAY[
        'web_enquiries',
        'web_event_registrations',
        'web_form_submissions'
    ]) LOOP
        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = tbl) THEN
            EXECUTE format('GRANT INSERT ON public.%I TO anon', tbl);
        END IF;
    END LOOP;
END $$;


-- ========================================================================================
-- STEP 2: Anonymous READ policies for website content
-- ========================================================================================

-- master_items (programs) — anon can read live items
DROP POLICY IF EXISTS "anon_read_live_items" ON public.master_items;
CREATE POLICY "anon_read_live_items" ON public.master_items
    FOR SELECT TO anon
    USING (is_live = true);

-- master_categories — anon can read active categories
DROP POLICY IF EXISTS "anon_read_active_categories" ON public.master_categories;
CREATE POLICY "anon_read_active_categories" ON public.master_categories
    FOR SELECT TO anon
    USING (is_active = true);

-- master_brands — anon can read all brands
DROP POLICY IF EXISTS "anon_read_brands" ON public.master_brands;
CREATE POLICY "anon_read_brands" ON public.master_brands
    FOR SELECT TO anon
    USING (true);

-- blog_posts — anon can read published posts
DROP POLICY IF EXISTS "anon_read_published_blogs" ON public.blog_posts;
CREATE POLICY "anon_read_published_blogs" ON public.blog_posts
    FOR SELECT TO anon
    USING (is_published = true);

-- gallery_items — anon can read all gallery items
DROP POLICY IF EXISTS "anon_read_gallery" ON public.gallery_items;
CREATE POLICY "anon_read_gallery" ON public.gallery_items
    FOR SELECT TO anon
    USING (true);

-- web_faqs — anon can read published FAQs
DROP POLICY IF EXISTS "anon_read_published_faqs" ON public.web_faqs;
CREATE POLICY "anon_read_published_faqs" ON public.web_faqs
    FOR SELECT TO anon
    USING (is_published = true);

-- web_pages — anon can read published pages
DROP POLICY IF EXISTS "anon_read_published_pages" ON public.web_pages;
CREATE POLICY "anon_read_published_pages" ON public.web_pages
    FOR SELECT TO anon
    USING (is_published = true);

-- web_menu_items — anon can read active menu items
DROP POLICY IF EXISTS "anon_read_active_menus" ON public.web_menu_items;
CREATE POLICY "anon_read_active_menus" ON public.web_menu_items
    FOR SELECT TO anon
    USING (is_active = true);

-- web_events — anon can read published events
DROP POLICY IF EXISTS "anon_read_published_events" ON public.web_events;
CREATE POLICY "anon_read_published_events" ON public.web_events
    FOR SELECT TO anon
    USING (is_published = true);

-- web_testimonials — anon can read published testimonials
DROP POLICY IF EXISTS "anon_read_published_testimonials" ON public.web_testimonials;
CREATE POLICY "anon_read_published_testimonials" ON public.web_testimonials
    FOR SELECT TO anon
    USING (is_published = true);


-- ========================================================================================
-- STEP 3: Anonymous INSERT policies for public forms
-- ========================================================================================

-- web_enquiries — anon can submit enquiries
DROP POLICY IF EXISTS "public_insert" ON public.web_enquiries;
DROP POLICY IF EXISTS "anon_insert_enquiries" ON public.web_enquiries;
CREATE POLICY "anon_insert_enquiries" ON public.web_enquiries
    AS PERMISSIVE
    FOR INSERT TO anon
    WITH CHECK (company_id IS NOT NULL);

-- web_event_registrations — anon can register for events
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'web_event_registrations') THEN
        DROP POLICY IF EXISTS "public_insert_event_reg" ON public.web_event_registrations;
        DROP POLICY IF EXISTS "anon_insert_event_reg" ON public.web_event_registrations;
        CREATE POLICY "anon_insert_event_reg" ON public.web_event_registrations
            AS PERMISSIVE
            FOR INSERT TO anon
            WITH CHECK (company_id IS NOT NULL);
    END IF;
END $$;

-- web_form_submissions — anon can submit forms
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'web_form_submissions') THEN
        DROP POLICY IF EXISTS "public_insert_form_sub" ON public.web_form_submissions;
        DROP POLICY IF EXISTS "anon_insert_form_sub" ON public.web_form_submissions;
        CREATE POLICY "anon_insert_form_sub" ON public.web_form_submissions
            AS PERMISSIVE
            FOR INSERT TO anon
            WITH CHECK (company_id IS NOT NULL);
    END IF;
END $$;


-- ========================================================================================
-- STEP 4: Storage bucket for file uploads
-- ========================================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('ecommerce', 'ecommerce', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public uploads to ecommerce bucket
DROP POLICY IF EXISTS "allow_public_uploads" ON storage.objects;
CREATE POLICY "allow_public_uploads" ON storage.objects
    FOR INSERT TO anon, authenticated
    WITH CHECK (bucket_id = 'ecommerce');

-- Allow public reads from ecommerce bucket
DROP POLICY IF EXISTS "allow_public_reads" ON storage.objects;
CREATE POLICY "allow_public_reads" ON storage.objects
    FOR SELECT TO anon, authenticated
    USING (bucket_id = 'ecommerce');

-- Allow authenticated users to update/delete their uploads
DROP POLICY IF EXISTS "allow_auth_manage" ON storage.objects;
CREATE POLICY "allow_auth_manage" ON storage.objects
    FOR ALL TO authenticated
    USING (bucket_id = 'ecommerce')
    WITH CHECK (bucket_id = 'ecommerce');


-- ========================================================================================
-- STEP 5: Refresh PostgREST schema cache
-- ========================================================================================

NOTIFY pgrst, 'reload schema';


-- ========================================================================================
-- DONE — Website can now:
--   READ: programs, categories, brands, blogs, gallery, FAQs, pages, events, testimonials
--   INSERT: enquiries, event registrations, form submissions
--   STORAGE: upload/read files from 'ecommerce' bucket
-- ========================================================================================
