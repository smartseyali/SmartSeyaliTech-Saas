import type { DocTypeDef } from "../types";

export const webPageSection: DocTypeDef = {
  name: "Web Page Section",
  tableName: "web_page_sections",
  module: "website",
  showItems: false,

  headerFields: [
    { key: "page_id", label: "Page", type: "select", required: true, lookupTable: "web_pages", lookupLabel: "title", lookupValue: "id" },
    { key: "section_type", label: "Section Type", type: "select", required: true, options: [
      { value: "hero", label: "Hero" },
      { value: "content", label: "Content" },
      { value: "cta", label: "CTA" },
      { value: "gallery", label: "Gallery" },
      { value: "testimonials", label: "Testimonials" },
      { value: "faq", label: "FAQ" },
      { value: "form", label: "Form" },
      { value: "video", label: "Video" },
      { value: "stats", label: "Stats" },
      { value: "team", label: "Team" },
      { value: "pricing", label: "Pricing" },
      { value: "custom", label: "Custom" },
    ]},
    { key: "title", label: "Title", type: "text" },
    { key: "content", label: "Content", type: "textarea", width: "full" },
    { key: "media_url", label: "Media", type: "image" },
    { key: "sort_order", label: "Sort Order", type: "number" },
    { key: "is_visible", label: "Visible", type: "checkbox" },
  ],

  columns: [
    { key: "title", label: "Title" },
    { key: "section_type", label: "Section Type" },
    { key: "sort_order", label: "Sort Order" },
    { key: "is_visible", label: "Visible" },
  ],
};
