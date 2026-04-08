import type { DocTypeDef } from "../types";

export const ecomCustomer: DocTypeDef = {
  name: "Customer",
  tableName: "ecom_customers",
  itemTableName: "ecom_customer_addresses",
  itemForeignKey: "customer_id",
  module: "ecommerce",
  icon: "Users",
  listTitle: "Ecommerce Customers",
  formTitle: "Customer",
  showItems: true,
  itemTitle: "Delivery Addresses",

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
          { value: "true", label: "Yes" },
          { value: "false", label: "No" },
        ],
      },
    ],
    config: [
      { key: "address", label: "Primary Address", type: "textarea", placeholder: "Street address" },
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

  itemFields: [
    { key: "label", label: "Label", type: "text", placeholder: "e.g. Home, Office, Warehouse" },
    { key: "full_name", label: "Recipient Name", type: "text", placeholder: "Full name" },
    { key: "phone", label: "Phone", type: "text", placeholder: "+91 98765 43210" },
    { key: "address_line1", label: "Address Line 1", type: "text", placeholder: "Building, street" },
    { key: "address_line2", label: "Address Line 2", type: "text", placeholder: "Area, landmark" },
    { key: "city", label: "City", type: "text", placeholder: "City" },
    { key: "state", label: "State", type: "text", placeholder: "State" },
    { key: "pincode", label: "Pincode", type: "text", placeholder: "600001" },
    { key: "country", label: "Country", type: "text", placeholder: "India" },
    { key: "is_default", label: "Default?", type: "select", options: [
      { value: "true", label: "Yes" },
      { value: "false", label: "No" },
    ]},
  ],

  columns: [
    { key: "full_name", label: "Customer Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "status", label: "Status" },
  ],
};
