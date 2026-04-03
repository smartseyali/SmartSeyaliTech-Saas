import type { DocTypeDef } from "../types";

export const webPage: DocTypeDef = {
  name: "Web Page",
  tableName: "web_pages",
  module: "website",
  showItems: false,

  tabFields: {
    basic: [
      { key: "title", label: "Page Title", type: "text", required: true, placeholder: "About Us" },
      { key: "slug", label: "URL Path", type: "text", required: true, placeholder: "about-us" },
      { key: "template", label: "Template", type: "select", options: [
        { value: "default", label: "Default" },
        { value: "landing", label: "Landing Page" },
        { value: "content", label: "Content Page" },
        { value: "contact", label: "Contact Page" },
      ]},
      { key: "featured_image", label: "Featured Image", type: "image", width: "full" },
      { key: "content", label: "Page Content", type: "textarea", placeholder: "Page content (supports HTML)", width: "full" },
    ],
    config: [
      { key: "meta_title", label: "SEO Title", type: "text", placeholder: "Custom title for search engines" },
      { key: "meta_description", label: "Meta Description", type: "textarea", placeholder: "SEO description (150-160 chars)" },
      { key: "is_published", label: "Published", type: "checkbox" },
      { key: "sort_order", label: "Sort Order", type: "number" },
      { key: "template_id", label: "Page Template", type: "select", lookupTable: "web_templates", lookupLabel: "name", lookupValue: "id" },
    ],
  },

  columns: [
    { key: "title", label: "Page Title" },
    { key: "slug", label: "URL" },
    { key: "template", label: "Template" },
    { key: "is_published", label: "Status" },
    { key: "updated_at", label: "Last Updated" },
  ],
};
