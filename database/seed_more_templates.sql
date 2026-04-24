-- ════════════════════════════════════════════════════════════════
--  Seed 14 additional storefront templates — 5 per category
-- ════════════════════════════════════════════════════════════════
--  Run after: create_storefront_templates.sql + extend_storefront_templates_pages.sql
--  Each template has files scaffolded at /public/templates/<category>/<slug>/
--  by `node scripts/scaffold-templates.cjs`.
-- ════════════════════════════════════════════════════════════════

-- helper: each page block is a compact JSONB
-- shape: { slug, title, file, icon, is_editable, fields:[{key,label,type}] }

INSERT INTO storefront_templates
    (slug, name, description, category, module_id, entry_path, thumbnail_url,
     tags, features, config_schema, pages, is_active, is_premium, price, sort_order)
VALUES

-- ═════════════════════ ECOMMERCE ═════════════════════
('fashion-boutique',
 'Atelier — Fashion Boutique',
 'Luxe fashion storefront with a muted beige + navy palette, slow typography, and a minimalist product presentation. Ideal for independent designers and curated apparel.',
 'ecommerce', 'ecommerce',
 '/templates/ecommerce/fashion-boutique/index.html',
 '/templates/ecommerce/fashion-boutique/assets/thumbnail.svg',
 ARRAY['fashion','luxe','boutique','apparel'],
 ARRAY['Product catalog','Variants','Lookbook hero','WhatsApp checkout','Wishlist','Newsletter'],
 '{
    "storeName":{"type":"text","label":"Boutique Name","required":true},
    "storeTagline":{"type":"text","label":"Tagline"},
    "contactEmail":{"type":"email","label":"Contact Email"},
    "whatsappNumber":{"type":"tel","label":"WhatsApp Number"}
  }'::jsonb,
 '[
    {"slug":"home","title":"Home","file":"index.html","icon":"home","is_editable":true,"fields":[
        {"key":"hero_title","label":"Hero Headline","type":"text"},
        {"key":"hero_subtitle","label":"Hero Subtitle","type":"textarea"}
    ]},
    {"slug":"shop","title":"Shop","file":"shop.html","icon":"shopping-bag","is_editable":true,"fields":[
        {"key":"hero_title","label":"Shop Headline","type":"text"},
        {"key":"hero_subtitle","label":"Shop Subtitle","type":"textarea"}
    ]},
    {"slug":"contact","title":"Contact","file":"contact.html","icon":"mail","is_editable":true,"fields":[
        {"key":"hero_title","label":"Contact Headline","type":"text"},
        {"key":"hero_subtitle","label":"Contact Intro","type":"textarea"}
    ]}
 ]'::jsonb,
 TRUE, FALSE, 0, 15),

('electronics-hub',
 'Volt — Electronics Hub',
 'Tech-forward storefront with deep-black background and neon-lime accents. Built for electronics, dev gear, and enthusiast audiences.',
 'ecommerce', 'ecommerce',
 '/templates/ecommerce/electronics-hub/index.html',
 '/templates/ecommerce/electronics-hub/assets/thumbnail.svg',
 ARRAY['electronics','tech','gadgets','dev','dark'],
 ARRAY['Product catalog','Spec sheets','Real-time stock','Razorpay/UPI','Pre-orders','Email notifications'],
 '{
    "storeName":{"type":"text","label":"Store Name","required":true},
    "storeTagline":{"type":"text","label":"Tagline"},
    "contactEmail":{"type":"email","label":"Support Email"}
  }'::jsonb,
 '[
    {"slug":"home","title":"Home","file":"index.html","icon":"home","is_editable":true,"fields":[
        {"key":"hero_title","label":"Hero Headline","type":"text"},
        {"key":"hero_subtitle","label":"Hero Subtitle","type":"textarea"}
    ]},
    {"slug":"shop","title":"Shop","file":"shop.html","icon":"shopping-bag","is_editable":true,"fields":[
        {"key":"hero_title","label":"Catalog Headline","type":"text"},
        {"key":"hero_subtitle","label":"Catalog Subtitle","type":"textarea"}
    ]},
    {"slug":"contact","title":"Support","file":"contact.html","icon":"life-buoy","is_editable":true,"fields":[
        {"key":"hero_title","label":"Support Headline","type":"text"},
        {"key":"hero_subtitle","label":"Support Intro","type":"textarea"}
    ]}
 ]'::jsonb,
 TRUE, FALSE, 0, 16),

('grocery-market',
 'FreshCart — Grocery Market',
 'Fresh-produce storefront with cream + forest-green palette. Built for local grocers, farm-to-table brands, and 2-hour delivery workflows.',
 'ecommerce', 'ecommerce',
 '/templates/ecommerce/grocery-market/index.html',
 '/templates/ecommerce/grocery-market/assets/thumbnail.svg',
 ARRAY['grocery','fresh','farm-to-table','delivery'],
 ARRAY['Product catalog','Category browse','2-hour delivery slots','Substitutions','Reorder','COD'],
 '{
    "storeName":{"type":"text","label":"Market Name","required":true},
    "storeTagline":{"type":"text","label":"Tagline"},
    "contactPhone":{"type":"tel","label":"Delivery Hotline"},
    "whatsappNumber":{"type":"tel","label":"WhatsApp Number"}
  }'::jsonb,
 '[
    {"slug":"home","title":"Home","file":"index.html","icon":"home","is_editable":true,"fields":[
        {"key":"hero_title","label":"Hero Headline","type":"text"},
        {"key":"hero_subtitle","label":"Hero Subtitle","type":"textarea"}
    ]},
    {"slug":"shop","title":"Shop","file":"shop.html","icon":"shopping-basket","is_editable":true,"fields":[
        {"key":"hero_title","label":"Shop Headline","type":"text"},
        {"key":"hero_subtitle","label":"Shop Subtitle","type":"textarea"}
    ]},
    {"slug":"contact","title":"Contact","file":"contact.html","icon":"mail","is_editable":true,"fields":[
        {"key":"hero_title","label":"Contact Headline","type":"text"},
        {"key":"hero_subtitle","label":"Contact Intro","type":"textarea"}
    ]}
 ]'::jsonb,
 TRUE, FALSE, 0, 17),

-- ═════════════════════ EDUCATION ═════════════════════
('university-modern',
 'Meridian — University',
 'Classic-meets-modern template for universities and large institutes. Navy + gold palette, broad program catalogs, admissions-focused flows.',
 'education', 'website',
 '/templates/education/university-modern/index.html',
 '/templates/education/university-modern/assets/thumbnail.svg',
 ARRAY['university','institute','admissions','programs','classic'],
 ARRAY['Program catalog','Faculty profiles','Admissions forms','Campus life','Research showcase','News feed'],
 '{
    "storeName":{"type":"text","label":"University Name","required":true},
    "storeTagline":{"type":"text","label":"Tagline"},
    "contactEmail":{"type":"email","label":"Admissions Email"},
    "contactPhone":{"type":"tel","label":"Admissions Phone"}
  }'::jsonb,
 '[
    {"slug":"home","title":"Home","file":"index.html","icon":"home","is_editable":true,"fields":[
        {"key":"hero_title","label":"Hero Headline","type":"text"},
        {"key":"hero_subtitle","label":"Hero Subtitle","type":"textarea"}
    ]},
    {"slug":"programs","title":"Programs","file":"programs.html","icon":"book-open","is_editable":true,"fields":[
        {"key":"hero_title","label":"Programs Headline","type":"text"},
        {"key":"hero_subtitle","label":"Programs Subtitle","type":"textarea"}
    ]},
    {"slug":"contact","title":"Admissions","file":"contact.html","icon":"mail","is_editable":true,"fields":[
        {"key":"hero_title","label":"Admissions Headline","type":"text"},
        {"key":"hero_subtitle","label":"Admissions Intro","type":"textarea"}
    ]}
 ]'::jsonb,
 TRUE, FALSE, 0, 26),

('skills-academy',
 'Skillforge — Online Courses',
 'Modern purple-gradient online-learning template. Perfect for course creators, skill academies, and cohort-based programs.',
 'education', 'website',
 '/templates/education/skills-academy/index.html',
 '/templates/education/skills-academy/assets/thumbnail.svg',
 ARRAY['online-courses','skills','cohort','edtech','modern'],
 ARRAY['Course catalog','Video hosting ready','Enrollments','Certificates','Drip content','Live sessions'],
 '{
    "storeName":{"type":"text","label":"Academy Name","required":true},
    "storeTagline":{"type":"text","label":"Tagline"},
    "contactEmail":{"type":"email","label":"Support Email"}
  }'::jsonb,
 '[
    {"slug":"home","title":"Home","file":"index.html","icon":"home","is_editable":true,"fields":[
        {"key":"hero_title","label":"Hero Headline","type":"text"},
        {"key":"hero_subtitle","label":"Hero Subtitle","type":"textarea"}
    ]},
    {"slug":"programs","title":"Courses","file":"programs.html","icon":"book-open","is_editable":true,"fields":[
        {"key":"hero_title","label":"Courses Headline","type":"text"},
        {"key":"hero_subtitle","label":"Courses Subtitle","type":"textarea"}
    ]},
    {"slug":"contact","title":"Support","file":"contact.html","icon":"life-buoy","is_editable":true,"fields":[
        {"key":"hero_title","label":"Support Headline","type":"text"},
        {"key":"hero_subtitle","label":"Support Intro","type":"textarea"}
    ]}
 ]'::jsonb,
 TRUE, FALSE, 0, 27),

('kids-school',
 'Little Learners — Kids School',
 'Playful pastel template for primary schools, day-cares, and early-education centers. Warm yellows, friendly blues, and a parent-first tone.',
 'education', 'website',
 '/templates/education/kids-school/index.html',
 '/templates/education/kids-school/assets/thumbnail.svg',
 ARRAY['school','kids','primary','preschool','playful'],
 ARRAY['Program catalog','Virtual tour','Admissions','Parent portal','Events calendar','Gallery'],
 '{
    "storeName":{"type":"text","label":"School Name","required":true},
    "storeTagline":{"type":"text","label":"Tagline"},
    "contactPhone":{"type":"tel","label":"Office Phone"},
    "contactEmail":{"type":"email","label":"Admissions Email"}
  }'::jsonb,
 '[
    {"slug":"home","title":"Home","file":"index.html","icon":"home","is_editable":true,"fields":[
        {"key":"hero_title","label":"Hero Headline","type":"text"},
        {"key":"hero_subtitle","label":"Hero Subtitle","type":"textarea"}
    ]},
    {"slug":"programs","title":"Programs","file":"programs.html","icon":"book-open","is_editable":true,"fields":[
        {"key":"hero_title","label":"Programs Headline","type":"text"},
        {"key":"hero_subtitle","label":"Programs Subtitle","type":"textarea"}
    ]},
    {"slug":"contact","title":"Visit Us","file":"contact.html","icon":"map-pin","is_editable":true,"fields":[
        {"key":"hero_title","label":"Visit Headline","type":"text"},
        {"key":"hero_subtitle","label":"Visit Intro","type":"textarea"}
    ]}
 ]'::jsonb,
 TRUE, FALSE, 0, 28),

-- ═════════════════════ LANDING PAGE ═════════════════════
('app-launch',
 'Orbit — Mobile App Launch',
 'Clean iOS-blue landing for mobile app launches and pre-orders. App-store badges, feature grid, and waitlist form.',
 'landing_page', 'website',
 '/templates/landing-page/app-launch/index.html',
 '/templates/landing-page/app-launch/assets/thumbnail.svg',
 ARRAY['app','mobile','launch','ios','android','waitlist'],
 ARRAY['Phone mockup hero','Feature grid','Waitlist form','App-store badges','Privacy section'],
 '{
    "storeName":{"type":"text","label":"App Name","required":true},
    "storeTagline":{"type":"text","label":"Tagline"},
    "contactEmail":{"type":"email","label":"Contact Email"}
  }'::jsonb,
 '[
    {"slug":"home","title":"Home","file":"index.html","icon":"home","is_editable":true,"fields":[
        {"key":"hero_title","label":"Hero Headline","type":"text"},
        {"key":"hero_subtitle","label":"Hero Subtitle","type":"textarea"}
    ]},
    {"slug":"about","title":"About","file":"about.html","icon":"info","is_editable":true,"fields":[
        {"key":"hero_title","label":"About Headline","type":"text"},
        {"key":"hero_subtitle","label":"About Intro","type":"textarea"}
    ]},
    {"slug":"contact","title":"Contact","file":"contact.html","icon":"mail","is_editable":true,"fields":[
        {"key":"hero_title","label":"Contact Headline","type":"text"},
        {"key":"hero_subtitle","label":"Contact Intro","type":"textarea"}
    ]}
 ]'::jsonb,
 TRUE, FALSE, 0, 31),

('agency-portfolio',
 'Studio Brick — Agency Portfolio',
 'Bold black & white editorial template with single red accent. Built for creative studios, agencies, and freelance collectives.',
 'landing_page', 'website',
 '/templates/landing-page/agency-portfolio/index.html',
 '/templates/landing-page/agency-portfolio/assets/thumbnail.svg',
 ARRAY['agency','portfolio','studio','creative','editorial','bold'],
 ARRAY['Case-study grid','Client logos','Capability sections','Project gallery','Contact form'],
 '{
    "storeName":{"type":"text","label":"Studio Name","required":true},
    "storeTagline":{"type":"text","label":"Tagline"},
    "contactEmail":{"type":"email","label":"Project Email"}
  }'::jsonb,
 '[
    {"slug":"home","title":"Home","file":"index.html","icon":"home","is_editable":true,"fields":[
        {"key":"hero_title","label":"Hero Headline","type":"text"},
        {"key":"hero_subtitle","label":"Hero Subtitle","type":"textarea"}
    ]},
    {"slug":"about","title":"About","file":"about.html","icon":"info","is_editable":true,"fields":[
        {"key":"hero_title","label":"About Headline","type":"text"},
        {"key":"hero_subtitle","label":"About Intro","type":"textarea"}
    ]},
    {"slug":"contact","title":"Contact","file":"contact.html","icon":"mail","is_editable":true,"fields":[
        {"key":"hero_title","label":"Contact Headline","type":"text"},
        {"key":"hero_subtitle","label":"Contact Intro","type":"textarea"}
    ]}
 ]'::jsonb,
 TRUE, FALSE, 0, 32),

('event-conference',
 'Summit — Event & Conference',
 'Dynamic magenta + orange template for conferences, summits, and multi-day events. Speaker grid, schedule, sponsor tiers.',
 'landing_page', 'website',
 '/templates/landing-page/event-conference/index.html',
 '/templates/landing-page/event-conference/assets/thumbnail.svg',
 ARRAY['event','conference','summit','speakers','schedule'],
 ARRAY['Speaker grid','Schedule builder','Sponsors','Ticket tiers','Venue section','Livestream ready'],
 '{
    "storeName":{"type":"text","label":"Event Name","required":true},
    "storeTagline":{"type":"text","label":"Tagline / Dates"},
    "contactEmail":{"type":"email","label":"Sponsorship Email"}
  }'::jsonb,
 '[
    {"slug":"home","title":"Home","file":"index.html","icon":"home","is_editable":true,"fields":[
        {"key":"hero_title","label":"Hero Headline","type":"text"},
        {"key":"hero_subtitle","label":"Hero Subtitle","type":"textarea"}
    ]},
    {"slug":"about","title":"About","file":"about.html","icon":"info","is_editable":true,"fields":[
        {"key":"hero_title","label":"About Headline","type":"text"},
        {"key":"hero_subtitle","label":"About Intro","type":"textarea"}
    ]},
    {"slug":"contact","title":"Sponsors","file":"contact.html","icon":"handshake","is_editable":true,"fields":[
        {"key":"hero_title","label":"Sponsors Headline","type":"text"},
        {"key":"hero_subtitle","label":"Sponsors Intro","type":"textarea"}
    ]}
 ]'::jsonb,
 TRUE, FALSE, 0, 33),

('consultancy',
 'Northwind — Consultancy',
 'Professional teal + slate template for B2B consultancies, advisory firms, and boutique service businesses.',
 'landing_page', 'website',
 '/templates/landing-page/consultancy/index.html',
 '/templates/landing-page/consultancy/assets/thumbnail.svg',
 ARRAY['consultancy','b2b','advisory','services','professional'],
 ARRAY['Service cards','Case studies','Team bios','Discovery-call booking','Insights/blog','Newsletter'],
 '{
    "storeName":{"type":"text","label":"Firm Name","required":true},
    "storeTagline":{"type":"text","label":"Positioning"},
    "contactEmail":{"type":"email","label":"Contact Email"}
  }'::jsonb,
 '[
    {"slug":"home","title":"Home","file":"index.html","icon":"home","is_editable":true,"fields":[
        {"key":"hero_title","label":"Hero Headline","type":"text"},
        {"key":"hero_subtitle","label":"Hero Subtitle","type":"textarea"}
    ]},
    {"slug":"about","title":"About","file":"about.html","icon":"info","is_editable":true,"fields":[
        {"key":"hero_title","label":"About Headline","type":"text"},
        {"key":"hero_subtitle","label":"About Intro","type":"textarea"}
    ]},
    {"slug":"contact","title":"Contact","file":"contact.html","icon":"mail","is_editable":true,"fields":[
        {"key":"hero_title","label":"Contact Headline","type":"text"},
        {"key":"hero_subtitle","label":"Contact Intro","type":"textarea"}
    ]}
 ]'::jsonb,
 TRUE, FALSE, 0, 34),

-- ═════════════════════ DYNAMIC ═════════════════════
('portfolio-designer',
 'Maya — Designer Portfolio',
 'Minimalist black & white portfolio with single orange accent. Perfect for designers, illustrators, and freelance creatives.',
 'dynamic', 'website',
 '/templates/dynamic/portfolio-designer/index.html',
 '/templates/dynamic/portfolio-designer/assets/thumbnail.svg',
 ARRAY['portfolio','designer','freelance','personal','minimal'],
 ARRAY['Project gallery','About page','Writing/blog','Contact form','Social links'],
 '{
    "storeName":{"type":"text","label":"Your Name","required":true},
    "storeTagline":{"type":"text","label":"Role / Tagline"},
    "contactEmail":{"type":"email","label":"Email"}
  }'::jsonb,
 '[
    {"slug":"home","title":"Home","file":"index.html","icon":"home","is_editable":true,"fields":[
        {"key":"hero_title","label":"Hero Headline","type":"text"},
        {"key":"hero_subtitle","label":"Hero Subtitle","type":"textarea"}
    ]},
    {"slug":"about","title":"About","file":"about.html","icon":"info","is_editable":true,"fields":[
        {"key":"hero_title","label":"About Headline","type":"text"},
        {"key":"hero_subtitle","label":"About Intro","type":"textarea"}
    ]},
    {"slug":"contact","title":"Contact","file":"contact.html","icon":"mail","is_editable":true,"fields":[
        {"key":"hero_title","label":"Contact Headline","type":"text"},
        {"key":"hero_subtitle","label":"Contact Intro","type":"textarea"}
    ]}
 ]'::jsonb,
 TRUE, FALSE, 0, 41),

('news-magazine',
 'The Signal — News Magazine',
 'Newsprint-cream editorial template with red accent. For daily newsletters, digest publications, and independent journalism.',
 'dynamic', 'website',
 '/templates/dynamic/news-magazine/index.html',
 '/templates/dynamic/news-magazine/assets/thumbnail.svg',
 ARRAY['news','magazine','newsletter','editorial','journalism'],
 ARRAY['Story feed','Category filters','Author pages','Subscribe form','Tip line','Archive'],
 '{
    "storeName":{"type":"text","label":"Publication Name","required":true},
    "storeTagline":{"type":"text","label":"Tagline"},
    "contactEmail":{"type":"email","label":"Editor Email"}
  }'::jsonb,
 '[
    {"slug":"home","title":"Home","file":"index.html","icon":"home","is_editable":true,"fields":[
        {"key":"hero_title","label":"Hero Headline","type":"text"},
        {"key":"hero_subtitle","label":"Hero Subtitle","type":"textarea"}
    ]},
    {"slug":"about","title":"About","file":"about.html","icon":"info","is_editable":true,"fields":[
        {"key":"hero_title","label":"About Headline","type":"text"},
        {"key":"hero_subtitle","label":"About Intro","type":"textarea"}
    ]},
    {"slug":"contact","title":"Tips","file":"contact.html","icon":"mail","is_editable":true,"fields":[
        {"key":"hero_title","label":"Tips Headline","type":"text"},
        {"key":"hero_subtitle","label":"Tips Intro","type":"textarea"}
    ]}
 ]'::jsonb,
 TRUE, FALSE, 0, 42),

('community-forum',
 'Commons — Community Platform',
 'Clean blue-accent template for communities, forums, and private member groups. Built for applications, weekly events, and member directories.',
 'dynamic', 'website',
 '/templates/dynamic/community-forum/index.html',
 '/templates/dynamic/community-forum/assets/thumbnail.svg',
 ARRAY['community','forum','members','private','slack','discord'],
 ARRAY['Application form','Member directory','Events calendar','Code of conduct','FAQ','Pricing'],
 '{
    "storeName":{"type":"text","label":"Community Name","required":true},
    "storeTagline":{"type":"text","label":"Tagline"},
    "contactEmail":{"type":"email","label":"Moderator Email"}
  }'::jsonb,
 '[
    {"slug":"home","title":"Home","file":"index.html","icon":"home","is_editable":true,"fields":[
        {"key":"hero_title","label":"Hero Headline","type":"text"},
        {"key":"hero_subtitle","label":"Hero Subtitle","type":"textarea"}
    ]},
    {"slug":"about","title":"About","file":"about.html","icon":"info","is_editable":true,"fields":[
        {"key":"hero_title","label":"About Headline","type":"text"},
        {"key":"hero_subtitle","label":"About Intro","type":"textarea"}
    ]},
    {"slug":"contact","title":"Join","file":"contact.html","icon":"user-plus","is_editable":true,"fields":[
        {"key":"hero_title","label":"Join Headline","type":"text"},
        {"key":"hero_subtitle","label":"Join Intro","type":"textarea"}
    ]}
 ]'::jsonb,
 TRUE, FALSE, 0, 43),

('podcast-show',
 'Static — Podcast Show',
 'Dark purple + pink audio-centric template for podcasts and interview shows. Episode feed, subscribe links, guest profiles.',
 'dynamic', 'website',
 '/templates/dynamic/podcast-show/index.html',
 '/templates/dynamic/podcast-show/assets/thumbnail.svg',
 ARRAY['podcast','audio','show','interviews','rss','apple','spotify'],
 ARRAY['Episode feed','Show notes','Subscribe badges','Guest pages','Transcripts','Newsletter'],
 '{
    "storeName":{"type":"text","label":"Show Name","required":true},
    "storeTagline":{"type":"text","label":"Tagline"},
    "contactEmail":{"type":"email","label":"Show Email"}
  }'::jsonb,
 '[
    {"slug":"home","title":"Home","file":"index.html","icon":"home","is_editable":true,"fields":[
        {"key":"hero_title","label":"Hero Headline","type":"text"},
        {"key":"hero_subtitle","label":"Hero Subtitle","type":"textarea"}
    ]},
    {"slug":"about","title":"About","file":"about.html","icon":"info","is_editable":true,"fields":[
        {"key":"hero_title","label":"About Headline","type":"text"},
        {"key":"hero_subtitle","label":"About Intro","type":"textarea"}
    ]},
    {"slug":"contact","title":"Guests","file":"contact.html","icon":"mic","is_editable":true,"fields":[
        {"key":"hero_title","label":"Guests Headline","type":"text"},
        {"key":"hero_subtitle","label":"Guests Intro","type":"textarea"}
    ]}
 ]'::jsonb,
 TRUE, FALSE, 0, 44)

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
    is_active     = EXCLUDED.is_active,
    sort_order    = EXCLUDED.sort_order,
    updated_at    = NOW();
