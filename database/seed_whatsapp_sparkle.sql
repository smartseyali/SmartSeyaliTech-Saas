-- ========================================================================================
-- SEED: Sparkle (company_id=9) — Full WhatsApp Business Platform Demo Data
-- Run AFTER whatsapp_module.sql migration
-- ========================================================================================

BEGIN;

-- ════════════════════════════════════════════════════════════════
-- CLEAN existing WhatsApp data for Sparkle (idempotent re-runs)
-- ════════════════════════════════════════════════════════════════

DELETE FROM public.whatsapp_messages       WHERE company_id = 9;
DELETE FROM public.whatsapp_campaign_messages WHERE company_id = 9;
DELETE FROM public.whatsapp_conversations  WHERE company_id = 9;
DELETE FROM public.whatsapp_bot_rules      WHERE company_id = 9;
DELETE FROM public.whatsapp_contacts       WHERE company_id = 9;
DELETE FROM public.whatsapp_logs           WHERE company_id = 9;
-- Campaigns & templates cleaned carefully (they have FKs pointing at them)
DELETE FROM public.whatsapp_campaigns      WHERE company_id = 9;
DELETE FROM public.whatsapp_templates      WHERE company_id = 9;
DELETE FROM public.whatsapp_accounts       WHERE company_id = 9;


-- ════════════════════════════════════════════════════════════════
-- 1. WHATSAPP ACCOUNTS
-- ════════════════════════════════════════════════════════════════

INSERT INTO public.whatsapp_accounts (id, company_id, phone_number, display_name, phone_number_id, waba_id, access_token, identity, infrastructure, security, status)
VALUES
    ('a0a00000-0000-4000-a000-000000000001', 9, '+919047736612', 'Sparkle Business', '109283746500001', 'WABA-98765-SPARKLE', 'EAAG_demo_token_sparkle_primary_2026', 'Sparkle Official', 'Meta Cloud API v21.0', 'TLS 1.3 · JWT', 'verified'),
    ('a0a00000-0000-4000-a000-000000000002', 9, '+919876543210', 'Sparkle Support', '109283746500002', 'WABA-98765-SPARKLE', 'EAAG_demo_token_sparkle_support_2026', 'Sparkle Support Line', 'Meta Cloud API v21.0', 'TLS 1.3 · JWT', 'pending');


-- ════════════════════════════════════════════════════════════════
-- 2. WHATSAPP TEMPLATES
-- ════════════════════════════════════════════════════════════════

INSERT INTO public.whatsapp_templates (id, company_id, template_name, name, category, language, content, structure, identity, meta_id, meta_template_id, status, body, header_type, header_content, footer_text, buttons, variables, sample_values)
VALUES
    -- Approved templates
    ('b0b00000-0000-4000-b000-000000000001', 9, 'order_confirmation', 'Order Confirmation', 'UTILITY', 'en_US',
     'Hi {{1}}, your order #{{2}} has been confirmed! Total: ₹{{3}}. Track at {{4}}',
     'HEADER(text) + BODY + FOOTER + BUTTONS(url)',
     'Sparkle · Utility', 'meta-tmpl-001', 'h_109384756001',
     'approved',
     'Hi {{1}}, your order #{{2}} has been confirmed! 🎉\n\nTotal: ₹{{3}}\nEstimated delivery: 3-5 business days.\n\nTrack your order anytime.',
     'text', 'Order Confirmed ✅',
     'Reply STOP to unsubscribe',
     '[{"type":"URL","text":"Track Order","url":"https://sparkle.shop/track/{{1}}"},{"type":"QUICK_REPLY","text":"Need Help?"}]',
     '{name,order_id,amount,tracking_url}',
     '{"1":"Priya","2":"ORD-20260411","3":"2,499","4":"https://sparkle.shop/track/ORD-20260411"}'),

    ('b0b00000-0000-4000-b000-000000000002', 9, 'summer_sale_2026', 'Summer Sale Blast', 'MARKETING', 'en_US',
     'Hey {{1}}! 🔥 Summer Sale is LIVE — up to 50% OFF on everything! Shop now before stock runs out.',
     'HEADER(image) + BODY + BUTTONS(url,quick_reply)',
     'Sparkle · Marketing', 'meta-tmpl-002', 'h_109384756002',
     'approved',
     'Hey {{1}}! 🔥\n\nOur BIGGEST Summer Sale is LIVE!\n☀️ Up to 50% OFF across all categories\n🚚 Free shipping above ₹999\n⏰ Ends April 20th\n\nDon''t miss out!',
     'image', 'https://sparkle.shop/cdn/banners/summer-sale-2026.jpg',
     'Shop Sparkle · sparkle.shop',
     '[{"type":"URL","text":"Shop Now","url":"https://sparkle.shop/sale"},{"type":"QUICK_REPLY","text":"Remind Me Later"}]',
     '{name}',
     '{"1":"Customer"}'),

    ('b0b00000-0000-4000-b000-000000000003', 9, 'shipping_update', 'Shipping Update', 'UTILITY', 'en_US',
     'Hi {{1}}, your order #{{2}} has been shipped via {{3}}. Tracking: {{4}}',
     'HEADER(text) + BODY + BUTTONS(url)',
     'Sparkle · Utility', 'meta-tmpl-003', 'h_109384756003',
     'approved',
     'Hi {{1}},\n\nGreat news! Your order #{{2}} is on its way! 🚚\n\nCourier: {{3}}\nTracking ID: {{4}}\nExpected delivery: 2-3 days\n\nYou can track your package anytime.',
     'text', 'Your Order is Shipped! 🚚',
     'Sparkle — sparkle.shop',
     '[{"type":"URL","text":"Track Package","url":"https://sparkle.shop/track/{{2}}"}]',
     '{name,order_id,courier,tracking_id}',
     '{"1":"Rahul","2":"ORD-20260409","3":"Delhivery","4":"DL1234567890"}'),

    ('b0b00000-0000-4000-b000-000000000004', 9, 'abandoned_cart', 'Abandoned Cart Reminder', 'MARKETING', 'en_US',
     'Hi {{1}}, you left something behind! Your cart with {{2}} items (₹{{3}}) is waiting. Complete your purchase now!',
     'HEADER(image) + BODY + BUTTONS(url,quick_reply)',
     'Sparkle · Marketing', 'meta-tmpl-004', 'h_109384756004',
     'approved',
     'Hi {{1}} 👋\n\nYou left something in your cart!\n\n🛒 {{2}} items worth ₹{{3}}\n\nComplete your order now and get FREE delivery!\nOffer valid for the next 24 hours.',
     'image', 'https://sparkle.shop/cdn/banners/cart-reminder.jpg',
     'Sparkle · sparkle.shop',
     '[{"type":"URL","text":"Complete Purchase","url":"https://sparkle.shop/cart"},{"type":"QUICK_REPLY","text":"Remove Items"}]',
     '{name,item_count,cart_total}',
     '{"1":"Meena","2":"3","3":"4,750"}'),

    ('b0b00000-0000-4000-b000-000000000005', 9, 'welcome_message', 'Welcome Message', 'MARKETING', 'en_US',
     'Welcome to Sparkle, {{1}}! 🌟 Use code WELCOME10 for 10% off your first order.',
     'BODY + BUTTONS(url)',
     'Sparkle · Marketing', 'meta-tmpl-005', 'h_109384756005',
     'approved',
     'Welcome to Sparkle, {{1}}! 🌟\n\nThanks for joining our community!\n\n🎁 Here''s a special gift for you:\nUse code WELCOME10 for 10% off your first order.\n\nBrowse our latest collection:',
     'none', NULL,
     'Sparkle · sparkle.shop',
     '[{"type":"URL","text":"Start Shopping","url":"https://sparkle.shop"}]',
     '{name}',
     '{"1":"Friend"}'),

    ('b0b00000-0000-4000-b000-000000000006', 9, 'payment_reminder', 'Payment Reminder', 'UTILITY', 'en_US',
     'Hi {{1}}, your payment of ₹{{2}} for order #{{3}} is pending. Please complete it to avoid cancellation.',
     'BODY + BUTTONS(url)',
     'Sparkle · Utility', 'meta-tmpl-006', 'h_109384756006',
     'approved',
     'Hi {{1}},\n\nFriendly reminder! 🔔\n\nYour payment of ₹{{2}} for order #{{3}} is still pending.\n\nPlease complete the payment within 24 hours to avoid automatic cancellation.',
     'none', NULL,
     'Sparkle · sparkle.shop',
     '[{"type":"URL","text":"Pay Now","url":"https://sparkle.shop/pay/{{3}}"}]',
     '{name,amount,order_id}',
     '{"1":"Arun","2":"1,299","3":"ORD-20260410"}'),

    -- Pending template
    ('b0b00000-0000-4000-b000-000000000007', 9, 'flash_sale_friday', 'Flash Sale Friday', 'MARKETING', 'en_US',
     'Flash Friday is here, {{1}}! 💥 Flat 40% off for the next 4 hours only!',
     'HEADER(image) + BODY + BUTTONS(url)',
     'Sparkle · Marketing', NULL, NULL,
     'pending',
     '⚡ FLASH FRIDAY ⚡\n\nHey {{1}},\n\nFlat 40% OFF for the next 4 HOURS only!\n\n🕐 Ends at midnight\n📦 Free express shipping\n💰 Extra 5% cashback on UPI\n\nGrab your favourites NOW!',
     'image', 'https://sparkle.shop/cdn/banners/flash-friday.jpg',
     'Sparkle Flash Deals',
     '[{"type":"URL","text":"Shop Flash Sale","url":"https://sparkle.shop/flash"}]',
     '{name}',
     '{"1":"Customer"}'),

    -- Rejected template
    ('b0b00000-0000-4000-b000-000000000008', 9, 'lottery_winner', 'Lottery Winner', 'MARKETING', 'en_US',
     'Congratulations {{1}}! You won our lucky draw! Claim your prize now!',
     'BODY',
     'Sparkle · Marketing', NULL, NULL,
     'rejected',
     'Congratulations {{1}}! 🎉🎊\n\nYou have been selected as a LUCKY WINNER!\nClaim your prize of ₹50,000 now!\n\nClick below to claim:',
     'none', NULL,
     NULL,
     '[{"type":"URL","text":"Claim Prize","url":"https://sparkle.shop/claim"}]',
     '{name}',
     '{"1":"Customer"}');


-- ════════════════════════════════════════════════════════════════
-- 3. WHATSAPP CONTACTS (30 realistic Indian contacts)
-- ════════════════════════════════════════════════════════════════

INSERT INTO public.whatsapp_contacts (id, company_id, name, phone, email, tags, attributes, lifecycle_stage, opt_in, opt_in_at, source, last_message_at)
VALUES
    -- VIP Customers
    ('c0c00000-0000-4000-c000-000000000001', 9, 'Priya Sharma', '+919876543001', 'priya.sharma@gmail.com',
     '{vip,repeat-buyer,fashion}', '{"city":"Chennai","total_orders":12,"ltv":45000,"last_order":"ORD-20260410"}',
     'customer', true, '2025-11-15 10:30:00+05:30', 'website', '2026-04-11 09:15:00+05:30'),

    ('c0c00000-0000-4000-c000-000000000002', 9, 'Rahul Krishnan', '+919876543002', 'rahul.k@yahoo.com',
     '{vip,wholesale,electronics}', '{"city":"Coimbatore","total_orders":28,"ltv":125000,"gst":"33AABCT1234F1Z5"}',
     'customer', true, '2025-08-20 14:00:00+05:30', 'api', '2026-04-10 16:45:00+05:30'),

    ('c0c00000-0000-4000-c000-000000000003', 9, 'Meena Devi', '+919876543003', 'meena.devi@hotmail.com',
     '{vip,repeat-buyer,beauty}', '{"city":"Madurai","total_orders":8,"ltv":22000}',
     'customer', true, '2025-12-01 09:00:00+05:30', 'whatsapp', '2026-04-11 11:20:00+05:30'),

    -- Regular Customers
    ('c0c00000-0000-4000-c000-000000000004', 9, 'Arun Balaji', '+919876543004', 'arun.b@gmail.com',
     '{repeat-buyer,fashion}', '{"city":"Trichy","total_orders":5,"ltv":15000}',
     'customer', true, '2026-01-10 11:30:00+05:30', 'csv', '2026-04-09 14:30:00+05:30'),

    ('c0c00000-0000-4000-c000-000000000005', 9, 'Divya Lakshmi', '+919876543005', 'divya.l@gmail.com',
     '{repeat-buyer,home-decor}', '{"city":"Salem","total_orders":3,"ltv":8500}',
     'customer', true, '2026-02-14 16:00:00+05:30', 'website', '2026-04-08 10:00:00+05:30'),

    ('c0c00000-0000-4000-c000-000000000006', 9, 'Karthik Rajan', '+919876543006', 'karthik.r@outlook.com',
     '{electronics,gadgets}', '{"city":"Chennai","total_orders":4,"ltv":32000}',
     'customer', true, '2026-01-22 08:45:00+05:30', 'manual', '2026-04-07 18:00:00+05:30'),

    ('c0c00000-0000-4000-c000-000000000007', 9, 'Sangeetha M', '+919876543007', 'sangeetha.m@gmail.com',
     '{fashion,sarees}', '{"city":"Thanjavur","total_orders":6,"ltv":18000}',
     'customer', true, '2025-10-05 13:15:00+05:30', 'website', '2026-04-06 12:00:00+05:30'),

    ('c0c00000-0000-4000-c000-000000000008', 9, 'Vijay Kumar', '+919876543008', 'vijay.k@gmail.com',
     '{electronics}', '{"city":"Erode","total_orders":2,"ltv":6000}',
     'customer', true, '2026-03-01 10:00:00+05:30', 'whatsapp', '2026-04-05 09:30:00+05:30'),

    -- Prospects (interested but haven't purchased yet)
    ('c0c00000-0000-4000-c000-000000000009', 9, 'Anitha Sundaram', '+919876543009', 'anitha.s@gmail.com',
     '{prospect,fashion}', '{"city":"Vellore","interest":"silk sarees"}',
     'prospect', true, '2026-03-15 11:00:00+05:30', 'website', '2026-04-10 10:00:00+05:30'),

    ('c0c00000-0000-4000-c000-000000000010', 9, 'Manoj Prabhu', '+919876543010', 'manoj.p@gmail.com',
     '{prospect,wholesale}', '{"city":"Tirunelveli","interest":"bulk electronics","business":"Prabhu Electronics"}',
     'prospect', true, '2026-03-20 09:30:00+05:30', 'manual', '2026-04-09 15:00:00+05:30'),

    ('c0c00000-0000-4000-c000-000000000011', 9, 'Lakshmi Narayanan', '+919876543011', 'lakshmi.n@yahoo.com',
     '{prospect,home-decor}', '{"city":"Kumbakonam","interest":"home furnishing"}',
     'prospect', true, '2026-04-01 14:00:00+05:30', 'whatsapp', '2026-04-08 11:30:00+05:30'),

    ('c0c00000-0000-4000-c000-000000000012', 9, 'Deepak Venkat', '+919876543012', 'deepak.v@gmail.com',
     '{prospect,gadgets}', '{"city":"Pondicherry","interest":"smart watches"}',
     'prospect', true, '2026-04-02 16:45:00+05:30', 'website', NULL),

    -- Leads (new, just subscribed)
    ('c0c00000-0000-4000-c000-000000000013', 9, 'Revathi Murugan', '+919876543013', NULL,
     '{lead}', '{"city":"Dindigul"}',
     'lead', true, '2026-04-08 10:30:00+05:30', 'whatsapp', '2026-04-08 10:30:00+05:30'),

    ('c0c00000-0000-4000-c000-000000000014', 9, 'Senthil Nathan', '+919876543014', 'senthil.n@gmail.com',
     '{lead,electronics}', '{"city":"Karur"}',
     'lead', true, '2026-04-09 08:00:00+05:30', 'csv', NULL),

    ('c0c00000-0000-4000-c000-000000000015', 9, 'Kavitha Raj', '+919876543015', NULL,
     '{lead}', '{"city":"Nagapattinam"}',
     'lead', true, '2026-04-09 12:00:00+05:30', 'website', NULL),

    ('c0c00000-0000-4000-c000-000000000016', 9, 'Balamurugan S', '+919876543016', 'bala.s@gmail.com',
     '{lead,wholesale}', '{"city":"Sivakasi","business":"Bala Traders"}',
     'lead', true, '2026-04-10 09:15:00+05:30', 'manual', NULL),

    ('c0c00000-0000-4000-c000-000000000017', 9, 'Janani Priya', '+919876543017', 'janani.p@gmail.com',
     '{lead,fashion}', '{"city":"Tirupur"}',
     'lead', true, '2026-04-10 14:30:00+05:30', 'website', NULL),

    ('c0c00000-0000-4000-c000-000000000018', 9, 'Gopal Krishnan', '+919876543018', NULL,
     '{lead}', '{"city":"Ramanathapuram"}',
     'lead', true, '2026-04-10 17:00:00+05:30', 'whatsapp', '2026-04-10 17:00:00+05:30'),

    ('c0c00000-0000-4000-c000-000000000019', 9, 'Nithya Sri', '+919876543019', 'nithya.s@gmail.com',
     '{lead,beauty}', '{"city":"Nagercoil"}',
     'lead', true, '2026-04-11 07:30:00+05:30', 'csv', NULL),

    ('c0c00000-0000-4000-c000-000000000020', 9, 'Ravi Chandran', '+919876543020', 'ravi.c@outlook.com',
     '{lead,electronics}', '{"city":"Thoothukudi"}',
     'lead', true, '2026-04-11 08:00:00+05:30', 'api', NULL),

    -- Inactive contacts (churned)
    ('c0c00000-0000-4000-c000-000000000021', 9, 'Suresh Babu', '+919876543021', 'suresh.b@gmail.com',
     '{inactive,churned}', '{"city":"Erode","last_order":"2025-06-15","total_orders":1,"ltv":1200}',
     'inactive', true, '2025-05-10 09:00:00+05:30', 'website', '2025-07-20 14:00:00+05:30'),

    ('c0c00000-0000-4000-c000-000000000022', 9, 'Pooja Ramesh', '+919876543022', 'pooja.r@gmail.com',
     '{inactive}', '{"city":"Ooty","total_orders":2,"ltv":3500}',
     'inactive', false, '2025-06-01 11:00:00+05:30', 'csv', '2025-09-01 10:00:00+05:30'),

    -- More active leads/customers for volume
    ('c0c00000-0000-4000-c000-000000000023', 9, 'Harini Venkatesh', '+919876543023', 'harini.v@gmail.com',
     '{repeat-buyer,beauty,fashion}', '{"city":"Chennai","total_orders":7,"ltv":19500}',
     'customer', true, '2025-09-12 10:00:00+05:30', 'website', '2026-04-11 08:45:00+05:30'),

    ('c0c00000-0000-4000-c000-000000000024', 9, 'Murugan Selvan', '+919876543024', 'murugan.s@gmail.com',
     '{wholesale,bulk-buyer}', '{"city":"Sivakasi","total_orders":15,"ltv":85000,"business":"Selvan Stores"}',
     'customer', true, '2025-07-01 08:00:00+05:30', 'manual', '2026-04-10 13:00:00+05:30'),

    ('c0c00000-0000-4000-c000-000000000025', 9, 'Saranya Mohan', '+919876543025', 'saranya.m@gmail.com',
     '{fashion,sarees,vip}', '{"city":"Kanchipuram","total_orders":10,"ltv":55000}',
     'customer', true, '2025-10-20 12:00:00+05:30', 'website', '2026-04-11 07:00:00+05:30'),

    ('c0c00000-0000-4000-c000-000000000026', 9, 'Dinesh Kumar P', '+919876543026', 'dinesh.kp@gmail.com',
     '{prospect,electronics}', '{"city":"Hosur","interest":"laptops"}',
     'prospect', true, '2026-04-05 09:00:00+05:30', 'website', '2026-04-07 10:30:00+05:30'),

    ('c0c00000-0000-4000-c000-000000000027', 9, 'Gayathri Devi', '+919876543027', 'gayathri.d@gmail.com',
     '{lead,home-decor}', '{"city":"Pudukottai"}',
     'lead', true, '2026-04-11 06:30:00+05:30', 'whatsapp', '2026-04-11 06:30:00+05:30'),

    ('c0c00000-0000-4000-c000-000000000028', 9, 'Prakash Raj', '+919876543028', 'prakash.r@gmail.com',
     '{repeat-buyer,gadgets}', '{"city":"Madurai","total_orders":4,"ltv":28000}',
     'customer', true, '2026-01-05 15:00:00+05:30', 'api', '2026-04-09 16:30:00+05:30'),

    ('c0c00000-0000-4000-c000-000000000029', 9, 'Thenmozhi K', '+919876543029', 'thenmozhi.k@gmail.com',
     '{lead,beauty}', '{"city":"Tirunelveli"}',
     'lead', true, '2026-04-11 10:00:00+05:30', 'website', NULL),

    ('c0c00000-0000-4000-c000-000000000030', 9, 'Ashok Selvan', '+919876543030', 'ashok.s@gmail.com',
     '{prospect,wholesale}', '{"city":"Coimbatore","business":"AS Textiles","interest":"bulk cotton"}',
     'prospect', true, '2026-04-03 11:00:00+05:30', 'manual', '2026-04-06 14:00:00+05:30');


-- ════════════════════════════════════════════════════════════════
-- 4. CAMPAIGNS (with realistic metrics)
-- ════════════════════════════════════════════════════════════════

-- Enhance existing campaigns table with new columns first (already done by migration),
-- then insert campaign records

INSERT INTO public.whatsapp_campaigns (id, company_id, name, status, campaign_type, template_id, segment_tags, variable_map, scheduled_at, started_at, completed_at, total_recipients, sent_count, delivered_count, read_count, failed_count)
VALUES
    -- Completed campaign
    ('d0d00000-0000-4000-d000-000000000001', 9, 'Summer Sale 2026 Blast', 'completed', 'marketing',
     'b0b00000-0000-4000-b000-000000000002',
     '{vip,repeat-buyer,fashion,beauty}', '{"1":"contact.name"}',
     '2026-04-05 10:00:00+05:30', '2026-04-05 10:00:00+05:30', '2026-04-05 10:08:00+05:30',
     18, 18, 16, 12, 0),

    -- Another completed campaign
    ('d0d00000-0000-4000-d000-000000000002', 9, 'Abandoned Cart Recovery — April', 'completed', 'marketing',
     'b0b00000-0000-4000-b000-000000000004',
     '{repeat-buyer}', '{"1":"contact.name","2":"contact.attributes.cart_items","3":"contact.attributes.cart_total"}',
     '2026-04-08 18:00:00+05:30', '2026-04-08 18:00:00+05:30', '2026-04-08 18:03:00+05:30',
     8, 8, 7, 5, 1),

    -- Running campaign
    ('d0d00000-0000-4000-d000-000000000003', 9, 'Welcome New Subscribers', 'running', 'marketing',
     'b0b00000-0000-4000-b000-000000000005',
     '{lead}', '{"1":"contact.name"}',
     NULL, '2026-04-11 08:00:00+05:30', NULL,
     10, 7, 5, 3, 0),

    -- Scheduled campaign
    ('d0d00000-0000-4000-d000-000000000004', 9, 'Flash Friday — April 12', 'scheduled', 'marketing',
     'b0b00000-0000-4000-b000-000000000002',
     '{vip,repeat-buyer}', '{"1":"contact.name"}',
     '2026-04-12 18:00:00+05:30', NULL, NULL,
     0, 0, 0, 0, 0),

    -- Draft campaign
    ('d0d00000-0000-4000-d000-000000000005', 9, 'Diwali Pre-Sale Teaser', 'draft', 'marketing',
     NULL, '{vip,wholesale}', '{}',
     NULL, NULL, NULL,
     0, 0, 0, 0, 0),

    -- Transactional campaign (payment reminders)
    ('d0d00000-0000-4000-d000-000000000006', 9, 'Pending Payment Reminders', 'completed', 'transactional',
     'b0b00000-0000-4000-b000-000000000006',
     '{}', '{"1":"contact.name","2":"contact.attributes.pending_amount","3":"contact.attributes.last_order"}',
     '2026-04-10 09:00:00+05:30', '2026-04-10 09:00:00+05:30', '2026-04-10 09:02:00+05:30',
     5, 5, 5, 4, 0);


-- ════════════════════════════════════════════════════════════════
-- 5. CAMPAIGN MESSAGES (per-recipient delivery tracking)
-- ════════════════════════════════════════════════════════════════

-- Summer Sale campaign messages (campaign 1 — completed)
INSERT INTO public.whatsapp_campaign_messages (id, company_id, campaign_id, contact_id, phone, variables, status, wa_message_id, sent_at, delivered_at, read_at)
VALUES
    ('e0e00000-0000-4000-e000-000000000001', 9, 'd0d00000-0000-4000-d000-000000000001', 'c0c00000-0000-4000-c000-000000000001', '+919876543001', '{"1":"Priya"}', 'read',    'wamid.HBg001', '2026-04-05 10:00:10+05:30', '2026-04-05 10:00:15+05:30', '2026-04-05 10:02:00+05:30'),
    ('e0e00000-0000-4000-e000-000000000002', 9, 'd0d00000-0000-4000-d000-000000000001', 'c0c00000-0000-4000-c000-000000000002', '+919876543002', '{"1":"Rahul"}', 'read',    'wamid.HBg002', '2026-04-05 10:00:12+05:30', '2026-04-05 10:00:18+05:30', '2026-04-05 10:05:00+05:30'),
    ('e0e00000-0000-4000-e000-000000000003', 9, 'd0d00000-0000-4000-d000-000000000001', 'c0c00000-0000-4000-c000-000000000003', '+919876543003', '{"1":"Meena"}', 'read',    'wamid.HBg003', '2026-04-05 10:00:14+05:30', '2026-04-05 10:00:20+05:30', '2026-04-05 10:15:00+05:30'),
    ('e0e00000-0000-4000-e000-000000000004', 9, 'd0d00000-0000-4000-d000-000000000001', 'c0c00000-0000-4000-c000-000000000004', '+919876543004', '{"1":"Arun"}',  'delivered','wamid.HBg004', '2026-04-05 10:00:16+05:30', '2026-04-05 10:00:22+05:30', NULL),
    ('e0e00000-0000-4000-e000-000000000005', 9, 'd0d00000-0000-4000-d000-000000000001', 'c0c00000-0000-4000-c000-000000000005', '+919876543005', '{"1":"Divya"}', 'read',    'wamid.HBg005', '2026-04-05 10:00:18+05:30', '2026-04-05 10:00:25+05:30', '2026-04-05 11:00:00+05:30'),
    ('e0e00000-0000-4000-e000-000000000006', 9, 'd0d00000-0000-4000-d000-000000000001', 'c0c00000-0000-4000-c000-000000000007', '+919876543007', '{"1":"Sangeetha"}', 'read', 'wamid.HBg006', '2026-04-05 10:00:20+05:30', '2026-04-05 10:00:28+05:30', '2026-04-05 10:30:00+05:30'),

    -- Welcome campaign messages (campaign 3 — running, partial sends)
    ('e0e00000-0000-4000-e000-000000000010', 9, 'd0d00000-0000-4000-d000-000000000003', 'c0c00000-0000-4000-c000-000000000013', '+919876543013', '{"1":"Revathi"}',   'read',      'wamid.HBg010', '2026-04-11 08:00:05+05:30', '2026-04-11 08:00:10+05:30', '2026-04-11 08:05:00+05:30'),
    ('e0e00000-0000-4000-e000-000000000011', 9, 'd0d00000-0000-4000-d000-000000000003', 'c0c00000-0000-4000-c000-000000000014', '+919876543014', '{"1":"Senthil"}',   'delivered',  'wamid.HBg011', '2026-04-11 08:00:07+05:30', '2026-04-11 08:00:12+05:30', NULL),
    ('e0e00000-0000-4000-e000-000000000012', 9, 'd0d00000-0000-4000-d000-000000000003', 'c0c00000-0000-4000-c000-000000000015', '+919876543015', '{"1":"Kavitha"}',   'read',      'wamid.HBg012', '2026-04-11 08:00:09+05:30', '2026-04-11 08:00:15+05:30', '2026-04-11 08:10:00+05:30'),
    ('e0e00000-0000-4000-e000-000000000013', 9, 'd0d00000-0000-4000-d000-000000000003', 'c0c00000-0000-4000-c000-000000000016', '+919876543016', '{"1":"Balamurugan"}','sent',      'wamid.HBg013', '2026-04-11 08:00:11+05:30', NULL, NULL),
    ('e0e00000-0000-4000-e000-000000000014', 9, 'd0d00000-0000-4000-d000-000000000003', 'c0c00000-0000-4000-c000-000000000017', '+919876543017', '{"1":"Janani"}',    'delivered',  'wamid.HBg014', '2026-04-11 08:00:13+05:30', '2026-04-11 08:00:20+05:30', NULL),
    ('e0e00000-0000-4000-e000-000000000015', 9, 'd0d00000-0000-4000-d000-000000000003', 'c0c00000-0000-4000-c000-000000000018', '+919876543018', '{"1":"Gopal"}',     'sent',      'wamid.HBg015', '2026-04-11 08:00:15+05:30', NULL, NULL),
    ('e0e00000-0000-4000-e000-000000000016', 9, 'd0d00000-0000-4000-d000-000000000003', 'c0c00000-0000-4000-c000-000000000019', '+919876543019', '{"1":"Nithya"}',    'read',      'wamid.HBg016', '2026-04-11 08:00:17+05:30', '2026-04-11 08:00:24+05:30', '2026-04-11 08:20:00+05:30'),
    ('e0e00000-0000-4000-e000-000000000017', 9, 'd0d00000-0000-4000-d000-000000000003', 'c0c00000-0000-4000-c000-000000000020', '+919876543020', '{"1":"Ravi"}',      'queued',    NULL, NULL, NULL, NULL),
    ('e0e00000-0000-4000-e000-000000000018', 9, 'd0d00000-0000-4000-d000-000000000003', 'c0c00000-0000-4000-c000-000000000027', '+919876543027', '{"1":"Gayathri"}',  'queued',    NULL, NULL, NULL, NULL),
    ('e0e00000-0000-4000-e000-000000000019', 9, 'd0d00000-0000-4000-d000-000000000003', 'c0c00000-0000-4000-c000-000000000029', '+919876543029', '{"1":"Thenmozhi"}', 'queued',    NULL, NULL, NULL, NULL);


-- ════════════════════════════════════════════════════════════════
-- 6. BOT RULES (complete automation flow)
-- ════════════════════════════════════════════════════════════════

INSERT INTO public.whatsapp_bot_rules (id, company_id, name, rule_type, priority, is_active, trigger_keywords, trigger_pattern, response_type, response_body, response_template_id, response_buttons, transfer_to)
VALUES
    -- Welcome message (lowest priority number = fires first for new chats)
    ('20200000-0000-4000-b000-000000000001', 9, 'Welcome Greeting', 'welcome', 1, true,
     '{}', NULL,
     'interactive',
     'Welcome to Sparkle! 🌟 How can we help you today?',
     NULL,
     '[{"id":"menu_shop","title":"🛍️ Shop Now"},{"id":"menu_track","title":"📦 Track Order"},{"id":"menu_support","title":"💬 Talk to Agent"}]',
     NULL),

    -- Price enquiry
    ('20200000-0000-4000-b000-000000000002', 9, 'Pricing Enquiry', 'keyword', 10, true,
     '{price,pricing,cost,rate,how much,kitna,rate card,price list}', NULL,
     'text',
     'Our pricing varies by product! 💰\n\nHere are some quick links:\n🛍️ Fashion: sparkle.shop/fashion\n📱 Electronics: sparkle.shop/electronics\n🏠 Home Decor: sparkle.shop/home\n\nOr type the product name and I''ll look it up for you!',
     NULL, '[]', NULL),

    -- Order tracking
    ('20200000-0000-4000-b000-000000000003', 9, 'Order Tracking', 'keyword', 15, true,
     '{track,tracking,where is my order,order status,delivery status,shipped,dispatch}', NULL,
     'interactive',
     'I can help you track your order! 📦\n\nPlease share your order number (starts with ORD-) or choose an option:',
     NULL,
     '[{"id":"track_recent","title":"My Recent Order"},{"id":"track_manual","title":"Enter Order #"}]',
     NULL),

    -- Order number pattern match
    ('20200000-0000-4000-b000-000000000004', 9, 'Order Number Detected', 'regex', 20, true,
     '{}', 'ORD-\\d{8,}',
     'text',
     'I found your order! 📋\n\nLet me check the status... Your order is being processed. You''ll receive a shipping update via WhatsApp once dispatched.\n\nFor real-time tracking, visit: sparkle.shop/track',
     NULL, '[]', NULL),

    -- Return/refund
    ('20200000-0000-4000-b000-000000000005', 9, 'Return & Refund', 'keyword', 25, true,
     '{return,refund,exchange,replace,damaged,broken,wrong item,cancel order}', NULL,
     'interactive',
     'We''re sorry to hear that! 😔 We''ll make it right.\n\nWhat would you like to do?',
     NULL,
     '[{"id":"return_initiate","title":"Start Return"},{"id":"return_agent","title":"Talk to Agent"}]',
     NULL),

    -- Menu option handler: Shop Now
    ('20200000-0000-4000-b000-000000000006', 9, 'Menu: Shop Now', 'menu', 30, true,
     '{menu_shop,shop,1,shop now}', NULL,
     'text',
     'Great choice! 🛍️ Browse our latest collection:\n\n✨ New Arrivals: sparkle.shop/new\n🔥 Trending: sparkle.shop/trending\n💸 Sale: sparkle.shop/sale\n\nHappy shopping!',
     NULL, '[]', NULL),

    -- Menu option handler: Talk to Agent
    ('20200000-0000-4000-b000-000000000007', 9, 'Menu: Talk to Agent', 'menu', 35, true,
     '{menu_support,agent,human,talk to agent,support,help,3,talk to someone}', NULL,
     'transfer',
     'Connecting you to a Sparkle support agent now... 🙋 Please hold, someone will be with you shortly!',
     NULL, '[]', NULL),

    -- Payment enquiry
    ('20200000-0000-4000-b000-000000000008', 9, 'Payment Help', 'keyword', 40, true,
     '{payment,pay,upi,card,cod,cash on delivery,emi,payment failed,payment issue}', NULL,
     'text',
     'We accept multiple payment methods! 💳\n\n✅ UPI (GPay, PhonePe, Paytm)\n✅ Credit/Debit Cards\n✅ Net Banking\n✅ Cash on Delivery (COD)\n✅ EMI (on orders above ₹3,000)\n\nHaving payment issues? Type "agent" to connect with support.',
     NULL, '[]', NULL),

    -- Thank you / positive feedback
    ('20200000-0000-4000-b000-000000000009', 9, 'Positive Response', 'keyword', 50, true,
     '{thank,thanks,great,awesome,perfect,super,nice,good,love it,happy}', NULL,
     'text',
     'Thank you so much! 😊🌟 We''re glad we could help!\n\nIf you need anything else, just message us. Have a wonderful day!',
     NULL, '[]', NULL),

    -- Fallback (no match)
    ('20200000-0000-4000-b000-000000000010', 9, 'Fallback — No Match', 'fallback', 999, true,
     '{}', NULL,
     'interactive',
     'I''m not sure I understood that. 🤔 Let me help you with the right option:',
     NULL,
     '[{"id":"menu_shop","title":"🛍️ Shop Now"},{"id":"menu_track","title":"📦 Track Order"},{"id":"menu_support","title":"💬 Talk to Agent"}]',
     NULL);


-- ════════════════════════════════════════════════════════════════
-- 7. CONVERSATIONS (various states)
-- ════════════════════════════════════════════════════════════════

INSERT INTO public.whatsapp_conversations (id, company_id, contact_id, account_id, assigned_to, status, session_expires_at, last_message_at, last_message_preview, unread_count, tags)
VALUES
    -- Active agent conversation (Priya asking about her order)
    ('f0f00000-0000-4000-f000-000000000001', 9, 'c0c00000-0000-4000-c000-000000000001', 'a0a00000-0000-4000-a000-000000000001',
     NULL, 'open',
     '2026-04-12 09:15:00+05:30', '2026-04-11 09:15:00+05:30',
     'Can you check why my order is delayed?', 2, '{support,order-issue}'),

    -- Waiting for agent (Rahul wants wholesale pricing)
    ('f0f00000-0000-4000-f000-000000000002', 9, 'c0c00000-0000-4000-c000-000000000002', 'a0a00000-0000-4000-a000-000000000001',
     NULL, 'waiting',
     '2026-04-11 16:45:00+05:30', '2026-04-10 16:45:00+05:30',
     'I need bulk pricing for 500 units', 1, '{wholesale,pricing}'),

    -- Bot handling (Meena browsing products)
    ('f0f00000-0000-4000-f000-000000000003', 9, 'c0c00000-0000-4000-c000-000000000003', 'a0a00000-0000-4000-a000-000000000001',
     NULL, 'bot',
     '2026-04-12 11:20:00+05:30', '2026-04-11 11:20:00+05:30',
     'Do you have silk sarees under 5000?', 0, '{product-enquiry}'),

    -- Resolved conversation
    ('f0f00000-0000-4000-f000-000000000004', 9, 'c0c00000-0000-4000-c000-000000000004', 'a0a00000-0000-4000-a000-000000000001',
     NULL, 'resolved',
     '2026-04-10 14:30:00+05:30', '2026-04-09 14:30:00+05:30',
     'Thanks, I received my order!', 0, '{order-delivered}'),

    -- Bot handling (new lead Revathi)
    ('f0f00000-0000-4000-f000-000000000005', 9, 'c0c00000-0000-4000-c000-000000000013', 'a0a00000-0000-4000-a000-000000000001',
     NULL, 'bot',
     '2026-04-09 10:30:00+05:30', '2026-04-08 10:30:00+05:30',
     'Hi, I saw your ad on Instagram', 0, '{lead,instagram}'),

    -- Active support (Karthik return request)
    ('f0f00000-0000-4000-f000-000000000006', 9, 'c0c00000-0000-4000-c000-000000000006', 'a0a00000-0000-4000-a000-000000000001',
     NULL, 'open',
     '2026-04-08 18:00:00+05:30', '2026-04-07 18:00:00+05:30',
     'The charger I received is not working', 3, '{return,defective}'),

    -- Waiting (Anitha wants styling advice)
    ('f0f00000-0000-4000-f000-000000000007', 9, 'c0c00000-0000-4000-c000-000000000009', 'a0a00000-0000-4000-a000-000000000001',
     NULL, 'waiting',
     '2026-04-11 10:00:00+05:30', '2026-04-10 10:00:00+05:30',
     'Can someone help me pick a saree for a wedding?', 1, '{fashion,personal-shopping}'),

    -- Expired session
    ('f0f00000-0000-4000-f000-000000000008', 9, 'c0c00000-0000-4000-c000-000000000021', 'a0a00000-0000-4000-a000-000000000001',
     NULL, 'expired',
     '2025-07-21 14:00:00+05:30', '2025-07-20 14:00:00+05:30',
     'ok thanks', 0, '{}'),

    -- Bot handling (Gayathri, today)
    ('f0f00000-0000-4000-f000-000000000009', 9, 'c0c00000-0000-4000-c000-000000000027', 'a0a00000-0000-4000-a000-000000000001',
     NULL, 'bot',
     '2026-04-12 06:30:00+05:30', '2026-04-11 06:30:00+05:30',
     'Hi', 1, '{new}'),

    -- Resolved (Saranya thanked)
    ('f0f00000-0000-4000-f000-000000000010', 9, 'c0c00000-0000-4000-c000-000000000025', 'a0a00000-0000-4000-a000-000000000001',
     NULL, 'resolved',
     '2026-04-11 07:00:00+05:30', '2026-04-11 07:00:00+05:30',
     'Perfect, love the saree! Thanks!', 0, '{happy-customer}');


-- ════════════════════════════════════════════════════════════════
-- 8. MESSAGES (chat history for key conversations)
-- ════════════════════════════════════════════════════════════════

-- Conversation 1: Priya asking about delayed order
INSERT INTO public.whatsapp_messages (id, company_id, conversation_id, contact_id, wa_message_id, direction, message_type, body, status, sent_at, delivered_at, read_at, created_at)
VALUES
    ('10100000-0000-4000-a000-000000000001', 9, 'f0f00000-0000-4000-f000-000000000001', 'c0c00000-0000-4000-c000-000000000001', 'wamid.in001', 'inbound', 'text',
     'Hi, I placed an order 3 days ago but haven''t received any shipping update yet.',
     'delivered', NULL, '2026-04-11 09:00:00+05:30', NULL, '2026-04-11 09:00:00+05:30'),
    ('10100000-0000-4000-a000-000000000002', 9, 'f0f00000-0000-4000-f000-000000000001', 'c0c00000-0000-4000-c000-000000000001', 'wamid.out001', 'outbound', 'text',
     'Welcome to Sparkle! 🌟 How can we help you today?',
     'read', '2026-04-11 09:00:05+05:30', '2026-04-11 09:00:08+05:30', '2026-04-11 09:00:10+05:30', '2026-04-11 09:00:05+05:30'),
    ('10100000-0000-4000-a000-000000000003', 9, 'f0f00000-0000-4000-f000-000000000001', 'c0c00000-0000-4000-c000-000000000001', 'wamid.in002', 'inbound', 'text',
     'My order number is ORD-20260408. It still shows "processing".',
     'delivered', NULL, '2026-04-11 09:02:00+05:30', NULL, '2026-04-11 09:02:00+05:30'),
    ('10100000-0000-4000-a000-000000000004', 9, 'f0f00000-0000-4000-f000-000000000001', 'c0c00000-0000-4000-c000-000000000001', 'wamid.out002', 'outbound', 'text',
     'I found your order! 📋\n\nLet me check the status... Your order is being processed. You''ll receive a shipping update via WhatsApp once dispatched.\n\nFor real-time tracking, visit: sparkle.shop/track',
     'read', '2026-04-11 09:02:05+05:30', '2026-04-11 09:02:10+05:30', '2026-04-11 09:02:30+05:30', '2026-04-11 09:02:05+05:30'),
    ('10100000-0000-4000-a000-000000000005', 9, 'f0f00000-0000-4000-f000-000000000001', 'c0c00000-0000-4000-c000-000000000001', 'wamid.in003', 'inbound', 'text',
     'It''s been 3 days. Can you check why my order is delayed?',
     'delivered', NULL, '2026-04-11 09:10:00+05:30', NULL, '2026-04-11 09:10:00+05:30'),
    ('10100000-0000-4000-a000-000000000006', 9, 'f0f00000-0000-4000-f000-000000000001', 'c0c00000-0000-4000-c000-000000000001', 'wamid.out003', 'outbound', 'text',
     'Connecting you to a Sparkle support agent now... 🙋 Please hold, someone will be with you shortly!',
     'read', '2026-04-11 09:10:05+05:30', '2026-04-11 09:10:10+05:30', '2026-04-11 09:10:15+05:30', '2026-04-11 09:10:05+05:30'),
    ('10100000-0000-4000-a000-000000000007', 9, 'f0f00000-0000-4000-f000-000000000001', 'c0c00000-0000-4000-c000-000000000001', 'wamid.in004', 'inbound', 'text',
     'Ok, waiting...',
     'delivered', NULL, '2026-04-11 09:15:00+05:30', NULL, '2026-04-11 09:15:00+05:30'),

-- Conversation 3: Meena asking about silk sarees (bot handling)
    ('10100000-0000-4000-a000-000000000008', 9, 'f0f00000-0000-4000-f000-000000000003', 'c0c00000-0000-4000-c000-000000000003', 'wamid.in010', 'inbound', 'text',
     'Hi, do you have silk sarees?',
     'delivered', NULL, '2026-04-11 11:00:00+05:30', NULL, '2026-04-11 11:00:00+05:30'),
    ('10100000-0000-4000-a000-000000000009', 9, 'f0f00000-0000-4000-f000-000000000003', 'c0c00000-0000-4000-c000-000000000003', 'wamid.out010', 'outbound', 'interactive',
     'Welcome to Sparkle! 🌟 How can we help you today?',
     'read', '2026-04-11 11:00:05+05:30', '2026-04-11 11:00:10+05:30', '2026-04-11 11:00:20+05:30', '2026-04-11 11:00:05+05:30'),
    ('10100000-0000-4000-a000-000000000010', 9, 'f0f00000-0000-4000-f000-000000000003', 'c0c00000-0000-4000-c000-000000000003', 'wamid.in011', 'inbound', 'text',
     'I want to see your silk saree collection. What''s the price range?',
     'delivered', NULL, '2026-04-11 11:05:00+05:30', NULL, '2026-04-11 11:05:00+05:30'),
    ('10100000-0000-4000-a000-000000000011', 9, 'f0f00000-0000-4000-f000-000000000003', 'c0c00000-0000-4000-c000-000000000003', 'wamid.out011', 'outbound', 'text',
     'Our pricing varies by product! 💰\n\nHere are some quick links:\n🛍️ Fashion: sparkle.shop/fashion\n📱 Electronics: sparkle.shop/electronics\n🏠 Home Decor: sparkle.shop/home\n\nOr type the product name and I''ll look it up for you!',
     'read', '2026-04-11 11:05:05+05:30', '2026-04-11 11:05:10+05:30', '2026-04-11 11:06:00+05:30', '2026-04-11 11:05:05+05:30'),
    ('10100000-0000-4000-a000-000000000012', 9, 'f0f00000-0000-4000-f000-000000000003', 'c0c00000-0000-4000-c000-000000000003', 'wamid.in012', 'inbound', 'text',
     'Do you have silk sarees under 5000?',
     'delivered', NULL, '2026-04-11 11:20:00+05:30', NULL, '2026-04-11 11:20:00+05:30'),

-- Conversation 9: Gayathri (brand new lead, just said hi)
    ('10100000-0000-4000-a000-000000000013', 9, 'f0f00000-0000-4000-f000-000000000009', 'c0c00000-0000-4000-c000-000000000027', 'wamid.in020', 'inbound', 'text',
     'Hi',
     'delivered', NULL, '2026-04-11 06:30:00+05:30', NULL, '2026-04-11 06:30:00+05:30'),
    ('10100000-0000-4000-a000-000000000014', 9, 'f0f00000-0000-4000-f000-000000000009', 'c0c00000-0000-4000-c000-000000000027', 'wamid.out020', 'outbound', 'interactive',
     'Welcome to Sparkle! 🌟 How can we help you today?',
     'delivered', '2026-04-11 06:30:05+05:30', '2026-04-11 06:30:10+05:30', NULL, '2026-04-11 06:30:05+05:30'),

-- Conversation 6: Karthik return request
    ('10100000-0000-4000-a000-000000000015', 9, 'f0f00000-0000-4000-f000-000000000006', 'c0c00000-0000-4000-c000-000000000006', 'wamid.in030', 'inbound', 'text',
     'I received a defective charger. The charger I received is not working at all.',
     'delivered', NULL, '2026-04-07 17:30:00+05:30', NULL, '2026-04-07 17:30:00+05:30'),
    ('10100000-0000-4000-a000-000000000016', 9, 'f0f00000-0000-4000-f000-000000000006', 'c0c00000-0000-4000-c000-000000000006', 'wamid.out030', 'outbound', 'interactive',
     'We''re sorry to hear that! 😔 We''ll make it right.\n\nWhat would you like to do?',
     'read', '2026-04-07 17:30:05+05:30', '2026-04-07 17:30:10+05:30', '2026-04-07 17:31:00+05:30', '2026-04-07 17:30:05+05:30'),
    ('10100000-0000-4000-a000-000000000017', 9, 'f0f00000-0000-4000-f000-000000000006', 'c0c00000-0000-4000-c000-000000000006', 'wamid.in031', 'inbound', 'interactive',
     'Talk to Agent',
     'delivered', NULL, '2026-04-07 17:32:00+05:30', NULL, '2026-04-07 17:32:00+05:30'),
    ('10100000-0000-4000-a000-000000000018', 9, 'f0f00000-0000-4000-f000-000000000006', 'c0c00000-0000-4000-c000-000000000006', 'wamid.out031', 'outbound', 'text',
     'Connecting you to a Sparkle support agent now... 🙋 Please hold, someone will be with you shortly!',
     'read', '2026-04-07 17:32:05+05:30', '2026-04-07 17:32:10+05:30', '2026-04-07 17:32:30+05:30', '2026-04-07 17:32:05+05:30'),
    ('10100000-0000-4000-a000-000000000019', 9, 'f0f00000-0000-4000-f000-000000000006', 'c0c00000-0000-4000-c000-000000000006', 'wamid.in032', 'inbound', 'text',
     'The charger I received is not working. Order was ORD-20260403. Please help.',
     'delivered', NULL, '2026-04-07 18:00:00+05:30', NULL, '2026-04-07 18:00:00+05:30');


-- ════════════════════════════════════════════════════════════════
-- 9. WHATSAPP LOGS (audit trail)
-- ════════════════════════════════════════════════════════════════

INSERT INTO public.whatsapp_logs (id, company_id, phone, contact, direction, message, status, event_type, wa_message_id)
VALUES
    ('30300000-0000-4000-c000-000000000001', 9, '+919876543001', 'Priya Sharma', 'inbound', 'Hi, I placed an order 3 days ago...', 'received', 'message', 'wamid.in001'),
    ('30300000-0000-4000-c000-000000000002', 9, '+919876543001', 'Priya Sharma', 'outbound', 'Welcome to Sparkle! 🌟 How can we help you today?', 'sent', 'message', 'wamid.out001'),
    ('30300000-0000-4000-c000-000000000003', 9, '+919876543001', 'Priya Sharma', 'status', 'Message wamid.out001 → read', 'read', 'status', 'wamid.out001'),
    ('30300000-0000-4000-c000-000000000004', 9, '+919876543003', 'Meena Devi', 'inbound', 'Hi, do you have silk sarees?', 'received', 'message', 'wamid.in010'),
    ('30300000-0000-4000-c000-000000000005', 9, '+919876543003', 'Meena Devi', 'outbound', 'Welcome to Sparkle! 🌟 How can we help...', 'sent', 'message', 'wamid.out010'),
    ('30300000-0000-4000-c000-000000000006', 9, '+919876543006', 'Karthik Rajan', 'inbound', 'I received a defective charger...', 'received', 'message', 'wamid.in030'),
    ('30300000-0000-4000-c000-000000000007', 9, '+919876543006', 'Karthik Rajan', 'outbound', 'We''re sorry to hear that! 😔...', 'sent', 'message', 'wamid.out030'),
    ('30300000-0000-4000-c000-000000000008', 9, '+919876543027', 'Gayathri Devi', 'inbound', 'Hi', 'received', 'message', 'wamid.in020'),
    ('30300000-0000-4000-c000-000000000009', 9, '+919876543027', 'Gayathri Devi', 'outbound', 'Welcome to Sparkle! 🌟...', 'sent', 'message', 'wamid.out020'),
    ('30300000-0000-4000-c000-000000000010', 9, NULL, 'System', 'status', 'Campaign "Summer Sale 2026 Blast" completed — 18 sent, 16 delivered, 12 read', 'completed', 'campaign', NULL),
    ('30300000-0000-4000-c000-000000000011', 9, NULL, 'System', 'status', 'Campaign "Welcome New Subscribers" started — 10 recipients queued', 'running', 'campaign', NULL),
    ('30300000-0000-4000-c000-000000000012', 9, '+919876543002', 'Rahul Krishnan', 'inbound', 'I need bulk pricing for 500 units', 'received', 'message', 'wamid.in040'),
    ('30300000-0000-4000-c000-000000000013', 9, '+919876543009', 'Anitha Sundaram', 'inbound', 'Can someone help me pick a saree for a wedding?', 'received', 'message', 'wamid.in050'),
    ('30300000-0000-4000-c000-000000000014', 9, NULL, 'System', 'status', 'Bot rule "Welcome Greeting" triggered 15 times today', 'info', 'bot', NULL),
    ('30300000-0000-4000-c000-000000000015', 9, NULL, 'System', 'status', 'Template "order_confirmation" synced — status: approved', 'approved', 'template_sync', 'h_109384756001');


COMMIT;

-- ════════════════════════════════════════════════════════════════
-- SUMMARY: Seed Data for Sparkle (company_id = 9)
-- ════════════════════════════════════════════════════════════════
--   whatsapp_accounts ........... 2 (1 verified, 1 pending)
--   whatsapp_templates .......... 8 (6 approved, 1 pending, 1 rejected)
--   whatsapp_contacts ........... 30 (12 customers, 6 prospects, 10 leads, 2 inactive)
--   whatsapp_campaigns .......... 6 (2 completed, 1 running, 1 scheduled, 1 draft, 1 transactional)
--   whatsapp_campaign_messages .. 16 (mixed statuses: read, delivered, sent, queued)
--   whatsapp_bot_rules .......... 10 (welcome, keywords, menu, regex, fallback)
--   whatsapp_conversations ...... 10 (2 open, 2 waiting, 3 bot, 2 resolved, 1 expired)
--   whatsapp_messages ........... 19 (multi-turn chats with bot + escalation)
--   whatsapp_logs ............... 15 (messages, status updates, campaign events)
-- ════════════════════════════════════════════════════════════════
