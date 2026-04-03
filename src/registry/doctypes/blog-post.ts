import type { DocTypeDef } from "../types";

export const blogPost: DocTypeDef = {
  name: "Blog Post",
  tableName: "blog_posts",
  module: "website",
  showItems: false,

  tabFields: {
    basic: [
      { key: "title", label: "Title", type: "text", required: true, placeholder: "Article title" },
      { key: "slug", label: "URL Slug", type: "text", placeholder: "auto-generated-from-title" },
      { key: "author", label: "Author", type: "text", placeholder: "Author name" },
      { key: "category", label: "Category", type: "select", options: [
        { value: "News", label: "News" },
        { value: "Tutorial", label: "Tutorial" },
        { value: "Update", label: "Update" },
        { value: "Case Study", label: "Case Study" },
        { value: "Guide", label: "Guide" },
      ]},
      { key: "read_time", label: "Read Time", type: "text", placeholder: "5 min read" },
      { key: "image_url", label: "Cover Image", type: "image", width: "full" },
      { key: "excerpt", label: "Excerpt", type: "textarea", placeholder: "Brief summary shown in blog listings (1-2 sentences)", width: "full" },
      { key: "content", label: "Content", type: "textarea", placeholder: "Full article content (supports HTML)", width: "full" },
    ],
    config: [
      { key: "is_published", label: "Published", type: "checkbox" },
      { key: "sort_order", label: "Sort Order", type: "number" },
      { key: "tags", label: "Tags (comma separated)", type: "text", placeholder: "health, education, tips" },
    ],
  },

  columns: [
    { key: "title", label: "Title" },
    { key: "author", label: "Author" },
    { key: "category", label: "Category" },
    { key: "is_published", label: "Status" },
    { key: "created_at", label: "Created" },
  ],
};
