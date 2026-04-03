import type { DocTypeDef } from "../types";

export const masterBrand: DocTypeDef = {
  name: "Brand",
  tableName: "master_brands",
  module: "masters",
  icon: "Tag",
  listTitle: "Brand Master",
  formTitle: "Brand",
  showItems: false,

  defaults: {
    is_active: true,
  },

  tabFields: {
    basic: [
      { key: "name", label: "Brand Name *", type: "text", required: true, placeholder: "e.g. Nike / Apple" },
      { key: "sub_brand_name", label: "Sub-Brand Name", type: "text", placeholder: "e.g. Air Jordan / iPhone" },
      { key: "description", label: "Description", type: "textarea", placeholder: "Enter brand description..." },
      { key: "logo_url", label: "Brand Logo", type: "image" },
    ],
    config: [
      {
        key: "is_active", label: "Status", type: "select",
        options: [
          { value: "true", label: "Active" },
          { value: "false", label: "Disabled" },
        ],
      },
      { key: "priority", label: "Priority", type: "number" },
      { key: "seo_keyword", label: "SEO Keywords", type: "text" },
    ],
    mapping: [
      {
        key: "visibility", label: "Visibility", type: "select",
        options: [
          { value: "Public", label: "Public" },
          { value: "Private", label: "Hidden" },
        ],
      },
      { key: "api_mapping", label: "Store Mapping", type: "text" },
    ],
  },

  columns: [
    { key: "name", label: "Brand Name", className: "font-bold text-slate-900" },
    { key: "manufacturer", label: "Manufacturer" },
    { key: "is_active", label: "Status" },
    { key: "created_at", label: "Created Date" },
    { key: "updated_at", label: "Updated Date" },
  ],
};
