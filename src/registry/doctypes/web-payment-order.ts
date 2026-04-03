import type { DocTypeDef } from "../types";

export const webPaymentOrder: DocTypeDef = {
  name: "Payment Order",
  tableName: "web_payment_orders",
  module: "website",
  showItems: false,

  headerFields: [
    { key: "order_no", label: "Order No", type: "text", required: true },
    { key: "payer_name", label: "Payer Name", type: "text" },
    { key: "payer_email", label: "Email", type: "email" },
    { key: "payer_phone", label: "Phone", type: "phone" },
    { key: "item_id", label: "Item / Service", type: "select", lookupTable: "master_items", lookupLabel: "item_name", lookupValue: "id" },
    { key: "item_name", label: "Item Name", type: "text" },
    { key: "registration_id", label: "Registration", type: "select", lookupTable: "web_registrations", lookupLabel: "registration_no", lookupValue: "id" },
    { key: "amount", label: "Amount", type: "currency", required: true },
    { key: "currency", label: "Currency", type: "text", placeholder: "INR" },
    { key: "gateway", label: "Payment Gateway", type: "select", required: true, options: [
      { value: "razorpay", label: "Razorpay" },
      { value: "stripe", label: "Stripe" },
      { value: "paytm", label: "Paytm" },
      { value: "phonepe", label: "PhonePe" },
      { value: "cashfree", label: "Cashfree" },
    ]},
    { key: "gateway_order_id", label: "Gateway Order ID", type: "text", readOnly: true },
    { key: "gateway_payment_id", label: "Gateway Payment ID", type: "text", readOnly: true },
    { key: "status", label: "Status", type: "select", options: [
      { value: "created", label: "Created" },
      { value: "attempted", label: "Attempted" },
      { value: "paid", label: "Paid" },
      { value: "failed", label: "Failed" },
      { value: "refunded", label: "Refunded" },
    ]},
    { key: "paid_at", label: "Paid At", type: "datetime-local", readOnly: true },
  ],

  columns: [
    { key: "order_no", label: "Order No" },
    { key: "payer_name", label: "Payer" },
    { key: "item_name", label: "Item" },
    { key: "amount", label: "Amount" },
    { key: "gateway", label: "Gateway" },
    { key: "status", label: "Status" },
    { key: "created_at", label: "Date" },
  ],

  statusField: "status",
  searchableFields: ["order_no", "payer_name", "payer_email", "gateway_order_id"],
  defaults: { status: "created", currency: "INR", amount: 0 },
};
