-- ═══════════════════════════════════════════════════════════════
--  DATA MIGRATION: Thandatti PostgreSQL → Smartseyali SaaS Supabase
-- ═══════════════════════════════════════════════════════════════
--
--  SOURCE: Thandatti backend PostgreSQL (pattikadai DB)
--  TARGET: Smartseyali SaaS Supabase
--
--  PREREQUISITES:
--    1. Run ecom_storefront_columns.sql first (adds missing columns)
--    2. Set @company_id variable to your SaaS company ID
--    3. Connect to thandatti DB via dblink or export CSVs
--
--  APPROACH:
--    This file uses INSERT...SELECT with explicit column mapping.
--    If source DB is separate, export each SELECT as CSV then
--    import into Supabase via CSV upload or psql \copy.
--
-- ═══════════════════════════════════════════════════════════════

-- ┌─────────────────────────────────────────────────────────────┐
-- │  SET YOUR COMPANY ID HERE                                   │
-- └─────────────────────────────────────────────────────────────┘
-- Replace with your actual company_id from the SaaS companies table
\set company_id 1


-- ═══════════════════════════════════════════════════════════════
--  FIELD MAPPING REFERENCE (Thandatti → SaaS)
-- ═══════════════════════════════════════════════════════════════
--
--  ┌────────────────────────────────────────────────────────────┐
--  │ PRODUCTS: thandatti.products → saas.master_items           │
--  ├──────────────────────┬─────────────────────────────────────┤
--  │ Thandatti Column     │ SaaS Column                        │
--  ├──────────────────────┼─────────────────────────────────────┤
--  │ id                   │ id                                  │
--  │ title                │ item_name                           │
--  │ sku                  │ item_code                           │
--  │ description          │ description                         │
--  │ detailed_description │ long_description                    │
--  │ new_price            │ selling_price                       │
--  │ old_price            │ mrp                                 │
--  │ category_id          │ category_id (re-mapped UUID)        │
--  │ brand_id             │ brand_id (re-mapped UUID)           │
--  │ primary_image        │ image_url                           │
--  │ stock_quantity        │ current_stock                       │
--  │ weight               │ weight_kg (parse numeric)           │
--  │ status='In Stock'    │ status='Active'                     │
--  │ rating               │ (not migrated — computed)           │
--  │ is_special           │ featured                            │
--  │ is_combo             │ tags (append 'combo')               │
--  │ sale_tag             │ (not migrated — UI only)            │
--  │ sequence             │ (not migrated)                      │
--  │ —                    │ company_id = @company_id            │
--  │ —                    │ item_type = 'Goods'                 │
--  │ —                    │ is_live = true                      │
--  │ —                    │ is_ecommerce = true                 │
--  │ —                    │ is_published = true                 │
--  │ created_at           │ created_at                          │
--  │ updated_at           │ updated_at                          │
--  └──────────────────────┴─────────────────────────────────────┘
--
--  ┌────────────────────────────────────────────────────────────┐
--  │ CATEGORIES: thandatti.categories → saas.master_categories  │
--  ├──────────────────────┬─────────────────────────────────────┤
--  │ id                   │ id                                  │
--  │ name                 │ name                                │
--  │ slug                 │ url_key                             │
--  │ description          │ description                         │
--  │ image                │ image_url                           │
--  │ parent_id            │ parent_id                           │
--  │ sequence             │ sort_order                          │
--  │ —                    │ company_id = @company_id            │
--  │ —                    │ type = 'Product'                    │
--  │ —                    │ is_active = true                    │
--  │ —                    │ visibility = 'Public'               │
--  └──────────────────────┴─────────────────────────────────────┘
--
--  ┌────────────────────────────────────────────────────────────┐
--  │ PRODUCT ATTRIBUTES → saas.master_product_variants          │
--  ├──────────────────────┬─────────────────────────────────────┤
--  │ id                   │ id                                  │
--  │ product_id           │ item_id                             │
--  │ attribute_value      │ name (e.g. "500g", "1kg")           │
--  │ price - product.new  │ price_adjustment                    │
--  │ sku_suffix           │ sku                                 │
--  │ stock_quantity        │ stock_qty                           │
--  │ is_default           │ (first variant)                     │
--  │ —                    │ company_id = @company_id            │
--  │ —                    │ is_active = true                    │
--  └──────────────────────┴─────────────────────────────────────┘
--
--  ┌────────────────────────────────────────────────────────────┐
--  │ ORDERS: thandatti.orders → saas.ecom_orders                │
--  ├──────────────────────┬─────────────────────────────────────┤
--  │ id                   │ id                                  │
--  │ order_number         │ order_number                        │
--  │ user_id              │ (lookup by email → auth.users)      │
--  │ subtotal             │ subtotal                            │
--  │ discount_amount      │ discount_amount                     │
--  │ delivery_charge      │ shipping_amount                     │
--  │ total_price          │ grand_total                         │
--  │ coupon_code          │ coupon_code                         │
--  │ payment_method       │ payment_method                      │
--  │ payment_status       │ payment_status                      │
--  │ status               │ status                              │
--  │ email                │ customer_email                      │
--  │ vat                  │ tax_amount                          │
--  │ address → join       │ shipping_address (JSONB)            │
--  │ address → join       │ customer_name, customer_phone       │
--  │ payment_transaction  │ payment_id                          │
--  │ —                    │ company_id = @company_id            │
--  └──────────────────────┴─────────────────────────────────────┘
--
--  ┌────────────────────────────────────────────────────────────┐
--  │ ORDER_ITEMS: thandatti.order_items → saas.ecom_order_items │
--  ├──────────────────────┬─────────────────────────────────────┤
--  │ id                   │ id                                  │
--  │ order_id             │ order_id                            │
--  │ product_id           │ product_id                          │
--  │ quantity             │ quantity                            │
--  │ unit_price           │ unit_price                          │
--  │ total_price          │ amount                              │
--  │ product → join title │ product_name                        │
--  │ —                    │ company_id = @company_id            │
--  └──────────────────────┴─────────────────────────────────────┘
--
--  ┌────────────────────────────────────────────────────────────┐
--  │ REVIEWS: thandatti.product_reviews → ecom_product_reviews  │
--  ├──────────────────────┬─────────────────────────────────────┤
--  │ id                   │ id                                  │
--  │ product_id           │ product_id                          │
--  │ user_id → email      │ customer_email                      │
--  │ user_id → name       │ customer_name                       │
--  │ rating               │ rating                              │
--  │ comment              │ review                              │
--  │ is_approved          │ is_published                        │
--  │ —                    │ company_id = @company_id            │
--  │ —                    │ status = approved/pending            │
--  └──────────────────────┴─────────────────────────────────────┘
--
--  ┌────────────────────────────────────────────────────────────┐
--  │ COUPONS: thandatti.coupons → saas.ecom_coupons             │
--  ├──────────────────────┬─────────────────────────────────────┤
--  │ id (UUID)            │ id (BIGINT auto)                    │
--  │ code                 │ code                                │
--  │ discount_type        │ discount_type                       │
--  │ discount_value       │ discount_value                      │
--  │ min_purchase_amount  │ min_order_amount                    │
--  │ max_discount_amount  │ max_discount_amount                 │
--  │ usage_limit          │ usage_limit                         │
--  │ used_count           │ used_count                          │
--  │ valid_from           │ valid_from                          │
--  │ valid_until          │ valid_to                            │
--  │ is_active            │ is_active                           │
--  │ —                    │ company_id = @company_id            │
--  └──────────────────────┴─────────────────────────────────────┘
--
--  ┌────────────────────────────────────────────────────────────┐
--  │ BANNERS: thandatti.banners → saas.ecom_banners             │
--  ├──────────────────────┬─────────────────────────────────────┤
--  │ id                   │ id                                  │
--  │ title                │ title                               │
--  │ subtitle             │ subtitle                            │
--  │ image_url            │ image_url                           │
--  │ link                 │ button_link                         │
--  │ type ('main','section') │ position ('hero','offer')        │
--  │ sequence             │ display_order                       │
--  │ is_active            │ is_active                           │
--  │ —                    │ company_id = @company_id            │
--  └──────────────────────┴─────────────────────────────────────┘
--
--  TABLES NOT MIGRATED (handled differently in SaaS):
--    - users → Supabase auth.users (separate signup flow)
--    - cart_items → localStorage in storefront
--    - wishlist_items → localStorage in storefront
--    - compare_items → localStorage in storefront
--    - addresses → stored as JSONB in ecom_orders.shipping_address
--    - countries/states/cities → config.js delivery zones
--    - delivery_charges/tariffs → config.js or shipping_zones table
--    - coupon_usage → tracked via ecom_coupons.used_count
--    - visitor_attribution/conversions → not migrated (analytics)
--    - product_images → only primary_image migrated as image_url
--    - product_tags → migrated into master_items.tags array
--    - blogs → ecom_blog (separate migration if needed)
--    - testimonials → not migrated (admin creates fresh)


-- ═══════════════════════════════════════════════════════════════
--  MIGRATION QUERIES
--  Export these as CSVs from thandatti DB, then import to Supabase
-- ═══════════════════════════════════════════════════════════════


-- ─── 1. CATEGORIES ──────────────────────────────────────────
-- Run on THANDATTI DB → export as CSV → import to Supabase master_categories

SELECT
  id,
  :company_id AS company_id,
  name,
  'Product' AS type,
  description,
  image AS image_url,
  parent_id,
  true AS is_active,
  COALESCE(sequence, 0) AS sort_order,
  slug AS url_key,
  'Public' AS visibility,
  NULL AS ecom_mapping,
  NULL AS user_id,
  created_at
FROM categories
ORDER BY COALESCE(sequence, 0);

-- CSV: migrate_categories.csv
-- Import to: master_categories


-- ─── 2. PRODUCTS ────────────────────────────────────────────
-- Run on THANDATTI DB → export as CSV → import to Supabase master_items

SELECT
  id,
  :company_id AS company_id,
  title AS item_name,
  sku AS item_code,
  'Goods' AS item_type,
  NULL AS usage_unit,
  category_id,
  brand_id,
  NULL AS hsn_sac,
  CASE WHEN status = 'In Stock' THEN 'Active' ELSE 'Inactive' END AS status,
  NULL AS purchase_price,
  COALESCE(old_price, new_price) AS mrp,
  new_price AS selling_price,
  NULL AS gst_rate,
  NULL AS discount_eligible,
  NULL AS tax_group_id,
  true AS is_live,
  true AS is_published,
  COALESCE(is_special, false) AS featured,
  -- Parse weight: "500g" → 0.5, "1kg" → 1.0
  CASE
    WHEN weight ILIKE '%kg%' THEN CAST(REGEXP_REPLACE(weight, '[^0-9.]', '', 'g') AS DECIMAL(10,2))
    WHEN weight ILIKE '%g%' THEN CAST(REGEXP_REPLACE(weight, '[^0-9.]', '', 'g') AS DECIMAL(10,2)) / 1000
    ELSE NULL
  END AS weight_kg,
  NULL AS web_title,
  NULL AS seo_description,
  image_url AS image_url,
  description,
  COALESCE(detailed_description, '') AS long_description,
  stock_quantity AS current_stock,
  NULL AS delivery_mode,
  NULL AS duration_value,
  NULL AS duration_unit,
  NULL AS max_capacity,
  NULL AS eligibility,
  NULL AS highlights,
  NULL AS brochure_url,
  NULL AS level,
  NULL AS outline,
  -- Build tags array from product_tags + is_combo flag
  NULL AS tags,
  NULL AS custom_fields,
  NULL AS default_warehouse_id,
  NULL AS reorder_level,
  NULL AS min_stock,
  NULL AS max_stock,
  NULL AS user_id,
  true AS is_ecommerce,
  COALESCE(is_special, false) AS is_best_seller,
  0 AS total_sold,
  NULL AS web_slug,
  NULL AS barcode,
  created_at,
  updated_at
FROM products
ORDER BY COALESCE(sequence, 0);

-- CSV: migrate_products.csv
-- Import to: master_items
-- NOTE: After import, run this to populate tags from product_tags table:
--   UPDATE master_items mi SET tags = (
--     SELECT ARRAY_AGG(pt.tag) FROM product_tags pt WHERE pt.product_id = mi.id
--   ) WHERE company_id = :company_id;
--
--   UPDATE master_items SET tags = ARRAY_APPEND(COALESCE(tags, '{}'), 'combo')
--   WHERE id IN (SELECT id FROM products WHERE is_combo = true) AND company_id = :company_id;


-- ─── 3. PRODUCT VARIANTS (from product_attributes) ─────────
-- Run on THANDATTI DB → export as CSV → import to Supabase master_product_variants

SELECT
  pa.id,
  :company_id AS company_id,
  pa.product_id AS item_id,
  pa.attribute_value AS name,
  pa.sku_suffix AS sku,
  NULL AS barcode,
  pa.attribute_type || ': ' || pa.attribute_value AS description,
  (pa.price - p.new_price) AS price_adjustment,
  true AS is_active,
  NULL AS erp_variant_id,
  'Public' AS visibility,
  pa.stock_quantity AS stock_qty,
  NULL AS user_id,
  pa.created_at
FROM product_attributes pa
JOIN products p ON p.id = pa.product_id
ORDER BY pa.product_id, pa.display_order;

-- CSV: migrate_variants.csv
-- Import to: master_product_variants


-- ─── 4. BANNERS ─────────────────────────────────────────────
-- Run on THANDATTI DB → export as CSV → import to Supabase ecom_banners

SELECT
  id,
  :company_id AS company_id,
  title,
  subtitle,
  NULL AS badge_text,
  'Shop Now' AS button_text,
  link AS button_link,
  image_url,
  CASE type
    WHEN 'main' THEN 'hero'
    WHEN 'section' THEN 'offer'
    ELSE type
  END AS position,
  COALESCE(sequence, 0) AS display_order,
  is_active,
  link AS link_url,
  NULL AS mobile_image_url,
  created_at,
  updated_at
FROM banners
ORDER BY COALESCE(sequence, 0);

-- CSV: migrate_banners.csv
-- Import to: ecom_banners


-- ─── 5. COUPONS ─────────────────────────────────────────────
-- Run on THANDATTI DB → export as CSV → import to Supabase ecom_coupons

SELECT
  :company_id AS company_id,
  code,
  NULL AS description,
  discount_type,
  discount_value,
  min_purchase_amount AS min_order_amount,
  max_discount_amount,
  usage_limit,
  used_count,
  valid_from::date AS valid_from,
  valid_until::date AS valid_to,
  is_active,
  1 AS per_user_limit,
  created_at,
  updated_at
FROM coupons;

-- CSV: migrate_coupons.csv
-- Import to: ecom_coupons
-- NOTE: ecom_coupons.id is BIGINT auto-increment, so don't include thandatti UUID id


-- ─── 6. ORDERS ──────────────────────────────────────────────
-- Run on THANDATTI DB → export as CSV → import to Supabase ecom_orders

SELECT
  o.id,
  :company_id AS company_id,
  NULL AS user_id,
  o.order_number,
  COALESCE(a.first_name || ' ' || a.last_name, 'Guest') AS customer_name,
  COALESCE(o.email, u.email, '') AS customer_email,
  COALESCE(u.phone_number, '') AS customer_phone,
  json_build_object(
    'line1', COALESCE(a.address_line, ''),
    'city', COALESCE(a.city, ''),
    'state', COALESCE(a.state_name, a.state, ''),
    'pincode', COALESCE(a.postal_code, '')
  )::jsonb AS shipping_address,
  NULL AS billing_address,
  o.subtotal,
  COALESCE(o.vat, 0) AS tax_amount,
  COALESCE(o.delivery_charge, 0) AS shipping_amount,
  COALESCE(o.discount_amount, 0) AS discount_amount,
  COALESCE(o.discount_amount, 0) AS coupon_discount,
  o.coupon_code,
  o.payment_method,
  o.payment_status,
  o.payment_transaction_id AS payment_id,
  o.payment_gateway AS payment_gateway_ref,
  o.status,
  NULL AS tracking_number,
  NULL AS tracking_no,
  NULL AS courier_name,
  NULL AS notes,
  o.total_price AS grand_total,
  '{}'::jsonb AS custom_fields,
  o.created_at,
  o.updated_at
FROM orders o
LEFT JOIN addresses a ON a.id = o.shipping_address_id
LEFT JOIN users u ON u.id = o.user_id
ORDER BY o.created_at;

-- CSV: migrate_orders.csv
-- Import to: ecom_orders


-- ─── 7. ORDER ITEMS ─────────────────────────────────────────
-- Run on THANDATTI DB → export as CSV → import to Supabase ecom_order_items

SELECT
  oi.id,
  oi.order_id,
  :company_id AS company_id,
  oi.product_id,
  NULL AS variant_id,
  p.title AS product_name,
  NULL AS variant_name,
  NULL AS variant_label,
  NULL AS sku,
  p.primary_image AS image_url,
  oi.quantity,
  oi.unit_price,
  oi.total_price AS amount,
  oi.unit_price AS price_at_time,
  oi.total_price AS total_price,
  oi.created_at
FROM order_items oi
LEFT JOIN products p ON p.id = oi.product_id
ORDER BY oi.order_id, oi.created_at;

-- CSV: migrate_order_items.csv
-- Import to: ecom_order_items


-- ─── 8. REVIEWS ─────────────────────────────────────────────
-- Run on THANDATTI DB → export as CSV → import to Supabase ecom_product_reviews

SELECT
  pr.id,
  :company_id AS company_id,
  pr.product_id,
  NULL AS order_id,
  COALESCE(u.first_name || ' ' || u.last_name, 'Customer') AS customer_name,
  u.email AS customer_email,
  pr.rating,
  NULL AS title,
  pr.comment AS review,
  CASE WHEN pr.is_approved THEN 'approved' ELSE 'pending' END AS status,
  false AS is_verified,
  pr.is_approved AS is_published,
  NULL AS admin_reply,
  pr.created_at,
  pr.updated_at
FROM product_reviews pr
LEFT JOIN users u ON u.id = pr.user_id
ORDER BY pr.created_at;

-- CSV: migrate_reviews.csv
-- Import to: ecom_product_reviews


-- ─── 9. ORDER TIMELINE (generate from orders) ──────────────
-- Thandatti doesn't have a timeline table, so create initial entries from orders

SELECT
  gen_random_uuid() AS id,
  o.id AS order_id,
  :company_id AS company_id,
  o.status,
  'Migrated from legacy system' AS note,
  NULL AS message,
  'system' AS created_by,
  o.created_at
FROM orders o
ORDER BY o.created_at;

-- CSV: migrate_order_timeline.csv
-- Import to: ecom_order_timeline


-- ═══════════════════════════════════════════════════════════════
--  POST-MIGRATION STEPS
-- ═══════════════════════════════════════════════════════════════

-- 1. Update product tags from product_tags table:
-- UPDATE master_items mi SET tags = (
--   SELECT ARRAY_AGG(pt.tag) FROM product_tags pt WHERE pt.product_id = mi.id
-- ) WHERE company_id = :company_id AND EXISTS (
--   SELECT 1 FROM product_tags pt WHERE pt.product_id = mi.id
-- );

-- 2. Mark combo products:
-- UPDATE master_items SET tags = ARRAY_APPEND(COALESCE(tags, '{}'), 'combo')
-- WHERE id IN (SELECT id FROM products WHERE is_combo = true)
-- AND company_id = :company_id;

-- 3. Update ecom_customers from order data:
-- INSERT INTO ecom_customers (company_id, full_name, email, phone, status, created_at)
-- SELECT DISTINCT ON (customer_email)
--   company_id, customer_name, customer_email, customer_phone, 'active', MIN(created_at)
-- FROM ecom_orders
-- WHERE company_id = :company_id AND customer_email IS NOT NULL AND customer_email != ''
-- GROUP BY company_id, customer_name, customer_email, customer_phone
-- ON CONFLICT DO NOTHING;

-- 4. Update customer stats:
-- UPDATE ecom_customers ec SET
--   total_orders = (SELECT COUNT(*) FROM ecom_orders eo WHERE eo.customer_email = ec.email AND eo.company_id = ec.company_id),
--   total_spent = (SELECT COALESCE(SUM(grand_total), 0) FROM ecom_orders eo WHERE eo.customer_email = ec.email AND eo.company_id = ec.company_id)
-- WHERE ec.company_id = :company_id;

-- 5. Verify counts:
-- SELECT 'master_items' AS tbl, COUNT(*) FROM master_items WHERE company_id = :company_id
-- UNION ALL SELECT 'master_categories', COUNT(*) FROM master_categories WHERE company_id = :company_id
-- UNION ALL SELECT 'master_product_variants', COUNT(*) FROM master_product_variants WHERE company_id = :company_id
-- UNION ALL SELECT 'ecom_orders', COUNT(*) FROM ecom_orders WHERE company_id = :company_id
-- UNION ALL SELECT 'ecom_order_items', COUNT(*) FROM ecom_order_items WHERE company_id = :company_id
-- UNION ALL SELECT 'ecom_banners', COUNT(*) FROM ecom_banners WHERE company_id = :company_id
-- UNION ALL SELECT 'ecom_coupons', COUNT(*) FROM ecom_coupons WHERE company_id = :company_id
-- UNION ALL SELECT 'ecom_product_reviews', COUNT(*) FROM ecom_product_reviews WHERE company_id = :company_id
-- UNION ALL SELECT 'ecom_customers', COUNT(*) FROM ecom_customers WHERE company_id = :company_id;
