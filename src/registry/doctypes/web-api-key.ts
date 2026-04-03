import type { DocTypeDef } from "../types";

export const webApiKey: DocTypeDef = {
  name: "API Key",
  tableName: "web_api_keys",
  module: "website",
  showItems: false,

  headerFields: [
    { key: "name", label: "Key Name", type: "text", required: true, placeholder: "My API Key" },
    { key: "api_key", label: "API Key", type: "text", required: true, readOnly: true },
    { key: "permissions", label: "Permissions", type: "textarea", width: "full", placeholder: "Define allowed permissions" },
    { key: "rate_limit", label: "Rate Limit", type: "number", placeholder: "1000" },
    { key: "is_active", label: "Active", type: "checkbox" },
    { key: "expires_at", label: "Expires At", type: "datetime-local" },
    { key: "last_used_at", label: "Last Used At", type: "datetime-local", readOnly: true },
  ],

  columns: [
    { key: "name", label: "Key Name" },
    { key: "api_key", label: "API Key" },
    { key: "is_active", label: "Active" },
    { key: "rate_limit", label: "Rate Limit" },
    { key: "last_used_at", label: "Last Used" },
    { key: "created_at", label: "Created" },
  ],

  defaults: { is_active: true, rate_limit: 1000 },
};
