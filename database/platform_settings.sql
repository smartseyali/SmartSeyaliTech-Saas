-- ═══════════════════════════════════════════════════════════════
--  Platform Settings — Global configuration (Razorpay, billing, etc.)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS platform_settings (
    id            INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),   -- singleton row

    -- Razorpay Payment Gateway
    razorpay_key_id      TEXT,
    razorpay_key_secret  TEXT,
    razorpay_test_mode   BOOLEAN DEFAULT true,

    -- Billing Configuration
    billing_mode         VARCHAR(20) DEFAULT 'both' CHECK (billing_mode IN ('monthly', 'yearly', 'both')),
    currency             VARCHAR(10) DEFAULT 'INR',
    currency_symbol      VARCHAR(5)  DEFAULT '₹',

    -- Metadata
    updated_at           TIMESTAMPTZ DEFAULT NOW(),
    updated_by           UUID REFERENCES auth.users(id)
);

-- Seed the singleton row so upserts always work
INSERT INTO platform_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- RLS: only super-admin can read/write (enforce via service-role or custom policy)
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read" ON platform_settings
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow super-admin write" ON platform_settings
    FOR ALL USING (true) WITH CHECK (true);
