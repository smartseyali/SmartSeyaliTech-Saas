import type { DocTypeDef } from "../types";

export const platformCurrency: DocTypeDef = {
  name: "Currency",
  tableName: "system_currencies",
  module: "platform",
  icon: "DollarSign",
  listTitle: "Currencies",
  formTitle: "Currency",
  showItems: false,
  isGlobal: true,

  defaults: {
    decimals: 2,
    exchange_rate: 1,
    is_default: false,
    is_active: true,
    sort_order: 0,
  },

  searchableFields: ["code", "name", "symbol"],

  headerFields: [
    { key: "code", label: "Code", type: "text", required: true, placeholder: "USD, INR, EUR" },
    { key: "name", label: "Name", type: "text", required: true, placeholder: "US Dollar" },
    { key: "symbol", label: "Symbol", type: "text", required: true, placeholder: "$" },
    { key: "exchange_rate", label: "Exchange Rate (vs base)", type: "number", placeholder: "1.0" },
    { key: "decimals", label: "Decimal Places", type: "number", placeholder: "2" },
    { key: "sort_order", label: "Sort Order", type: "number", placeholder: "0" },
    { key: "is_default", label: "Default Currency", type: "checkbox" },
    { key: "is_active", label: "Active", type: "checkbox" },
  ],

  columns: [
    { key: "code", label: "Code", className: "font-semibold text-gray-900 dark:text-foreground" },
    { key: "name", label: "Name" },
    { key: "symbol", label: "Symbol" },
    { key: "exchange_rate", label: "Rate" },
    { key: "decimals", label: "Decimals" },
    { key: "is_default", label: "Default" },
    { key: "is_active", label: "Active" },
  ],
};
