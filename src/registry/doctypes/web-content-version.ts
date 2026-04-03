import type { DocTypeDef } from "../types";

export const webContentVersion: DocTypeDef = {
  name: "Content Version",
  tableName: "web_content_versions",
  module: "website",
  showItems: false,

  headerFields: [
    { key: "entity_type", label: "Entity Type", type: "select", required: true, options: [
      { value: "web_page", label: "Web Page" },
      { value: "blog_post", label: "Blog Post" },
      { value: "web_template", label: "Web Template" },
    ]},
    { key: "entity_id", label: "Entity ID", type: "text", required: true },
    { key: "version_number", label: "Version", type: "number", required: true },
    { key: "title", label: "Title", type: "text" },
    { key: "change_summary", label: "Change Summary", type: "text" },
    { key: "content_snapshot", label: "Content Snapshot", type: "textarea", width: "full", readOnly: true },
    { key: "is_published", label: "Published", type: "checkbox" },
  ],

  columns: [
    { key: "entity_type", label: "Entity Type" },
    { key: "title", label: "Title" },
    { key: "version_number", label: "Version" },
    { key: "is_published", label: "Published" },
    { key: "created_at", label: "Created" },
  ],
};
