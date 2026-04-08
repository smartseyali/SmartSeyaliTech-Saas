import type { DocTypeDef } from "../types";

export const ecomCustomer: DocTypeDef = {
  name: "Customer",
  tableName: "ecom_customers",
  module: "ecommerce",
  icon: "Users",
  listTitle: "Ecommerce Customers",
  formTitle: "Customer",
  showItems: false,

  defaults: {
    status: "active",
  },

  tabFields: {
    basic: [
      { key: "full_name", label: "Full Name *", type: "text", required: true, placeholder: "Customer full name" },
      { key: "email", label: "Email *", type: "email", required: true, placeholder: "customer@email.com" },
      { key: "phone", label: "Phone", type: "text", placeholder: "+91 98765 43210" },
      {
        key: "status", label: "Status", type: "select",
        options: [
          { value: "active", label: "Active" },
          { value: "blocked", label: "Blocked" },
        ],
      },
      {
        key: "email_verified", label: "Email Verified", type: "select",
        options: [
          { value: true, label: "Yes" },
          { value: false, label: "No" },
        ],
      },
    ],
    config: [
      { key: "address", label: "Address", type: "textarea", placeholder: "Street address" },
      { key: "city", label: "City", type: "text", placeholder: "City" },
      { key: "state", label: "State", type: "text", placeholder: "State" },
      { key: "pincode", label: "Pincode", type: "text", placeholder: "600001" },
    ],
    audit: [
      { key: "total_orders", label: "Total Orders", type: "number" },
      { key: "total_spent", label: "Total Spent (INR)", type: "currency" },
      { key: "created_at", label: "Registered On", type: "date" },
    ],
  },

  columns: [
    { key: "full_name", label: "Customer Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "status", label: "Status" },
  ],
};
