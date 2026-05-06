-- ═══════════════════════════════════════════════════════════════
--  Hostinger Domain Registry
--  Tracks domains purchased through the SmartSeyali platform
--  via the Hostinger API on the platform owner's Hostinger account.
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hostinger_domains (
    id               BIGSERIAL PRIMARY KEY,
    company_id       BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- Domain info
    domain           TEXT NOT NULL,
    status           TEXT NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending', 'active', 'expired', 'failed', 'cancelled')),

    -- Hostinger references
    hostinger_order_id   TEXT,
    hostinger_domain_id  TEXT,

    -- Lifecycle
    purchased_at     TIMESTAMPTZ,
    expires_at       TIMESTAMPTZ,
    dns_configured   BOOLEAN NOT NULL DEFAULT false,

    -- Linked deployment
    deployment_id    BIGINT REFERENCES template_deployments(id) ON DELETE SET NULL,

    -- Audit
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_company_domain UNIQUE (company_id, domain)
);

CREATE INDEX IF NOT EXISTS idx_hostinger_domains_company ON hostinger_domains(company_id);
CREATE INDEX IF NOT EXISTS idx_hostinger_domains_status  ON hostinger_domains(status);

-- RLS: each company only sees its own domains
ALTER TABLE hostinger_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "company_own_domains" ON hostinger_domains
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM company_users WHERE user_id = auth.uid()
            UNION
            SELECT id FROM companies WHERE user_id = auth.uid()
        )
    );

-- ─── Add Hostinger API key column to platform_settings ──────────
ALTER TABLE platform_settings
    ADD COLUMN IF NOT EXISTS hostinger_api_key        TEXT,
    ADD COLUMN IF NOT EXISTS hostinger_platform_cname TEXT;  -- e.g. app.smartseyali.com

COMMENT ON COLUMN platform_settings.hostinger_api_key IS
    'Hostinger SmartControl API Bearer token — used server-side only (Edge Function)';
COMMENT ON COLUMN platform_settings.hostinger_platform_cname IS
    'Platform CNAME that client domains should point to (e.g. app.smartseyali.com)';
