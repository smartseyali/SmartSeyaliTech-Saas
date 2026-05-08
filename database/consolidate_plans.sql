-- Consolidate pricing_plans (marketing-only) into system_plans (billing engine).
-- After running this, pricing_plans is no longer needed.

-- 1. Add marketing display columns to system_plans
ALTER TABLE public.system_plans
  ADD COLUMN IF NOT EXISTS tagline        text,
  ADD COLUMN IF NOT EXISTS cta_label      text    NOT NULL DEFAULT 'Get Started',
  ADD COLUMN IF NOT EXISTS cta_href       text,
  ADD COLUMN IF NOT EXISTS not_included   jsonb   NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS is_highlighted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_published   boolean NOT NULL DEFAULT true;

-- 2. Migrate any existing rows from pricing_plans → system_plans by name match.
--    (Only runs if pricing_plans exists and has data.)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pricing_plans' AND table_schema = 'public') THEN
    UPDATE public.system_plans sp
    SET
      tagline        = pp.tagline,
      cta_label      = COALESCE(pp.cta_label, 'Get Started'),
      cta_href       = pp.cta_href,
      not_included   = COALESCE(pp.not_included, '[]'::jsonb),
      is_highlighted = COALESCE(pp.is_highlighted, false),
      is_published   = COALESCE(pp.is_published, true)
    FROM public.pricing_plans pp
    WHERE lower(sp.name) = lower(pp.name);
  END IF;
END $$;

-- 3. Drop the now-redundant marketing table
DROP TABLE IF EXISTS public.pricing_plans;
