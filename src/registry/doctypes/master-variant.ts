import type { DocTypeDef } from "../types";

export const masterVariant: DocTypeDef = {
  name: "Variant",
  tableName: "master_product_variants",
  module: "masters",
  icon: "Layers",
  listTitle: "Variants",
  formTitle: "Product Variant",
  showItems: false,

  defaults: {
    is_active: true,
  },

  tabFields: {
    basic: [
      { key: "name", label: "Variant Name *", type: "text", required: true, placeholder: "e.g. Red / XL" },
      { key: "sku", label: "SKU", type: "text" },
      { key: "barcode", label: "Barcode", type: "text" },
      { key: "description", label: "Description", type: "text" },
    ],
    config: [
      { key: "selling_price", label: "Selling Price", type: "currency", placeholder: "Variant selling price" },
      { key: "mrp", label: "MRP", type: "currency", placeholder: "Variant MRP (strikethrough price)" },
      { key: "price_adjustment", label: "Price Adjustment (legacy)", type: "currency", placeholder: "0.00" },
      {
        key: "is_active", label: "Status", type: "select",
        options: [
          { value: "true", label: "Active" },
          { value: "false", label: "Disabled" },
        ],
      },
    ],
    mapping: [
      { key: "erp_variant_id", label: "ERP ID", type: "text" },
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
    { key: "name", label: "Variant Name", className: "font-bold text-slate-900" },
    { key: "sku", label: "SKU", className: "font-mono text-blue-600" },
    { key: "is_active", label: "Status" },
    { key: "updated_at", label: "Last Updated" },
  ],
};
