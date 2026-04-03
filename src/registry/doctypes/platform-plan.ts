import type { DocTypeDef } from "../types";

export const platformPlan: DocTypeDef = {
  name: "Subscription Plan",
  tableName: "system_plans",
  module: "platform",
  icon: "CreditCard",
  listTitle: "Subscription Plans",
  formTitle: "Subscription Plan",
  showItems: false,
  isGlobal: true,

  defaults: {
    is_active: true,
    sort_order: 0,
    price_monthly: 0,
  },

  headerFields: [
    { key: "name", label: "Plan Name", type: "text", required: true, placeholder: "e.g. Professional" },
    { key: "slug", label: "System Slug", type: "text", required: true, placeholder: "e.g. enterprise-tier" },
    { key: "price_monthly", label: "Monthly Price ($)", type: "number", placeholder: "0.00" },
    { key: "sort_order", label: "Sort Priority", type: "number", placeholder: "0" },
    { key: "features", label: "Features (comma-separated)", type: "textarea", placeholder: "Core SaaS Engine, Unlimited Cloud Storage, Dedicated IT Advisor" },
    {
      key: "is_active", label: "Status", type: "select",
      options: [
        { value: "true", label: "Active" },
        { value: "false", label: "Disabled" },
      ],
    },
  ],

  columns: [
    { key: "name", label: "Plan Name", className: "font-bold text-slate-900" },
    { key: "slug", label: "Slug" },
    { key: "price_monthly", label: "Price / Month" },
    { key: "sort_order", label: "Sort Order" },
    { key: "is_active", label: "Status" },
  ],
};
