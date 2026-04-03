import type { DocTypeDef } from "../types";

export const masterContact: DocTypeDef = {
  name: "Contact",
  tableName: "master_contacts",
  module: "masters",
  icon: "User",
  listTitle: "Contact List",
  formTitle: "Contact",
  showItems: true,

  defaults: {
    status: "Active",
  },

  tabFields: {
    basic: [
      { key: "full_name", label: "Legal Name *", type: "text", required: true, placeholder: "Company or Individual Name" },
      {
        key: "type", label: "Type", type: "select",
        options: [
          { label: "Customer", value: "Customer" },
          { label: "Vendor", value: "Vendor" },
          { label: "Employee", value: "Employee" },
        ],
      },
      { key: "phone", label: "Phone Number", type: "text", placeholder: "+91..." },
      { key: "email", label: "Email Address", type: "text", placeholder: "contact@example.com" },
      { key: "gst_number", label: "GST Number", type: "text", placeholder: "27AAAAA0000A1Z5" },
      { key: "pan", label: "PAN", type: "text", placeholder: "ABCDE1234F" },
    ],
    config: [
      { key: "billing_address", label: "Billing Address", type: "textarea", placeholder: "Full billing address..." },
      { key: "shipping_address", label: "Shipping Address", type: "textarea", placeholder: "Full shipping address..." },
    ],
    mapping: [
      { key: "erp_id", label: "ERP ID", type: "text" },
      {
        key: "status", label: "Status", type: "select",
        options: [
          { value: "Active", label: "Active" },
          { value: "Blocked", label: "Blocked" },
        ],
      },
    ],
  },

  itemFields: [
    { key: "contact_person", label: "Contact Person", type: "text", placeholder: "Name" },
    { key: "phone", label: "Phone", type: "text", placeholder: "Phone" },
    { key: "email", label: "Email", type: "text", placeholder: "Email" },
    { key: "role", label: "Role", type: "text", placeholder: "e.g. Manager" },
  ],

  columns: [
    { key: "full_name", label: "Contact Name", className: "font-bold text-slate-900" },
    { key: "type", label: "Category" },
    { key: "email", label: "Email Address" },
    { key: "phone", label: "Phone Number" },
    { key: "status", label: "Status" },
    { key: "updated_at", label: "Updated Date" },
  ],
};
