import type { DocTypeDef } from "../types";

export const platformAnnouncement: DocTypeDef = {
  name: "Announcement",
  tableName: "system_announcements",
  module: "platform",
  icon: "Megaphone",
  listTitle: "Announcements",
  formTitle: "Announcement",
  showItems: false,
  isGlobal: true,
  statusField: "severity",

  defaults: {
    severity: "info",
    audience: "all",
    is_active: true,
  },

  searchableFields: ["title", "body"],

  headerFields: [
    { key: "title", label: "Title", type: "text", required: true, placeholder: "Scheduled maintenance on Sunday" },
    {
      key: "severity", label: "Severity", type: "select",
      options: [
        { label: "Info", value: "info" },
        { label: "Warning", value: "warning" },
        { label: "Critical", value: "critical" },
        { label: "Success", value: "success" },
      ],
    },
    {
      key: "audience", label: "Audience", type: "select",
      options: [
        { label: "All Users", value: "all" },
        { label: "Tenant Admins Only", value: "admins" },
        { label: "Super Admins Only", value: "super_admins" },
      ],
    },
    { key: "body", label: "Message", type: "textarea", required: true, placeholder: "Details of the announcement…", width: "full" },
    { key: "starts_at", label: "Starts At", type: "date" },
    { key: "ends_at", label: "Ends At", type: "date" },
    { key: "is_active", label: "Active", type: "checkbox" },
  ],

  columns: [
    { key: "title", label: "Title", className: "font-semibold text-gray-900 dark:text-foreground" },
    { key: "severity", label: "Severity" },
    { key: "audience", label: "Audience" },
    { key: "starts_at", label: "Starts" },
    { key: "ends_at", label: "Ends" },
    { key: "is_active", label: "Active" },
  ],
};
