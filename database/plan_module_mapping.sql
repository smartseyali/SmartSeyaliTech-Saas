-- Plan → Module Mapping
-- Adds modules_included column to pricing_plans so each bundle tier
-- knows which app slugs to auto-install during onboarding.
--
-- Run this once against your Supabase project.

ALTER TABLE pricing_plans
  ADD COLUMN IF NOT EXISTS modules_included TEXT[] DEFAULT '{}';

-- Seed example mappings (adjust slugs to match your PLATFORM_MODULES ids)
UPDATE pricing_plans SET modules_included = ARRAY['ecommerce','crm','sales','masters']
  WHERE LOWER(name) LIKE '%starter%';

UPDATE pricing_plans SET modules_included = ARRAY['ecommerce','pos','crm','sales','inventory','purchase','hrms','finance','whatsapp','website','masters']
  WHERE LOWER(name) LIKE '%growth%';

UPDATE pricing_plans SET modules_included = ARRAY['ecommerce','pos','crm','sales','inventory','purchase','hrms','finance','whatsapp','website','masters']
  WHERE LOWER(name) LIKE '%enterprise%';
