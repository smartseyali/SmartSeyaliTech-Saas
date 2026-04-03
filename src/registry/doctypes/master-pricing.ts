import type { DocTypeDef } from "../types";

/**
 * Pricing.tsx exports two components: PriceLists and TaxMapping.
 * PriceLists uses the same table as master-price-list.ts (master_price_lists)
 * with a simpler flat-field form. This doctype captures the simpler view.
 * TaxMapping is a secondary view of master_taxes (see master-tax.ts).
 */
export const masterPricing: DocTypeDef = {
  name: "Pricing Strategy",
  tableName: "master_price_lists",
  module: "masters",
  icon: "CreditCard",
  listTitle: "Price Lists",
  formTitle: "Price List",
  showItems: false,

  defaults: {
    currency: "INR",
    is_active: true,
  },

  headerFields: [
    { key: "name", label: "Price List Name", required: true, placeholder: "Summer Sale 2026, Wholesale..." },
    {
      key: "currency", label: "Currency", type: "select",
      options: [
        { label: "INR", value: "INR" },
        { label: "USD", value: "USD" },
        { label: "EUR", value: "EUR" },
      ],
    },
    {
      key: "is_active", label: "Status", type: "select",
      options: [
        { label: "Active", value: "true" },
        { label: "Inactive", value: "false" },
      ],
    },
    { key: "description", label: "Description", placeholder: "Describe this price list..." },
  ],

  columns: [
    { key: "name", label: "Name" },
    { key: "is_active", label: "Status" },
  ],
};
