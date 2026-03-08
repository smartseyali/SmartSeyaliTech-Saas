-- Migration: Add slug to system_modules and update foreign keys if needed
ALTER TABLE public.system_modules ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Seed slugs if they don't exist
UPDATE public.system_modules SET slug = LOWER(REPLACE(name, ' ', '-')) WHERE slug IS NULL;

-- Update Modules management to use slug
