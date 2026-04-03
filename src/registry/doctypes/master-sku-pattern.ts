import type { DocTypeDef } from "../types";

export const masterSkuPattern: DocTypeDef = {
  name: "SKU Pattern",
  tableName: "master_sku_patterns",
  module: "masters",
  icon: "Hash",
  listTitle: "SKU Generator",
  formTitle: "SKU Pattern",
  showItems: false,

  defaults: {
    is_active: true,
    digits: 4,
    separator: "Hyphen",
  },

  tabFields: {
    basic: [
      { key: "name", label: "Pattern Name *", type: "text", required: true, placeholder: "e.g. Electronics Pattern" },
      { key: "prefix", label: "Prefix", type: "text", placeholder: "ELE" },
      { key: "suffix", label: "Suffix", type: "text", placeholder: "NY" },
      { key: "counter_start", label: "Start Number", type: "number", placeholder: "0001" },
    ],
    config: [
      { key: "digits", label: "Digits", type: "number", placeholder: "4" },
      {
        key: "separator", label: "Separator", type: "select",
        options: [
          { label: "Hyphen (-)", value: "Hyphen" },
          { label: "Underscore (_)", value: "Underscore" },
          { label: "None", value: "None" },
        ],
      },
      {
        key: "is_active", label: "Status", type: "select",
        options: [
          { value: "true", label: "Active" },
          { value: "false", label: "Disabled" },
        ],
      },
    ],
    mapping: [
      { key: "erp_mapping_id", label: "ERP Mapping", type: "text" },
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
    { key: "name", label: "Pattern Name", className: "font-bold text-slate-900" },
    { key: "prefix", label: "Format" },
    { key: "is_active", label: "Status" },
    { key: "updated_at", label: "Last Updated" },
  ],
};
