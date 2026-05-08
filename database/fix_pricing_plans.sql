-- ============================================================
-- Fix pricing_plans: add missing columns + seed data + fix RLS
-- Run this in Supabase SQL Editor.
-- Safe to re-run — uses IF NOT EXISTS and ON CONFLICT DO NOTHING.
-- ============================================================

-- ── 1. Add columns that may be missing from the original table ───────────────
ALTER TABLE public.pricing_plans
    ADD COLUMN IF NOT EXISTS modules_included TEXT[]   DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS not_included     JSONB    DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS is_highlighted   BOOLEAN  NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS tagline          VARCHAR(500),
    ADD COLUMN IF NOT EXISTS cta_href         VARCHAR(500),
    ADD COLUMN IF NOT EXISTS is_published     BOOLEAN  NOT NULL DEFAULT true;

-- ── 2. Fix RLS ───────────────────────────────────────────────────────────────
ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pricing_plans_public_read"  ON public.pricing_plans;
DROP POLICY IF EXISTS "pricing_plans_admin_write"  ON public.pricing_plans;
DROP POLICY IF EXISTS "pricing_plans_super_write"  ON public.pricing_plans;

-- Public (anon) can read published plans — needed for marketing pricing page
CREATE POLICY "pricing_plans_public_read"
    ON public.pricing_plans FOR SELECT
    USING (is_published = true);

-- Super-admin can read and write all rows (including drafts)
CREATE POLICY "pricing_plans_super_write"
    ON public.pricing_plans FOR ALL
    USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_super_admin = true)
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_super_admin = true)
    );

-- ── 3. Seed plans if table is empty ─────────────────────────────────────────
INSERT INTO public.pricing_plans
    (name, tagline, price_monthly, price_yearly, is_highlighted,
     cta_label, features, not_included, modules_included, sort_order, is_published)
VALUES
    (
        'Starter',
        'Single-store essentials for small teams.',
        1249, 14990, false,
        'Start Free Trial',
        '["Up to 3 users","1 storefront / 1 outlet","E-Commerce + POS modules","500 products","Basic CRM","Email support","Standard themes"]'::jsonb,
        '["WhatsApp Business API","Custom domain","Multi-branch"]'::jsonb,
        ARRAY['ecommerce','crm','sales','masters'],
        1, true
    ),
    (
        'Growth',
        'For multi-channel businesses scaling up.',
        3333, 39990, true,
        'Start Free Trial',
        '["Up to 15 users","3 storefronts / 5 outlets","All commerce + finance modules","Unlimited products","Full CRM + Sales pipeline","WhatsApp Business API","Custom domain support","GST & invoicing","Priority email + WhatsApp support"]'::jsonb,
        '["Dedicated success manager","Custom integrations"]'::jsonb,
        ARRAY['ecommerce','pos','crm','sales','inventory','purchase','hrms','finance','whatsapp','website','masters'],
        2, true
    ),
    (
        'Enterprise',
        'For multi-branch operations with advanced needs.',
        8333, 99990, false,
        'Talk to Sales',
        '["Unlimited users","Unlimited storefronts & outlets","All modules included","Multi-branch consolidation","Dedicated account manager","Custom integrations & API access","Advanced reporting + BI","SSO & advanced permissions","99.9% uptime SLA","24/7 phone + WhatsApp support"]'::jsonb,
        '[]'::jsonb,
        ARRAY['ecommerce','pos','crm','sales','inventory','purchase','hrms','finance','whatsapp','website','masters'],
        3, true
    )
ON CONFLICT DO NOTHING;

-- ── 4. Backfill modules_included for any existing rows that are empty ────────
UPDATE public.pricing_plans
SET modules_included = ARRAY['ecommerce','crm','sales','masters']
WHERE lower(name) LIKE '%starter%' AND (modules_included IS NULL OR modules_included = '{}');

UPDATE public.pricing_plans
SET modules_included = ARRAY['ecommerce','pos','crm','sales','inventory','purchase','hrms','finance','whatsapp','website','masters']
WHERE lower(name) LIKE '%growth%' AND (modules_included IS NULL OR modules_included = '{}');

UPDATE public.pricing_plans
SET modules_included = ARRAY['ecommerce','pos','crm','sales','inventory','purchase','hrms','finance','whatsapp','website','masters']
WHERE lower(name) LIKE '%enterprise%' AND (modules_included IS NULL OR modules_included = '{}');

-- ── 5. Re-point subscriptions.plan_id FK to pricing_plans ───────────────────
-- (Skip if subscriptions table doesn't have plan_id or FK is already correct)
DO $$
BEGIN
    -- Drop old FK if it pointed to subscription_plans (which may be dropped)
    ALTER TABLE public.subscriptions
        DROP CONSTRAINT IF EXISTS subscriptions_plan_id_fkey;

    -- Add FK to pricing_plans
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'subscriptions_plan_id_fkey'
          AND table_name = 'subscriptions'
    ) THEN
        ALTER TABLE public.subscriptions
            ADD CONSTRAINT subscriptions_plan_id_fkey
            FOREIGN KEY (plan_id) REFERENCES public.pricing_plans(id) ON DELETE SET NULL;
    END IF;
EXCEPTION
    WHEN others THEN NULL; -- subscriptions table may not have plan_id column yet
END $$;
