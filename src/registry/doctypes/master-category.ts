import type { DocTypeDef } from "../types";

export const masterCategory: DocTypeDef = {
  name: "Category",
  tableName: "master_categories",
  module: "masters",
  icon: "LayoutGrid",
  listTitle: "Category List",
  formTitle: "Category",
  showItems: false,

  defaults: {
    is_active: true,
  },

  tabFields: {
    basic: [
      { key: "name", label: "Category Name *", type: "text", required: true, placeholder: "e.g. Electronics" },
      {
        key: "type", label: "Type", type: "select",
        options: [
          { label: "Product", value: "Product" },
          { label: "Service", value: "Service" },
        ],
      },
      { key: "parent_id", label: "Parent Category", type: "select", lookupTable: "master_categories", lookupLabel: "name", lookupValue: "id" },
      { key: "description", label: "Description", type: "textarea", placeholder: "Category description for storefront display", width: "full" },
      { key: "image_url", label: "Category Image", type: "image", width: "full" },
    ],
    config: [
      {
        key: "is_active", label: "Status", type: "select",
        options: [
          { value: "true", label: "Active" },
          { value: "false", label: "Disabled" },
        ],
      },
      { key: "sort_order", label: "Sort Order", type: "number" },
      { key: "url_key", label: "URL Key", type: "text" },
    ],
    mapping: [
      {
        key: "visibility", label: "Visibility", type: "select",
        options: [
          { value: "Public", label: "Public" },
          { value: "Private", label: "Hidden" },
        ],
      },
      { key: "ecom_mapping", label: "Store Mapping", type: "text" },
    ],
  },

  columns: [
    { key: "name", label: "Category Name", className: "font-bold text-slate-900" },
    { key: "parent_id", label: "Parent Category" },
    { key: "is_active", label: "Status" },
    { key: "created_at", label: "Created Date" },
    { key: "updated_at", label: "Updated Date" },
  ],
};
