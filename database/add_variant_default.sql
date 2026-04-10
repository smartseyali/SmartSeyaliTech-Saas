-- Add is_default column to master_product_variants
-- Only one variant per item should be marked as default (displayed on website card)

ALTER TABLE public.master_product_variants
  ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false;

-- Add is_default column to product_variants (ecom variants table)
ALTER TABLE public.product_variants
  ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false;
