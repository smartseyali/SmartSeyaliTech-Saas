-- ========================================================================================
-- FIX: Super Admin RLS Bypass
--
-- Problem: user_has_company_access() only checks company_users and company ownership.
-- Super admins who are not explicitly in company_users for every company cannot read
-- company-scoped data (company_users, subscriptions, company_modules, etc.)
--
-- This also fixes the companies SELECT policy to allow super admins to see all companies.
-- ========================================================================================

-- STEP 1: Update user_has_company_access() to include super admin check
CREATE OR REPLACE FUNCTION public.user_has_company_access(check_company_id BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Super admins have access to ALL companies
  IF EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND is_super_admin = true
  ) THEN
    RETURN true;
  END IF;

  -- Regular users: check company_users mapping or direct ownership
  RETURN EXISTS (
    SELECT 1 FROM public.company_users WHERE user_id = auth.uid() AND company_id = check_company_id
  ) OR EXISTS (
    SELECT 1 FROM public.companies WHERE user_id = auth.uid() AND id = check_company_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;


-- STEP 2: Fix companies SELECT policy to include super admins
DROP POLICY IF EXISTS "users_read_own" ON public.companies;
CREATE POLICY "users_read_own" ON public.companies FOR SELECT USING (
    user_id = auth.uid()
    OR id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_super_admin = true)
);

-- STEP 3: Fix companies UPDATE policy to include super admins
DROP POLICY IF EXISTS "owners_update" ON public.companies;
CREATE POLICY "owners_update" ON public.companies FOR UPDATE USING (
    user_id = auth.uid()
    OR id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid() AND role = 'admin')
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_super_admin = true)
);

-- STEP 4: Fix companies DELETE policy to include super admins
DROP POLICY IF EXISTS "owners_delete" ON public.companies;
CREATE POLICY "owners_delete" ON public.companies FOR DELETE USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_super_admin = true)
);

-- STEP 5: Fix users table — super admins can update any user (for role management)
DROP POLICY IF EXISTS "super_admin_update" ON public.users;
CREATE POLICY "super_admin_update" ON public.users FOR UPDATE USING (
    id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_super_admin = true)
) WITH CHECK (
    id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_super_admin = true)
);
