import type { DocTypeDef } from "../types";

export const webMedia: DocTypeDef = {
  name: "Web Media",
  tableName: "web_media",
  module: "website",
  showItems: false,

  tabFields: {
    basic: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "file_name", label: "File Name", type: "text", required: true },
      { key: "file_url", label: "File", type: "image", width: "full" },
      { key: "file_type", label: "File Type", type: "select", options: [
        { value: "image", label: "Image" },
        { value: "video", label: "Video" },
        { value: "document", label: "Document" },
        { value: "audio", label: "Audio" },
      ]},
      { key: "mime_type", label: "MIME Type", type: "text" },
      { key: "alt_text", label: "Alt Text", type: "text" },
      { key: "caption", label: "Caption", type: "textarea" },
      { key: "folder", label: "Folder", type: "text", placeholder: "e.g. general, products, team" },
    ],
    config: [
      { key: "is_public", label: "Public", type: "checkbox" },
      { key: "tags", label: "Tags", type: "text", placeholder: "comma separated" },
      { key: "file_size", label: "File Size", type: "number", readOnly: true },
      { key: "width", label: "Width", type: "number", readOnly: true },
      { key: "height", label: "Height", type: "number", readOnly: true },
    ],
  },

  columns: [
    { key: "title", label: "Title" },
    { key: "file_type", label: "File Type" },
    { key: "folder", label: "Folder" },
    { key: "is_public", label: "Public" },
    { key: "created_at", label: "Created" },
  ],

  searchableFields: ["title", "alt_text", "folder"],
};
