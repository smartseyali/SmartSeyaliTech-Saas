-- ============================================================================
-- WhatsApp Business Platform Module — Complete Schema
-- Multi-tenant with RLS, indexes, and audit columns
--
-- Convention from schema.sql:
--   PK:         id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
--   Tenant FK:  company_id BIGINT NOT NULL REFERENCES public.companies(id)
--   User FK:    UUID REFERENCES auth.users(id)
--   WA table FK: UUID (since existing whatsapp_* tables use UUID PKs)
-- ============================================================================

-- ── 1. CONTACTS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.whatsapp_contacts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id      BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    phone           TEXT NOT NULL,
    email           TEXT,
    tags            TEXT[] DEFAULT '{}',
    attributes      JSONB DEFAULT '{}',
    lifecycle_stage TEXT NOT NULL DEFAULT 'lead'
                    CHECK (lifecycle_stage IN ('lead','prospect','customer','inactive')),
    opt_in          BOOLEAN NOT NULL DEFAULT FALSE,
    opt_in_at       TIMESTAMP WITH TIME ZONE,
    source          TEXT DEFAULT 'manual',
    last_message_at TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE (company_id, phone)
);

CREATE INDEX IF NOT EXISTS idx_wa_contacts_company   ON whatsapp_contacts (company_id);
CREATE INDEX IF NOT EXISTS idx_wa_contacts_phone     ON whatsapp_contacts (company_id, phone);
CREATE INDEX IF NOT EXISTS idx_wa_contacts_tags      ON whatsapp_contacts USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_wa_contacts_lifecycle ON whatsapp_contacts (company_id, lifecycle_stage);

ALTER TABLE whatsapp_contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS wa_contacts_tenant ON whatsapp_contacts;
CREATE POLICY wa_contacts_tenant ON whatsapp_contacts
    USING (company_id IN (SELECT company_id FROM company_users WHERE user_id = auth.uid()))
    WITH CHECK (company_id IN (SELECT company_id FROM company_users WHERE user_id = auth.uid()));

-- ── 2. TEMPLATES (enhance existing) ────────────────────────────────────────
-- Add columns to the existing whatsapp_templates table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='whatsapp_templates' AND column_name='body') THEN
        ALTER TABLE whatsapp_templates ADD COLUMN body TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='whatsapp_templates' AND column_name='header_type') THEN
        ALTER TABLE whatsapp_templates ADD COLUMN header_type TEXT DEFAULT 'none';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='whatsapp_templates' AND column_name='header_content') THEN
        ALTER TABLE whatsapp_templates ADD COLUMN header_content TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='whatsapp_templates' AND column_name='footer_text') THEN
        ALTER TABLE whatsapp_templates ADD COLUMN footer_text TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='whatsapp_templates' AND column_name='buttons') THEN
        ALTER TABLE whatsapp_templates ADD COLUMN buttons JSONB DEFAULT '[]';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='whatsapp_templates' AND column_name='variables') THEN
        ALTER TABLE whatsapp_templates ADD COLUMN variables TEXT[] DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='whatsapp_templates' AND column_name='sample_values') THEN
        ALTER TABLE whatsapp_templates ADD COLUMN sample_values JSONB DEFAULT '{}';
    END IF;
END $$;

-- ── 3. CAMPAIGNS (enhance existing) ────────────────────────────────────────
-- The whatsapp_campaigns table already exists in schema.sql with basic columns.
-- Add the new columns needed for the full campaign module.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='whatsapp_campaigns' AND column_name='campaign_type') THEN
        ALTER TABLE whatsapp_campaigns ADD COLUMN campaign_type TEXT DEFAULT 'marketing';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='whatsapp_campaigns' AND column_name='template_id') THEN
        ALTER TABLE whatsapp_campaigns ADD COLUMN template_id UUID REFERENCES public.whatsapp_templates(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='whatsapp_campaigns' AND column_name='segment_tags') THEN
        ALTER TABLE whatsapp_campaigns ADD COLUMN segment_tags TEXT[] DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='whatsapp_campaigns' AND column_name='segment_filter') THEN
        ALTER TABLE whatsapp_campaigns ADD COLUMN segment_filter JSONB DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='whatsapp_campaigns' AND column_name='variable_map') THEN
        ALTER TABLE whatsapp_campaigns ADD COLUMN variable_map JSONB DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='whatsapp_campaigns' AND column_name='scheduled_at') THEN
        ALTER TABLE whatsapp_campaigns ADD COLUMN scheduled_at TIMESTAMP WITH TIME ZONE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='whatsapp_campaigns' AND column_name='started_at') THEN
        ALTER TABLE whatsapp_campaigns ADD COLUMN started_at TIMESTAMP WITH TIME ZONE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='whatsapp_campaigns' AND column_name='completed_at') THEN
        ALTER TABLE whatsapp_campaigns ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='whatsapp_campaigns' AND column_name='total_recipients') THEN
        ALTER TABLE whatsapp_campaigns ADD COLUMN total_recipients INT DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='whatsapp_campaigns' AND column_name='sent_count') THEN
        ALTER TABLE whatsapp_campaigns ADD COLUMN sent_count INT DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='whatsapp_campaigns' AND column_name='delivered_count') THEN
        ALTER TABLE whatsapp_campaigns ADD COLUMN delivered_count INT DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='whatsapp_campaigns' AND column_name='read_count') THEN
        ALTER TABLE whatsapp_campaigns ADD COLUMN read_count INT DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='whatsapp_campaigns' AND column_name='failed_count') THEN
        ALTER TABLE whatsapp_campaigns ADD COLUMN failed_count INT DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='whatsapp_campaigns' AND column_name='created_by') THEN
        ALTER TABLE whatsapp_campaigns ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='whatsapp_campaigns' AND column_name='updated_at') THEN
        ALTER TABLE whatsapp_campaigns ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
    END IF;
END $$;

-- ── 4. CAMPAIGN MESSAGES (per-recipient tracking) ──────────────────────────
CREATE TABLE IF NOT EXISTS public.whatsapp_campaign_messages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id      BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    campaign_id     UUID NOT NULL REFERENCES public.whatsapp_campaigns(id) ON DELETE CASCADE,
    contact_id      UUID REFERENCES public.whatsapp_contacts(id),
    phone           TEXT NOT NULL,
    wa_message_id   TEXT,
    variables       JSONB DEFAULT '{}',
    status          VARCHAR(50) NOT NULL DEFAULT 'queued',
    error_message   TEXT,
    sent_at         TIMESTAMP WITH TIME ZONE,
    delivered_at    TIMESTAMP WITH TIME ZONE,
    read_at         TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_wa_camp_msg_campaign ON whatsapp_campaign_messages (campaign_id);
CREATE INDEX IF NOT EXISTS idx_wa_camp_msg_status   ON whatsapp_campaign_messages (campaign_id, status);
CREATE INDEX IF NOT EXISTS idx_wa_camp_msg_wamid    ON whatsapp_campaign_messages (wa_message_id);

ALTER TABLE whatsapp_campaign_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS wa_camp_msg_tenant ON whatsapp_campaign_messages;
CREATE POLICY wa_camp_msg_tenant ON whatsapp_campaign_messages
    USING (company_id IN (SELECT company_id FROM company_users WHERE user_id = auth.uid()))
    WITH CHECK (company_id IN (SELECT company_id FROM company_users WHERE user_id = auth.uid()));

-- ── 5. CONVERSATIONS ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.whatsapp_conversations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id      BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    contact_id      UUID NOT NULL REFERENCES public.whatsapp_contacts(id),
    account_id      UUID REFERENCES public.whatsapp_accounts(id),
    assigned_to     UUID REFERENCES auth.users(id),
    status          VARCHAR(50) NOT NULL DEFAULT 'bot',
    channel         TEXT DEFAULT 'whatsapp',
    session_expires_at TIMESTAMP WITH TIME ZONE,
    last_message_at TIMESTAMP WITH TIME ZONE,
    last_message_preview TEXT,
    unread_count    INT DEFAULT 0,
    tags            TEXT[] DEFAULT '{}',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_wa_conv_company    ON whatsapp_conversations (company_id);
CREATE INDEX IF NOT EXISTS idx_wa_conv_contact    ON whatsapp_conversations (company_id, contact_id);
CREATE INDEX IF NOT EXISTS idx_wa_conv_assigned   ON whatsapp_conversations (company_id, assigned_to, status);
CREATE INDEX IF NOT EXISTS idx_wa_conv_status     ON whatsapp_conversations (company_id, status);

ALTER TABLE whatsapp_conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS wa_conv_tenant ON whatsapp_conversations;
CREATE POLICY wa_conv_tenant ON whatsapp_conversations
    USING (company_id IN (SELECT company_id FROM company_users WHERE user_id = auth.uid()))
    WITH CHECK (company_id IN (SELECT company_id FROM company_users WHERE user_id = auth.uid()));

-- ── 6. MESSAGES ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id      BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES public.whatsapp_conversations(id) ON DELETE CASCADE,
    contact_id      UUID REFERENCES public.whatsapp_contacts(id),
    wa_message_id   TEXT,
    direction       VARCHAR(50) NOT NULL,
    message_type    VARCHAR(50) NOT NULL DEFAULT 'text',
    body            TEXT,
    media_url       TEXT,
    media_mime_type TEXT,
    template_name   TEXT,
    template_vars   JSONB DEFAULT '{}',
    interactive     JSONB,
    context_message_id TEXT,
    status          VARCHAR(50) NOT NULL DEFAULT 'pending',
    error_code      TEXT,
    error_message   TEXT,
    sent_by         UUID REFERENCES auth.users(id),
    sent_at         TIMESTAMP WITH TIME ZONE,
    delivered_at    TIMESTAMP WITH TIME ZONE,
    read_at         TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_wa_msg_conversation ON whatsapp_messages (conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_wa_msg_wamid        ON whatsapp_messages (wa_message_id);
CREATE INDEX IF NOT EXISTS idx_wa_msg_contact      ON whatsapp_messages (company_id, contact_id);

ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS wa_msg_tenant ON whatsapp_messages;
CREATE POLICY wa_msg_tenant ON whatsapp_messages
    USING (company_id IN (SELECT company_id FROM company_users WHERE user_id = auth.uid()))
    WITH CHECK (company_id IN (SELECT company_id FROM company_users WHERE user_id = auth.uid()));

-- ── 7. BOT RULES ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.whatsapp_bot_rules (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id      BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    rule_type       VARCHAR(50) NOT NULL DEFAULT 'keyword',
    priority        INT NOT NULL DEFAULT 100,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    trigger_keywords TEXT[] DEFAULT '{}',
    trigger_pattern TEXT,
    response_type   VARCHAR(50) NOT NULL DEFAULT 'text',
    response_body   TEXT,
    response_template_id UUID REFERENCES public.whatsapp_templates(id),
    response_buttons JSONB DEFAULT '[]',
    transfer_to     UUID REFERENCES auth.users(id),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_wa_bot_company ON whatsapp_bot_rules (company_id, is_active, priority);

ALTER TABLE whatsapp_bot_rules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS wa_bot_tenant ON whatsapp_bot_rules;
CREATE POLICY wa_bot_tenant ON whatsapp_bot_rules
    USING (company_id IN (SELECT company_id FROM company_users WHERE user_id = auth.uid()))
    WITH CHECK (company_id IN (SELECT company_id FROM company_users WHERE user_id = auth.uid()));

-- ── 8. UPDATE LOGS TABLE ────────────────────────────────────────────────────
-- Add richer fields to the existing whatsapp_logs table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='whatsapp_logs' AND column_name='event_type') THEN
        ALTER TABLE whatsapp_logs ADD COLUMN event_type TEXT DEFAULT 'message';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='whatsapp_logs' AND column_name='wa_message_id') THEN
        ALTER TABLE whatsapp_logs ADD COLUMN wa_message_id TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='whatsapp_logs' AND column_name='payload') THEN
        ALTER TABLE whatsapp_logs ADD COLUMN payload JSONB DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='whatsapp_logs' AND column_name='error_details') THEN
        ALTER TABLE whatsapp_logs ADD COLUMN error_details TEXT;
    END IF;
END $$;

-- ── 9. ADD WHATSAPP TABLES TO RLS ALLOWED LIST ─────────────────────────────
-- (The schema.sql has a function that grants access — add new tables to it)

-- ── 10. HELPER FUNCTIONS ────────────────────────────────────────────────────

-- Update campaign counters from campaign_messages
CREATE OR REPLACE FUNCTION update_campaign_stats(p_campaign_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE whatsapp_campaigns SET
        sent_count      = (SELECT COUNT(*) FROM whatsapp_campaign_messages WHERE campaign_id = p_campaign_id AND status IN ('sent','delivered','read')),
        delivered_count = (SELECT COUNT(*) FROM whatsapp_campaign_messages WHERE campaign_id = p_campaign_id AND status IN ('delivered','read')),
        read_count      = (SELECT COUNT(*) FROM whatsapp_campaign_messages WHERE campaign_id = p_campaign_id AND status = 'read'),
        failed_count    = (SELECT COUNT(*) FROM whatsapp_campaign_messages WHERE campaign_id = p_campaign_id AND status = 'failed'),
        updated_at      = timezone('utc'::text, now())
    WHERE id = p_campaign_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if conversation session is within 24-hour window
CREATE OR REPLACE FUNCTION is_wa_session_active(p_conversation_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_expires TIMESTAMP WITH TIME ZONE;
BEGIN
    SELECT session_expires_at INTO v_expires
    FROM whatsapp_conversations WHERE id = p_conversation_id;
    RETURN v_expires IS NOT NULL AND v_expires > now();
END;
$$ LANGUAGE plpgsql STABLE;
