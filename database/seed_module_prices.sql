-- Seed individual module prices into system_modules from PLATFORM_MODULES config.
-- Run this once in Supabase SQL Editor.
-- Safe to re-run — only updates rows that exist.

-- Ensure the columns exist (added in a previous migration)
ALTER TABLE public.system_modules
    ADD COLUMN IF NOT EXISTS price_monthly INT     DEFAULT 0,
    ADD COLUMN IF NOT EXISTS price_yearly  INT     DEFAULT 0,
    ADD COLUMN IF NOT EXISTS is_free       BOOLEAN DEFAULT false;

UPDATE public.system_modules SET price_monthly =  999, price_yearly =  9990, is_free = false WHERE slug = 'ecommerce';
UPDATE public.system_modules SET price_monthly =  499, price_yearly =  4990, is_free = false WHERE slug = 'pos';
UPDATE public.system_modules SET price_monthly =  499, price_yearly =  4990, is_free = false WHERE slug = 'crm';
UPDATE public.system_modules SET price_monthly =  799, price_yearly =  7990, is_free = false WHERE slug = 'sales';
UPDATE public.system_modules SET price_monthly =  599, price_yearly =  5990, is_free = false WHERE slug = 'inventory';
UPDATE public.system_modules SET price_monthly =  499, price_yearly =  4990, is_free = false WHERE slug = 'purchase';
UPDATE public.system_modules SET price_monthly =  699, price_yearly =  6990, is_free = false WHERE slug = 'hrms';
UPDATE public.system_modules SET price_monthly =  799, price_yearly =  7990, is_free = false WHERE slug = 'finance';
UPDATE public.system_modules SET price_monthly =  299, price_yearly =  2990, is_free = false WHERE slug = 'whatsapp';
UPDATE public.system_modules SET price_monthly =  599, price_yearly =  5990, is_free = false WHERE slug = 'website';
UPDATE public.system_modules SET price_monthly =    0, price_yearly =     0, is_free = true  WHERE slug = 'masters';
