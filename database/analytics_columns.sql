-- Analytics & Tracking columns for ecom_settings
-- Adds per-tenant storage for GA4, GTM, Meta Pixel, Clarity, and custom scripts

ALTER TABLE ecom_settings
  ADD COLUMN IF NOT EXISTS integrations JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS custom_head_scripts TEXT,
  ADD COLUMN IF NOT EXISTS custom_body_scripts TEXT;

COMMENT ON COLUMN ecom_settings.integrations IS
  'Per-tenant analytics integration IDs: { ga4_measurement_id, gtm_container_id, meta_pixel_id, clarity_project_id }';

COMMENT ON COLUMN ecom_settings.custom_head_scripts IS
  'Raw HTML/JS injected into storefront <head> — for Pinterest Tag, TikTok Pixel, Snapchat, etc.';

COMMENT ON COLUMN ecom_settings.custom_body_scripts IS
  'Raw HTML/JS injected at end of storefront <body> — for Hotjar, live chat widgets, etc.';
