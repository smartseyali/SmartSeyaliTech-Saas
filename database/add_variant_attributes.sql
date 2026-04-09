-- ═══════════════════════════════════════════════════════════════
--  Add structured attributes to master_product_variants
--  Enables Flipkart-style color/size selection with per-variant images
-- ═══════════════════════════════════════════════════════════════

-- Image per variant (Red/XL shows different image than Blue/M)
ALTER TABLE master_product_variants ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Structured color & size (instead of just a free-text name)
ALTER TABLE master_product_variants ADD COLUMN IF NOT EXISTS color VARCHAR(100);
ALTER TABLE master_product_variants ADD COLUMN IF NOT EXISTS size VARCHAR(100);

COMMENT ON COLUMN master_product_variants.image_url IS 'Variant-specific product image';
COMMENT ON COLUMN master_product_variants.color IS 'Color attribute (e.g. Red, Blue, Black)';
COMMENT ON COLUMN master_product_variants.size IS 'Size attribute (e.g. S, M, L, XL, 500g)';
