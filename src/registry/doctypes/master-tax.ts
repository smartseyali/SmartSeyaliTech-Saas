import type { DocTypeDef } from "../types";

export const masterTax: DocTypeDef = {
  name: "Tax Rule",
  tableName: "master_taxes",
  module: "masters",
  icon: "Percent",
  listTitle: "Tax Master",
  formTitle: "Tax Rule",
  showItems: false,

  defaults: {
    status: "active",
    tax_type: "gst",
  },

  tabFields: {
    basic: [
      { key: "tax_name", label: "Tax Name *", type: "text", required: true, placeholder: "e.g. GST 18%" },
      {
        key: "tax_type", label: "Tax Type", type: "select",
        options: [
          { label: "GST", value: "gst" },
          { label: "VAT", value: "vat" },
          { label: "Service Tax", value: "service" },
          { label: "IGST", value: "igst" },
          { label: "CGST", value: "cgst" },
          { label: "SGST", value: "sgst" },
        ],
      },
      { key: "rate", label: "Rate (%) *", type: "percentage", placeholder: "18.00" },
      { key: "description", label: "Description", type: "text", placeholder: "Enter details..." },
    ],
    config: [
      {
        key: "applies_to", label: "Applies To", type: "select",
        options: [
          { value: "both", label: "Both" },
          { value: "sales", label: "Sales Only" },
          { value: "purchase", label: "Purchase Only" },
        ],
      },
      {
        key: "status", label: "Status", type: "select",
        options: [
          { value: "active", label: "Active" },
          { value: "inactive", label: "Disabled" },
        ],
      },
    ],
    mapping: [
      { key: "account_code", label: "Ledger Account", type: "text", placeholder: "Account code to map to" },
      { key: "hsn_sac", label: "HSN/SAC", type: "text" },
    ],
  },

  columns: [
    { key: "tax_name", label: "Tax Name", className: "font-bold text-slate-900" },
    { key: "tax_type", label: "Tax Type" },
    { key: "rate", label: "Rate %" },
    { key: "status", label: "Status" },
    { key: "updated_at", label: "Updated Date" },
  ],
};
