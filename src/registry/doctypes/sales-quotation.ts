import type { DocTypeDef } from "../types";

export const salesQuotation: DocTypeDef = {
  name: "Sales Quotation",
  tableName: "sales_quotations",
  itemTableName: "sales_quotation_items",
  itemForeignKey: "quotation_id",
  module: "sales",
  icon: "FileText",
  listTitle: "Quotations",
  formTitle: "Sales Quotation",

  defaults: {
    currency: "INR",
    status: "draft",
  },

  headerFields: [
    { key: "reference_no", label: "Reference No", required: true, placeholder: "QT-2026-001" },
    { key: "customer_name", label: "Customer Name", required: true, placeholder: "Customer name..." },
    { key: "customer_email", label: "Customer Email", placeholder: "email@company.com" },
    { key: "customer_phone", label: "Customer Phone", placeholder: "+91 98765 43210" },
    { key: "customer_address", label: "Customer Address", placeholder: "Full address..." },
    { key: "date", label: "Quotation Date", type: "date", required: true },
    { key: "valid_until", label: "Valid Until", type: "date" },
    { key: "billing_address", label: "Billing Address", placeholder: "Billing address..." },
    { key: "shipping_address", label: "Shipping Address", placeholder: "Shipping address..." },
    {
      key: "currency", label: "Currency", type: "select",
      options: [
        { label: "INR – Indian Rupee", value: "INR" },
        { label: "USD – US Dollar", value: "USD" },
        { label: "EUR – Euro", value: "EUR" },
      ],
    },
    {
      key: "status", label: "Status", type: "select",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Sent", value: "sent" },
        { label: "Accepted", value: "accepted" },
        { label: "Rejected", value: "rejected" },
        { label: "Expired", value: "expired" },
      ],
    },
    { key: "payment_terms", label: "Payment Terms", placeholder: "e.g. Net 30..." },
    { key: "notes", label: "Notes", placeholder: "Internal notes..." },
    { key: "terms_and_conditions", label: "Terms & Conditions", placeholder: "Standard T&C..." },
  ],

  itemFields: [
    { key: "item_code", label: "Item Code", type: "text", placeholder: "Item Code" },
    { key: "description", label: "Description", type: "text", placeholder: "Description" },
    { key: "uom", label: "UOM", type: "text", placeholder: "PCS" },
    { key: "quantity", label: "Qty", type: "number", placeholder: "0" },
    { key: "unit_price", label: "Unit Price", type: "currency", placeholder: "0.00" },
    { key: "tax_rate", label: "Tax %", type: "percentage", placeholder: "18" },
    { key: "discount_pct", label: "Disc %", type: "percentage", placeholder: "0" },
    { key: "amount", label: "Amount", type: "currency", placeholder: "0.00" },
  ],

  columns: [
    { key: "reference_no", label: "Reference No" },
    { key: "customer_name", label: "Customer" },
    { key: "date", label: "Date" },
    { key: "valid_until", label: "Valid Until" },
    { key: "total_qty", label: "Qty" },
    { key: "grand_total", label: "Grand Total" },
    { key: "status", label: "Status" },
  ],

  statusFlow: [
    {
      field: "status",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Sent", value: "sent" },
        { label: "Accepted", value: "accepted" },
        { label: "Rejected", value: "rejected" },
        { label: "Expired", value: "expired" },
      ],
    },
  ],

  conversions: [
    {
      target: "salesOrder",
      label: "Convert to SO",
      sourceItemTable: "sales_quotation_items",
      targetItemTable: "sales_order_items",
      headerMap: {
        customer_name: "customer_name",
        customer_email: "customer_email",
        customer_phone: "customer_phone",
        billing_address: "billing_address",
        shipping_address: "shipping_address",
        currency: "currency",
        payment_terms: "payment_terms",
      },
    },
  ],
};
