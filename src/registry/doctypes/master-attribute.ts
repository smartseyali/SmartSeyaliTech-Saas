import type { DocTypeDef } from "../types";

export const masterAttribute: DocTypeDef = {
  name: "Attribute",
  tableName: "master_attributes",
  module: "masters",
  icon: "Layers",
  listTitle: "Attributes",
  formTitle: "Attribute",
  showItems: false,

  defaults: {
    is_active: true,
    type: "Select",
  },

  tabFields: {
    basic: [
      { key: "name", label: "Attribute Name *", type: "text", required: true, placeholder: "e.g. Color / Size" },
      {
        key: "type", label: "Input Type", type: "select",
        options: [
          { label: "Dropdown", value: "Select" },
          { label: "Multi-select", value: "Multi-select" },
          { label: "Text", value: "Text" },
          { label: "Color Swatch", value: "Swatch" },
        ],
      },
      { key: "unit", label: "Unit", type: "text", placeholder: "e.g. cm, kg" },
      { key: "description", label: "Description", type: "text", placeholder: "Enter details..." },
    ],
    config: [
      {
        key: "is_filterable", label: "Show in Filters", type: "select",
        options: [
          { value: "true", label: "Yes" },
          { value: "false", label: "No" },
        ],
      },
      {
        key: "is_required", label: "Required?", type: "select",
        options: [
          { value: "true", label: "Yes" },
          { value: "false", label: "No" },
        ],
      },
      {
        key: "display_type", label: "Display Style", type: "select",
        options: [
          { label: "Dropdown Menu", value: "Dropdown" },
          { label: "Checkbox Grid", value: "Checkbox" },
          { label: "Radio Buttons", value: "Radio" },
        ],
      },
    ],
    mapping: [
      { key: "erp_mapping_id", label: "ERP ID", type: "text" },
      {
        key: "visibility", label: "Visibility", type: "select",
        options: [
          { value: "Public", label: "Public" },
          { value: "Private", label: "Hidden" },
        ],
      },
    ],
  },

  columns: [
    { key: "name", label: "Attribute Name", className: "font-bold text-slate-900" },
    { key: "type", label: "Input Type" },
    { key: "is_filterable", label: "Filterable" },
    { key: "is_active", label: "Status" },
    { key: "updated_at", label: "Last Updated" },
  ],
};
