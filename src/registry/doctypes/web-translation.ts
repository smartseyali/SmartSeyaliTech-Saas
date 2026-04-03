import type { DocTypeDef } from "../types";

export const webTranslation: DocTypeDef = {
  name: "Translation",
  tableName: "web_translations",
  module: "website",
  showItems: false,

  headerFields: [
    { key: "entity_type", label: "Entity Type", type: "select", required: true, options: [
      { value: "web_page", label: "Web Page" },
      { value: "blog_post", label: "Blog Post" },
      { value: "web_program", label: "Program" },
      { value: "web_event", label: "Event" },
      { value: "web_faq", label: "FAQ" },
    ]},
    { key: "entity_id", label: "Entity ID", type: "text", required: true, placeholder: "UUID of entity" },
    { key: "locale", label: "Locale", type: "select", required: true, options: [
      { value: "hi", label: "Hindi" },
      { value: "ta", label: "Tamil" },
      { value: "te", label: "Telugu" },
      { value: "kn", label: "Kannada" },
      { value: "ml", label: "Malayalam" },
      { value: "mr", label: "Marathi" },
      { value: "bn", label: "Bengali" },
      { value: "gu", label: "Gujarati" },
      { value: "pa", label: "Punjabi" },
      { value: "fr", label: "French" },
      { value: "es", label: "Spanish" },
      { value: "ar", label: "Arabic" },
      { value: "zh", label: "Chinese" },
    ]},
    { key: "field_key", label: "Field Key", type: "text", required: true, placeholder: "e.g. title, content, description" },
    { key: "translated_value", label: "Translated Value", type: "textarea", width: "full", required: true },
    { key: "is_approved", label: "Approved", type: "checkbox" },
  ],

  columns: [
    { key: "entity_type", label: "Entity Type" },
    { key: "locale", label: "Locale" },
    { key: "field_key", label: "Field" },
    { key: "is_approved", label: "Approved" },
    { key: "updated_at", label: "Updated" },
  ],

  searchableFields: ["entity_type", "locale", "field_key"],
};
