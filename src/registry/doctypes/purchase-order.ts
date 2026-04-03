import type { DocTypeDef } from "../types";

export const purchaseOrder: DocTypeDef = {
  name: "Purchase Order",
  tableName: "purchase_orders",
  itemTableName: "purchase_order_items",
  itemForeignKey: "order_id",
  module: "purchase",
  icon: "Package",
  listTitle: "Purchase Orders",
  formTitle: "Purchase Order",

  defaults: {
    status: "draft",
  },

  headerFields: [
    { key: "reference_no", label: "PO Number", required: true, placeholder: "PO/24-25/001" },
    { key: "vendor_name", label: "Supplier / Vendor", required: true },
    { key: "vendor_gstin", label: "Vendor GSTIN / PAN", placeholder: "27AAAAA0000A1Z5" },
    { key: "date", label: "Date", type: "date", required: true },
    { key: "expected_delivery", label: "Expected Delivery Date", type: "date" },
    { key: "vendor_address", label: "Vendor Billing Address", type: "textarea" },
    { key: "delivery_address", label: "Delivery Address / Location", type: "textarea", placeholder: "Receiving Godown address..." },
    { key: "payment_terms", label: "Payment Terms", placeholder: "e.g. 30 Days Credit" },
    {
      key: "procurement_type", label: "PO Category", type: "select",
      options: [
        { value: "Goods", label: "Goods / Inventory" },
        { value: "Services", label: "Services / OPEX" },
      ],
    },
    {
      key: "status", label: "Procurement Status", type: "select",
      options: [
        { label: "Draft / Pending", value: "draft" },
        { label: "Confirmed / Ordered", value: "confirmed" },
        { label: "Partially Received", value: "partially-received" },
        { label: "Received / Closed", value: "received" },
      ],
    },
  ],

  itemFields: [
    { key: "product_id", label: "Stock Item", type: "select", lookupTable: "master_items", lookupLabel: "name", lookupValue: "id" },
    { key: "description", label: "Item Description", type: "text" },
    { key: "hsn_code", label: "HSN / SAC", type: "text" },
    { key: "quantity", label: "Quantity", type: "number" },
    { key: "unit_price", label: "Rate (INR)", type: "currency" },
    { key: "tax_rate", label: "GST Rate (%)", type: "percentage" },
    { key: "amount", label: "Total Taxable", type: "currency" },
  ],

  columns: [
    { key: "reference_no", label: "PO Number" },
    { key: "vendor_name", label: "Vendor" },
    { key: "grand_total", label: "Order Value", className: "text-right" },
    { key: "status", label: "Status" },
  ],

  statusFlow: [
    {
      field: "status",
      options: [
        { label: "Draft / Pending", value: "draft" },
        { label: "Confirmed / Ordered", value: "confirmed" },
        { label: "Partially Received", value: "partially-received" },
        { label: "Received / Closed", value: "received" },
      ],
    },
  ],
};
