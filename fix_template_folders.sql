-- ================================================================
--  Fix Template Folder Names in system_templates
--  Run this in Supabase SQL Editor → https://supabase.com/dashboard
-- ================================================================

-- Fix "Flipkart Style" → folder should be 'flipkart-style'
UPDATE public.system_templates
SET folder = 'flipkart-style'
WHERE folder ILIKE '%flipkart%'
   OR name ILIKE '%flipkart%';

-- Fix "Fruitables" folder name (actual disk folder is 'Fruitables' with capital F)
-- The provisioner now handles case-insensitive matching, but let's keep it clean
UPDATE public.system_templates
SET folder = 'Fruitables'
WHERE name ILIKE '%fruitables%' OR name ILIKE '%organic%';

-- Fix "Amazon Style" folder if needed
UPDATE public.system_templates
SET folder = 'amazon-style'
WHERE name ILIKE '%amazon%'
  AND folder NOT ILIKE 'amazon-style';

-- Fix "Modern Shop" folder if needed
UPDATE public.system_templates
SET folder = 'modern-shop'
WHERE name ILIKE '%modern%'
  AND folder NOT ILIKE 'modern-shop';

-- ── Verify results ────────────────────────────────────────────
SELECT id, name, folder, is_active
FROM public.system_templates
ORDER BY sort_order;

-- ── Also insert Flipkart if it doesn't exist yet ──────────────
INSERT INTO public.system_templates (
    folder, name, description, industry, version, component_count,
    preview_image, gallery_images, color, tags, is_active, sort_order
)
SELECT
    'flipkart-style',
    'Flipkart Style',
    'A feature-rich multi-category marketplace layout inspired by India''s largest ecommerce platform. Perfect for high-volume retail.',
    'retail',
    '1.0.0',
    24,
    'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=900',
    ARRAY[
        'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=900',
        'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?q=80&w=900',
        'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=900'
    ],
    '#F37121',
    ARRAY['marketplace', 'retail', 'flipkart', 'ecommerce'],
    true,
    4
WHERE NOT EXISTS (
    SELECT 1 FROM public.system_templates WHERE folder = 'flipkart-style'
);
