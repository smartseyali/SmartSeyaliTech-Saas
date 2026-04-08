-- ═══════════════════════════════════════════════════════════
-- Create ecom_customer_addresses table for multiple delivery addresses
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.ecom_customer_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.ecom_customers(id) ON DELETE CASCADE,
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    label VARCHAR(100) DEFAULT 'Home',
    full_name VARCHAR(255),
    phone VARCHAR(100),
    address_line1 TEXT,
    address_line2 TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    country VARCHAR(100) DEFAULT 'India',
    is_default BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.ecom_customer_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON public.ecom_customer_addresses
  FOR ALL TO authenticated
  USING (
    company_id IN (
      SELECT cu.company_id FROM public.company_users cu WHERE cu.user_id = auth.uid()
      UNION
      SELECT c.id FROM public.companies c WHERE c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT cu.company_id FROM public.company_users cu WHERE cu.user_id = auth.uid()
      UNION
      SELECT c.id FROM public.companies c WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "anon_select" ON public.ecom_customer_addresses
  FOR SELECT TO anon USING (true);

CREATE POLICY "anon_insert" ON public.ecom_customer_addresses
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_update" ON public.ecom_customer_addresses
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "service_role_bypass" ON public.ecom_customer_addresses
  FOR ALL USING (auth.role() = 'service_role');

-- Grants
GRANT ALL ON public.ecom_customer_addresses TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.ecom_customer_addresses TO anon;
