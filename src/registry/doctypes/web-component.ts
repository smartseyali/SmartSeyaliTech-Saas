import type { DocTypeDef } from "../types";

export const webComponent: DocTypeDef = {
  name: "Web Component",
  tableName: "web_components",
  module: "website",
  showItems: false,

  headerFields: [
    { key: "name", label: "Name", type: "text", required: true },
    { key: "slug", label: "Slug", type: "text", required: true },
    { key: "component_type", label: "Component Type", type: "select", required: true, options: [
      { value: "header", label: "Header" },
      { value: "footer", label: "Footer" },
      { value: "sidebar", label: "Sidebar" },
      { value: "banner", label: "Banner" },
      { value: "cta", label: "CTA" },
      { value: "testimonial_card", label: "Testimonial Card" },
      { value: "pricing_table", label: "Pricing Table" },
    ]},
    { key: "content", label: "Content", type: "textarea", width: "full" },
    { key: "config", label: "Configuration", type: "textarea", width: "full", placeholder: "JSON configuration" },
    { key: "thumbnail_url", label: "Thumbnail", type: "image" },
    { key: "is_global", label: "Global", type: "checkbox" },
    { key: "is_active", label: "Active", type: "checkbox" },
  ],

  columns: [
    { key: "name", label: "Name" },
    { key: "component_type", label: "Type" },
    { key: "is_global", label: "Global" },
    { key: "is_active", label: "Active" },
    { key: "created_at", label: "Created" },
  ],
};
