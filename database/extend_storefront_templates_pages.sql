-- ════════════════════════════════════════════════════════════════
--  Storefront Templates — pages manifest
-- ════════════════════════════════════════════════════════════════
--  Each template declares the pages it ships with, so the tenant's
--  Website → Pages admin can list them and allow per-page editing.
--
--  Shape of storefront_templates.pages (JSONB):
--    [
--      {
--        "slug": "home",               -- stored on web_pages.slug
--        "title": "Home",              -- human-readable name
--        "file":  "index.html",        -- file inside the template
--        "icon":  "home",              -- optional lucide icon name
--        "is_editable": true,
--        "fields": [
--          { "key": "hero_title",    "label": "Hero Headline", "type": "text" },
--          { "key": "hero_subtitle", "label": "Hero Subtitle", "type": "textarea" }
--        ]
--      }
--    ]
-- ════════════════════════════════════════════════════════════════

ALTER TABLE storefront_templates
    ADD COLUMN IF NOT EXISTS pages JSONB NOT NULL DEFAULT '[]'::jsonb;

-- ── Update Pattikadai with its 16 pages ─────────────────────────
UPDATE storefront_templates
SET pages = '[
    {"slug":"home","title":"Home","file":"index.html","icon":"home","is_editable":true,"fields":[
        {"key":"hero_title","label":"Hero Headline","type":"text"},
        {"key":"hero_subtitle","label":"Hero Subtitle","type":"textarea"},
        {"key":"featured_category","label":"Featured Category","type":"text"}
    ]},
    {"slug":"about","title":"About","file":"about.html","icon":"info","is_editable":true,"fields":[
        {"key":"intro_title","label":"Intro Title","type":"text"},
        {"key":"intro_body","label":"Intro Body","type":"textarea"},
        {"key":"mission","label":"Mission","type":"textarea"}
    ]},
    {"slug":"shop","title":"Shop","file":"shop.html","icon":"shopping-bag","is_editable":false,"fields":[]},
    {"slug":"product","title":"Product Detail","file":"product.html","icon":"package","is_editable":false,"fields":[]},
    {"slug":"contact","title":"Contact","file":"contact.html","icon":"mail","is_editable":true,"fields":[
        {"key":"intro","label":"Intro Text","type":"textarea"},
        {"key":"hours","label":"Business Hours","type":"textarea"}
    ]},
    {"slug":"cart","title":"Cart","file":"cart.html","icon":"shopping-cart","is_editable":false,"fields":[]},
    {"slug":"checkout","title":"Checkout","file":"checkout.html","icon":"credit-card","is_editable":false,"fields":[]},
    {"slug":"wishlist","title":"Wishlist","file":"wishlist.html","icon":"heart","is_editable":false,"fields":[]},
    {"slug":"login","title":"Login","file":"login.html","icon":"log-in","is_editable":false,"fields":[]},
    {"slug":"register","title":"Register","file":"register.html","icon":"user-plus","is_editable":false,"fields":[]},
    {"slug":"faq","title":"FAQ","file":"faq.html","icon":"help-circle","is_editable":true,"fields":[
        {"key":"faqs","label":"FAQs (JSON array of {q,a})","type":"json"}
    ]},
    {"slug":"terms","title":"Terms","file":"terms.html","icon":"file-text","is_editable":true,"fields":[
        {"key":"body","label":"Terms Body","type":"markdown"}
    ]},
    {"slug":"privacy","title":"Privacy","file":"privacy.html","icon":"shield","is_editable":true,"fields":[
        {"key":"body","label":"Privacy Body","type":"markdown"}
    ]},
    {"slug":"user-profile","title":"My Profile","file":"user-profile.html","icon":"user","is_editable":false,"fields":[]},
    {"slug":"my-orders","title":"My Orders","file":"my-orders.html","icon":"package","is_editable":false,"fields":[]},
    {"slug":"my-addresses","title":"My Addresses","file":"my-addresses.html","icon":"map-pin","is_editable":false,"fields":[]}
]'::jsonb
WHERE slug = 'pattikadai';

-- ── Update Sparkle Institute with its 14 pages ──────────────────
UPDATE storefront_templates
SET pages = '[
    {"slug":"home","title":"Home","file":"index.html","icon":"home","is_editable":true,"fields":[
        {"key":"hero_title","label":"Hero Headline","type":"text"},
        {"key":"hero_subtitle","label":"Hero Subtitle","type":"textarea"},
        {"key":"cta_text","label":"CTA Button Text","type":"text"}
    ]},
    {"slug":"about","title":"About","file":"about.html","icon":"info","is_editable":true,"fields":[
        {"key":"intro_title","label":"Intro Title","type":"text"},
        {"key":"intro_body","label":"Intro Body","type":"textarea"},
        {"key":"vision","label":"Vision","type":"textarea"},
        {"key":"mission","label":"Mission","type":"textarea"}
    ]},
    {"slug":"programs","title":"Programs","file":"programs.html","icon":"book-open","is_editable":false,"fields":[]},
    {"slug":"program-detail","title":"Program Detail","file":"program-detail.html","icon":"book","is_editable":false,"fields":[]},
    {"slug":"apply","title":"Apply","file":"apply.html","icon":"pen-tool","is_editable":true,"fields":[
        {"key":"intro","label":"Intro Text","type":"textarea"}
    ]},
    {"slug":"blog","title":"Blog","file":"blog.html","icon":"rss","is_editable":false,"fields":[]},
    {"slug":"blog-post","title":"Blog Post","file":"blog-post.html","icon":"file-text","is_editable":false,"fields":[]},
    {"slug":"gallery","title":"Gallery","file":"gallery.html","icon":"image","is_editable":false,"fields":[]},
    {"slug":"contact","title":"Contact","file":"contact.html","icon":"mail","is_editable":true,"fields":[
        {"key":"intro","label":"Intro Text","type":"textarea"},
        {"key":"hours","label":"Office Hours","type":"textarea"}
    ]},
    {"slug":"faqs","title":"FAQs","file":"faqs.html","icon":"help-circle","is_editable":true,"fields":[
        {"key":"faqs","label":"FAQs (JSON array of {q,a})","type":"json"}
    ]},
    {"slug":"terms","title":"Terms","file":"terms.html","icon":"file-text","is_editable":true,"fields":[
        {"key":"body","label":"Terms Body","type":"markdown"}
    ]},
    {"slug":"products","title":"Products","file":"products.html","icon":"package","is_editable":false,"fields":[]},
    {"slug":"local-landing","title":"Landing Variant","file":"local-landing.html","icon":"compass","is_editable":true,"fields":[
        {"key":"headline","label":"Headline","type":"text"},
        {"key":"subheadline","label":"Subheadline","type":"textarea"}
    ]},
    {"slug":"404","title":"404 — Not Found","file":"404.html","icon":"alert-triangle","is_editable":false,"fields":[]}
]'::jsonb
WHERE slug = 'sparkleinstitute';

-- ── web_pages: ensure unique index for tenant + slug ────────────
-- (Assumed to exist from schema.sql; re-asserted for safety)
CREATE UNIQUE INDEX IF NOT EXISTS web_pages_company_slug_uniq
    ON web_pages(company_id, slug);

-- ── NEW TEMPLATE SEEDS (scaffolded in public/templates/) ────────
-- These correspond to the four new skeleton templates scaffolded under
-- public/templates/<category>/<slug>/. Each declares its pages manifest.

INSERT INTO storefront_templates
    (slug, name, description, category, module_id, entry_path, thumbnail_url,
     tags, features, config_schema, pages, is_active, is_premium, price, sort_order)
VALUES
    ('saas-landing',
     'SaaS Landing — Product Launch',
     'Modern single-page landing for SaaS products and pre-launch campaigns. Features hero, benefits grid, pricing, and waitlist signup.',
     'landing_page', 'website',
     '/templates/landing-page/saas-landing/index.html',
     '/templates/landing-page/saas-landing/assets/thumbnail.svg',
     ARRAY['landing','saas','launch','waitlist'],
     ARRAY['Hero with CTA','Benefits grid','Pricing tiers','Testimonials','Waitlist form','Mobile-first'],
     '{
        "storeName": { "type": "text", "label": "Product Name", "required": true },
        "storeTagline": { "type": "text", "label": "Tagline" },
        "contactEmail": { "type": "email", "label": "Contact Email" }
      }'::jsonb,
     '[
        {"slug":"home","title":"Home","file":"index.html","icon":"home","is_editable":true,"fields":[
            {"key":"hero_title","label":"Hero Headline","type":"text"},
            {"key":"hero_subtitle","label":"Hero Subtitle","type":"textarea"},
            {"key":"cta_primary","label":"Primary CTA","type":"text"},
            {"key":"cta_secondary","label":"Secondary CTA","type":"text"}
        ]},
        {"slug":"pricing","title":"Pricing","file":"pricing.html","icon":"dollar-sign","is_editable":true,"fields":[
            {"key":"intro","label":"Section Intro","type":"textarea"}
        ]},
        {"slug":"contact","title":"Contact","file":"contact.html","icon":"mail","is_editable":true,"fields":[
            {"key":"intro","label":"Contact Intro","type":"textarea"}
        ]}
    ]'::jsonb,
     TRUE, FALSE, 0, 30),

    ('blog-starter',
     'Blog Starter — Editorial',
     'Clean editorial layout for blogs, newsletters, and publications. Pulls posts from the Smartseyali blog module.',
     'dynamic', 'website',
     '/templates/dynamic/blog-starter/index.html',
     '/templates/dynamic/blog-starter/assets/thumbnail.svg',
     ARRAY['blog','editorial','content','newsletter'],
     ARRAY['Post feed','Category filters','Tag pages','Author profile','Newsletter signup','SEO-ready'],
     '{
        "storeName": { "type": "text", "label": "Publication Name", "required": true },
        "storeTagline": { "type": "text", "label": "Tagline" }
      }'::jsonb,
     '[
        {"slug":"home","title":"Home","file":"index.html","icon":"home","is_editable":true,"fields":[
            {"key":"hero_title","label":"Publication Tagline","type":"text"},
            {"key":"hero_subtitle","label":"Intro Paragraph","type":"textarea"}
        ]},
        {"slug":"about","title":"About","file":"about.html","icon":"info","is_editable":true,"fields":[
            {"key":"body","label":"About Body","type":"markdown"}
        ]},
        {"slug":"contact","title":"Contact","file":"contact.html","icon":"mail","is_editable":true,"fields":[
            {"key":"intro","label":"Intro","type":"textarea"}
        ]}
    ]'::jsonb,
     TRUE, FALSE, 0, 40),

    ('minimal-store',
     'Minimal Store — Lightweight E-commerce',
     'Minimalist storefront for small catalogs and single-product launches. Fast, mobile-first, and designed for conversions.',
     'ecommerce', 'ecommerce',
     '/templates/ecommerce/minimal-store/index.html',
     '/templates/ecommerce/minimal-store/assets/thumbnail.svg',
     ARRAY['minimal','fast','mobile-first','single-product'],
     ARRAY['Hero banner','Product grid','Lightweight cart','Checkout via WhatsApp','SEO meta'],
     '{
        "storeName": { "type": "text", "label": "Store Name", "required": true },
        "storeTagline": { "type": "text", "label": "Tagline" },
        "contactPhone": { "type": "tel", "label": "Contact Phone" },
        "whatsappNumber": { "type": "tel", "label": "WhatsApp Number" }
      }'::jsonb,
     '[
        {"slug":"home","title":"Home","file":"index.html","icon":"home","is_editable":true,"fields":[
            {"key":"hero_title","label":"Hero Headline","type":"text"},
            {"key":"hero_subtitle","label":"Hero Subtitle","type":"textarea"}
        ]},
        {"slug":"shop","title":"Shop","file":"shop.html","icon":"shopping-bag","is_editable":false,"fields":[]},
        {"slug":"product","title":"Product","file":"product.html","icon":"package","is_editable":false,"fields":[]},
        {"slug":"cart","title":"Cart","file":"cart.html","icon":"shopping-cart","is_editable":false,"fields":[]},
        {"slug":"contact","title":"Contact","file":"contact.html","icon":"mail","is_editable":true,"fields":[
            {"key":"intro","label":"Contact Intro","type":"textarea"}
        ]}
    ]'::jsonb,
     TRUE, FALSE, 0, 20),

    ('coaching-lite',
     'Coaching Lite — Tutoring & Classes',
     'Compact template for tutors, coaching centers, and small institutes. Features program catalog, testimonials, enquiry form.',
     'education', 'website',
     '/templates/education/coaching-lite/index.html',
     '/templates/education/coaching-lite/assets/thumbnail.svg',
     ARRAY['education','coaching','tutor','classes','small'],
     ARRAY['Program catalog','Instructor profiles','Testimonials','Enquiry form','Mobile-first'],
     '{
        "storeName": { "type": "text", "label": "Institute Name", "required": true },
        "storeTagline": { "type": "text", "label": "Tagline" },
        "contactPhone": { "type": "tel", "label": "Contact Phone" },
        "contactEmail": { "type": "email", "label": "Contact Email" }
      }'::jsonb,
     '[
        {"slug":"home","title":"Home","file":"index.html","icon":"home","is_editable":true,"fields":[
            {"key":"hero_title","label":"Hero Headline","type":"text"},
            {"key":"hero_subtitle","label":"Hero Subtitle","type":"textarea"}
        ]},
        {"slug":"programs","title":"Programs","file":"programs.html","icon":"book-open","is_editable":false,"fields":[]},
        {"slug":"about","title":"About","file":"about.html","icon":"info","is_editable":true,"fields":[
            {"key":"intro_title","label":"Intro Title","type":"text"},
            {"key":"intro_body","label":"Intro Body","type":"textarea"}
        ]},
        {"slug":"contact","title":"Contact","file":"contact.html","icon":"mail","is_editable":true,"fields":[
            {"key":"intro","label":"Contact Intro","type":"textarea"}
        ]}
    ]'::jsonb,
     TRUE, FALSE, 0, 25)
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
    pages         = EXCLUDED.pages,
    updated_at    = NOW();
