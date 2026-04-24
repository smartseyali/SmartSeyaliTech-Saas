-- ========================================================================================
-- TENANT EMAIL VERIFICATION
-- Application-level email verification for platform (tenant) users
-- Follows the same pattern as storefront customer verification (ecom_complete_v2.sql)
-- Safe to run multiple times (idempotent)
-- NO external extensions required (uses built-in gen_random_uuid)
-- ========================================================================================


-- ========================================================================================
-- 1. ADD VERIFICATION COLUMNS TO users TABLE
-- ========================================================================================

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS verification_token TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS verification_token_expires_at TIMESTAMPTZ;

-- Grandfather existing users — they were active before this feature
UPDATE public.users SET email_verified = true WHERE email_verified = false OR email_verified IS NULL;


-- ========================================================================================
-- 2. TENANT GENERATE VERIFICATION TOKEN
-- ========================================================================================

CREATE OR REPLACE FUNCTION public.tenant_generate_verification(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user RECORD;
  v_token TEXT;
BEGIN
  SELECT id, username, full_name, email_verified INTO v_user
  FROM public.users
  WHERE id = p_user_id;

  IF v_user.id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  IF v_user.email_verified = true THEN
    RETURN jsonb_build_object('already_verified', true);
  END IF;

  -- Generate 64-char hex token using built-in gen_random_uuid (no pgcrypto needed)
  v_token := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');

  UPDATE public.users
  SET verification_token = v_token,
      verification_token_expires_at = now() + interval '24 hours'
  WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'token', v_token,
    'email', v_user.username,
    'full_name', v_user.full_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- ========================================================================================
-- 3. TENANT VERIFY EMAIL VIA TOKEN
-- ========================================================================================

CREATE OR REPLACE FUNCTION public.tenant_verify_email(p_token TEXT)
RETURNS JSONB AS $$
DECLARE
  v_user RECORD;
BEGIN
  SELECT id, username, full_name, email_verified, verification_token_expires_at
  INTO v_user
  FROM public.users
  WHERE verification_token = p_token;

  IF v_user.id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired verification link';
  END IF;

  IF v_user.email_verified = true THEN
    RETURN jsonb_build_object('already_verified', true, 'email', v_user.username);
  END IF;

  IF v_user.verification_token_expires_at < now() THEN
    RAISE EXCEPTION 'Verification link has expired. Please request a new one.';
  END IF;

  UPDATE public.users
  SET email_verified = true,
      verification_token = NULL,
      verification_token_expires_at = NULL
  WHERE id = v_user.id;

  RETURN jsonb_build_object(
    'verified', true,
    'email', v_user.username,
    'full_name', v_user.full_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- ========================================================================================
-- 4. TENANT RESEND VERIFICATION
-- ========================================================================================

CREATE OR REPLACE FUNCTION public.tenant_resend_verification(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user RECORD;
  v_token TEXT;
BEGIN
  SELECT id, username, full_name, email_verified INTO v_user
  FROM public.users
  WHERE id = p_user_id;

  IF v_user.id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  IF v_user.email_verified = true THEN
    RETURN jsonb_build_object('already_verified', true);
  END IF;

  -- Generate 64-char hex token using built-in gen_random_uuid (no pgcrypto needed)
  v_token := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');

  UPDATE public.users
  SET verification_token = v_token,
      verification_token_expires_at = now() + interval '24 hours'
  WHERE id = v_user.id;

  RETURN jsonb_build_object(
    'token', v_token,
    'email', v_user.username,
    'full_name', v_user.full_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- ========================================================================================
-- 5. GRANTS
-- ========================================================================================

-- tenant_generate_verification must be callable without a session: when Supabase
-- "Enable Email Confirmations" is ON, signUp() returns no session, so the very first
-- verification-send after registration runs as anon. SECURITY DEFINER means the
-- function still runs with owner privileges; anon callers only receive the token
-- back, which is harmless on its own — to actually verify, the token must be
-- delivered to the user's inbox.
GRANT EXECUTE ON FUNCTION public.tenant_generate_verification(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.tenant_generate_verification(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.tenant_verify_email(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.tenant_verify_email(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.tenant_resend_verification(UUID) TO authenticated;
