import type { DocTypeDef } from "../types";

export const galleryItem: DocTypeDef = {
  name: "Gallery Item",
  tableName: "gallery_items",
  module: "website",
  showItems: false,

  headerFields: [
    { key: "title", label: "Title", type: "text", required: true, placeholder: "Image or video title" },
    { key: "description", label: "Description", type: "textarea", placeholder: "Brief description" },
    { key: "media_url", label: "Media", type: "image", width: "full" },
    { key: "media_type", label: "Media Type", type: "select", options: [
      { value: "image", label: "Image" },
      { value: "video", label: "Video" },
    ]},
    { key: "category", label: "Category", type: "text", placeholder: "e.g. Events, Campus, Team" },
    { key: "is_featured", label: "Featured", type: "checkbox" },
    { key: "display_order", label: "Sort Order", type: "number" },
  ],

  columns: [
    { key: "title", label: "Title" },
    { key: "media_type", label: "Type" },
    { key: "category", label: "Category" },
    { key: "is_featured", label: "Featured" },
    { key: "display_order", label: "Order" },
    { key: "created_at", label: "Added" },
  ],
};
