import type { DocTypeDef } from "../types";

export const webPaymentGateway: DocTypeDef = {
  name: "Payment Gateway",
  tableName: "payment_gateways",
  module: "website",
  showItems: false,

  headerFields: [
    { key: "gateway", label: "Gateway", type: "select", required: true, options: [
      { value: "razorpay", label: "Razorpay" },
      { value: "stripe", label: "Stripe" },
      { value: "paytm", label: "Paytm" },
      { value: "phonepe", label: "PhonePe" },
      { value: "cashfree", label: "Cashfree" },
      { value: "instamojo", label: "Instamojo" },
    ]},
    { key: "display_name", label: "Display Name", type: "text", placeholder: "e.g. Pay with Razorpay" },
    { key: "is_active", label: "Active", type: "checkbox" },
    { key: "is_test_mode", label: "Test Mode", type: "checkbox" },
    { key: "config", label: "Credentials", type: "textarea", width: "full", placeholder: '{\n  "key_id": "rzp_test_...",\n  "key_secret": "...",\n  "webhook_secret": "..."\n}' },
  ],

  columns: [
    { key: "gateway", label: "Gateway" },
    { key: "display_name", label: "Name" },
    { key: "is_active", label: "Active" },
    { key: "is_test_mode", label: "Test Mode" },
    { key: "updated_at", label: "Last Updated" },
  ],

  defaults: { is_active: false, is_test_mode: true, config: "{}" },
};
