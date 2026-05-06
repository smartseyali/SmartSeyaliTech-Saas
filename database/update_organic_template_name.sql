-- Update the Pattikadai template name to "Organic — Retail Storefront"
-- Run this once in the Supabase SQL editor.

UPDATE storefront_templates
SET
  name          = 'Organic — Retail Storefront',
  description   = 'Clean organic-retail storefront with WhatsApp checkout, product variants, shoppable videos, and dynamic shipping zones. Ideal for food, wellness, and natural-product brands.',
  tags          = ARRAY['retail', 'organic', 'whatsapp', 'food', 'wellness'],
  thumbnail_url = '/templates/ecommerce/pattikadai/assets/thumbnail.svg',
  updated_at    = NOW()
WHERE slug = 'pattikadai';
