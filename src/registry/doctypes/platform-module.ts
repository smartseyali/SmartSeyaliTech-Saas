import type { DocTypeDef } from "../types";

export const platformModule: DocTypeDef = {
  name: "Platform Module",
  tableName: "system_modules",
  module: "platform",
  icon: "Layers",
  listTitle: "Platform Modules",
  formTitle: "Platform Module",
  showItems: false,
  isGlobal: true,

  defaults: {
    is_active: true,
    is_core: false,
    needs_template: false,
    sort_order: 0,
    status: "live",
    icon: "🚀",
    color: "#2563EB",
    color_from: "from-blue-500",
    color_to: "to-blue-700",
    technologies: "React, Supabase, PostgreSQL",
    included_in_plans: "standard, professional, enterprise, custom",
  },

  headerFields: [
    { key: "slug", label: "Unique Slug", type: "text", required: true, placeholder: "e.g. ecommerce" },
    { key: "name", label: "Display Name", type: "text", required: true, placeholder: "e.g. E-Commerce Pro" },
    { key: "tagline", label: "Short Tagline", type: "text", placeholder: "Short marketing hook" },
    { key: "description", label: "Base Description", type: "textarea", placeholder: "Technical summary" },
    { key: "long_description", label: "Detailed Overview", type: "textarea", placeholder: "Tell the full story of this module..." },
    { key: "icon", label: "Icon Emoji", type: "text", placeholder: "🚀" },
    {
      key: "category", label: "Category", type: "select",
      options: [
        { value: "commerce", label: "Commerce" },
        { value: "finance", label: "Finance" },
        { value: "operations", label: "Operations" },
        { value: "people", label: "People" },
        { value: "customer", label: "Customer" },
        { value: "analytics", label: "Analytics" },
      ],
    },
    {
      key: "status", label: "Status", type: "select",
      options: [
        { value: "live", label: "Live" },
        { value: "beta", label: "Beta" },
        { value: "coming-soon", label: "Coming Soon" },
        { value: "planned", label: "Planned" },
      ],
    },
    { key: "color", label: "Brand Color", type: "text", placeholder: "#2563EB" },
    { key: "color_from", label: "Gradient From", type: "text", placeholder: "from-blue-500" },
    { key: "color_to", label: "Gradient To", type: "text", placeholder: "to-blue-700" },
    { key: "route", label: "App Route", type: "text", placeholder: "/apps/ecommerce" },
    { key: "dashboard_route", label: "Dashboard Route", type: "text", placeholder: "/apps/ecommerce" },
    { key: "features", label: "Key Features (comma-separated)", type: "textarea", placeholder: "Feature A, Feature B, Feature C" },
    { key: "technologies", label: "Technologies (comma-separated)", type: "text", placeholder: "React, Supabase, PostgreSQL" },
    { key: "included_in_plans", label: "Included in Plans (comma-separated)", type: "text", placeholder: "standard, professional, enterprise" },
    { key: "interface_overview", label: "Interface Overview", type: "textarea", placeholder: "Explain how it looks after deployment..." },
    { key: "screenshots", label: "Screenshots (comma-separated URLs)", type: "textarea", placeholder: "https://example.com/img1.png, https://example.com/img2.png" },
    { key: "use_cases", label: "Use Cases (JSON)", type: "textarea", placeholder: '[{"title": "Retail", "description": "Manage shops", "icon": "store"}]' },
    { key: "sort_order", label: "Sort Order", type: "number", placeholder: "0" },
    {
      key: "is_core", label: "Core Module", type: "select",
      options: [
        { value: "true", label: "Yes" },
        { value: "false", label: "No" },
      ],
    },
    {
      key: "is_active", label: "Active", type: "select",
      options: [
        { value: "true", label: "Active" },
        { value: "false", label: "Disabled" },
      ],
    },
    {
      key: "needs_template", label: "Needs Template", type: "select",
      options: [
        { value: "true", label: "Yes" },
        { value: "false", label: "No" },
      ],
    },
  ],

  columns: [
    { key: "name", label: "Module Name", className: "font-bold text-slate-900" },
    { key: "slug", label: "Slug" },
    { key: "category", label: "Category" },
    { key: "status", label: "Status" },
    { key: "is_core", label: "Core" },
    { key: "is_active", label: "Active" },
    { key: "sort_order", label: "Sort" },
  ],

  statusField: "status",
};
