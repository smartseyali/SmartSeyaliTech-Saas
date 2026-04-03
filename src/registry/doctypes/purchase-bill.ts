import type { DocTypeDef } from "../types";

export const purchaseBill: DocTypeDef = {
  name: "Purchase Bill",
  tableName: "purchase_bills",
  itemTableName: "purchase_bill_items",
  itemForeignKey: "bill_id",
  module: "purchase",
  icon: "CreditCard",
  listTitle: "Purchase Bills",
  formTitle: "Vendor Bill",

  defaults: {
    status: "draft",
  },

  headerFields: [
    { key: "vendor_name", label: "Supplier / Vendor", required: true },
    { key: "vendor_gstin", label: "Vendor GSTIN / PAN", placeholder: "27AAAAA0000A1Z5" },
    { key: "bill_no", label: "Supplier Invoice No", required: true, placeholder: "INV-123" },
    { key: "reference_no", label: "Vendor Bill Reference (Internal)", required: true, placeholder: "BILL/24-25/001" },
    { key: "bill_date", label: "Supplier Invoice Date", type: "date" },
    { key: "date", label: "Bill Booking Date", type: "date" },
    { key: "due_date", label: "Payment Due Date", type: "date" },
    { key: "grn_reference", label: "GRN Link / Reference", placeholder: "GRN-001" },
    {
      key: "status", label: "Bill Status", type: "select",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Unpaid", value: "unpaid" },
        { label: "Partially Paid", value: "partial" },
        { label: "Paid / Settled", value: "paid" },
        { label: "Overdue", value: "overdue" },
      ],
    },
  ],

  itemFields: [
    { key: "product_id", label: "Billed Item", type: "select", lookupTable: "master_items", lookupLabel: "name", lookupValue: "id" },
    { key: "description", label: "Item Description", type: "text" },
    { key: "hsn_code", label: "HSN / SAC", type: "text" },
    { key: "quantity", label: "Quantity", type: "number" },
    { key: "unit_price", label: "Rate (INR)", type: "currency" },
    { key: "tax_rate", label: "GST Rate (%)", type: "percentage" },
    { key: "cess_amount", label: "Cess Amount", type: "currency" },
    { key: "round_off", label: "Round-off (+/-)", type: "currency" },
    { key: "amount", label: "Total Payable", type: "currency" },
  ],

  columns: [
    { key: "reference_no", label: "Internal Ref" },
    { key: "vendor_name", label: "Supplier" },
    { key: "grand_total", label: "Bill Amount", className: "text-right" },
    { key: "status", label: "Status" },
  ],

  statusFlow: [
    {
      field: "status",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Unpaid", value: "unpaid" },
        { label: "Partially Paid", value: "partial" },
        { label: "Paid / Settled", value: "paid" },
        { label: "Overdue", value: "overdue" },
      ],
    },
  ],
};
