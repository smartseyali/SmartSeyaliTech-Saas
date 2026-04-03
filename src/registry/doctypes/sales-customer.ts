import type { DocTypeDef } from "../types";

export const salesCustomer: DocTypeDef = {
  name: "Customer",
  tableName: "master_contacts",
  module: "sales",
  icon: "Users",
  listTitle: "Customer Relationship Matrix",
  formTitle: "Customer Master",
  showItems: false,

  defaults: {
    type: "customer",
    status: "Active",
  },

  tabFields: {
    basic: [
      { key: "name", label: "Customer Name *", type: "text", required: true, placeholder: "Full Legal Name" },
      { key: "gstin", label: "Customer GSTIN", placeholder: "27AAAAA0000A1Z5" },
      { key: "pan", label: "Permanent Account Number (PAN)", placeholder: "ABCDE1234F" },
      {
        key: "customer_group", label: "Customer Group", type: "select",
        options: [
          { value: "Retail", label: "Retail" },
          { value: "Wholesale", label: "Wholesale / Distributor" },
          { value: "Export", label: "Export" },
        ],
      },
      { key: "industry", label: "Industry Segment", placeholder: "e.g. Textiles, Tech" },
    ],
    config: [
      { key: "contact_person", label: "Primary Contact Person", placeholder: "Name" },
      { key: "designation", label: "Designation", placeholder: "e.g. Purchase Manager" },
      { key: "email", label: "Email Address", type: "email" },
      { key: "phone", label: "Mobile / Phone", placeholder: "+91" },
    ],
    mapping: [
      { key: "billing_address", label: "Register Billing Address", type: "textarea", placeholder: "Include State & Pincode" },
      { key: "shipping_address", label: "Shipping Address", type: "textarea" },
    ],
    audit: [
      { key: "credit_limit", label: "Credit Limit (INR)", type: "currency" },
      { key: "payment_terms", label: "Payment Terms / Credit Days", placeholder: "e.g. 30 Days" },
      {
        key: "status", label: "Customer Status", type: "select",
        options: [
          { value: "Active", label: "Active" },
          { value: "On-Hold", label: "On-Hold" },
          { value: "Inactive", label: "Inactive" },
        ],
      },
    ],
  },

  columns: [
    { key: "name", label: "Customer Name" },
    { key: "phone", label: "Contact No" },
    { key: "city", label: "Location / State" },
    { key: "status", label: "Status" },
  ],
};
