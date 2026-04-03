import type { DocTypeDef } from "../types";

export const masterUser: DocTypeDef = {
  name: "User",
  tableName: "master_users",
  module: "masters",
  icon: "UserPlus",
  listTitle: "User Directory",
  formTitle: "User",
  showItems: false,

  defaults: {
    is_active: true,
    role: "Operator",
  },

  tabFields: {
    basic: [
      { key: "full_name", label: "Full Name", type: "text", required: true, placeholder: "e.g. Johnathan Doe" },
      { key: "email", label: "Email", type: "text", required: true, placeholder: "john.doe@company.com" },
      { key: "phone", label: "Phone", type: "text", placeholder: "+91 ..." },
      {
        key: "role", label: "Role", type: "select",
        options: [
          { label: "Super Admin", value: "SuperAdmin" },
          { label: "Manager", value: "Manager" },
          { label: "Operator", value: "Operator" },
          { label: "Viewer", value: "Viewer" },
        ],
      },
    ],
    config: [
      { key: "password", label: "Password", type: "text", placeholder: "Enter password..." },
      {
        key: "is_active", label: "Status", type: "select",
        options: [
          { value: "true", label: "Active" },
          { value: "false", label: "Inactive" },
        ],
      },
      {
        key: "mfa_enabled", label: "Multi-Factor Authentication (MFA)", type: "select",
        options: [
          { value: "true", label: "Mandatory" },
          { value: "false", label: "Optional" },
        ],
      },
    ],
    mapping: [
      { key: "department_id", label: "Department", type: "text" },
      { key: "erp_user_ref", label: "External ID", type: "text" },
    ],
  },

  columns: [
    { key: "full_name", label: "Name", className: "font-bold text-slate-900" },
    { key: "email", label: "Email", className: "text-blue-600 font-medium" },
    { key: "role", label: "Role", className: "text-slate-500 font-bold uppercase text-[11px] tracking-widest" },
    { key: "is_active", label: "Status" },
    { key: "last_login", label: "Last Login" },
  ],
};
