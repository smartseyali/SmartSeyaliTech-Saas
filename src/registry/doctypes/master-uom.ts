import type { DocTypeDef } from "../types";

export const masterUom: DocTypeDef = {
  name: "Unit of Measure",
  tableName: "master_uoms",
  module: "masters",
  icon: "Scale",
  listTitle: "UOM Master",
  formTitle: "Unit of Measure",
  showItems: false,

  defaults: {
    is_active: true,
    ratio: 1,
  },

  tabFields: {
    basic: [
      { key: "name", label: "Unit Name *", type: "text", required: true, placeholder: "e.g. Kilogram (Kg), Liters (L)" },
      {
        key: "category", label: "Category *", type: "select",
        options: [
          { label: "Unit / Count", value: "Unit" },
          { label: "Weight / Mass", value: "Weight" },
          { label: "Volume / Capacity", value: "Volume" },
          { label: "Length / Distance", value: "Length" },
        ],
      },
      { key: "reference_uom", label: "Reference Unit", type: "text", placeholder: "e.g. Gram for kg" },
      { key: "ratio", label: "Conversion Rate *", type: "number", placeholder: "1.0000" },
    ],
    config: [
      {
        key: "is_active", label: "Status", type: "select",
        options: [
          { value: "true", label: "Active" },
          { value: "false", label: "Disabled" },
        ],
      },
      { key: "precision", label: "Decimals", type: "number", placeholder: "2" },
    ],
    mapping: [
      { key: "erp_uom_code", label: "ERP Unit Code", type: "text" },
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
    { key: "name", label: "Unit Name", className: "font-bold text-slate-900" },
    { key: "category", label: "Category" },
    { key: "ratio", label: "Conversion Rate" },
    { key: "is_active", label: "Status" },
    { key: "updated_at", label: "Last Updated" },
  ],
};
