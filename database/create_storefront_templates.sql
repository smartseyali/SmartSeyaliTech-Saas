-- ════════════════════════════════════════════════════════════════
--  Storefront Templates — registry + company selection
-- ════════════════════════════════════════════════════════════════
--  Purpose: Multi-template marketplace for Website / E-commerce
--  modules. Super-admin registers templates; tenants pick one after
--  purchasing a module. Template static files live in
--  /public/templates/<category>/<slug>/ and read their runtime
--  configuration (company_id, anon_key, supabase_url) from URL query
--  params when loaded inside the /store/:slug route.
-- ════════════════════════════════════════════════════════════════

-- ── 1. storefront_templates ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS storefront_templates (
    id               BIGSERIAL PRIMARY KEY,
    slug             TEXT NOT NULL UNIQUE,
    name             TEXT NOT NULL,
    description      TEXT,
    category         TEXT NOT NULL,                      -- 'ecommerce', 'education', 'landing_page', 'dynamic'
    module_id        TEXT,                               -- matches system_modules.id ('ecommerce', 'website', …)
    entry_path       TEXT NOT NULL,                      -- '/templates/ecommerce/pattikadai/index.html'
    thumbnail_url    TEXT,
    preview_url      TEXT,                               -- external live demo (optional)
    tags             TEXT[] DEFAULT '{}',
    features         TEXT[] DEFAULT '{}',                -- ['Product Catalog','WhatsApp Checkout','PWA']
    config_schema    JSONB DEFAULT '{}'::jsonb,          -- describes configurable fields for the picker
    is_active        BOOLEAN NOT NULL DEFAULT TRUE,
    is_premium       BOOLEAN NOT NULL DEFAULT FALSE,
    price            NUMERIC(10,2) DEFAULT 0,            -- 0 = included with module
    sort_order       INTEGER NOT NULL DEFAULT 0,
    author           TEXT DEFAULT 'Smartseyali',
    version          TEXT DEFAULT '1.0.0',
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_storefront_templates_category ON storefront_templates(category);
CREATE INDEX IF NOT EXISTS idx_storefront_templates_module   ON storefront_templates(module_id);
CREATE INDEX IF NOT EXISTS idx_storefront_templates_active   ON storefront_templates(is_active) WHERE is_active = TRUE;

-- Trigger: updated_at
CREATE OR REPLACE FUNCTION storefront_templates_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_storefront_templates_updated_at ON storefront_templates;
CREATE TRIGGER trg_storefront_templates_updated_at
    BEFORE UPDATE ON storefront_templates
    FOR EACH ROW EXECUTE FUNCTION storefront_templates_set_updated_at();

-- ── 2. companies.active_template_id + template_config ──────────
-- active_template_id → FK to storefront_templates.id
-- template_config    → tenant-specific overrides (contact, social, theme colors, etc.)
ALTER TABLE companies
    ADD COLUMN IF NOT EXISTS active_template_id BIGINT REFERENCES storefront_templates(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS template_config    JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_companies_active_template ON companies(active_template_id);

-- ── 3. RLS ─────────────────────────────────────────────────────
ALTER TABLE storefront_templates ENABLE ROW LEVEL SECURITY;

-- Public read for active templates (so tenants and anonymous storefront visitors can see them)
DROP POLICY IF EXISTS storefront_templates_select ON storefront_templates;
CREATE POLICY storefront_templates_select ON storefront_templates
    FOR SELECT
    USING (is_active = TRUE OR auth.role() = 'service_role');

-- Only super-admins can write (mirror of other platform tables)
DROP POLICY IF EXISTS storefront_templates_insert ON storefront_templates;
CREATE POLICY storefront_templates_insert ON storefront_templates
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid() AND users.is_super_admin = TRUE
        )
    );

DROP POLICY IF EXISTS storefront_templates_update ON storefront_templates;
CREATE POLICY storefront_templates_update ON storefront_templates
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid() AND users.is_super_admin = TRUE
        )
    );

DROP POLICY IF EXISTS storefront_templates_delete ON storefront_templates;
CREATE POLICY storefront_templates_delete ON storefront_templates
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid() AND users.is_super_admin = TRUE
        )
    );

-- ── 4. Seed: existing two templates ─────────────────────────────
INSERT INTO storefront_templates
    (slug, name, description, category, module_id, entry_path, thumbnail_url,
     tags, features, config_schema, is_active, is_premium, price, sort_order)
VALUES
    ('pattikadai',
     'Pattikadai — Retail Storefront',
     'Vibrant single-page storefront for retail brands with WhatsApp checkout, product variants, and dynamic shipping zones. Built for South-Indian F&B brands.',
     'ecommerce',
     'ecommerce',
     '/templates/ecommerce/pattikadai/index.html',
     '/templates/ecommerce/pattikadai/assets/img/logo/logo.gif',
     ARRAY['retail', 'f-and-b', 'whatsapp', 'india'],
     ARRAY['Product Catalog', 'Variants & Stock', 'WhatsApp Checkout', 'Razorpay', 'Dynamic Shipping', 'Cart & Wishlist', 'Mobile-first'],
     '{
        "storeName": { "type": "text", "label": "Store Name", "required": true },
        "storeTagline": { "type": "text", "label": "Tagline" },
        "contactPhone": { "type": "tel", "label": "Contact Phone" },
        "contactEmail": { "type": "email", "label": "Contact Email" },
        "whatsappNumber": { "type": "tel", "label": "WhatsApp Number" },
        "razorpayKey": { "type": "text", "label": "Razorpay Key" }
      }'::jsonb,
     TRUE, FALSE, 0, 10),

    ('sparkleinstitute',
     'Sparkle Institute — Education',
     'Professional institution template for coaching centers, schools, and training programs. Includes program catalog, online applications, blog, and FAQs.',
     'education',
     'website',
     '/templates/education/sparkleinstitute/index.html',
     '/templates/education/sparkleinstitute/logo.jpg',
     ARRAY['education', 'coaching', 'institute', 'programs'],
     ARRAY['Program Catalog', 'Online Applications', 'Gallery', 'Blog', 'FAQs', 'Contact Form', 'SEO-ready'],
     '{
        "storeName": { "type": "text", "label": "Institution Name", "required": true },
        "storeTagline": { "type": "text", "label": "Tagline" },
        "contactPhone": { "type": "tel", "label": "Contact Phone" },
        "contactEmail": { "type": "email", "label": "Contact Email" }
      }'::jsonb,
     TRUE, FALSE, 0, 20)
ON CONFLICT (slug) DO UPDATE SET
    name          = EXCLUDED.name,
    description   = EXCLUDED.description,
    category      = EXCLUDED.category,
    module_id     = EXCLUDED.module_id,
    entry_path    = EXCLUDED.entry_path,
    thumbnail_url = EXCLUDED.thumbnail_url,
    tags          = EXCLUDED.tags,
    features      = EXCLUDED.features,
    config_schema = EXCLUDED.config_schema,
    updated_at    = NOW();

-- ── 5. Grants ──────────────────────────────────────────────────
GRANT SELECT ON storefront_templates TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON storefront_templates TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE storefront_templates_id_seq TO authenticated;
