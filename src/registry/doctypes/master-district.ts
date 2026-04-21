import type { DocTypeDef } from "../types";

export const masterDistrict: DocTypeDef = {
  name: "District",
  tableName: "master_districts",
  module: "masters",
  icon: "Map",
  listTitle: "Districts",
  formTitle: "District",
  showItems: false,
  isGlobal: true,

  selectQuery: "*, master_states(name, code)",

  defaults: {
    is_active: true,
    sort_order: 0,
  },

  headerFields: [
    {
      key: "state_id", label: "State *", type: "select", required: true,
      lookupTable: "master_states",
      lookupValue: "id",
      lookupLabel: "name",
    },
    { key: "name", label: "District Name *", type: "text", required: true, placeholder: "e.g. Coimbatore" },
    { key: "code", label: "Code", type: "text", placeholder: "CBE" },
    { key: "sort_order", label: "Sort Order", type: "number", placeholder: "0" },
    {
      key: "is_active", label: "Status", type: "select",
      options: [
        { value: "true", label: "Active" },
        { value: "false", label: "Disabled" },
      ],
    },
  ],

  columns: [
    { key: "name", label: "District", className: "font-bold text-slate-900" },
    { key: "master_states.name", label: "State" },
    { key: "code", label: "Code" },
    { key: "is_active", label: "Status" },
  ],

  searchableFields: ["name", "code"],
  defaultSort: { key: "sort_order", dir: "asc" },
};
