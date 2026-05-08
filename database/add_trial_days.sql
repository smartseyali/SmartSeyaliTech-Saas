-- ============================================================
-- Add configurable trial_days and tax config to platform tables.
-- Run in Supabase SQL Editor. Safe to re-run.
-- ============================================================

-- Free trial days per module / plan
ALTER TABLE public.system_modules
    ADD COLUMN IF NOT EXISTS trial_days INTEGER NOT NULL DEFAULT 14;

ALTER TABLE public.pricing_plans
    ADD COLUMN IF NOT EXISTS trial_days INTEGER NOT NULL DEFAULT 14;

-- Platform-level tax configuration (singleton row id=1 in platform_settings)
ALTER TABLE public.platform_settings
    ADD COLUMN IF NOT EXISTS tax_label    VARCHAR(20)    NOT NULL DEFAULT 'GST',
    ADD COLUMN IF NOT EXISTS tax_rate     NUMERIC(5,2)   NOT NULL DEFAULT 18,
    ADD COLUMN IF NOT EXISTS tax_included BOOLEAN        NOT NULL DEFAULT false;
