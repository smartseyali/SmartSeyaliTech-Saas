import type { DocTypeDef } from "../types";

export const platformFeatureFlag: DocTypeDef = {
  name: "Feature Flag",
  tableName: "system_feature_flags",
  module: "platform",
  icon: "ToggleRight",
  listTitle: "Feature Flags",
  formTitle: "Feature Flag",
  showItems: false,
  isGlobal: true,

  defaults: {
    is_enabled: false,
    rollout_pct: 0,
  },

  searchableFields: ["key", "name"],

  headerFields: [
    { key: "key", label: "Flag Key", type: "text", required: true, placeholder: "enable_new_dashboard" },
    { key: "name", label: "Display Name", type: "text", required: true, placeholder: "New Dashboard Layout" },
    { key: "description", label: "Description", type: "textarea", placeholder: "What does this flag control?", width: "full" },
    { key: "rollout_pct", label: "Rollout %", type: "percentage", placeholder: "0–100" },
    { key: "is_enabled", label: "Enabled", type: "checkbox" },
  ],

  columns: [
    { key: "key", label: "Key", className: "font-mono text-xs text-gray-900 dark:text-foreground" },
    { key: "name", label: "Name" },
    { key: "description", label: "Description" },
    { key: "rollout_pct", label: "Rollout" },
    { key: "is_enabled", label: "Enabled" },
  ],
};
