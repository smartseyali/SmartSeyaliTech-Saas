-- Add is_combo boolean column to master_items
ALTER TABLE public.master_items
  ADD COLUMN IF NOT EXISTS is_combo BOOLEAN DEFAULT false;

COMMENT ON COLUMN master_items.is_combo IS 'Mark as Special Combo on storefront';
