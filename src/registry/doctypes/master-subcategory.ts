import type { DocTypeDef } from "../types";

export const masterSubcategory: DocTypeDef = {
  name: "Subcategory",
  tableName: "master_subcategories",
  module: "masters",
  icon: "ListTree",
  listTitle: "Subcategory Mapping",
  formTitle: "Subcategory",
  showItems: false,

  defaults: {
    is_active: true,
  },

  tabFields: {
    basic: [
      { key: "name", label: "Subcategory Name *", type: "text", required: true, placeholder: "e.g. Smartphones" },
      { key: "parent_category", label: "Parent Category", type: "text" },
      { key: "description", label: "Description", type: "text", placeholder: "Enter details..." },
    ],
    config: [
      {
        key: "is_active", label: "Status", type: "select",
        options: [
          { value: "true", label: "Active" },
          { value: "false", label: "Disabled" },
        ],
      },
      { key: "mapping_logic", label: "Mapping Logic", type: "text", placeholder: "e.g. Auto-link to parent" },
    ],
    mapping: [
      { key: "storefront_url_key", label: "SEO URL Key", type: "text" },
      { key: "api_mapping", label: "API Mapping", type: "text" },
      { key: "saas_id", label: "Operational ID", type: "text" },
    ],
  },

  columns: [
    { key: "name", label: "Subcategory Name", className: "font-bold text-slate-900" },
    { key: "parent_category", label: "Parent Category" },
    { key: "is_active", label: "Status" },
    { key: "updated_at", label: "Last Updated" },
  ],
};
