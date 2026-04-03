import type { DocTypeDef } from "../types";

export const masterRole: DocTypeDef = {
  name: "Role",
  tableName: "master_roles",
  module: "masters",
  icon: "ShieldCheck",
  listTitle: "Roles",
  formTitle: "Role",
  showItems: false,

  defaults: {
    is_active: true,
    scope: "Global",
  },

  tabFields: {
    basic: [
      { key: "name", label: "Role Name", type: "text", required: true, placeholder: "e.g. Finance Controller" },
      {
        key: "scope", label: "Access Scope", type: "select",
        options: [
          { label: "Global", value: "Global" },
          { label: "Module", value: "Module" },
          { label: "Branch", value: "Branch" },
          { label: "Department", value: "Dept" },
        ],
      },
      { key: "description", label: "Description", type: "text", placeholder: "Describe role responsibilities..." },
    ],
    config: [
      { key: "permission_flags", label: "Permissions", type: "text", placeholder: "e.g. view, edit, delete" },
      {
        key: "is_active", label: "Status", type: "select",
        options: [
          { value: "true", label: "Active" },
          { value: "false", label: "Inactive" },
        ],
      },
    ],
    mapping: [
      { key: "external_role_map", label: "External System ID", type: "text" },
      { key: "group_alias", label: "Group Name", type: "text" },
    ],
  },

  columns: [
    { key: "name", label: "Role Name", className: "font-bold text-slate-900 uppercase tracking-tighter" },
    { key: "scope", label: "Scope" },
    { key: "is_active", label: "Status" },
    { key: "updated_at", label: "Last Updated" },
  ],
};
