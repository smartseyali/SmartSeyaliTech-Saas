import type { DocTypeDef } from "../types";

export const webRegistration: DocTypeDef = {
  name: "Registration",
  tableName: "web_registrations",
  module: "website",
  showItems: false,

  tabFields: {
    basic: [
      { key: "registration_no", label: "Registration No", type: "text", placeholder: "REG-2026-001" },
      { key: "registrant_name", label: "Name", type: "text", required: true },
      { key: "registrant_email", label: "Email", type: "email" },
      { key: "registrant_phone", label: "Phone", type: "phone" },
      { key: "item_id", label: "Item / Service", type: "select", required: true, lookupTable: "master_items", lookupLabel: "item_name", lookupValue: "id" },
      { key: "group_id", label: "Group", type: "select", lookupTable: "web_groups", lookupLabel: "name", lookupValue: "id" },
      { key: "contact_id", label: "Contact", type: "select", lookupTable: "master_contacts", lookupLabel: "full_name", lookupValue: "id" },
      { key: "enquiry_id", label: "Source Enquiry", type: "select", lookupTable: "web_enquiries", lookupLabel: "name", lookupValue: "id" },
      { key: "registration_date", label: "Date", type: "date" },
      { key: "source", label: "Source", type: "select", options: [
        { value: "website", label: "Website" },
        { value: "walk-in", label: "Walk-in" },
        { value: "referral", label: "Referral" },
        { value: "campaign", label: "Campaign" },
      ]},
      { key: "status", label: "Status", type: "select", options: [
        { value: "pending", label: "Pending" },
        { value: "confirmed", label: "Confirmed" },
        { value: "active", label: "Active" },
        { value: "completed", label: "Completed" },
        { value: "dropped", label: "Dropped" },
        { value: "cancelled", label: "Cancelled" },
      ]},
    ],
    config: [
      { key: "total_amount", label: "Total Amount", type: "currency" },
      { key: "discount_amount", label: "Discount", type: "currency" },
      { key: "discount_reason", label: "Discount Reason", type: "text" },
      { key: "paid_amount", label: "Paid", type: "currency", readOnly: true },
      { key: "balance_amount", label: "Balance", type: "currency", readOnly: true },
      { key: "payment_status", label: "Payment Status", type: "select", options: [
        { value: "unpaid", label: "Unpaid" },
        { value: "partial", label: "Partial" },
        { value: "paid", label: "Paid" },
        { value: "refunded", label: "Refunded" },
      ]},
      { key: "notes", label: "Notes", type: "textarea", width: "full" },
    ],
  },

  columns: [
    { key: "registration_no", label: "Reg No" },
    { key: "registrant_name", label: "Name" },
    { key: "registrant_email", label: "Email" },
    { key: "status", label: "Status" },
    { key: "payment_status", label: "Payment" },
    { key: "total_amount", label: "Amount" },
    { key: "paid_amount", label: "Paid" },
    { key: "created_at", label: "Date" },
  ],

  statusField: "status",
  defaults: { status: "pending", payment_status: "unpaid", total_amount: 0, paid_amount: 0, balance_amount: 0, discount_amount: 0 },
  searchableFields: ["registration_no", "registrant_name", "registrant_email"],
};
