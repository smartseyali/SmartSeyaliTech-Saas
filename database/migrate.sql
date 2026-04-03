-- ========================================================================================
-- SMARTSEYALI MULTI-TENANT ERP SAAS PLATFORM
-- DATABASE MIGRATION (Upgrade existing database to latest schema)
-- ========================================================================================
-- PostgreSQL / Supabase-compatible
-- Generated: 2026-04-02
-- Safe to re-run: uses IF NOT EXISTS / IF EXISTS guards throughout
-- Does NOT drop any existing tables or columns
-- ========================================================================================


-- ========================================================================================
-- SECTION 0: CREATE BASE TABLES THAT MAY NOT EXIST YET
-- ========================================================================================
-- These are the original Website module tables. If your database was set up before
-- the Website module, these won't exist. CREATE TABLE IF NOT EXISTS is safe to re-run.

-- Web Pages
CREATE TABLE IF NOT EXISTS public.web_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) NOT NULL,
    content TEXT,
    meta_title VARCHAR(500),
    meta_description TEXT,
    featured_image TEXT,
    template VARCHAR(100) DEFAULT 'default',
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    sort_order INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'draft',
    version INT DEFAULT 1,
    parent_page_id UUID REFERENCES public.web_pages(id) ON DELETE SET NULL,
    template_id UUID,
    reviewed_by UUID,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    custom_fields JSONB DEFAULT '{}'::jsonb,
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(company_id, slug)
);

-- Blog Posts
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500),
    excerpt TEXT,
    content TEXT,
    author VARCHAR(255),
    category VARCHAR(100),
    image_url TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    read_time VARCHAR(50),
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    sort_order INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'draft',
    version INT DEFAULT 1,
    reviewed_by UUID,
    custom_fields JSONB DEFAULT '{}'::jsonb,
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Web Enquiries
CREATE TABLE IF NOT EXISTS public.web_enquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(100),
    subject VARCHAR(500),
    message TEXT,
    source VARCHAR(100) DEFAULT 'website',
    program_id UUID,
    program_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'new',
    assigned_to UUID,
    notes TEXT,
    contact_id UUID,
    custom_fields JSONB DEFAULT '{}'::jsonb,
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Gallery Items
CREATE TABLE IF NOT EXISTS public.gallery_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    media_url TEXT NOT NULL,
    media_type VARCHAR(50) DEFAULT 'image',
    category VARCHAR(100),
    is_featured BOOLEAN DEFAULT false,
    display_order INT DEFAULT 0,
    custom_fields JSONB DEFAULT '{}'::jsonb,
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Web FAQs
CREATE TABLE IF NOT EXISTS public.web_faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'General',
    sort_order INT DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    custom_fields JSONB DEFAULT '{}'::jsonb,
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Web Menu Items
CREATE TABLE IF NOT EXISTS public.web_menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    label VARCHAR(255) NOT NULL,
    url VARCHAR(500),
    page_id UUID REFERENCES public.web_pages(id) ON DELETE SET NULL,
    parent_id UUID REFERENCES public.web_menu_items(id) ON DELETE CASCADE,
    position VARCHAR(50) DEFAULT 'header',
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);


-- ========================================================================================
-- SECTION 1: ALTER EXISTING TABLES — ADD MISSING COLUMNS
-- ========================================================================================

-- ── system_modules — per-app pricing (Odoo-style) ────────────────────────────
ALTER TABLE public.system_modules ADD COLUMN IF NOT EXISTS price_monthly DECIMAL(10,2) DEFAULT 0;
ALTER TABLE public.system_modules ADD COLUMN IF NOT EXISTS price_yearly DECIMAL(10,2) DEFAULT 0;
ALTER TABLE public.system_modules ADD COLUMN IF NOT EXISTS trial_days INT DEFAULT 14;
ALTER TABLE public.system_modules ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT false;

-- ── company_modules — billing tracking ───────────────────────────────────────
ALTER TABLE public.company_modules ADD COLUMN IF NOT EXISTS installed_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.company_modules ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
ALTER TABLE public.company_modules ADD COLUMN IF NOT EXISTS billing_status VARCHAR(50) DEFAULT 'active';

-- master_items — website extension columns
ALTER TABLE public.master_items ADD COLUMN IF NOT EXISTS delivery_mode VARCHAR(50);
ALTER TABLE public.master_items ADD COLUMN IF NOT EXISTS duration_value INT;
ALTER TABLE public.master_items ADD COLUMN IF NOT EXISTS duration_unit VARCHAR(20);
ALTER TABLE public.master_items ADD COLUMN IF NOT EXISTS max_capacity INT;
ALTER TABLE public.master_items ADD COLUMN IF NOT EXISTS eligibility TEXT;
ALTER TABLE public.master_items ADD COLUMN IF NOT EXISTS highlights JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.master_items ADD COLUMN IF NOT EXISTS brochure_url TEXT;
ALTER TABLE public.master_items ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;
ALTER TABLE public.master_items ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.master_items ADD COLUMN IF NOT EXISTS level VARCHAR(50);
ALTER TABLE public.master_items ADD COLUMN IF NOT EXISTS outline JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.master_items ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.master_items ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;

-- web_pages — CMS enhancements
ALTER TABLE public.web_pages ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.web_pages ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'draft';
ALTER TABLE public.web_pages ADD COLUMN IF NOT EXISTS version INT DEFAULT 1;
ALTER TABLE public.web_pages ADD COLUMN IF NOT EXISTS parent_page_id UUID REFERENCES public.web_pages(id) ON DELETE SET NULL;
ALTER TABLE public.web_pages ADD COLUMN IF NOT EXISTS template_id UUID;
ALTER TABLE public.web_pages ADD COLUMN IF NOT EXISTS reviewed_by UUID;
ALTER TABLE public.web_pages ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.web_pages ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;

-- blog_posts
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'draft';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS version INT DEFAULT 1;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS reviewed_by UUID;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;

-- web_enquiries — lookup FKs
ALTER TABLE public.web_enquiries ADD COLUMN IF NOT EXISTS program_id UUID;
ALTER TABLE public.web_enquiries ADD COLUMN IF NOT EXISTS contact_id UUID;
ALTER TABLE public.web_enquiries ADD COLUMN IF NOT EXISTS assigned_to UUID;
ALTER TABLE public.web_enquiries ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;

-- gallery_items
ALTER TABLE public.gallery_items ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;

-- web_faqs
ALTER TABLE public.web_faqs ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;

-- master_contacts
ALTER TABLE public.master_contacts ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;

-- ── sales_orders — missing columns from DocType ──────────────────────────────
ALTER TABLE public.sales_orders ADD COLUMN IF NOT EXISTS reference_no VARCHAR(100);
ALTER TABLE public.sales_orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);
ALTER TABLE public.sales_orders ADD COLUMN IF NOT EXISTS customer_gstin VARCHAR(100);
ALTER TABLE public.sales_orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE public.sales_orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE public.sales_orders ADD COLUMN IF NOT EXISTS place_of_supply VARCHAR(100);
ALTER TABLE public.sales_orders ADD COLUMN IF NOT EXISTS delivery_date DATE;
ALTER TABLE public.sales_orders ADD COLUMN IF NOT EXISTS shipping_method VARCHAR(100);
ALTER TABLE public.sales_orders ADD COLUMN IF NOT EXISTS freight_charges DECIMAL(12,2) DEFAULT 0;
ALTER TABLE public.sales_orders ADD COLUMN IF NOT EXISTS sales_channel VARCHAR(100);
ALTER TABLE public.sales_orders ADD COLUMN IF NOT EXISTS order_priority VARCHAR(50) DEFAULT 'Standard';
ALTER TABLE public.sales_orders ADD COLUMN IF NOT EXISTS order_status VARCHAR(50) DEFAULT 'to-deliver';
ALTER TABLE public.sales_orders ADD COLUMN IF NOT EXISTS billing_status VARCHAR(50) DEFAULT 'to-invoice';
ALTER TABLE public.sales_orders ADD COLUMN IF NOT EXISTS payment_terms TEXT;
ALTER TABLE public.sales_orders ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.sales_orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(12,2) DEFAULT 0;
ALTER TABLE public.sales_orders ADD COLUMN IF NOT EXISTS grand_total DECIMAL(12,2) DEFAULT 0;
ALTER TABLE public.sales_orders ADD COLUMN IF NOT EXISTS total_qty DECIMAL(12,2) DEFAULT 0;
ALTER TABLE public.sales_orders ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR';
ALTER TABLE public.sales_orders ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;

-- ── sales_order_items — missing columns ──────────────────────────────────────
ALTER TABLE public.sales_order_items ADD COLUMN IF NOT EXISTS product_id UUID;
ALTER TABLE public.sales_order_items ADD COLUMN IF NOT EXISTS item_code TEXT;
ALTER TABLE public.sales_order_items ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.sales_order_items ADD COLUMN IF NOT EXISTS hsn_code TEXT;
ALTER TABLE public.sales_order_items ADD COLUMN IF NOT EXISTS uom TEXT DEFAULT 'PCS';
ALTER TABLE public.sales_order_items ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 0;
ALTER TABLE public.sales_order_items ADD COLUMN IF NOT EXISTS discount_pct DECIMAL(5,2) DEFAULT 0;
ALTER TABLE public.sales_order_items ADD COLUMN IF NOT EXISTS amount DECIMAL(12,2) DEFAULT 0;
ALTER TABLE public.sales_order_items ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- ── sales_quotations — missing columns ───────────────────────────────────────
ALTER TABLE public.sales_quotations ADD COLUMN IF NOT EXISTS reference_no VARCHAR(100);
ALTER TABLE public.sales_quotations ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);
ALTER TABLE public.sales_quotations ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE public.sales_quotations ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE public.sales_quotations ADD COLUMN IF NOT EXISTS customer_address TEXT;
ALTER TABLE public.sales_quotations ADD COLUMN IF NOT EXISTS billing_address TEXT;
ALTER TABLE public.sales_quotations ADD COLUMN IF NOT EXISTS shipping_address TEXT;
ALTER TABLE public.sales_quotations ADD COLUMN IF NOT EXISTS payment_terms TEXT;
ALTER TABLE public.sales_quotations ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.sales_quotations ADD COLUMN IF NOT EXISTS terms_and_conditions TEXT;
ALTER TABLE public.sales_quotations ADD COLUMN IF NOT EXISTS subtotal DECIMAL(12,2) DEFAULT 0;
ALTER TABLE public.sales_quotations ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(12,2) DEFAULT 0;
ALTER TABLE public.sales_quotations ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(12,2) DEFAULT 0;
ALTER TABLE public.sales_quotations ADD COLUMN IF NOT EXISTS grand_total DECIMAL(12,2) DEFAULT 0;
ALTER TABLE public.sales_quotations ADD COLUMN IF NOT EXISTS total_qty DECIMAL(12,2) DEFAULT 0;
ALTER TABLE public.sales_quotations ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR';
ALTER TABLE public.sales_quotations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.sales_quotations ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;

-- ── sales_quotation_items — missing columns ──────────────────────────────────
ALTER TABLE public.sales_quotation_items ADD COLUMN IF NOT EXISTS product_id UUID;
ALTER TABLE public.sales_quotation_items ADD COLUMN IF NOT EXISTS item_code TEXT;
ALTER TABLE public.sales_quotation_items ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.sales_quotation_items ADD COLUMN IF NOT EXISTS uom TEXT DEFAULT 'PCS';
ALTER TABLE public.sales_quotation_items ADD COLUMN IF NOT EXISTS unit_price DECIMAL(12,2) DEFAULT 0;
ALTER TABLE public.sales_quotation_items ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 0;
ALTER TABLE public.sales_quotation_items ADD COLUMN IF NOT EXISTS discount_pct DECIMAL(5,2) DEFAULT 0;
ALTER TABLE public.sales_quotation_items ADD COLUMN IF NOT EXISTS hsn_code TEXT;
ALTER TABLE public.sales_quotation_items ADD COLUMN IF NOT EXISTS amount DECIMAL(12,2) DEFAULT 0;
ALTER TABLE public.sales_quotation_items ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- ── sales_invoices — missing columns ─────────────────────────────────────────
ALTER TABLE public.sales_invoices ADD COLUMN IF NOT EXISTS reference_no VARCHAR(100);
ALTER TABLE public.sales_invoices ADD COLUMN IF NOT EXISTS invoice_type VARCHAR(50) DEFAULT 'Tax Invoice';
ALTER TABLE public.sales_invoices ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);
ALTER TABLE public.sales_invoices ADD COLUMN IF NOT EXISTS customer_gstin VARCHAR(100);
ALTER TABLE public.sales_invoices ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE public.sales_invoices ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE public.sales_invoices ADD COLUMN IF NOT EXISTS place_of_supply VARCHAR(100);
ALTER TABLE public.sales_invoices ADD COLUMN IF NOT EXISTS billing_address TEXT;
ALTER TABLE public.sales_invoices ADD COLUMN IF NOT EXISTS shipping_address TEXT;
ALTER TABLE public.sales_invoices ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(12,2) DEFAULT 0;
ALTER TABLE public.sales_invoices ADD COLUMN IF NOT EXISTS outstanding_amount DECIMAL(12,2) DEFAULT 0;
ALTER TABLE public.sales_invoices ADD COLUMN IF NOT EXISTS bank_details TEXT;
ALTER TABLE public.sales_invoices ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid';
ALTER TABLE public.sales_invoices ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.sales_invoices ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(12,2) DEFAULT 0;
ALTER TABLE public.sales_invoices ADD COLUMN IF NOT EXISTS total_qty DECIMAL(12,2) DEFAULT 0;
ALTER TABLE public.sales_invoices ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR';
ALTER TABLE public.sales_invoices ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.sales_invoices ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;

-- ── sales_invoice_items — missing columns ────────────────────────────────────
ALTER TABLE public.sales_invoice_items ADD COLUMN IF NOT EXISTS product_id UUID;
ALTER TABLE public.sales_invoice_items ADD COLUMN IF NOT EXISTS item_code TEXT;
ALTER TABLE public.sales_invoice_items ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.sales_invoice_items ADD COLUMN IF NOT EXISTS uom TEXT DEFAULT 'PCS';
ALTER TABLE public.sales_invoice_items ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 0;
ALTER TABLE public.sales_invoice_items ADD COLUMN IF NOT EXISTS discount_pct DECIMAL(5,2) DEFAULT 0;
ALTER TABLE public.sales_invoice_items ADD COLUMN IF NOT EXISTS hsn_code TEXT;
ALTER TABLE public.sales_invoice_items ADD COLUMN IF NOT EXISTS amount DECIMAL(12,2) DEFAULT 0;
ALTER TABLE public.sales_invoice_items ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- ── purchase_orders — missing columns ────────────────────────────────────────
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS reference_no VARCHAR(100);
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS vendor_name VARCHAR(255);
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS vendor_gstin VARCHAR(100);
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS vendor_email TEXT;
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS vendor_phone TEXT;
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS vendor_address TEXT;
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS delivery_address TEXT;
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS expected_delivery DATE;
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS payment_terms TEXT;
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS procurement_type VARCHAR(100);
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(12,2) DEFAULT 0;
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS total_qty DECIMAL(12,2) DEFAULT 0;
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR';
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;

-- ── purchase_bills — missing columns ─────────────────────────────────────────
ALTER TABLE public.purchase_bills ADD COLUMN IF NOT EXISTS reference_no VARCHAR(100);
ALTER TABLE public.purchase_bills ADD COLUMN IF NOT EXISTS vendor_name VARCHAR(255);
ALTER TABLE public.purchase_bills ADD COLUMN IF NOT EXISTS vendor_gstin VARCHAR(100);
ALTER TABLE public.purchase_bills ADD COLUMN IF NOT EXISTS vendor_email TEXT;
ALTER TABLE public.purchase_bills ADD COLUMN IF NOT EXISTS grn_reference VARCHAR(100);
ALTER TABLE public.purchase_bills ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE public.purchase_bills ADD COLUMN IF NOT EXISTS subtotal DECIMAL(12,2) DEFAULT 0;
ALTER TABLE public.purchase_bills ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(12,2) DEFAULT 0;
ALTER TABLE public.purchase_bills ADD COLUMN IF NOT EXISTS cess_amount DECIMAL(12,2) DEFAULT 0;
ALTER TABLE public.purchase_bills ADD COLUMN IF NOT EXISTS round_off DECIMAL(12,2) DEFAULT 0;
ALTER TABLE public.purchase_bills ADD COLUMN IF NOT EXISTS grand_total DECIMAL(12,2) DEFAULT 0;
ALTER TABLE public.purchase_bills ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(12,2) DEFAULT 0;
ALTER TABLE public.purchase_bills ADD COLUMN IF NOT EXISTS total_qty DECIMAL(12,2) DEFAULT 0;
ALTER TABLE public.purchase_bills ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid';
ALTER TABLE public.purchase_bills ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.purchase_bills ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR';
ALTER TABLE public.purchase_bills ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.purchase_bills ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;

-- ── crm_deals — missing columns ──────────────────────────────────────────────
ALTER TABLE public.crm_deals ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE public.crm_deals ADD COLUMN IF NOT EXISTS stage VARCHAR(50);
ALTER TABLE public.crm_deals ADD COLUMN IF NOT EXISTS priority VARCHAR(50) DEFAULT 'Medium';
ALTER TABLE public.crm_deals ADD COLUMN IF NOT EXISTS expected_closing DATE;
ALTER TABLE public.crm_deals ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.crm_deals ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;

-- ── crm_leads — missing columns ──────────────────────────────────────────────
ALTER TABLE public.crm_leads ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
ALTER TABLE public.crm_leads ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE public.crm_leads ADD COLUMN IF NOT EXISTS phone VARCHAR(100);
ALTER TABLE public.crm_leads ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);
ALTER TABLE public.crm_leads ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE public.crm_leads ADD COLUMN IF NOT EXISTS priority VARCHAR(50) DEFAULT 'Medium';
ALTER TABLE public.crm_leads ADD COLUMN IF NOT EXISTS pipeline VARCHAR(100);
ALTER TABLE public.crm_leads ADD COLUMN IF NOT EXISTS contact VARCHAR(255);
ALTER TABLE public.crm_leads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.crm_leads ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;

-- ── crm_accounts — missing columns ───────────────────────────────────────────
ALTER TABLE public.crm_accounts ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE public.crm_accounts ADD COLUMN IF NOT EXISTS industry VARCHAR(100);
ALTER TABLE public.crm_accounts ADD COLUMN IF NOT EXISTS website VARCHAR(255);
ALTER TABLE public.crm_accounts ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;

-- ── hrms_employees — missing columns ─────────────────────────────────────────
ALTER TABLE public.hrms_employees ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE public.hrms_employees ADD COLUMN IF NOT EXISTS contact VARCHAR(100);
ALTER TABLE public.hrms_employees ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE public.hrms_employees ADD COLUMN IF NOT EXISTS joining_date DATE;
ALTER TABLE public.hrms_employees ADD COLUMN IF NOT EXISTS designation_id UUID;
ALTER TABLE public.hrms_employees ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;

-- ── master_contacts — missing columns ────────────────────────────────────────
ALTER TABLE public.master_contacts ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE public.master_contacts ADD COLUMN IF NOT EXISTS customer_group VARCHAR(100);
ALTER TABLE public.master_contacts ADD COLUMN IF NOT EXISTS contact_person VARCHAR(255);
ALTER TABLE public.master_contacts ADD COLUMN IF NOT EXISTS designation VARCHAR(100);
ALTER TABLE public.master_contacts ADD COLUMN IF NOT EXISTS industry VARCHAR(100);
ALTER TABLE public.master_contacts ADD COLUMN IF NOT EXISTS credit_limit DECIMAL(12,2) DEFAULT 0;
ALTER TABLE public.master_contacts ADD COLUMN IF NOT EXISTS payment_terms VARCHAR(255);
ALTER TABLE public.master_contacts ADD COLUMN IF NOT EXISTS gstin VARCHAR(100);
ALTER TABLE public.master_contacts ADD COLUMN IF NOT EXISTS pan VARCHAR(100);
ALTER TABLE public.master_contacts ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.master_contacts ADD COLUMN IF NOT EXISTS bank_details TEXT;
ALTER TABLE public.master_contacts ADD COLUMN IF NOT EXISTS rating DECIMAL(3,1);
ALTER TABLE public.master_contacts ADD COLUMN IF NOT EXISTS contact_info TEXT;
ALTER TABLE public.master_contacts ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE public.master_contacts ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;

-- ── master_chart_of_accounts — missing columns ──────────────────────────────
ALTER TABLE public.master_chart_of_accounts ADD COLUMN IF NOT EXISTS balance DECIMAL(15,2) DEFAULT 0;
ALTER TABLE public.master_chart_of_accounts ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active';

-- ── master_users — missing columns ───────────────────────────────────────────
ALTER TABLE public.master_users ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

-- ── master_brands — missing columns ──────────────────────────────────────────
ALTER TABLE public.master_brands ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.master_brands ADD COLUMN IF NOT EXISTS manufacturer VARCHAR(255);

-- ── master_categories — missing columns ──────────────────────────────────────
ALTER TABLE public.master_categories ADD COLUMN IF NOT EXISTS image_url TEXT;

-- ── master_items — extra missing columns ─────────────────────────────────────
ALTER TABLE public.master_items ADD COLUMN IF NOT EXISTS long_description TEXT;

-- ── whatsapp_accounts — missing columns ──────────────────────────────────────
ALTER TABLE public.whatsapp_accounts ADD COLUMN IF NOT EXISTS display_name VARCHAR(255);
ALTER TABLE public.whatsapp_accounts ADD COLUMN IF NOT EXISTS phone_number_id VARCHAR(100);
ALTER TABLE public.whatsapp_accounts ADD COLUMN IF NOT EXISTS waba_id VARCHAR(100);
ALTER TABLE public.whatsapp_accounts ADD COLUMN IF NOT EXISTS access_token TEXT;

-- ── whatsapp_templates — missing columns ─────────────────────────────────────
ALTER TABLE public.whatsapp_templates ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE public.whatsapp_templates ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE public.whatsapp_templates ADD COLUMN IF NOT EXISTS language VARCHAR(50) DEFAULT 'en';
ALTER TABLE public.whatsapp_templates ADD COLUMN IF NOT EXISTS structure TEXT;

-- ── whatsapp_logs — missing columns ──────────────────────────────────────────
ALTER TABLE public.whatsapp_logs ADD COLUMN IF NOT EXISTS contact VARCHAR(255);
ALTER TABLE public.whatsapp_logs ADD COLUMN IF NOT EXISTS direction VARCHAR(50);
ALTER TABLE public.whatsapp_logs ADD COLUMN IF NOT EXISTS message TEXT;

-- ── ecom_orders — missing columns ────────────────────────────────────────────
ALTER TABLE public.ecom_orders ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;


-- ========================================================================================
-- SECTION 2: CREATE NEW TABLES
-- Order: web_templates BEFORE web_pages FK, web_groups BEFORE web_registrations,
--        web_registrations BEFORE web_payments/web_credentials,
--        web_events BEFORE web_event_registrations,
--        web_forms BEFORE web_form_submissions,
--        web_pricing BEFORE web_pricing_items
-- ========================================================================================

-- Web Media (media library)
CREATE TABLE IF NOT EXISTS public.web_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    title VARCHAR(500) NOT NULL,
    file_name VARCHAR(500) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50) DEFAULT 'image',
    mime_type VARCHAR(100),
    file_size BIGINT,
    width INT,
    height INT,
    alt_text VARCHAR(500),
    caption TEXT,
    folder VARCHAR(255) DEFAULT 'general',
    tags JSONB DEFAULT '[]'::jsonb,
    is_public BOOLEAN DEFAULT false,
    storage_path TEXT,
    thumbnail_url TEXT,
    custom_fields JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Web Templates (page/section/email templates) — MUST be created before web_pages FK
CREATE TABLE IF NOT EXISTS public.web_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    template_type VARCHAR(50) DEFAULT 'page',
    thumbnail_url TEXT,
    html_content TEXT,
    css_content TEXT,
    config JSONB DEFAULT '{}'::jsonb,
    is_system BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    custom_fields JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(company_id, slug)
);

-- Web Page Sections (page builder blocks)
CREATE TABLE IF NOT EXISTS public.web_page_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    page_id UUID NOT NULL REFERENCES public.web_pages(id) ON DELETE CASCADE,
    section_type VARCHAR(100) DEFAULT 'content',
    title VARCHAR(500),
    content TEXT,
    config JSONB DEFAULT '{}'::jsonb,
    media_url TEXT,
    sort_order INT DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Web Components (reusable content blocks)
CREATE TABLE IF NOT EXISTS public.web_components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    component_type VARCHAR(100) NOT NULL,
    content TEXT,
    config JSONB DEFAULT '{}'::jsonb,
    thumbnail_url TEXT,
    is_global BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    custom_fields JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(company_id, slug)
);

-- Web Forms (custom form builder) — MUST be created before web_form_submissions
CREATE TABLE IF NOT EXISTS public.web_forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    fields JSONB NOT NULL DEFAULT '[]'::jsonb,
    success_message TEXT DEFAULT 'Thank you for your submission!',
    redirect_url VARCHAR(500),
    email_notify VARCHAR(500),
    is_published BOOLEAN DEFAULT true,
    submit_button_text VARCHAR(100) DEFAULT 'Submit',
    max_submissions INT,
    closes_at TIMESTAMP WITH TIME ZONE,
    custom_fields JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(company_id, slug)
);

-- Web Form Submissions
CREATE TABLE IF NOT EXISTS public.web_form_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    form_id UUID NOT NULL REFERENCES public.web_forms(id) ON DELETE CASCADE,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    submitter_name VARCHAR(255),
    submitter_email VARCHAR(255),
    submitter_ip VARCHAR(50),
    status VARCHAR(50) DEFAULT 'new',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Web SEO Meta
CREATE TABLE IF NOT EXISTS public.web_seo_meta (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    meta_title VARCHAR(500),
    meta_description TEXT,
    og_title VARCHAR(500),
    og_description TEXT,
    og_image TEXT,
    canonical_url VARCHAR(500),
    robots VARCHAR(100) DEFAULT 'index,follow',
    structured_data JSONB,
    keywords TEXT,
    focus_keyphrase VARCHAR(255),
    seo_score INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(entity_type, entity_id)
);

-- Web Content Versions
CREATE TABLE IF NOT EXISTS public.web_content_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    version_number INT NOT NULL DEFAULT 1,
    title VARCHAR(500),
    content_snapshot JSONB NOT NULL,
    change_summary VARCHAR(500),
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Web Groups (batch, cohort, section, time-slot) — MUST be created before web_registrations
CREATE TABLE IF NOT EXISTS public.web_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    item_id UUID NOT NULL REFERENCES public.master_items(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100),
    start_date DATE,
    end_date DATE,
    schedule TEXT,
    max_capacity INT,
    registered_count INT DEFAULT 0,
    facilitator_name VARCHAR(255),
    facilitator_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    venue VARCHAR(500),
    delivery_mode VARCHAR(50) DEFAULT 'offline',
    meeting_link TEXT,
    status VARCHAR(50) DEFAULT 'upcoming',
    is_registration_open BOOLEAN DEFAULT true,
    notes TEXT,
    custom_fields JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Web Registrations (booking, enrollment, RSVP) — MUST be created before web_payments/web_credentials
CREATE TABLE IF NOT EXISTS public.web_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    item_id UUID NOT NULL REFERENCES public.master_items(id) ON DELETE CASCADE,
    group_id UUID REFERENCES public.web_groups(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES public.master_contacts(id) ON DELETE SET NULL,
    enquiry_id UUID REFERENCES public.web_enquiries(id) ON DELETE SET NULL,
    registration_no VARCHAR(100),
    registrant_name VARCHAR(255) NOT NULL,
    registrant_email VARCHAR(255),
    registrant_phone VARCHAR(100),
    registration_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'pending',
    payment_status VARCHAR(50) DEFAULT 'unpaid',
    total_amount DECIMAL(12,2) DEFAULT 0,
    paid_amount DECIMAL(12,2) DEFAULT 0,
    balance_amount DECIMAL(12,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    discount_reason VARCHAR(255),
    source VARCHAR(100),
    notes TEXT,
    custom_fields JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Web Schedules (session, appointment, meeting)
CREATE TABLE IF NOT EXISTS public.web_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    group_id UUID NOT NULL REFERENCES public.web_groups(id) ON DELETE CASCADE,
    item_id UUID REFERENCES public.master_items(id) ON DELETE SET NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    schedule_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    duration_minutes INT,
    schedule_type VARCHAR(50) DEFAULT 'session',
    facilitator_name VARCHAR(255),
    facilitator_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    venue VARCHAR(500),
    meeting_link TEXT,
    recording_url TEXT,
    materials_url TEXT,
    status VARCHAR(50) DEFAULT 'scheduled',
    attendance_count INT DEFAULT 0,
    notes TEXT,
    custom_fields JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Web Pricing (fee plan, pricing tier) — MUST be created before web_pricing_items
CREATE TABLE IF NOT EXISTS public.web_pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    item_id UUID NOT NULL REFERENCES public.master_items(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    pricing_type VARCHAR(100) DEFAULT 'standard',
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'INR',
    installments_allowed BOOLEAN DEFAULT false,
    installment_count INT DEFAULT 1,
    tax_inclusive BOOLEAN DEFAULT true,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    valid_from DATE,
    valid_to DATE,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    custom_fields JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Web Pricing Items (child of web_pricing)
CREATE TABLE IF NOT EXISTS public.web_pricing_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pricing_id UUID NOT NULL REFERENCES public.web_pricing(id) ON DELETE CASCADE,
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    item_label VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    is_optional BOOLEAN DEFAULT false,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Web Payments
CREATE TABLE IF NOT EXISTS public.web_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    registration_id UUID NOT NULL REFERENCES public.web_registrations(id) ON DELETE CASCADE,
    receipt_no VARCHAR(100),
    amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    payment_date DATE DEFAULT CURRENT_DATE,
    payment_mode VARCHAR(50) DEFAULT 'online',
    transaction_id VARCHAR(255),
    gateway VARCHAR(100),
    receipt_voucher_id UUID REFERENCES public.receipt_vouchers(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'completed',
    notes TEXT,
    custom_fields JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Web Credentials (certificate, badge, license)
CREATE TABLE IF NOT EXISTS public.web_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    registration_id UUID NOT NULL REFERENCES public.web_registrations(id) ON DELETE CASCADE,
    item_id UUID REFERENCES public.master_items(id) ON DELETE SET NULL,
    credential_no VARCHAR(100) NOT NULL,
    credential_type VARCHAR(50) DEFAULT 'certificate',
    recipient_name VARCHAR(255) NOT NULL,
    offering_name VARCHAR(255),
    item_name VARCHAR(255),
    issue_date DATE DEFAULT CURRENT_DATE,
    expiry_date DATE,
    grade VARCHAR(50),
    score DECIMAL(5,2),
    template_id UUID REFERENCES public.web_templates(id) ON DELETE SET NULL,
    document_url TEXT,
    verification_code VARCHAR(100),
    status VARCHAR(50) DEFAULT 'issued',
    notes TEXT,
    custom_fields JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(company_id, credential_no)
);

-- Web Events (public events/webinars) — MUST be created before web_event_registrations
CREATE TABLE IF NOT EXISTS public.web_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500),
    description TEXT,
    event_type VARCHAR(100) DEFAULT 'event',
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    venue VARCHAR(500),
    address TEXT,
    meeting_link TEXT,
    mode VARCHAR(50) DEFAULT 'offline',
    image_url TEXT,
    max_attendees INT,
    registration_count INT DEFAULT 0,
    is_free BOOLEAN DEFAULT true,
    ticket_price DECIMAL(12,2) DEFAULT 0,
    registration_url TEXT,
    organizer_name VARCHAR(255),
    contact_email VARCHAR(255),
    tags JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(50) DEFAULT 'upcoming',
    is_published BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    sort_order INT DEFAULT 0,
    custom_fields JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(company_id, slug)
);

-- Web Event Registrations
CREATE TABLE IF NOT EXISTS public.web_event_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    event_id UUID NOT NULL REFERENCES public.web_events(id) ON DELETE CASCADE,
    attendee_name VARCHAR(255) NOT NULL,
    attendee_email VARCHAR(255),
    attendee_phone VARCHAR(100),
    contact_id UUID REFERENCES public.master_contacts(id) ON DELETE SET NULL,
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    status VARCHAR(50) DEFAULT 'registered',
    ticket_no VARCHAR(100),
    notes TEXT,
    custom_fields JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Web Testimonials
CREATE TABLE IF NOT EXISTS public.web_testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    author_name VARCHAR(255) NOT NULL,
    author_title VARCHAR(255),
    author_avatar TEXT,
    item_id UUID REFERENCES public.master_items(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    video_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    custom_fields JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Web Automation Rules
CREATE TABLE IF NOT EXISTS public.web_automation_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger_event VARCHAR(100) NOT NULL,
    trigger_entity VARCHAR(100),
    conditions JSONB DEFAULT '{}'::jsonb,
    actions JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    run_count INT DEFAULT 0,
    last_run_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Web API Keys
CREATE TABLE IF NOT EXISTS public.web_api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    api_key VARCHAR(255) NOT NULL,
    secret_hash VARCHAR(255),
    permissions JSONB DEFAULT '[]'::jsonb,
    rate_limit INT DEFAULT 1000,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Web Translations
CREATE TABLE IF NOT EXISTS public.web_translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    locale VARCHAR(10) NOT NULL,
    field_key VARCHAR(100) NOT NULL,
    translated_value TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(entity_type, entity_id, locale, field_key)
);

-- Web Custom Field Definitions (system table)
CREATE TABLE IF NOT EXISTS public.web_custom_field_defs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    target_table VARCHAR(100) NOT NULL,
    field_key VARCHAR(100) NOT NULL,
    field_label VARCHAR(255) NOT NULL,
    field_type VARCHAR(50) NOT NULL DEFAULT 'text',
    options JSONB DEFAULT '[]'::jsonb,
    placeholder VARCHAR(255),
    default_value TEXT,
    is_required BOOLEAN DEFAULT false,
    is_visible BOOLEAN DEFAULT true,
    section VARCHAR(50) DEFAULT 'custom',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(company_id, target_table, field_key)
);


-- ========================================================================================
-- SECTION 3: ADD DEFERRED FK CONSTRAINTS
-- ========================================================================================

-- Add template_id FK from web_pages to web_templates (only if web_templates exists and constraint missing)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'web_pages_template_id_fkey'
    ) AND EXISTS (
        SELECT 1 FROM pg_tables WHERE tablename = 'web_templates'
    ) THEN
        ALTER TABLE public.web_pages ADD CONSTRAINT web_pages_template_id_fkey
            FOREIGN KEY (template_id) REFERENCES public.web_templates(id) ON DELETE SET NULL;
    END IF;
END $$;


-- ========================================================================================
-- SECTION 4: INDEXES FOR NEW TABLES
-- ========================================================================================

-- Company-scoped indexes (tenant partition)
CREATE INDEX IF NOT EXISTS idx_web_media_company ON public.web_media(company_id);
CREATE INDEX IF NOT EXISTS idx_web_templates_company ON public.web_templates(company_id);
CREATE INDEX IF NOT EXISTS idx_web_page_sections_company ON public.web_page_sections(company_id);
CREATE INDEX IF NOT EXISTS idx_web_components_company ON public.web_components(company_id);
CREATE INDEX IF NOT EXISTS idx_web_forms_company ON public.web_forms(company_id);
CREATE INDEX IF NOT EXISTS idx_web_form_submissions_company ON public.web_form_submissions(company_id);
CREATE INDEX IF NOT EXISTS idx_web_seo_meta_company ON public.web_seo_meta(company_id);
CREATE INDEX IF NOT EXISTS idx_web_content_versions_company ON public.web_content_versions(company_id);
CREATE INDEX IF NOT EXISTS idx_web_groups_company ON public.web_groups(company_id);
CREATE INDEX IF NOT EXISTS idx_web_registrations_company ON public.web_registrations(company_id);
CREATE INDEX IF NOT EXISTS idx_web_schedules_company ON public.web_schedules(company_id);
CREATE INDEX IF NOT EXISTS idx_web_pricing_company ON public.web_pricing(company_id);
CREATE INDEX IF NOT EXISTS idx_web_pricing_items_company ON public.web_pricing_items(company_id);
CREATE INDEX IF NOT EXISTS idx_web_payments_company ON public.web_payments(company_id);
CREATE INDEX IF NOT EXISTS idx_web_credentials_company ON public.web_credentials(company_id);
CREATE INDEX IF NOT EXISTS idx_web_events_company ON public.web_events(company_id);
CREATE INDEX IF NOT EXISTS idx_web_event_registrations_company ON public.web_event_registrations(company_id);
CREATE INDEX IF NOT EXISTS idx_web_testimonials_company ON public.web_testimonials(company_id);
CREATE INDEX IF NOT EXISTS idx_web_automation_rules_company ON public.web_automation_rules(company_id);
CREATE INDEX IF NOT EXISTS idx_web_api_keys_company ON public.web_api_keys(company_id);
CREATE INDEX IF NOT EXISTS idx_web_translations_company ON public.web_translations(company_id);
CREATE INDEX IF NOT EXISTS idx_web_cfd_company ON public.web_custom_field_defs(company_id);
CREATE INDEX IF NOT EXISTS idx_web_cfd_target ON public.web_custom_field_defs(company_id, target_table);

-- FK / relationship indexes
CREATE INDEX IF NOT EXISTS idx_web_page_sections_page ON public.web_page_sections(page_id);
CREATE INDEX IF NOT EXISTS idx_web_form_submissions_form ON public.web_form_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_web_groups_item ON public.web_groups(item_id);
CREATE INDEX IF NOT EXISTS idx_web_registrations_item ON public.web_registrations(item_id);
CREATE INDEX IF NOT EXISTS idx_web_registrations_group ON public.web_registrations(group_id);
CREATE INDEX IF NOT EXISTS idx_web_schedules_group ON public.web_schedules(group_id);
CREATE INDEX IF NOT EXISTS idx_web_schedules_item ON public.web_schedules(item_id);
CREATE INDEX IF NOT EXISTS idx_web_pricing_item ON public.web_pricing(item_id);
CREATE INDEX IF NOT EXISTS idx_web_pricing_items_pricing ON public.web_pricing_items(pricing_id);
CREATE INDEX IF NOT EXISTS idx_web_payments_registration ON public.web_payments(registration_id);
CREATE INDEX IF NOT EXISTS idx_web_credentials_registration ON public.web_credentials(registration_id);
CREATE INDEX IF NOT EXISTS idx_web_credentials_item ON public.web_credentials(item_id);
CREATE INDEX IF NOT EXISTS idx_web_event_registrations_event ON public.web_event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_web_testimonials_item ON public.web_testimonials(item_id);

-- Status / filter indexes
CREATE INDEX IF NOT EXISTS idx_web_media_file_type ON public.web_media(file_type);
CREATE INDEX IF NOT EXISTS idx_web_templates_type ON public.web_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_web_form_submissions_status ON public.web_form_submissions(status);
CREATE INDEX IF NOT EXISTS idx_web_groups_status ON public.web_groups(status);
CREATE INDEX IF NOT EXISTS idx_web_registrations_status ON public.web_registrations(status);
CREATE INDEX IF NOT EXISTS idx_web_registrations_payment_status ON public.web_registrations(payment_status);
CREATE INDEX IF NOT EXISTS idx_web_schedules_status ON public.web_schedules(status);
CREATE INDEX IF NOT EXISTS idx_web_payments_status ON public.web_payments(status);
CREATE INDEX IF NOT EXISTS idx_web_credentials_status ON public.web_credentials(status);
CREATE INDEX IF NOT EXISTS idx_web_events_status ON public.web_events(status);
CREATE INDEX IF NOT EXISTS idx_web_event_registrations_status ON public.web_event_registrations(status);

-- Slug / lookup indexes
CREATE INDEX IF NOT EXISTS idx_web_templates_slug ON public.web_templates(company_id, slug);
CREATE INDEX IF NOT EXISTS idx_web_components_slug ON public.web_components(company_id, slug);
CREATE INDEX IF NOT EXISTS idx_web_forms_slug ON public.web_forms(company_id, slug);
CREATE INDEX IF NOT EXISTS idx_web_events_slug ON public.web_events(company_id, slug);

-- Entity polymorphic indexes
CREATE INDEX IF NOT EXISTS idx_web_seo_meta_entity ON public.web_seo_meta(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_web_content_versions_entity ON public.web_content_versions(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_web_translations_entity_locale ON public.web_translations(entity_type, entity_id, locale);
CREATE INDEX IF NOT EXISTS idx_web_api_keys_key ON public.web_api_keys(api_key);
CREATE INDEX IF NOT EXISTS idx_web_credentials_verification ON public.web_credentials(verification_code);
CREATE INDEX IF NOT EXISTS idx_web_schedules_date ON public.web_schedules(company_id, schedule_date);


-- ========================================================================================
-- SECTION 5: RLS POLICIES
-- ========================================================================================

-- Helper function for company access check (CREATE OR REPLACE — safe to re-run)
CREATE OR REPLACE FUNCTION public.user_has_company_access(check_company_id BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.company_users WHERE user_id = auth.uid() AND company_id = check_company_id
  ) OR EXISTS (
    SELECT 1 FROM public.companies WHERE user_id = auth.uid() AND id = check_company_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Enable RLS + tenant_isolation + service_role_bypass for all new website tables
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        'web_media', 'web_templates', 'web_page_sections', 'web_components',
        'web_forms', 'web_form_submissions', 'web_seo_meta', 'web_content_versions',
        'web_groups', 'web_registrations', 'web_schedules',
        'web_pricing', 'web_pricing_items', 'web_payments', 'web_credentials',
        'web_events', 'web_event_registrations', 'web_testimonials',
        'web_automation_rules', 'web_api_keys', 'web_translations',
        'web_custom_field_defs'
    ]) LOOP
        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = tbl) THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);

            -- Tenant isolation policy
            EXECUTE format('DROP POLICY IF EXISTS "tenant_isolation" ON public.%I', tbl);
            EXECUTE format(
                'CREATE POLICY "tenant_isolation" ON public.%I USING (public.user_has_company_access(company_id)) WITH CHECK (public.user_has_company_access(company_id))',
                tbl
            );

            -- Service role bypass
            EXECUTE format('DROP POLICY IF EXISTS "service_role_bypass" ON public.%I', tbl);
            EXECUTE format(
                'CREATE POLICY "service_role_bypass" ON public.%I FOR ALL USING (auth.role() = ''service_role'')',
                tbl
            );
        END IF;
    END LOOP;
END $$;

-- Public read access for published website content (unauthenticated visitors)
DROP POLICY IF EXISTS "public_read_events" ON public.web_events;
CREATE POLICY "public_read_events" ON public.web_events
    FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "public_read_testimonials" ON public.web_testimonials;
CREATE POLICY "public_read_testimonials" ON public.web_testimonials
    FOR SELECT USING (is_published = true);

-- Public can submit forms
DROP POLICY IF EXISTS "public_insert_form_submissions" ON public.web_form_submissions;
CREATE POLICY "public_insert_form_submissions" ON public.web_form_submissions
    FOR INSERT WITH CHECK (true);

-- Public can register for events
DROP POLICY IF EXISTS "public_insert_event_registrations" ON public.web_event_registrations;
CREATE POLICY "public_insert_event_registrations" ON public.web_event_registrations
    FOR INSERT WITH CHECK (true);


-- ── web_payment_orders — Tracks payment intent before completion ──────────────
-- This is the bridge between "user clicked Pay" and "payment completed".
-- Razorpay/Stripe create an order first, then the payment webhook confirms it.
CREATE TABLE IF NOT EXISTS public.web_payment_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    registration_id UUID REFERENCES public.web_registrations(id) ON DELETE SET NULL,
    order_no VARCHAR(100) NOT NULL,
    amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'INR',
    gateway VARCHAR(100) NOT NULL,          -- razorpay, stripe, paytm
    gateway_order_id VARCHAR(255),          -- razorpay order_id / stripe payment_intent_id
    gateway_payment_id VARCHAR(255),        -- razorpay payment_id / stripe charge_id
    gateway_signature VARCHAR(500),         -- verification signature
    status VARCHAR(50) DEFAULT 'created',   -- created, attempted, paid, failed, refunded
    payer_name VARCHAR(255),
    payer_email VARCHAR(255),
    payer_phone VARCHAR(100),
    item_id UUID REFERENCES public.master_items(id) ON DELETE SET NULL,
    item_name VARCHAR(255),
    metadata JSONB DEFAULT '{}'::jsonb,     -- extra gateway-specific data
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_web_payment_orders_company ON public.web_payment_orders(company_id);
CREATE INDEX IF NOT EXISTS idx_web_payment_orders_status ON public.web_payment_orders(company_id, status);
CREATE INDEX IF NOT EXISTS idx_web_payment_orders_gateway ON public.web_payment_orders(gateway_order_id);
CREATE INDEX IF NOT EXISTS idx_web_payment_orders_registration ON public.web_payment_orders(registration_id);

ALTER TABLE public.web_payment_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_full_access" ON public.web_payment_orders;
CREATE POLICY "authenticated_full_access" ON public.web_payment_orders
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_read_access" ON public.web_payment_orders;
CREATE POLICY "anon_read_access" ON public.web_payment_orders
    FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS "anon_insert_payment_orders" ON public.web_payment_orders;
CREATE POLICY "anon_insert_payment_orders" ON public.web_payment_orders
    FOR INSERT TO anon WITH CHECK (true);


-- ========================================================================================
-- SECTION 6: SEED SYSTEM MODULES (required for permissions to work)
-- ========================================================================================
-- Without these rows, hasModule() check fails because system_modules is empty.
-- Uses ON CONFLICT DO UPDATE to refresh pricing/metadata if re-run.

INSERT INTO public.system_modules (slug, name, tagline, is_core, is_active, is_free, price_monthly, price_yearly, trial_days, sort_order, category, status, route, dashboard_route, icon) VALUES
    ('ecommerce',  'E-Commerce',           'Sell online with a full-featured store',                   false, true, false, 999,  9990, 14, 1,  'commerce',   'live', '/apps/ecommerce',  '/apps/ecommerce',  '🛒'),
    ('pos',        'Point of Sale',        'In-store billing at your fingertips',                      false, true, false, 499,  4990, 14, 2,  'commerce',   'beta', '/apps/pos',         '/apps/pos',        '🖥️'),
    ('crm',        'CRM',                  'Convert leads into loyal customers',                       false, true, false, 499,  4990, 14, 3,  'customer',   'beta', '/apps/crm',         '/apps/crm',        '🎯'),
    ('sales',      'Sales Management',     'Quotations and order processing',                          false, true, false, 799,  7990, 14, 4,  'commerce',   'live', '/apps/sales',       '/apps/sales',      '💼'),
    ('inventory',  'Inventory',            'Stock control across locations',                            false, true, false, 599,  5990, 14, 5,  'operations', 'live', '/apps/inventory',   '/apps/inventory',  '📦'),
    ('purchase',   'Purchase',             'Streamline procurement end-to-end',                         false, true, false, 499,  4990, 14, 6,  'operations', 'beta', '/apps/purchase',    '/apps/purchase',   '🛍️'),
    ('hrms',       'HRMS',                 'Employee operations hub',                                   false, true, false, 699,  6990, 14, 7,  'people',     'beta', '/apps/hrms',        '/apps/hrms',       '👥'),
    ('finance',    'Finance & Accounting', 'Double-entry accounting and financial reporting',           false, true, false, 799,  7990, 14, 8,  'finance',    'beta', '/apps/finance',     '/apps/finance',    '💰'),
    ('whatsapp',   'WhatsApp Integration', 'Connect customers on WhatsApp',                            false, true, false, 299,  2990, 14, 9,  'customer',   'live', '/apps/whatsapp',    '/apps/whatsapp',   '💬'),
    ('website',    'Website',              'CMS + Business Platform Engine',                            false, true, false, 599,  5990, 14, 10, 'commerce',   'live', '/apps/website',     '/apps/website',    '🌐'),
    ('masters',    'Master Data Hub',      'Centralized registry for items, contacts, tax, and more',  true,  true, true,  0,    0,    0,  99, 'operations', 'live', '/apps/masters',     '/apps/masters',    '🗄️')
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    tagline = EXCLUDED.tagline,
    is_core = EXCLUDED.is_core,
    is_free = EXCLUDED.is_free,
    price_monthly = EXCLUDED.price_monthly,
    price_yearly = EXCLUDED.price_yearly,
    trial_days = EXCLUDED.trial_days,
    sort_order = EXCLUDED.sort_order,
    category = EXCLUDED.category,
    status = EXCLUDED.status,
    route = EXCLUDED.route,
    dashboard_route = EXCLUDED.dashboard_route,
    icon = EXCLUDED.icon;


-- ========================================================================================
-- END OF MIGRATION
-- ========================================================================================
