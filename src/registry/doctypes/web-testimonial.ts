import type { DocTypeDef } from "../types";

export const webTestimonial: DocTypeDef = {
  name: "Testimonial",
  tableName: "web_testimonials",
  module: "website",
  showItems: false,

  headerFields: [
    { key: "author_name", label: "Author Name", type: "text", required: true },
    { key: "author_title", label: "Author Title", type: "text", placeholder: "e.g. MBA 2024 Graduate, CEO at Acme" },
    { key: "author_avatar", label: "Author Avatar", type: "image" },
    { key: "item_id", label: "Related Item / Service", type: "select", lookupTable: "master_items", lookupLabel: "item_name", lookupValue: "id" },
    { key: "content", label: "Content", type: "textarea", width: "full", required: true },
    { key: "rating", label: "Rating", type: "number", placeholder: "1-5" },
    { key: "video_url", label: "Video URL", type: "text", placeholder: "YouTube/Vimeo URL" },
    { key: "is_featured", label: "Featured", type: "checkbox" },
    { key: "is_published", label: "Published", type: "checkbox" },
    { key: "sort_order", label: "Sort Order", type: "number" },
  ],

  columns: [
    { key: "author_name", label: "Author" },
    { key: "author_title", label: "Title" },
    { key: "rating", label: "Rating" },
    { key: "is_featured", label: "Featured" },
    { key: "is_published", label: "Published" },
    { key: "sort_order", label: "Order" },
  ],

  defaults: { is_published: true, sort_order: 0 },
  searchableFields: ["author_name", "author_title"],
};
