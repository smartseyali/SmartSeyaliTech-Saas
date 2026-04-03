import type { DocTypeDef } from "../types";

export const inventoryItem: DocTypeDef = {
  name: "Inventory Item",
  tableName: "master_items",
  module: "inventory",
  icon: "Package",
  listTitle: "Items",
  formTitle: "Inventory Item",
  showItems: false,

  defaults: {
    status: "active",
  },

  headerFields: [
    { key: "name", label: "Product Name", required: true, placeholder: "e.g. Laptop, Printer..." },
    { key: "sku", label: "SKU", placeholder: "ELP-2026-00X" },
    { key: "rate", label: "Standard unit rate", type: "currency", placeholder: "0.00" },
    { key: "category", label: "Category", placeholder: "Hardware / Software" },
    {
      key: "status", label: "Status", type: "select",
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
    },
    { key: "description", label: "Description", placeholder: "Product description" },
  ],

  columns: [
    { key: "name", label: "Item" },
    { key: "sku", label: "SKU" },
    { key: "rate", label: "Unit Value" },
    { key: "stock", label: "Inventory Level" },
    { key: "status", label: "Status" },
  ],
};
