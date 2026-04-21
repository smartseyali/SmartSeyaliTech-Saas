import type { DocTypeDef } from "../types";

export const masterState: DocTypeDef = {
  name: "State",
  tableName: "master_states",
  module: "masters",
  icon: "MapPin",
  listTitle: "States",
  formTitle: "State / Province",
  showItems: false,
  isGlobal: true,

  selectQuery: "*, master_countries(name, iso2)",

  defaults: {
    is_active: true,
    sort_order: 0,
  },

  headerFields: [
    {
      key: "country_id", label: "Country *", type: "select", required: true,
      lookupTable: "master_countries",
      lookupValue: "id",
      lookupLabel: "name",
    },
    { key: "name", label: "State Name *", type: "text", required: true, placeholder: "e.g. Tamil Nadu" },
    { key: "code", label: "Code", type: "text", placeholder: "TN" },
    { key: "gst_code", label: "GST Code", type: "text", placeholder: "33" },
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
    { key: "name", label: "State", className: "font-bold text-slate-900" },
    { key: "master_countries.name", label: "Country" },
    { key: "code", label: "Code" },
    { key: "gst_code", label: "GST Code" },
    { key: "is_active", label: "Status" },
  ],

  searchableFields: ["name", "code", "gst_code"],
  defaultSort: { key: "sort_order", dir: "asc" },
};
