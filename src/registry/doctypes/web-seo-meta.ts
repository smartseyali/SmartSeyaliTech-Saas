import type { DocTypeDef } from "../types";

export const webSeoMeta: DocTypeDef = {
  name: "SEO Meta",
  tableName: "web_seo_meta",
  module: "website",
  showItems: false,

  headerFields: [
    { key: "entity_type", label: "Entity Type", type: "select", required: true, options: [
      { value: "web_page", label: "Web Page" },
      { value: "blog_post", label: "Blog Post" },
      { value: "web_program", label: "Web Program" },
      { value: "web_event", label: "Web Event" },
    ]},
    { key: "entity_id", label: "Entity ID", type: "text", required: true, placeholder: "Select or enter the page/post ID" },
    { key: "meta_title", label: "Meta Title", type: "text" },
    { key: "meta_description", label: "Meta Description", type: "textarea" },
    { key: "og_title", label: "OG Title", type: "text" },
    { key: "og_description", label: "OG Description", type: "textarea" },
    { key: "og_image", label: "OG Image", type: "image" },
    { key: "canonical_url", label: "Canonical URL", type: "text" },
    { key: "robots", label: "Robots", type: "text", placeholder: "index,follow" },
    { key: "keywords", label: "Keywords", type: "text" },
    { key: "focus_keyphrase", label: "Focus Keyphrase", type: "text" },
    { key: "seo_score", label: "SEO Score", type: "number", readOnly: true },
  ],

  columns: [
    { key: "entity_type", label: "Entity Type" },
    { key: "meta_title", label: "Meta Title" },
    { key: "focus_keyphrase", label: "Focus Keyphrase" },
    { key: "seo_score", label: "SEO Score" },
    { key: "updated_at", label: "Updated" },
  ],
};
