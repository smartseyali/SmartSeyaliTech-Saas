-- ═══════════════════════════════════════════════════════════════
--  Platform Marketing Tables
--  Stores content for the SmartSeyali.com marketing site.
--  These are PLATFORM-LEVEL tables (no company_id) — they are
--  managed by super-admins and read publicly without auth.
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Extend existing platform_settings singleton ───────────────
-- platform_settings already exists (platform_settings.sql) as a
-- singleton row (id=1) with Razorpay/billing/Hostinger columns.
-- We add marketing-specific columns here. Sensitive columns
-- (razorpay, hostinger keys) are NOT exposed publicly — we expose
-- only safe contact/stats columns via the site_info view below.

ALTER TABLE public.platform_settings
    ADD COLUMN IF NOT EXISTS contact_email          TEXT DEFAULT 'support@smartseyali.com',
    ADD COLUMN IF NOT EXISTS contact_phone          TEXT DEFAULT '+91 90477 36612',
    ADD COLUMN IF NOT EXISTS contact_whatsapp       TEXT DEFAULT '919047736612',
    ADD COLUMN IF NOT EXISTS contact_address        TEXT DEFAULT 'SR Nagar, Tiruppur, TN',
    ADD COLUMN IF NOT EXISTS contact_address_detail TEXT DEFAULT 'Nethaji Third Street, India',
    ADD COLUMN IF NOT EXISTS contact_hours          TEXT DEFAULT 'Mon–Sat: 6pm – 10pm',
    ADD COLUMN IF NOT EXISTS contact_hours_sub      TEXT DEFAULT 'Limited weekend support',
    ADD COLUMN IF NOT EXISTS stat_clients_raw       INT  DEFAULT 50,
    ADD COLUMN IF NOT EXISTS stat_modules_raw       INT  DEFAULT 20,
    ADD COLUMN IF NOT EXISTS stat_uptime_raw        INT  DEFAULT 99,
    ADD COLUMN IF NOT EXISTS stat_support_raw       INT  DEFAULT 24;

-- Seed / update the singleton row with the initial marketing values.
UPDATE public.platform_settings SET
    contact_email          = 'support@smartseyali.com',
    contact_phone          = '+91 90477 36612',
    contact_whatsapp       = '919047736612',
    contact_address        = 'SR Nagar, Tiruppur, TN',
    contact_address_detail = 'Nethaji Third Street, India',
    contact_hours          = 'Mon–Sat: 6pm – 10pm',
    contact_hours_sub      = 'Limited weekend support',
    stat_clients_raw       = 50,
    stat_modules_raw       = 20,
    stat_uptime_raw        = 99,
    stat_support_raw       = 24
WHERE id = 1;

-- Public view — exposes only the safe marketing columns.
-- Razorpay, billing, and Hostinger columns remain hidden.
CREATE OR REPLACE VIEW public.site_info AS
SELECT
    contact_email,
    contact_phone,
    contact_whatsapp,
    contact_address,
    contact_address_detail,
    contact_hours,
    contact_hours_sub,
    stat_clients_raw,
    stat_modules_raw,
    stat_uptime_raw,
    stat_support_raw
FROM public.platform_settings
WHERE id = 1;

-- Grant anonymous + authenticated read access to the view.
GRANT SELECT ON public.site_info TO anon, authenticated;


-- ── 2. Platform Testimonials ────────────────────────────────────
-- Customer quotes shown on the marketing home page.

CREATE TABLE IF NOT EXISTS public.platform_testimonials (
    id           UUID     PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_name  VARCHAR(255) NOT NULL,
    author_role  VARCHAR(255),
    company      VARCHAR(255),
    quote        TEXT     NOT NULL,
    rating       SMALLINT DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
    is_published BOOLEAN  DEFAULT true,
    sort_order   INT      DEFAULT 0,
    created_at   TIMESTAMPTZ DEFAULT now(),
    updated_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.platform_testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "platform_testimonials_public_read" ON public.platform_testimonials;
DROP POLICY IF EXISTS "platform_testimonials_admin_write" ON public.platform_testimonials;

CREATE POLICY "platform_testimonials_public_read"
    ON public.platform_testimonials FOR SELECT USING (is_published = true);

CREATE POLICY "platform_testimonials_admin_write"
    ON public.platform_testimonials FOR ALL
    USING (auth.email() = current_setting('app.super_admin_email', true))
    WITH CHECK (auth.email() = current_setting('app.super_admin_email', true));


-- ── 3. Platform Client Logos ─────────────────────────────────────
-- Business names / logos shown in the marquee on the home page.

CREATE TABLE IF NOT EXISTS public.platform_client_logos (
    id           UUID     PRIMARY KEY DEFAULT uuid_generate_v4(),
    name         VARCHAR(255) NOT NULL,
    logo_url     TEXT,
    is_published BOOLEAN  DEFAULT true,
    sort_order   INT      DEFAULT 0,
    created_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.platform_client_logos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "platform_client_logos_public_read" ON public.platform_client_logos;
DROP POLICY IF EXISTS "platform_client_logos_admin_write" ON public.platform_client_logos;

CREATE POLICY "platform_client_logos_public_read"
    ON public.platform_client_logos FOR SELECT USING (is_published = true);

CREATE POLICY "platform_client_logos_admin_write"
    ON public.platform_client_logos FOR ALL
    USING (auth.email() = current_setting('app.super_admin_email', true))
    WITH CHECK (auth.email() = current_setting('app.super_admin_email', true));


-- ── 4. Platform FAQs ────────────────────────────────────────────
-- FAQs shown on the pricing page. category = 'pricing' | 'general' | 'support'

CREATE TABLE IF NOT EXISTS public.platform_faqs (
    id           UUID     PRIMARY KEY DEFAULT uuid_generate_v4(),
    question     TEXT     NOT NULL,
    answer       TEXT     NOT NULL,
    category     VARCHAR(100) DEFAULT 'general',
    sort_order   INT      DEFAULT 0,
    is_published BOOLEAN  DEFAULT true,
    created_at   TIMESTAMPTZ DEFAULT now(),
    updated_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.platform_faqs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "platform_faqs_public_read" ON public.platform_faqs;
DROP POLICY IF EXISTS "platform_faqs_admin_write" ON public.platform_faqs;

CREATE POLICY "platform_faqs_public_read"
    ON public.platform_faqs FOR SELECT USING (is_published = true);

CREATE POLICY "platform_faqs_admin_write"
    ON public.platform_faqs FOR ALL
    USING (auth.email() = current_setting('app.super_admin_email', true))
    WITH CHECK (auth.email() = current_setting('app.super_admin_email', true));


-- ── 5. Pricing Plans ────────────────────────────────────────────
-- Starter / Growth / Enterprise tiers shown on the pricing page.
-- Prices in INR (whole rupees).

CREATE TABLE IF NOT EXISTS public.pricing_plans (
    id             UUID     PRIMARY KEY DEFAULT uuid_generate_v4(),
    name           VARCHAR(100) NOT NULL,
    tagline        VARCHAR(500),
    price_monthly  INT      NOT NULL,
    price_yearly   INT      NOT NULL,
    is_highlighted BOOLEAN  DEFAULT false,
    cta_label      VARCHAR(100) DEFAULT 'Start Free Trial',
    cta_href       VARCHAR(500),
    features       JSONB    NOT NULL DEFAULT '[]',
    not_included   JSONB             DEFAULT '[]',
    sort_order     INT      DEFAULT 0,
    is_published   BOOLEAN  DEFAULT true,
    created_at     TIMESTAMPTZ DEFAULT now(),
    updated_at     TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pricing_plans_public_read" ON public.pricing_plans;
DROP POLICY IF EXISTS "pricing_plans_admin_write" ON public.pricing_plans;

CREATE POLICY "pricing_plans_public_read"
    ON public.pricing_plans FOR SELECT USING (is_published = true);

CREATE POLICY "pricing_plans_admin_write"
    ON public.pricing_plans FOR ALL
    USING (auth.email() = current_setting('app.super_admin_email', true))
    WITH CHECK (auth.email() = current_setting('app.super_admin_email', true));


-- ═══════════════════════════════════════════════════════════════
--  SEED DATA
-- ═══════════════════════════════════════════════════════════════

-- ── platform_client_logos ────────────────────────────────────────
INSERT INTO public.platform_client_logos (name, sort_order) VALUES
    ('Ramraj Cotton', 1),
    ('Sri Kumaran',   2),
    ('Nithyasree',    3),
    ('Bharath Mills', 4),
    ('Annai Stores',  5),
    ('Vetrivel Tex',  6)
ON CONFLICT DO NOTHING;


-- ── platform_testimonials ────────────────────────────────────────
INSERT INTO public.platform_testimonials (author_name, author_role, company, quote, rating, sort_order) VALUES
    (
        'Rajan K.', 'Managing Director', 'Ramraj Cotton',
        'SmartSeyali replaced 4 different tools we were juggling. Our team onboarded in a week and we cut operational overhead by 35%.',
        5, 1
    ),
    (
        'Priya M.', 'Operations Head', 'Annai Stores',
        'The inventory and POS modules alone were worth the switch. Real-time stock sync across 3 outlets changed everything for us.',
        5, 2
    ),
    (
        'Suresh V.', 'CFO', 'Bharath Mills',
        'Finance reporting used to take 2 days every month. With SmartSeyali it''s automated and ready in minutes — accurate every time.',
        5, 3
    )
ON CONFLICT DO NOTHING;


-- ── platform_faqs ────────────────────────────────────────────────
INSERT INTO public.platform_faqs (question, answer, category, sort_order) VALUES
    (
        'Is there a free trial?',
        'Yes — every plan starts with a 14-day free trial. No credit card required to start. You can cancel anytime during the trial.',
        'pricing', 1
    ),
    (
        'Can I switch plans later?',
        'Absolutely. You can upgrade or downgrade from your billing dashboard. Pro-rated billing applies on upgrades; downgrades take effect at the end of the current cycle.',
        'pricing', 2
    ),
    (
        'Do prices include GST?',
        'Listed prices are exclusive of 18% GST as per Indian tax law. Final invoice will reflect GST applicable to your state of registration.',
        'pricing', 3
    ),
    (
        'What payment methods do you accept?',
        'We accept all major payment methods via Razorpay — UPI, Net Banking, debit/credit cards, and wallets. Annual subscriptions can also be paid via bank transfer for enterprise plans.',
        'pricing', 4
    ),
    (
        'Can I cancel anytime?',
        'Yes. Cancellation takes effect at the end of your current billing period. You retain access to your data and can export it at any time.',
        'pricing', 5
    ),
    (
        'Do you offer discounts for non-profits or startups?',
        'We offer 30% off for registered non-profits and educational institutions, and 20% off the first year for startups under 2 years old. Contact us for details.',
        'pricing', 6
    )
ON CONFLICT DO NOTHING;


-- ── pricing_plans ────────────────────────────────────────────────
INSERT INTO public.pricing_plans
    (name, tagline, price_monthly, price_yearly, is_highlighted, cta_label, cta_href, features, not_included, sort_order)
VALUES
    (
        'Starter',
        'Single-store essentials for small teams.',
        1249, 14990, false,
        'Start Free Trial', '/contact?plan=starter',
        '["Up to 3 users","1 storefront / 1 outlet","E-Commerce + POS modules","500 products","Basic CRM","Email support","Standard themes"]',
        '["WhatsApp Business API","Custom domain","Multi-branch"]',
        1
    ),
    (
        'Growth',
        'For multi-channel businesses scaling up.',
        3333, 39990, true,
        'Start Free Trial', '/contact?plan=growth',
        '["Up to 15 users","3 storefronts / 5 outlets","All commerce + finance modules","Unlimited products","Full CRM + Sales pipeline","WhatsApp Business API","Custom domain support","GST & invoicing","Priority email + WhatsApp support"]',
        '["Dedicated success manager","Custom integrations"]',
        2
    ),
    (
        'Enterprise',
        'For multi-branch operations with advanced needs.',
        8333, 99990, false,
        'Talk to Sales', '/contact?plan=enterprise',
        '["Unlimited users","Unlimited storefronts & outlets","All modules included (HRMS, Purchase, Analytics)","Multi-branch consolidation","Dedicated account manager","Custom integrations & API access","Advanced reporting + BI","SSO & advanced permissions","99.9% uptime SLA","24/7 phone + WhatsApp support"]',
        '[]',
        3
    )
ON CONFLICT DO NOTHING;
