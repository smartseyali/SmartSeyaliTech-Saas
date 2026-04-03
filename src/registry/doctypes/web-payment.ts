import type { DocTypeDef } from "../types";

export const webPayment: DocTypeDef = {
  name: "Payment",
  tableName: "web_payments",
  module: "website",
  showItems: false,

  headerFields: [
    { key: "receipt_no", label: "Receipt No", type: "text", placeholder: "PAY-2026-001" },
    { key: "registration_id", label: "Registration", type: "select", required: true, lookupTable: "web_registrations", lookupLabel: "registrant_name", lookupValue: "id" },
    { key: "amount", label: "Amount", type: "currency", required: true },
    { key: "payment_date", label: "Date", type: "date" },
    { key: "payment_mode", label: "Payment Mode", type: "select", options: [
      { value: "cash", label: "Cash" },
      { value: "cheque", label: "Cheque" },
      { value: "online", label: "Online" },
      { value: "upi", label: "UPI" },
      { value: "bank_transfer", label: "Bank Transfer" },
      { value: "card", label: "Card" },
    ]},
    { key: "transaction_id", label: "Transaction ID", type: "text" },
    { key: "gateway", label: "Gateway", type: "select", options: [
      { value: "razorpay", label: "Razorpay" },
      { value: "stripe", label: "Stripe" },
      { value: "paytm", label: "Paytm" },
      { value: "manual", label: "Manual" },
    ]},
    { key: "status", label: "Status", type: "select", options: [
      { value: "pending", label: "Pending" },
      { value: "completed", label: "Completed" },
      { value: "failed", label: "Failed" },
      { value: "refunded", label: "Refunded" },
    ]},
    { key: "notes", label: "Notes", type: "textarea", width: "full" },
  ],

  columns: [
    { key: "receipt_no", label: "Receipt No" },
    { key: "payment_date", label: "Date" },
    { key: "amount", label: "Amount" },
    { key: "payment_mode", label: "Mode" },
    { key: "status", label: "Status" },
    { key: "created_at", label: "Created" },
  ],

  statusField: "status",
  defaults: { status: "completed", payment_mode: "online", amount: 0 },
  referencePrefix: "PAY",
};
