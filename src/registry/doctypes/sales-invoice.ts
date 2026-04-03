import type { DocTypeDef } from "../types";

export const salesInvoice: DocTypeDef = {
  name: "Sales Invoice",
  tableName: "sales_invoices",
  itemTableName: "sales_invoice_items",
  itemForeignKey: "invoice_id",
  module: "sales",
  icon: "Receipt",
  listTitle: "Sales Invoices",
  formTitle: "Sales Invoice",

  defaults: {
    currency: "INR",
    status: "draft",
    payment_status: "unpaid",
    payment_terms: "net-30",
    paid_amount: 0,
  },

  headerFields: [
    { key: "reference_no", label: "Invoice Number", required: true, placeholder: "INV/24-25/001" },
    {
      key: "invoice_type", label: "Invoice Type", type: "select",
      options: [
        { value: "Tax Invoice", label: "Tax Invoice" },
        { value: "Cash Memo", label: "Cash Memo" },
        { value: "Bill of Supply", label: "Bill of Supply" },
      ],
    },
    { key: "customer_name", label: "Customer Name", required: true, placeholder: "Customer name..." },
    { key: "customer_gstin", label: "Customer GSTIN / PAN", placeholder: "27AAAAA0000A1Z5" },
    {
      key: "place_of_supply", label: "Place of Supply", type: "select",
      options: [{ value: "Maharashtra", label: "Maharashtra" }],
    },
    { key: "date", label: "Invoice Date", type: "date", required: true },
    { key: "due_date", label: "Payment Due Date", type: "date" },
    { key: "billing_address", label: "Billing Address", placeholder: "Include State/Pincode..." },
    {
      key: "payment_status", label: "Settlement Status", type: "select",
      options: [
        { label: "Unpaid / Outstanding", value: "unpaid" },
        { label: "Partially Collected", value: "partial" },
        { label: "Fully Paid", value: "paid" },
      ],
    },
    {
      key: "status", label: "Invoice Status", type: "select",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Finalized", value: "submitted" },
        { label: "Cancelled / Void", value: "cancelled" },
      ],
    },
    { key: "paid_amount", label: "Amount Collected", type: "currency", placeholder: "0.00" },
    { key: "bank_details", label: "Bank Account / Payment Info", type: "textarea", placeholder: "Branch details, IFSC..." },
    { key: "notes", label: "Terms / Notes", placeholder: "Terms and conditions..." },
  ],

  itemFields: [
    { key: "product_id", label: "Product / Service", type: "select", lookupTable: "master_items", lookupLabel: "name", lookupValue: "id" },
    { key: "description", label: "Description", type: "text", placeholder: "Description" },
    { key: "hsn_code", label: "HSN / SAC", type: "text", placeholder: "HSN" },
    { key: "quantity", label: "Quantity", type: "number", placeholder: "0" },
    { key: "unit_price", label: "Rate (INR)", type: "currency", placeholder: "0.00" },
    { key: "tax_rate", label: "GST Rate (%)", type: "percentage", placeholder: "18" },
    { key: "discount_pct", label: "Discount %", type: "percentage", placeholder: "0" },
    { key: "amount", label: "Taxable Amount", type: "currency", placeholder: "0.00" },
  ],

  columns: [
    { key: "reference_no", label: "Invoice Number" },
    { key: "customer_name", label: "Customer" },
    { key: "date", label: "Invoice Date" },
    { key: "due_date", label: "Due Date" },
    { key: "grand_total", label: "Total Payable" },
    { key: "paid_amount", label: "Collected" },
    { key: "outstanding_amount", label: "Outstanding" },
    { key: "payment_status", label: "Settlement" },
    { key: "status", label: "Invoice Status" },
  ],

  statusFlow: [
    {
      field: "status",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Finalized", value: "submitted" },
        { label: "Cancelled / Void", value: "cancelled" },
      ],
    },
    {
      field: "payment_status",
      options: [
        { label: "Unpaid / Outstanding", value: "unpaid" },
        { label: "Partially Collected", value: "partial" },
        { label: "Fully Paid", value: "paid" },
      ],
    },
  ],
};
