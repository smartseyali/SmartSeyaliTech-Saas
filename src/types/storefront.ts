/**
 * Storefront template registry types.
 * Mirrors the storefront_templates table created in
 * database/create_storefront_templates.sql
 */

export type StorefrontTemplateCategory = "ecommerce" | "education" | "landing_page" | "dynamic" | string;

export type ConfigField = {
    type: "text" | "tel" | "email" | "url" | "color" | "number";
    label: string;
    required?: boolean;
    placeholder?: string;
    default?: string;
};

export type PageField = {
    key: string;
    label: string;
    type: "text" | "textarea" | "markdown" | "json" | "number" | "url";
    placeholder?: string;
};

export type TemplatePage = {
    slug: string;
    title: string;
    file: string;
    icon?: string;
    is_editable: boolean;
    fields: PageField[];
};

export type StorefrontTemplate = {
    id: number;
    slug: string;
    name: string;
    description: string | null;
    category: StorefrontTemplateCategory;
    module_id: string | null;
    entry_path: string;
    thumbnail_url: string | null;
    preview_url: string | null;
    tags: string[];
    features: string[];
    config_schema: Record<string, ConfigField>;
    pages: TemplatePage[];
    is_active: boolean;
    is_premium: boolean;
    price: number;
    sort_order: number;
    author: string;
    version: string;
    created_at: string;
    updated_at: string;
};

/**
 * Per-tenant overrides stored on companies.template_config.
 * Keys should match a template's config_schema.
 */
export type TemplateConfigOverrides = Record<string, string | number | null>;

/**
 * Runtime config passed to a template via URL query params.
 * Templates parse these in their own config.js bootstrap.
 */
export type StorefrontRuntimeConfig = {
    company_id: string | number;
    supabase_url: string;
    anon_key: string;
    template_slug?: string;
    /** Serialized JSON of TemplateConfigOverrides */
    overrides?: string;
};
