import type { DocTypeDef } from "../types";

export const webForm: DocTypeDef = {
  name: "Web Form",
  tableName: "web_forms",
  module: "website",
  showItems: false,

  tabFields: {
    basic: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "slug", label: "Slug", type: "text", required: true },
      { key: "description", label: "Description", type: "textarea" },
      { key: "fields", label: "Fields", type: "textarea", width: "full", placeholder: "Define form fields" },
      { key: "submit_button_text", label: "Submit Button Text", type: "text" },
      { key: "success_message", label: "Success Message", type: "textarea" },
    ],
    config: [
      { key: "email_notify", label: "Notification Email", type: "email", placeholder: "Notification email" },
      { key: "redirect_url", label: "Redirect URL", type: "text" },
      { key: "is_published", label: "Published", type: "checkbox" },
      { key: "max_submissions", label: "Max Submissions", type: "number" },
      { key: "closes_at", label: "Closes At", type: "datetime-local" },
    ],
  },

  columns: [
    { key: "name", label: "Name" },
    { key: "slug", label: "Slug" },
    { key: "is_published", label: "Published" },
    { key: "created_at", label: "Created" },
  ],

  searchableFields: ["name", "slug"],
};
