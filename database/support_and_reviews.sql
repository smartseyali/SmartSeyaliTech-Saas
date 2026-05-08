-- ═══════════════════════════════════════════════════════════════════════════
--  Support Tickets, Support Messages, and Platform Testimonials (extended)
--
--  Creates:
--    • public.support_tickets      — tenant-scoped helpdesk tickets
--    • public.support_messages     — per-ticket message thread
--
--  Extends:
--    • public.platform_testimonials — adds company_id, submitted_by, is_approved
--
--  RLS:
--    • Tenants can access only their own company's rows via company_users membership.
--    • Super-admins (is_super_admin = true in public.users) bypass all restrictions.
--    • Authenticated users can submit testimonials (pending approval).
--
--  Safe to re-run.
-- ═══════════════════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────────────────
--  1. support_tickets
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.support_tickets (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id   UUID        REFERENCES public.companies(id) ON DELETE CASCADE,
    company_name TEXT,
    subject      TEXT        NOT NULL,
    category     TEXT        NOT NULL DEFAULT 'general',
    description  TEXT        NOT NULL,
    status       TEXT        NOT NULL DEFAULT 'open',
    priority     TEXT        NOT NULL DEFAULT 'normal',
    created_by   UUID        REFERENCES auth.users(id),
    resolved_at  TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_company
    ON public.support_tickets(company_id);

CREATE INDEX IF NOT EXISTS idx_support_tickets_status
    ON public.support_tickets(status, created_at DESC);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Tenant: SELECT own company's tickets
DROP POLICY IF EXISTS "support_tickets_tenant_select" ON public.support_tickets;
CREATE POLICY "support_tickets_tenant_select"
    ON public.support_tickets FOR SELECT
    USING (
        company_id IN (
            SELECT company_id FROM public.company_users WHERE user_id = auth.uid()
        )
    );

-- Tenant: INSERT tickets for own company
DROP POLICY IF EXISTS "support_tickets_tenant_insert" ON public.support_tickets;
CREATE POLICY "support_tickets_tenant_insert"
    ON public.support_tickets FOR INSERT
    WITH CHECK (
        company_id IN (
            SELECT company_id FROM public.company_users WHERE user_id = auth.uid()
        )
    );

-- Tenant: UPDATE own company's tickets (e.g. add notes, close)
DROP POLICY IF EXISTS "support_tickets_tenant_update" ON public.support_tickets;
CREATE POLICY "support_tickets_tenant_update"
    ON public.support_tickets FOR UPDATE
    USING (
        company_id IN (
            SELECT company_id FROM public.company_users WHERE user_id = auth.uid()
        )
    );

-- Super-admin: full access to ALL tickets
DROP POLICY IF EXISTS "support_tickets_super_admin_all" ON public.support_tickets;
CREATE POLICY "support_tickets_super_admin_all"
    ON public.support_tickets FOR ALL
    USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_super_admin = true)
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_super_admin = true)
    );


-- ─────────────────────────────────────────────────────────────────────────
--  2. support_messages
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.support_messages (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id       UUID        NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    message         TEXT        NOT NULL,
    is_from_support BOOLEAN     NOT NULL DEFAULT false,
    sender_name     TEXT,
    created_by      UUID        REFERENCES auth.users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_messages_ticket
    ON public.support_messages(ticket_id, created_at ASC);

ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- Tenant: SELECT messages for tickets that belong to their company
DROP POLICY IF EXISTS "support_messages_tenant_select" ON public.support_messages;
CREATE POLICY "support_messages_tenant_select"
    ON public.support_messages FOR SELECT
    USING (
        ticket_id IN (
            SELECT id FROM public.support_tickets
            WHERE company_id IN (
                SELECT company_id FROM public.company_users WHERE user_id = auth.uid()
            )
        )
    );

-- Tenant: INSERT messages on their own company's tickets
DROP POLICY IF EXISTS "support_messages_tenant_insert" ON public.support_messages;
CREATE POLICY "support_messages_tenant_insert"
    ON public.support_messages FOR INSERT
    WITH CHECK (
        ticket_id IN (
            SELECT id FROM public.support_tickets
            WHERE company_id IN (
                SELECT company_id FROM public.company_users WHERE user_id = auth.uid()
            )
        )
    );

-- Super-admin: full access to ALL messages
DROP POLICY IF EXISTS "support_messages_super_admin_all" ON public.support_messages;
CREATE POLICY "support_messages_super_admin_all"
    ON public.support_messages FOR ALL
    USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_super_admin = true)
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_super_admin = true)
    );


-- ─────────────────────────────────────────────────────────────────────────
--  3. Extend platform_testimonials
-- ─────────────────────────────────────────────────────────────────────────

ALTER TABLE public.platform_testimonials
    ADD COLUMN IF NOT EXISTS company_id   UUID    REFERENCES public.companies(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS submitted_by UUID    REFERENCES auth.users(id),
    ADD COLUMN IF NOT EXISTS is_approved  BOOLEAN NOT NULL DEFAULT false;

-- Authenticated users may submit a testimonial (is_published defaults to false,
-- is_approved defaults to false — both require super-admin action to go live).
DROP POLICY IF EXISTS "platform_testimonials_tenant_insert" ON public.platform_testimonials;
CREATE POLICY "platform_testimonials_tenant_insert"
    ON public.platform_testimonials FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
    );

-- Super-admin write policy already covers ALL (update the existing one to use
-- the is_super_admin pattern consistent with the rest of the codebase).
DROP POLICY IF EXISTS "platform_testimonials_admin_write" ON public.platform_testimonials;
CREATE POLICY "platform_testimonials_admin_write"
    ON public.platform_testimonials FOR ALL
    USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_super_admin = true)
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_super_admin = true)
    );
