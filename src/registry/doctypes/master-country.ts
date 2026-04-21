import type { DocTypeDef } from "../types";

export const masterCountry: DocTypeDef = {
  name: "Country",
  tableName: "master_countries",
  module: "masters",
  icon: "Globe2",
  listTitle: "Countries",
  formTitle: "Country",
  showItems: false,
  isGlobal: true,

  defaults: {
    is_active: true,
    sort_order: 0,
  },

  headerFields: [
    { key: "name", label: "Country Name *", type: "text", required: true, placeholder: "e.g. India" },
    { key: "iso2", label: "ISO 2", type: "text", placeholder: "IN" },
    { key: "iso3", label: "ISO 3", type: "text", placeholder: "IND" },
    { key: "phone_code", label: "Phone Code", type: "text", placeholder: "+91" },
    { key: "currency_code", label: "Currency Code", type: "text", placeholder: "INR" },
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
    { key: "name", label: "Country", className: "font-bold text-slate-900" },
    { key: "iso2", label: "ISO2" },
    { key: "iso3", label: "ISO3" },
    { key: "phone_code", label: "Phone" },
    { key: "currency_code", label: "Currency" },
    { key: "is_active", label: "Status" },
  ],

  searchableFields: ["name", "iso2", "iso3"],
  defaultSort: { key: "sort_order", dir: "asc" },
};
