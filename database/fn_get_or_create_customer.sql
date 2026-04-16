-- ═══════════════════════════════════════════════════════════
-- RPC: get_or_create_customer_id
-- Returns the ecom_customers.id for the current auth user.
-- Creates the customer record if it doesn't exist.
-- SECURITY DEFINER — bypasses RLS so nested policy issues don't block it.
--
-- RUN THIS IN SUPABASE SQL EDITOR
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_or_create_customer_id(p_company_id BIGINT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_email TEXT;
  v_customer_id UUID;
  v_name TEXT;
BEGIN
  -- Get current auth user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get email from auth.users
  SELECT email INTO v_email FROM auth.users WHERE id = v_user_id;

  -- Try to find by auth_user_id
  SELECT id INTO v_customer_id
  FROM ecom_customers
  WHERE company_id = p_company_id AND auth_user_id = v_user_id
  LIMIT 1;

  IF v_customer_id IS NOT NULL THEN
    RETURN v_customer_id;
  END IF;

  -- Try to find by user_id (legacy column)
  SELECT id INTO v_customer_id
  FROM ecom_customers
  WHERE company_id = p_company_id AND user_id = v_user_id
  LIMIT 1;

  IF v_customer_id IS NOT NULL THEN
    -- Link auth_user_id for future lookups
    UPDATE ecom_customers SET auth_user_id = v_user_id WHERE id = v_customer_id;
    RETURN v_customer_id;
  END IF;

  -- Try to find by email
  SELECT id INTO v_customer_id
  FROM ecom_customers
  WHERE company_id = p_company_id AND email = v_email
  LIMIT 1;

  IF v_customer_id IS NOT NULL THEN
    -- Link auth_user_id for future lookups
    UPDATE ecom_customers SET auth_user_id = v_user_id WHERE id = v_customer_id;
    RETURN v_customer_id;
  END IF;

  -- Create new customer
  v_name := COALESCE(
    (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = v_user_id),
    split_part(v_email, '@', 1)
  );

  INSERT INTO ecom_customers (company_id, auth_user_id, full_name, email, status)
  VALUES (p_company_id, v_user_id, v_name, v_email, 'active')
  RETURNING id INTO v_customer_id;

  RETURN v_customer_id;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.get_or_create_customer_id(BIGINT) TO authenticated;
