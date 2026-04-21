import type { DocTypeDef } from "../types";

export const platformTaxRate: DocTypeDef = {
  name: "Tax Rate",
  tableName: "system_tax_rates",
  module: "platform",
  icon: "Percent",
  listTitle: "Platform Tax Rates",
  formTitle: "Tax Rate",
  showItems: false,
  isGlobal: true,

  defaults: {
    rate: 0,
    tax_type: "gst",
    is_default: false,
    is_active: true,
  },

  searchableFields: ["name", "country_code", "tax_type"],

  headerFields: [
    { key: "name", label: "Name", type: "text", required: true, placeholder: "GST 18%" },
    { key: "rate", label: "Rate (%)", type: "percentage", required: true, placeholder: "18" },
    {
      key: "tax_type", label: "Tax Type", type: "select",
      options: [
        { label: "GST", value: "gst" },
        { label: "VAT", value: "vat" },
        { label: "Sales Tax", value: "sales" },
        { label: "Service Tax", value: "service" },
        { label: "Custom", value: "custom" },
      ],
    },
    { key: "country_code", label: "Country", type: "select", lookupTable: "system_countries", lookupValue: "code", lookupLabel: "name" },
    { key: "is_default", label: "Default Rate", type: "checkbox" },
    { key: "is_active", label: "Active", type: "checkbox" },
  ],

  columns: [
    { key: "name", label: "Name", className: "font-semibold text-gray-900 dark:text-foreground" },
    { key: "rate", label: "Rate (%)" },
    { key: "tax_type", label: "Type" },
    { key: "country_code", label: "Country" },
    { key: "is_default", label: "Default" },
    { key: "is_active", label: "Active" },
  ],
};
