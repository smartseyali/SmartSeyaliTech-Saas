import type { DocTypeDef } from "../types";

export const webPricing: DocTypeDef = {
  name: "Pricing Plan",
  tableName: "web_pricing",
  module: "website",
  itemTableName: "web_pricing_items",
  itemForeignKey: "pricing_id",
  showItems: true,
  itemTitle: "Pricing Items",

  headerFields: [
    { key: "name", label: "Plan Name", type: "text", required: true, placeholder: "e.g. Standard, Premium" },
    { key: "item_id", label: "Item / Service", type: "select", required: true, lookupTable: "master_items", lookupLabel: "item_name", lookupValue: "id" },
    { key: "pricing_type", label: "Pricing Type", type: "select", options: [
      { value: "standard", label: "Standard" },
      { value: "early_bird", label: "Early Bird" },
      { value: "promotional", label: "Promotional" },
      { value: "subscription", label: "Subscription" },
      { value: "installment", label: "Installment" },
    ]},
    { key: "total_amount", label: "Total Amount", type: "currency", required: true },
    { key: "currency", label: "Currency", type: "text", placeholder: "INR" },
    { key: "installments_allowed", label: "Installments", type: "checkbox" },
    { key: "installment_count", label: "No. of Installments", type: "number" },
    { key: "tax_inclusive", label: "Tax Inclusive", type: "checkbox" },
    { key: "tax_rate", label: "Tax Rate", type: "percentage" },
    { key: "valid_from", label: "Valid From", type: "date" },
    { key: "valid_to", label: "Valid To", type: "date" },
    { key: "is_active", label: "Active", type: "checkbox" },
    { key: "notes", label: "Notes", type: "textarea", width: "full" },
  ],

  itemFields: [
    { key: "item_label", label: "Item", type: "text", required: true, placeholder: "e.g. Base Fee, Tax, Materials" },
    { key: "amount", label: "Amount", type: "currency", required: true },
    { key: "is_optional", label: "Optional", type: "checkbox" },
    { key: "sort_order", label: "Order", type: "number" },
  ],

  columns: [
    { key: "name", label: "Plan" },
    { key: "pricing_type", label: "Type" },
    { key: "total_amount", label: "Amount" },
    { key: "is_active", label: "Active" },
    { key: "valid_from", label: "From" },
    { key: "valid_to", label: "To" },
  ],

  defaults: { pricing_type: "standard", currency: "INR", is_active: true, tax_inclusive: true, installments_allowed: false, installment_count: 1, total_amount: 0 },
};
