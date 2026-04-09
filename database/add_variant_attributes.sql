-- ═══════════════════════════════════════════════════════════════
--  Add all missing columns to master_product_variants
--  Run this ONCE in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Variant images
ALTER TABLE master_product_variants ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Structured attributes
ALTER TABLE master_product_variants ADD COLUMN IF NOT EXISTS color VARCHAR(100);
ALTER TABLE master_product_variants ADD COLUMN IF NOT EXISTS size VARCHAR(100);

-- Pricing
ALTER TABLE master_product_variants ADD COLUMN IF NOT EXISTS selling_price DECIMAL(15,2);
ALTER TABLE master_product_variants ADD COLUMN IF NOT EXISTS mrp DECIMAL(15,2);

-- Unit of Measure
ALTER TABLE master_product_variants ADD COLUMN IF NOT EXISTS uom VARCHAR(50);
