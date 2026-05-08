-- ============================================================
-- Consolidate plans tables — make pricing_plans the single source of truth
-- Run this in Supabase SQL Editor BEFORE deploying the frontend changes.
-- ============================================================

-- ── Step 1: Re-point subscriptions.plan_id → pricing_plans ──────────────────
ALTER TABLE subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_plan_id_fkey;

-- Map: look up the old plan name via subscription_plans, find the matching pricing_plan
UPDATE subscriptions s
SET plan_id = pp.id
FROM subscription_plans sp
JOIN pricing_plans pp ON lower(pp.name) = lower(sp.name)
WHERE s.plan_id = sp.id;

-- Nullify any rows that still don't resolve to a pricing_plans row
UPDATE subscriptions
SET plan_id = NULL
WHERE plan_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM pricing_plans pp WHERE pp.id = subscriptions.plan_id
  );

ALTER TABLE subscriptions
  ADD CONSTRAINT subscriptions_plan_id_fkey
  FOREIGN KEY (plan_id) REFERENCES pricing_plans(id) ON DELETE SET NULL;

-- ── Step 2: Re-point companies.plan_id → pricing_plans ──────────────────────
ALTER TABLE companies
  DROP CONSTRAINT IF EXISTS companies_plan_id_fkey;

UPDATE companies c
SET plan_id = pp.id
FROM system_plans sp
JOIN pricing_plans pp ON lower(pp.name) = lower(sp.name)
WHERE c.plan_id = sp.id;

UPDATE companies
SET plan_id = NULL
WHERE plan_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM pricing_plans pp WHERE pp.id = companies.plan_id
  );

ALTER TABLE companies
  ADD CONSTRAINT companies_plan_id_fkey
  FOREIGN KEY (plan_id) REFERENCES pricing_plans(id) ON DELETE SET NULL;

-- ── Step 3: Re-point system_subscriptions.plan_id if table exists ────────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'system_subscriptions'
  ) THEN
    ALTER TABLE system_subscriptions
      DROP CONSTRAINT IF EXISTS system_subscriptions_plan_id_fkey;

    UPDATE system_subscriptions ss
    SET plan_id = pp.id
    FROM system_plans sp
    JOIN pricing_plans pp ON lower(pp.name) = lower(sp.name)
    WHERE ss.plan_id = sp.id;

    UPDATE system_subscriptions
    SET plan_id = NULL
    WHERE plan_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM pricing_plans pp
        WHERE pp.id = system_subscriptions.plan_id
      );

    ALTER TABLE system_subscriptions
      ADD CONSTRAINT system_subscriptions_plan_id_fkey
      FOREIGN KEY (plan_id) REFERENCES pricing_plans(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ── Step 4: Drop redundant tables ────────────────────────────────────────────
DROP TABLE IF EXISTS subscription_plans CASCADE;
DROP TABLE IF EXISTS system_plans CASCADE;
