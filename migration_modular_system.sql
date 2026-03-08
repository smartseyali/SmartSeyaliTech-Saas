-- Migration: Enhance system_modules schema to support dynamic marketplace
ALTER TABLE public.system_modules ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE public.system_modules ADD COLUMN IF NOT EXISTS tagline TEXT;
ALTER TABLE public.system_modules ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.system_modules ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'operations';
ALTER TABLE public.system_modules ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Live';
ALTER TABLE public.system_modules ADD COLUMN IF NOT EXISTS base_route TEXT DEFAULT '/apps/';
ALTER TABLE public.system_modules ADD COLUMN IF NOT EXISTS dashboard_route TEXT DEFAULT '/apps/';
ALTER TABLE public.system_modules ADD COLUMN IF NOT EXISTS brand_color TEXT DEFAULT '#3b82f6';
ALTER TABLE public.system_modules ADD COLUMN IF NOT EXISTS gradient_from TEXT DEFAULT 'from-blue-500';
ALTER TABLE public.system_modules ADD COLUMN IF NOT EXISTS gradient_to TEXT DEFAULT 'to-blue-700';
ALTER TABLE public.system_modules ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]';
ALTER TABLE public.system_modules ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.system_modules ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE public.system_modules ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Seed slugs if they don't exist
UPDATE public.system_modules SET slug = LOWER(REPLACE(name, ' ', '-')) WHERE slug IS NULL;
