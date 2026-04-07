-- ═══════════════════════════════════════════════════════════════
--  Create Super Admin User for Smartseyali Platform
-- ═══════════════════════════════════════════════════════════════
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
--
-- PREREQUISITE: First create the auth user via:
--   Dashboard → Authentication → Users → Add User
--   Email: nateshraja1999@gmail.com | Auto Confirm: Yes
-- ═══════════════════════════════════════════════════════════════

-- Step 1: Ensure the public.users record exists for this auth user
-- (The on_auth_user_created trigger should have created it automatically,
--  but this handles the case where it didn't)
INSERT INTO public.users (id, username, full_name, is_super_admin, created_at, updated_at)
SELECT
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', 'Super Admin'),
    true,
    NOW(),
    NOW()
FROM auth.users au
WHERE au.email = 'admin@smartseyali.com'
ON CONFLICT (id) DO UPDATE SET
    is_super_admin = true,
    updated_at = NOW();

-- Step 2: Verify the super admin was created/updated
SELECT
    u.id,
    u.username,
    u.full_name,
    u.is_super_admin,
    au.email,
    au.email_confirmed_at
FROM public.users u
JOIN auth.users au ON au.id = u.id
WHERE au.email = 'admin@smartseyali.com';
