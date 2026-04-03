import type { DocTypeDef } from "../types";

export const masterPriceList: DocTypeDef = {
  name: "Price List",
  tableName: "master_price_lists",
  module: "masters",
  icon: "DollarSign",
  listTitle: "Price Lists",
  formTitle: "Price List",
  showItems: false,

  defaults: {
    currency: "INR",
    is_active: true,
  },

  tabFields: {
    basic: [
      { key: "name", label: "Price List Name *", type: "text", required: true, placeholder: "e.g. Wholesale / Retail" },
      {
        key: "currency", label: "Currency", type: "select",
        options: [
          { label: "Indian Rupee (INR)", value: "INR" },
          { label: "US Dollar (USD)", value: "USD" },
          { label: "Euro (EUR)", value: "EUR" },
        ],
      },
      {
        key: "type", label: "Price Type", type: "select",
        options: [
          { label: "Selling", value: "Sell" },
          { label: "Buying", value: "Buy" },
        ],
      },
    ],
    config: [
      {
        key: "is_active", label: "Status", type: "select",
        options: [
          { value: "true", label: "Active" },
          { value: "false", label: "Disabled" },
        ],
      },
      { key: "effective_from", label: "Effective From", type: "date" },
      { key: "effective_to", label: "Effective To", type: "date" },
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
    { key: "name", label: "Price List Name", className: "font-bold text-slate-900" },
    { key: "currency", label: "Currency" },
    { key: "type", label: "Direction" },
    { key: "is_active", label: "Status" },
    { key: "updated_at", label: "Last Updated" },
  ],
};
