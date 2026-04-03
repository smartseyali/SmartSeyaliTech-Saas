import type { DocTypeDef } from "../types";

export const salesOrder: DocTypeDef = {
  name: "Sales Order",
  tableName: "sales_orders",
  itemTableName: "sales_order_items",
  itemForeignKey: "order_id",
  module: "sales",
  icon: "FileText",
  listTitle: "Sales Orders",
  formTitle: "Sales Order",

  defaults: {
    currency: "INR",
    status: "draft",
    order_status: "to-deliver",
    billing_status: "to-invoice",
  },

  headerFields: [
    { key: "reference_no", label: "Sales Order No", required: true, placeholder: "SO/24-25/001" },
    { key: "customer_name", label: "Customer Name", required: true, placeholder: "Customer name..." },
    { key: "customer_gstin", label: "Customer GSTIN", placeholder: "27AAAAA0000A1Z5" },
    {
      key: "place_of_supply", label: "Place of Supply (State) *", type: "select",
      options: [
        { value: "Maharashtra", label: "Maharashtra" },
        { value: "Delhi", label: "Delhi" },
      ],
    },
    { key: "date", label: "Order Date", type: "date", required: true },
    { key: "delivery_date", label: "Expected Delivery Date", type: "date" },
    { key: "billing_address", label: "Billing Address", placeholder: "Include State/Pincode..." },
    { key: "shipping_address", label: "Shipping Address", placeholder: "Include State/Pincode..." },
    { key: "shipping_method", label: "Shipping Method", placeholder: "e.g. Surface / Air" },
    { key: "freight_charges", label: "Freight / Shipping Charge", type: "currency", placeholder: "0.00" },
    { key: "sales_channel", label: "Order Source / Channel", placeholder: "e.g. Website, B2B, Offline" },
    {
      key: "branch_id", label: "Fulfilment Branch", type: "select",
      options: [{ value: "Main", label: "Main Branch" }],
    },
    {
      key: "order_priority", label: "Order Priority", type: "select",
      options: [
        { value: "Standard", label: "Standard" },
        { value: "High", label: "High" },
        { value: "Critical", label: "Critical" },
      ],
    },
    {
      key: "status", label: "Order Confirmation", type: "select",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Confirmed", value: "confirmed" },
        { label: "Closed", value: "closed" },
        { label: "Cancelled", value: "cancelled" },
      ],
    },
    {
      key: "order_status", label: "Delivery Status", type: "select",
      options: [
        { label: "To Deliver", value: "to-deliver" },
        { label: "Shipped", value: "shipped" },
        { label: "Delivered", value: "delivered" },
      ],
    },
    {
      key: "billing_status", label: "Invoice Status", type: "select",
      options: [
        { label: "To Invoice", value: "to-invoice" },
        { label: "Invoiced", value: "invoiced" },
      ],
    },
    { key: "payment_terms", label: "Payment Terms", placeholder: "e.g. Net 30 / Advance" },
    { key: "notes", label: "Internal Notes", placeholder: "Internal notes..." },
  ],

  itemFields: [
    { key: "product_id", label: "Item Master", type: "select", lookupTable: "master_items", lookupLabel: "name", lookupValue: "id" },
    { key: "description", label: "Item Description", type: "text", placeholder: "Description" },
    { key: "hsn_code", label: "HSN / SAC", type: "text", placeholder: "HSN" },
    { key: "quantity", label: "Quantity", type: "number", placeholder: "0" },
    { key: "unit_price", label: "Rate (INR)", type: "currency", placeholder: "0.00" },
    { key: "tax_rate", label: "GST Rate (%)", type: "percentage", placeholder: "18" },
    { key: "discount_pct", label: "Discount %", type: "percentage", placeholder: "0" },
    { key: "amount", label: "Taxable Amount", type: "currency", placeholder: "0.00" },
  ],

  columns: [
    { key: "reference_no", label: "Sales Order No" },
    { key: "customer_name", label: "Customer" },
    { key: "date", label: "Order Date" },
    { key: "delivery_date", label: "Delivery Date" },
    { key: "total_qty", label: "Qty" },
    { key: "grand_total", label: "Order Value (Incl. Tax)" },
    { key: "order_status", label: "Delivery Status" },
    { key: "billing_status", label: "Invoice Status" },
    { key: "status", label: "Status" },
  ],

  statusFlow: [
    {
      field: "status",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Confirmed", value: "confirmed" },
        { label: "Closed", value: "closed" },
        { label: "Cancelled", value: "cancelled" },
      ],
    },
  ],

  conversions: [
    {
      target: "salesInvoice",
      label: "Create Invoice",
      sourceItemTable: "sales_order_items",
      targetItemTable: "sales_invoice_items",
      headerMap: {
        customer_name: "customer_name",
        customer_email: "customer_email",
        customer_phone: "customer_phone",
        billing_address: "billing_address",
        currency: "currency",
      },
    },
  ],
};
