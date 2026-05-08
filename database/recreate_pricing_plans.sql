-- ============================================================
-- Recreate pricing_plans as the single source of truth for
-- all plan management (marketing display + onboarding module mapping).
--
-- Safe to run even if the table already exists — uses
-- IF NOT EXISTS and ON CONFLICT DO NOTHING throughout.
-- ============================================================

-- ── 1. Create the table ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pricing_plans (
    id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    name             VARCHAR(100) NOT NULL,
    tagline          VARCHAR(500),
    price_monthly    INT         NOT NULL DEFAULT 0,
    price_yearly     INT         NOT NULL DEFAULT 0,
    is_highlighted   BOOLEAN     NOT NULL DEFAULT false,
    cta_label        VARCHAR(100) DEFAULT 'Start Free Trial',
    cta_href         VARCHAR(500),
    features         JSONB       NOT NULL DEFAULT '[]',
    not_included     JSONB                DEFAULT '[]',
    modules_included TEXT[]               DEFAULT '{}',
    sort_order       INT                  DEFAULT 0,
    is_published     BOOLEAN     NOT NULL DEFAULT true,
    created_at       TIMESTAMPTZ          DEFAULT now(),
    updated_at       TIMESTAMPTZ          DEFAULT now()
);

-- Add missing columns if the table already existed without them
ALTER TABLE public.pricing_plans
    ADD COLUMN IF NOT EXISTS modules_included TEXT[]  DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS not_included     JSONB   DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS is_highlighted   BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS tagline          VARCHAR(500),
    ADD COLUMN IF NOT EXISTS cta_href         VARCHAR(500);

-- ── 2. RLS ───────────────────────────────────────────────────────────────────
ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pricing_plans_public_read"  ON public.pricing_plans;
DROP POLICY IF EXISTS "pricing_plans_admin_write"  ON public.pricing_plans;
DROP POLICY IF EXISTS "pricing_plans_super_write"  ON public.pricing_plans;

-- Anyone (including unauthenticated marketing site visitors) can read published plans
CREATE POLICY "pricing_plans_public_read"
    ON public.pricing_plans FOR SELECT
    USING (is_published = true);

-- Super-admin can read/write all rows (including drafts)
CREATE POLICY "pricing_plans_super_write"
    ON public.pricing_plans FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.super_admins
            WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.super_admins
            WHERE user_id = auth.uid()
        )
    );

-- ── 3. Seed default plans ────────────────────────────────────────────────────
-- Pull existing data from system_plans if it has the rows; otherwise insert fresh.
-- ON CONFLICT DO NOTHING prevents duplicate inserts on re-runs.

INSERT INTO public.pricing_plans
    (name, tagline, price_monthly, price_yearly, is_highlighted,
     cta_label, cta_href, features, not_included, modules_included, sort_order, is_published)
SELECT
    sp.name,
    sp.tagline,
    sp.price_monthly,
    sp.price_yearly,
    COALESCE(sp.is_highlighted, false),
    COALESCE(sp.cta_label, 'Start Free Trial'),
    sp.cta_href,
    COALESCE(sp.features, '[]'::jsonb),
    COALESCE(sp.not_included, '[]'::jsonb),
    '{}',
    COALESCE(sp.sort_order, 0),
    COALESCE(sp.is_published, true)
FROM public.system_plans sp
WHERE NOT EXISTS (
    SELECT 1 FROM public.pricing_plans pp
    WHERE lower(pp.name) = lower(sp.name)
)
  AND EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'system_plans'
  );

-- Fallback: if system_plans didn't exist or had no rows, insert hardcoded defaults
INSERT INTO public.pricing_plans
    (name, tagline, price_monthly, price_yearly, is_highlighted,
     cta_label, features, not_included, modules_included, sort_order)
VALUES
    (
        'Starter',
        'Single-store essentials for small teams.',
        1249, 14990, false,
        'Start Free Trial',
        '["Up to 3 users","1 storefront / 1 outlet","E-Commerce + POS modules","500 products","Basic CRM","Email support","Standard themes"]'::jsonb,
        '["WhatsApp Business API","Custom domain","Multi-branch"]'::jsonb,
        ARRAY['ecommerce','crm','sales','masters'],
        1
    ),
    (
        'Growth',
        'For multi-channel businesses scaling up.',
        3333, 39990, true,
        'Start Free Trial',
        '["Up to 15 users","3 storefronts / 5 outlets","All commerce + finance modules","Unlimited products","Full CRM + Sales pipeline","WhatsApp Business API","Custom domain support","GST & invoicing","Priority email + WhatsApp support"]'::jsonb,
        '["Dedicated success manager","Custom integrations"]'::jsonb,
        ARRAY['ecommerce','pos','crm','sales','inventory','purchase','hrms','finance','whatsapp','website','masters'],
        2
    ),
    (
        'Enterprise',
        'For multi-branch operations with advanced needs.',
        8333, 99990, false,
        'Talk to Sales',
        '["Unlimited users","Unlimited storefronts & outlets","All modules included","Multi-branch consolidation","Dedicated account manager","Custom integrations & API access","Advanced reporting + BI","SSO & advanced permissions","99.9% uptime SLA","24/7 phone + WhatsApp support"]'::jsonb,
        '[]'::jsonb,
        ARRAY['ecommerce','pos','crm','sales','inventory','purchase','hrms','finance','whatsapp','website','masters'],
        3
    )
ON CONFLICT DO NOTHING;
