-- ============================================================
-- Public tenant showcase — exposes active companies' name and logo
-- for the marketing home page without requiring auth.
-- SECURITY DEFINER bypasses RLS on the companies table.
-- Run in Supabase SQL Editor. Safe to re-run.
-- ============================================================

CREATE OR REPLACE FUNCTION public.fn_public_tenant_showcase()
RETURNS TABLE (name text, logo_url text)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT
    c.name,
    c.logo_url
  FROM public.companies c
  WHERE c.is_active = true
  ORDER BY c.created_at ASC
  LIMIT 100;
$$;

-- Allow anonymous (public marketing page) and authenticated users to call it
GRANT EXECUTE ON FUNCTION public.fn_public_tenant_showcase() TO anon, authenticated;
