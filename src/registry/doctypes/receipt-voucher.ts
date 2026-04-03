import type { DocTypeDef } from "../types";

export const receiptVoucher: DocTypeDef = {
  name: "Receipt Voucher",
  tableName: "receipt_vouchers",
  module: "sales",
  icon: "CreditCard",
  listTitle: "Receipt Vouchers",
  formTitle: "Receipt Voucher",
  showItems: false,

  defaults: {
    payment_mode: "bank",
    amount: 0,
    status: "draft",
  },

  headerFields: [
    { key: "reference_no", label: "Reference No", required: true, placeholder: "RV-2026-001" },
    { key: "voucher_date", label: "Voucher Date", type: "date", required: true },
    { key: "customer_name", label: "Customer Name", required: true, placeholder: "Customer name..." },
    {
      key: "payment_mode", label: "Payment Mode", type: "select",
      options: [
        { label: "Cash", value: "cash" },
        { label: "Bank Transfer", value: "bank" },
        { label: "Cheque", value: "cheque" },
        { label: "UPI", value: "upi" },
        { label: "NEFT", value: "neft" },
        { label: "RTGS", value: "rtgs" },
      ],
    },
    { key: "bank_account", label: "Bank Account", placeholder: "Account name / number..." },
    { key: "cheque_no", label: "Cheque No", placeholder: "Cheque number..." },
    { key: "cheque_date", label: "Cheque Date", type: "date" },
    { key: "utr_no", label: "UTR No", placeholder: "UTR reference..." },
    { key: "transaction_id", label: "Transaction ID", placeholder: "Transaction ID..." },
    { key: "amount", label: "Amount Received", type: "currency", required: true, placeholder: "0.00" },
    { key: "notes", label: "Notes", placeholder: "Remarks..." },
  ],

  columns: [
    { key: "reference_no", label: "Reference No" },
    { key: "voucher_date", label: "Voucher Date" },
    { key: "customer_name", label: "Customer" },
    { key: "payment_mode", label: "Mode" },
    { key: "amount", label: "Amount" },
    { key: "allocated_amount", label: "Allocated" },
    { key: "unallocated_amount", label: "Unallocated" },
    { key: "status", label: "Status" },
  ],
};
