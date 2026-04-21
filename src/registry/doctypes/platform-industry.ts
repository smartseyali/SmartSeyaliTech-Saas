import type { DocTypeDef } from "../types";

export const platformIndustry: DocTypeDef = {
  name: "Industry",
  tableName: "system_industries",
  module: "platform",
  icon: "Factory",
  listTitle: "Industries",
  formTitle: "Industry",
  showItems: false,
  isGlobal: true,

  defaults: {
    is_active: true,
    sort_order: 0,
  },

  searchableFields: ["slug", "name"],

  headerFields: [
    { key: "slug", label: "Slug", type: "text", required: true, placeholder: "retail, healthcare" },
    { key: "name", label: "Name", type: "text", required: true, placeholder: "Retail & Commerce" },
    { key: "description", label: "Description", type: "textarea", placeholder: "Brief description of this industry vertical" },
    { key: "icon", label: "Icon Name (lucide)", type: "text", placeholder: "ShoppingBag" },
    { key: "sort_order", label: "Sort Order", type: "number", placeholder: "0" },
    { key: "is_active", label: "Active", type: "checkbox" },
  ],

  columns: [
    { key: "name", label: "Name", className: "font-semibold text-gray-900 dark:text-foreground" },
    { key: "slug", label: "Slug" },
    { key: "description", label: "Description" },
    { key: "sort_order", label: "Order" },
    { key: "is_active", label: "Active" },
  ],
};
