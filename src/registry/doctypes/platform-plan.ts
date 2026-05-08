import type { DocTypeDef } from "../types";

// Manages subscription bundle tiers shown on the marketing pricing page.
// Table: pricing_plans  (RLS: public read, super-admin write)
export const platformPlan: DocTypeDef = {
  name: "Pricing Plan",
  tableName: "pricing_plans",
  module: "platform",
  icon: "CreditCard",
  listTitle: "Pricing Plans",
  formTitle: "Pricing Plan",
  showItems: false,
  isGlobal: true,

  defaults: {
    is_highlighted: false,
    is_published: true,
    sort_order: 0,
    price_monthly: 0,
    price_yearly: 0,
    cta_label: "Start Free Trial",
  },

  headerFields: [
    // ── Identity ─────────────────────────────────────────────────
    { key: "name",          label: "Plan Name",           type: "text",   required: true, placeholder: "e.g. Growth" },
    { key: "tagline",       label: "Tagline",             type: "text",   placeholder: "e.g. For growing businesses" },

    // ── Pricing ──────────────────────────────────────────────────
    { key: "price_monthly", label: "Monthly Price (₹)",   type: "number", placeholder: "0" },
    { key: "price_yearly",  label: "Yearly Price (₹)",    type: "number", placeholder: "0" },
    { key: "trial_days",    label: "Free Trial Days",      type: "number", placeholder: "14" },
    { key: "sort_order",    label: "Sort Order",          type: "number", placeholder: "0" },

    // ── Features ─────────────────────────────────────────────────
    {
      key: "features",
      label: "Included Features (one per line or comma-separated)",
      type: "textarea",
      placeholder: "All core modules\nUnlimited users\nPriority support",
    },
    {
      key: "not_included",
      label: "Not Included (one per line or comma-separated)",
      type: "textarea",
      placeholder: "Custom integrations\nDedicated account manager",
    },

    // ── Modules included in this plan ───────────────────────────
    {
      key: "modules_included",
      label: "Modules Included",
      type: "multiselect",
      lookupTable: "system_modules",
      lookupLabel: "name",
      lookupValue: "slug",
      lookupFilter: { is_active: true },
    },

    // ── CTA ──────────────────────────────────────────────────────
    { key: "cta_label",     label: "CTA Button Label",    type: "text",   placeholder: "Start Free Trial" },
    { key: "cta_href",      label: "CTA Button Link (leave blank to auto-link to /onboarding)", type: "text", placeholder: "/contact?plan=enterprise (optional)" },

    // ── Display flags ────────────────────────────────────────────
    {
      key: "is_highlighted",
      label: "Most Popular (highlight on pricing page)",
      type: "select",
      options: [
        { value: "true",  label: "Yes — show 'Most Popular' badge" },
        { value: "false", label: "No" },
      ],
    },
    {
      key: "is_published",
      label: "Visibility",
      type: "select",
      options: [
        { value: "true",  label: "Published — visible on pricing page" },
        { value: "false", label: "Draft — hidden from pricing page" },
      ],
    },
  ],

  columns: [
    { key: "name",          label: "Plan Name",   className: "font-bold text-slate-900" },
    { key: "price_monthly", label: "Monthly (₹)" },
    { key: "price_yearly",  label: "Yearly (₹)" },
    { key: "sort_order",    label: "Sort" },
    { key: "is_highlighted", label: "Featured" },
    { key: "is_published",  label: "Published" },
  ],
};
