-- ═══════════════════════════════════════════════════════════════
--  Ecommerce Storefront — Column Additions
--  Run this on Supabase SQL Editor
--  Date: 2026-04-05
--  Purpose: Add missing columns needed for thandatti_deploy
--           storefront + SaaS admin alignment
-- ═══════════════════════════════════════════════════════════════

-- ─── master_items: Ecommerce visibility & sales tracking ────
ALTER TABLE master_items ADD COLUMN IF NOT EXISTS is_ecommerce BOOLEAN DEFAULT false;
ALTER TABLE master_items ADD COLUMN IF NOT EXISTS is_best_seller BOOLEAN DEFAULT false;
ALTER TABLE master_items ADD COLUMN IF NOT EXISTS total_sold INTEGER DEFAULT 0;
ALTER TABLE master_items ADD COLUMN IF NOT EXISTS web_slug VARCHAR(255);
ALTER TABLE master_items ADD COLUMN IF NOT EXISTS barcode VARCHAR(100);

COMMENT ON COLUMN master_items.is_ecommerce IS 'Show this product on storefront (alternative to is_live)';
COMMENT ON COLUMN master_items.is_best_seller IS 'Mark as best seller on storefront';
COMMENT ON COLUMN master_items.total_sold IS 'Total units sold (for bestselling sort)';
COMMENT ON COLUMN master_items.web_slug IS 'URL-friendly slug for SEO';
COMMENT ON COLUMN master_items.barcode IS 'EAN/UPC barcode';

-- ─── master_product_variants: Own selling_price & mrp ──────
ALTER TABLE master_product_variants ADD COLUMN IF NOT EXISTS selling_price DECIMAL(15,2);
ALTER TABLE master_product_variants ADD COLUMN IF NOT EXISTS mrp DECIMAL(15,2);

COMMENT ON COLUMN master_product_variants.selling_price IS 'Variant selling price (overrides parent item price when set)';
COMMENT ON COLUMN master_product_variants.mrp IS 'Variant MRP (overrides parent item MRP when set)';

-- ─── ecom_banners: Mobile image + link URL alias ────────────
ALTER TABLE ecom_banners ADD COLUMN IF NOT EXISTS mobile_image_url TEXT;
ALTER TABLE ecom_banners ADD COLUMN IF NOT EXISTS link_url TEXT;

COMMENT ON COLUMN ecom_banners.mobile_image_url IS 'Separate image for mobile devices';
COMMENT ON COLUMN ecom_banners.link_url IS 'Click destination URL (alias for button_link)';

-- ─── ecom_orders: Coupon discount + payment gateway ref ─────
ALTER TABLE ecom_orders ADD COLUMN IF NOT EXISTS coupon_discount DECIMAL(15,2) DEFAULT 0;
ALTER TABLE ecom_orders ADD COLUMN IF NOT EXISTS payment_gateway_ref VARCHAR(255);

COMMENT ON COLUMN ecom_orders.coupon_discount IS 'Coupon discount amount (mirror of discount_amount for admin)';
COMMENT ON COLUMN ecom_orders.payment_gateway_ref IS 'Payment gateway transaction/reference ID';

-- ─── ecom_order_items: Variant label + SKU snapshot ─────────
ALTER TABLE ecom_order_items ADD COLUMN IF NOT EXISTS variant_label VARCHAR(255);
ALTER TABLE ecom_order_items ADD COLUMN IF NOT EXISTS sku VARCHAR(100);

COMMENT ON COLUMN ecom_order_items.variant_label IS 'Variant display label (admin reads this)';
COMMENT ON COLUMN ecom_order_items.sku IS 'Product SKU at time of order';

-- ─── ecom_product_reviews: Status + verified purchase ───────
ALTER TABLE ecom_product_reviews ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE ecom_product_reviews ADD COLUMN IF NOT EXISTS is_verified_purchase BOOLEAN DEFAULT false;

COMMENT ON COLUMN ecom_product_reviews.status IS 'Moderation status: pending, approved, rejected';
COMMENT ON COLUMN ecom_product_reviews.is_verified_purchase IS 'Whether reviewer actually bought the product';

-- ─── ecom_settings: Extended store config ───────────────────
ALTER TABLE ecom_settings ADD COLUMN IF NOT EXISTS secondary_color VARCHAR(20);
ALTER TABLE ecom_settings ADD COLUMN IF NOT EXISTS support_phone VARCHAR(100);
ALTER TABLE ecom_settings ADD COLUMN IF NOT EXISTS support_email VARCHAR(255);
ALTER TABLE ecom_settings ADD COLUMN IF NOT EXISTS delivery JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN ecom_settings.secondary_color IS 'Secondary brand color (hex)';
COMMENT ON COLUMN ecom_settings.support_phone IS 'Customer support phone number';
COMMENT ON COLUMN ecom_settings.support_email IS 'Customer support email';
COMMENT ON COLUMN ecom_settings.delivery IS 'Delivery config JSON: {freeDeliveryAbove, stateZones, weightSlabs, defaultItemWeight, unserviceablePincodes}';

-- ─── ecom_coupons: Per user limit ───────────────────────────
ALTER TABLE ecom_coupons ADD COLUMN IF NOT EXISTS per_user_limit INTEGER DEFAULT 1;

COMMENT ON COLUMN ecom_coupons.per_user_limit IS 'Max redemptions per customer';

-- ─── ecom_customers: Address + purchase stats ───────────────
ALTER TABLE ecom_customers ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE ecom_customers ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE ecom_customers ADD COLUMN IF NOT EXISTS state VARCHAR(100);
ALTER TABLE ecom_customers ADD COLUMN IF NOT EXISTS pincode VARCHAR(10);
ALTER TABLE ecom_customers ADD COLUMN IF NOT EXISTS total_orders INTEGER DEFAULT 0;
ALTER TABLE ecom_customers ADD COLUMN IF NOT EXISTS total_spent DECIMAL(15,2) DEFAULT 0;

COMMENT ON COLUMN ecom_customers.total_orders IS 'Lifetime order count';
COMMENT ON COLUMN ecom_customers.total_spent IS 'Lifetime spend amount';

-- ─── shipping_zones: Weight-based rate config ───────────────
ALTER TABLE shipping_zones ADD COLUMN IF NOT EXISTS per_kg_rate DECIMAL(10,2) DEFAULT 0;
ALTER TABLE shipping_zones ADD COLUMN IF NOT EXISTS weight_slabs JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN shipping_zones.per_kg_rate IS 'Rate per kg for weight-based shipping';
COMMENT ON COLUMN shipping_zones.weight_slabs IS 'Weight slab pricing: [{maxGrams, price}]';


-- ═══════════════════════════════════════════════════════════════
--  RLS Policies for storefront (anon read access)
-- ═══════════════════════════════════════════════════════════════

-- master_items: Allow anon to read active ecommerce products
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'storefront_read_products' AND tablename = 'master_items') THEN
    CREATE POLICY storefront_read_products ON master_items
      FOR SELECT USING (is_live = true AND status = 'Active');
  END IF;
END $$;

-- master_categories: Allow anon to read active categories
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'storefront_read_categories' AND tablename = 'master_categories') THEN
    CREATE POLICY storefront_read_categories ON master_categories
      FOR SELECT USING (is_active = true);
  END IF;
END $$;

-- master_product_variants: Allow anon to read active variants
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'storefront_read_variants' AND tablename = 'master_product_variants') THEN
    CREATE POLICY storefront_read_variants ON master_product_variants
      FOR SELECT USING (is_active = true);
  END IF;
END $$;

-- ecom_banners: Allow anon to read active banners
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'storefront_read_banners' AND tablename = 'ecom_banners') THEN
    CREATE POLICY storefront_read_banners ON ecom_banners
      FOR SELECT USING (is_active = true);
  END IF;
END $$;

-- ecom_settings: Allow anon to read store settings
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'storefront_read_settings' AND tablename = 'ecom_settings') THEN
    CREATE POLICY storefront_read_settings ON ecom_settings
      FOR SELECT USING (true);
  END IF;
END $$;

-- ecom_product_reviews: Allow anon to read published reviews
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'storefront_read_reviews' AND tablename = 'ecom_product_reviews') THEN
    CREATE POLICY storefront_read_reviews ON ecom_product_reviews
      FOR SELECT USING (is_published = true);
  END IF;
END $$;

-- ecom_product_reviews: Allow anon to insert new reviews
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'storefront_insert_reviews' AND tablename = 'ecom_product_reviews') THEN
    CREATE POLICY storefront_insert_reviews ON ecom_product_reviews
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- ecom_coupons: Allow anon to read active coupons (for validation)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'storefront_read_coupons' AND tablename = 'ecom_coupons') THEN
    CREATE POLICY storefront_read_coupons ON ecom_coupons
      FOR SELECT USING (is_active = true);
  END IF;
END $$;

-- ecom_orders: Allow anon to insert orders (guest checkout)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'storefront_insert_orders' AND tablename = 'ecom_orders') THEN
    CREATE POLICY storefront_insert_orders ON ecom_orders
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- ecom_orders: Allow authenticated users to read their own orders
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'storefront_read_own_orders' AND tablename = 'ecom_orders') THEN
    CREATE POLICY storefront_read_own_orders ON ecom_orders
      FOR SELECT USING (
        customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
      );
  END IF;
END $$;

-- ecom_order_items: Allow anon to insert order items
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'storefront_insert_order_items' AND tablename = 'ecom_order_items') THEN
    CREATE POLICY storefront_insert_order_items ON ecom_order_items
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- ecom_order_items: Allow read for own order items
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'storefront_read_order_items' AND tablename = 'ecom_order_items') THEN
    CREATE POLICY storefront_read_order_items ON ecom_order_items
      FOR SELECT USING (
        order_id IN (
          SELECT id FROM ecom_orders WHERE customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
      );
  END IF;
END $$;

-- ecom_order_timeline: Allow insert for new timeline entries
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'storefront_insert_timeline' AND tablename = 'ecom_order_timeline') THEN
    CREATE POLICY storefront_insert_timeline ON ecom_order_timeline
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;


-- ═══════════════════════════════════════════════════════════════
--  Enable RLS on tables (if not already enabled)
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE master_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecom_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecom_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecom_product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecom_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecom_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecom_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecom_order_timeline ENABLE ROW LEVEL SECURITY;
