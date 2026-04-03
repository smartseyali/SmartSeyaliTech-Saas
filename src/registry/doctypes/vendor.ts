import type { DocTypeDef } from "../types";

export const vendor: DocTypeDef = {
  name: "Vendor",
  tableName: "master_contacts",
  module: "purchase",
  icon: "Building2",
  listTitle: "Supplier Matrix",
  formTitle: "Vendor Master",
  showItems: false,

  defaults: {
    type: "vendor",
    status: "Active",
  },

  headerFields: [
    { key: "name", label: "Supplier / Trading Name *", required: true, placeholder: "Legal Entity Name" },
    { key: "gstin", label: "Supplier GSTIN", placeholder: "27AAAAA0000A1Z5" },
    { key: "pan", label: "Permanent Account Number (PAN)", placeholder: "ABCDE1234F" },
    {
      key: "category", label: "Vendor Category / Type", type: "select",
      options: [
        { value: "Manufacturer", label: "Manufacturer" },
        { value: "Trader", label: "Trader / Wholesaler" },
        { value: "Service Provider", label: "Service Provider" },
      ],
    },
    { key: "contact_person", label: "Primary Contact Person", placeholder: "Name" },
    { key: "email", label: "Contact Email", type: "email" },
    { key: "phone", label: "Contact Phone / Mobile", placeholder: "+91" },
    { key: "billing_address", label: "Billing Address (Inc State/Pincode)", type: "textarea" },
    { key: "bank_details", label: "Bank Account Details", type: "textarea", placeholder: "A/c No, IFSC, Branch..." },
    { key: "payment_terms", label: "Payment Terms / Credit Days", placeholder: "e.g. 30 Days" },
    {
      key: "status", label: "Status", type: "select",
      options: [
        { label: "Active", value: "Active" },
        { label: "On-Hold", value: "On-Hold" },
        { label: "Blacklisted", value: "Blocked" },
      ],
    },
    { key: "rating", label: "Vendor Rating (0-5)", type: "number", placeholder: "4.5" },
  ],

  columns: [
    { key: "name", label: "Supplier Name" },
    { key: "contact_info", label: "Contact / Email" },
    { key: "rating", label: "Vendor Rating" },
    { key: "status", label: "Status" },
  ],
};
