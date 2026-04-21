import type { DocTypeDef } from "../types";

export const platformEmailTemplate: DocTypeDef = {
  name: "Email Template",
  tableName: "system_email_templates",
  module: "platform",
  icon: "Mail",
  listTitle: "Email Templates",
  formTitle: "Email Template",
  showItems: false,
  isGlobal: true,

  defaults: {
    is_active: true,
  },

  searchableFields: ["key", "name", "subject"],

  headerFields: [
    { key: "key", label: "Template Key", type: "text", required: true, placeholder: "welcome, verify_email, reset_password" },
    { key: "name", label: "Template Name", type: "text", required: true, placeholder: "User Welcome Email" },
    { key: "subject", label: "Email Subject", type: "text", required: true, placeholder: "Welcome to {{platform_name}}" },
  ],

  tabFields: {
    basic: [
      { key: "body_html", label: "HTML Body", type: "textarea", placeholder: "<p>Hi {{name}}, welcome!</p>", width: "full" },
      { key: "body_text", label: "Plain Text Body", type: "textarea", placeholder: "Hi {{name}}, welcome!", width: "full" },
      { key: "is_active", label: "Active", type: "checkbox" },
    ],
  },

  columns: [
    { key: "key", label: "Key", className: "font-mono text-xs text-gray-900 dark:text-foreground" },
    { key: "name", label: "Template Name" },
    { key: "subject", label: "Subject" },
    { key: "is_active", label: "Active" },
  ],
};
