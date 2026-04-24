-- ========================================================================================
-- TEMPLATE DEPLOYMENTS
-- Tenant submits a template + custom domain request. Super admin generates the zip,
-- deploys manually, then marks it deployed with the final URL.
-- Idempotent: safe to re-run.
-- ========================================================================================

-- ── 1. TABLE ──────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.template_deployments (
    id                BIGSERIAL PRIMARY KEY,
    company_id        BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    module_id         TEXT   NOT NULL,                        -- 'ecommerce' | 'website' | ...
    template_id       BIGINT NOT NULL REFERENCES public.storefront_templates(id) ON DELETE RESTRICT,
    template_slug     TEXT,                                    -- denormalized for zip build
    template_category TEXT,                                    -- denormalized for zip build
    custom_domain     TEXT   NOT NULL,                        -- e.g. shop.tenant.com
    config_overrides  JSONB  NOT NULL DEFAULT '{}'::jsonb,

    status            TEXT   NOT NULL DEFAULT 'requested'
                             CHECK (status IN ('requested','deployed','cancelled')),
    deployed_url      TEXT,
    notes             TEXT,

    requested_by      UUID   REFERENCES public.users(id),
    requested_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    deployed_by       UUID   REFERENCES public.users(id),
    deployed_at       TIMESTAMPTZ,

    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_template_deployments_company ON public.template_deployments(company_id);
CREATE INDEX IF NOT EXISTS idx_template_deployments_status  ON public.template_deployments(status);
CREATE INDEX IF NOT EXISTS idx_template_deployments_module  ON public.template_deployments(module_id);

-- Only one active (non-cancelled) request per (company, module). Cancelled rows can coexist.
CREATE UNIQUE INDEX IF NOT EXISTS uq_template_deployments_active_per_module
    ON public.template_deployments(company_id, module_id)
    WHERE status <> 'cancelled';

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.template_deployments_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_template_deployments_updated_at ON public.template_deployments;
CREATE TRIGGER trg_template_deployments_updated_at
    BEFORE UPDATE ON public.template_deployments
    FOR EACH ROW EXECUTE FUNCTION public.template_deployments_set_updated_at();


-- ── 2. RLS ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.template_deployments ENABLE ROW LEVEL SECURITY;

-- Tenant: can see and INSERT rows for companies they belong to.
DROP POLICY IF EXISTS template_deployments_tenant_select ON public.template_deployments;
CREATE POLICY template_deployments_tenant_select ON public.template_deployments
    FOR SELECT TO authenticated
    USING (
        company_id IN (
            SELECT company_id FROM public.company_users WHERE user_id = auth.uid()
            UNION
            SELECT id FROM public.companies WHERE user_id = auth.uid()
        )
        OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_super_admin = true)
    );

DROP POLICY IF EXISTS template_deployments_tenant_insert ON public.template_deployments;
CREATE POLICY template_deployments_tenant_insert ON public.template_deployments
    FOR INSERT TO authenticated
    WITH CHECK (
        company_id IN (
            SELECT company_id FROM public.company_users WHERE user_id = auth.uid()
            UNION
            SELECT id FROM public.companies WHERE user_id = auth.uid()
        )
    );

-- Tenant: can UPDATE their own row but only the config_overrides / custom_domain / notes
-- while status = 'requested'. Admins can update anything.
DROP POLICY IF EXISTS template_deployments_update ON public.template_deployments;
CREATE POLICY template_deployments_update ON public.template_deployments
    FOR UPDATE TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_super_admin = true)
        OR (
            status = 'requested'
            AND company_id IN (
                SELECT company_id FROM public.company_users WHERE user_id = auth.uid()
                UNION
                SELECT id FROM public.companies WHERE user_id = auth.uid()
            )
        )
    );

-- Only super admin can delete.
DROP POLICY IF EXISTS template_deployments_super_admin_delete ON public.template_deployments;
CREATE POLICY template_deployments_super_admin_delete ON public.template_deployments
    FOR DELETE TO authenticated
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_super_admin = true));


-- ── 3. RPC: mark a deployment as deployed (super admin only) ─────────────────────────
CREATE OR REPLACE FUNCTION public.template_deployment_mark_deployed(
    p_id BIGINT,
    p_deployed_url TEXT,
    p_notes TEXT DEFAULT NULL
)
RETURNS public.template_deployments AS $$
DECLARE
    v_is_super BOOLEAN;
    v_row public.template_deployments;
BEGIN
    SELECT is_super_admin INTO v_is_super FROM public.users WHERE id = auth.uid();
    IF NOT COALESCE(v_is_super, false) THEN
        RAISE EXCEPTION 'Only super admins can mark deployments as deployed';
    END IF;

    UPDATE public.template_deployments
       SET status       = 'deployed',
           deployed_url = p_deployed_url,
           notes        = COALESCE(p_notes, notes),
           deployed_by  = auth.uid(),
           deployed_at  = now()
     WHERE id = p_id
     RETURNING * INTO v_row;

    IF v_row.id IS NULL THEN
        RAISE EXCEPTION 'Deployment not found';
    END IF;
    RETURN v_row;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.template_deployment_mark_deployed(BIGINT, TEXT, TEXT) TO authenticated;
