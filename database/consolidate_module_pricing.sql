-- ═══════════════════════════════════════════════════════════════════════════
--  Consolidate ALL pricing into system_plans
--  After running this:
--   • system_plans is the single table for both subscription bundles and
--     individual module/app pricing.
--   • system_modules retains only metadata (icon, description, features).
--   • pricing_plans (old marketing table) is dropped if it still exists.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Extend system_plans with all missing columns ────────────────────────
ALTER TABLE public.system_plans
  -- Marketing display columns (from consolidate_plans.sql — safe to re-run)
  ADD COLUMN IF NOT EXISTS price_yearly    decimal(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tagline         text,
  ADD COLUMN IF NOT EXISTS cta_label       text NOT NULL DEFAULT 'Get Started',
  ADD COLUMN IF NOT EXISTS cta_href        text,
  ADD COLUMN IF NOT EXISTS not_included    jsonb NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS is_highlighted  boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_published    boolean NOT NULL DEFAULT true,
  -- New: plan classification and module linking
  ADD COLUMN IF NOT EXISTS plan_type       varchar(20) NOT NULL DEFAULT 'bundle',
  ADD COLUMN IF NOT EXISTS module_slug     text,
  ADD COLUMN IF NOT EXISTS trial_days      int NOT NULL DEFAULT 14,
  ADD COLUMN IF NOT EXISTS is_free         boolean NOT NULL DEFAULT false;

-- ── 2. Stamp all pre-existing rows as bundle plans ─────────────────────────
UPDATE public.system_plans
SET plan_type = 'bundle'
WHERE plan_type IS DISTINCT FROM 'bundle' AND plan_type IS DISTINCT FROM 'module';

-- ── 3. Migrate pricing_plans → system_plans (if table still exists) ────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'pricing_plans' AND table_schema = 'public'
  ) THEN
    UPDATE public.system_plans sp
    SET
      tagline        = pp.tagline,
      cta_label      = COALESCE(pp.cta_label, 'Get Started'),
      cta_href       = pp.cta_href,
      not_included   = COALESCE(pp.not_included, '[]'::jsonb),
      is_highlighted = COALESCE(pp.is_highlighted, false),
      is_published   = COALESCE(pp.is_published, true),
      price_yearly   = COALESCE(pp.price_yearly, 0)
    FROM public.pricing_plans pp
    WHERE lower(sp.name) = lower(pp.name);

    DROP TABLE IF EXISTS public.pricing_plans;
  END IF;
END $$;

-- ── 4. Insert module pricing rows from system_modules ─────────────────────
--   Each active module gets one plan_type='module' row.
--   The slug is prefixed with 'mod-' to avoid collision with bundle slugs.
--   Uses ON CONFLICT DO UPDATE so re-running is safe.
INSERT INTO public.system_plans
  (name, slug, module_slug, plan_type,
   price_monthly, price_yearly, is_free, trial_days,
   features, tagline, cta_label,
   is_active, is_published, sort_order)
SELECT
  m.name,
  'mod-' || m.slug,
  m.slug,
  'module',
  COALESCE(m.price_monthly, 0),
  COALESCE(m.price_yearly,  0),
  COALESCE(m.is_free,       false),
  COALESCE(m.trial_days,    14),
  COALESCE(m.features, '[]'::jsonb),
  m.tagline,
  CASE WHEN COALESCE(m.is_free, false) THEN 'Get Started Free' ELSE 'Try Free' END,
  m.is_active,
  true,
  m.sort_order
FROM public.system_modules m
ON CONFLICT (slug) DO UPDATE SET
  price_monthly = EXCLUDED.price_monthly,
  price_yearly  = EXCLUDED.price_yearly,
  is_free       = EXCLUDED.is_free,
  trial_days    = EXCLUDED.trial_days,
  module_slug   = EXCLUDED.module_slug,
  plan_type     = 'module';

-- ── 5. Drop pricing columns from system_modules ───────────────────────────
--   Pricing is now owned by system_plans. Metadata stays in system_modules.
ALTER TABLE public.system_modules
  DROP COLUMN IF EXISTS price_monthly,
  DROP COLUMN IF EXISTS price_yearly,
  DROP COLUMN IF EXISTS is_free,
  DROP COLUMN IF EXISTS trial_days;

-- ── 6. RLS — ensure module plan rows are publicly readable ────────────────
--   system_plans already has a public-read policy from fix_rls_v2.sql.
--   Nothing extra needed — the WHERE plan_type filter in the query handles it.

-- ── 7. Helpful index ──────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS system_plans_plan_type_idx ON public.system_plans (plan_type);
CREATE INDEX IF NOT EXISTS system_plans_module_slug_idx ON public.system_plans (module_slug);
