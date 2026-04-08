-- ═══════════════════════════════════════════════════════════
-- Print Formats — ERPNext-style print template system
-- Stores HTML templates per DocType per company
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.print_formats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    doctype_key VARCHAR(100) NOT NULL,       -- registry key e.g. "salesOrder", "ecomCustomer"
    format_type VARCHAR(50) DEFAULT 'standard',  -- standard | custom
    html_template TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    paper_size VARCHAR(20) DEFAULT 'A4',     -- A4, Letter, A5
    orientation VARCHAR(20) DEFAULT 'portrait', -- portrait, landscape
    margin_top INTEGER DEFAULT 20,           -- mm
    margin_bottom INTEGER DEFAULT 20,
    margin_left INTEGER DEFAULT 15,
    margin_right INTEGER DEFAULT 15,
    header_html TEXT,                         -- optional repeating header
    footer_html TEXT,                         -- optional repeating footer
    css TEXT,                                 -- custom CSS overrides
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.print_formats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON public.print_formats
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

CREATE POLICY "service_role_bypass" ON public.print_formats
  FOR ALL USING (auth.role() = 'service_role');

GRANT ALL ON public.print_formats TO authenticated;

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_print_formats_doctype
  ON public.print_formats(company_id, doctype_key, is_active);
