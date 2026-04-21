import type { DocTypeDef } from "../types";

export const platformCountry: DocTypeDef = {
  name: "Country",
  tableName: "system_countries",
  module: "platform",
  icon: "Globe2",
  listTitle: "Countries",
  formTitle: "Country",
  showItems: false,
  isGlobal: true,

  defaults: {
    is_active: true,
    sort_order: 0,
  },

  searchableFields: ["code", "name", "calling_code"],

  headerFields: [
    { key: "code", label: "ISO Code (2-letter)", type: "text", required: true, placeholder: "IN, US, GB" },
    { key: "name", label: "Name", type: "text", required: true, placeholder: "India" },
    { key: "calling_code", label: "Calling Code", type: "text", placeholder: "+91" },
    { key: "currency_code", label: "Default Currency", type: "select", lookupTable: "system_currencies", lookupValue: "code", lookupLabel: "code" },
    { key: "sort_order", label: "Sort Order", type: "number", placeholder: "0" },
    { key: "is_active", label: "Active", type: "checkbox" },
  ],

  columns: [
    { key: "code", label: "Code", className: "font-semibold text-gray-900 dark:text-foreground" },
    { key: "name", label: "Name" },
    { key: "calling_code", label: "Dial Code" },
    { key: "currency_code", label: "Currency" },
    { key: "is_active", label: "Active" },
  ],
};
