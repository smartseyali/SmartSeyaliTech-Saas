import type { DocTypeDef } from "../types";

export const webTemplate: DocTypeDef = {
  name: "Web Template",
  tableName: "web_templates",
  module: "website",
  showItems: false,

  tabFields: {
    basic: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "slug", label: "Slug", type: "text", required: true },
      { key: "template_type", label: "Template Type", type: "select", options: [
        { value: "page", label: "Page" },
        { value: "section", label: "Section" },
        { value: "header", label: "Header" },
        { value: "footer", label: "Footer" },
        { value: "email", label: "Email" },
        { value: "certificate", label: "Certificate" },
      ]},
      { key: "description", label: "Description", type: "textarea" },
      { key: "thumbnail_url", label: "Thumbnail", type: "image" },
    ],
    config: [
      { key: "html_content", label: "HTML Content", type: "textarea", width: "full", placeholder: "HTML template" },
      { key: "css_content", label: "CSS Content", type: "textarea", width: "full", placeholder: "Custom CSS" },
      { key: "config", label: "Configuration", type: "textarea", width: "full", placeholder: "JSON configuration" },
      { key: "is_system", label: "System Template", type: "checkbox" },
      { key: "is_active", label: "Active", type: "checkbox" },
      { key: "sort_order", label: "Sort Order", type: "number" },
    ],
  },

  columns: [
    { key: "name", label: "Name" },
    { key: "template_type", label: "Type" },
    { key: "is_system", label: "System" },
    { key: "is_active", label: "Active" },
    { key: "sort_order", label: "Sort Order" },
  ],
};
