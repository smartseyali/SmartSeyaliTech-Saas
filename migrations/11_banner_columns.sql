-- Migration 11: Add missing columns to ecom_banners
-- Adds scheduling, CTA button, and styling columns that the Banners UI expects

ALTER TABLE public.ecom_banners
    ADD COLUMN IF NOT EXISTS button_text TEXT,
    ADD COLUMN IF NOT EXISTS button_link TEXT,
    ADD COLUMN IF NOT EXISTS overlay_opacity INTEGER DEFAULT 40,
    ADD COLUMN IF NOT EXISTS text_color TEXT DEFAULT 'white',
    ADD COLUMN IF NOT EXISTS starts_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS ends_at TIMESTAMPTZ;
