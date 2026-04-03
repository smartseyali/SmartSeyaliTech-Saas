import type { DocTypeDef } from "../types";

export const masterFiscalYear: DocTypeDef = {
  name: "Fiscal Year",
  tableName: "master_fiscal_years",
  module: "masters",
  icon: "Calendar",
  listTitle: "Fiscal Years",
  formTitle: "Fiscal Year",
  showItems: false,

  headerFields: [
    { key: "name", label: "Fiscal Year Name (e.g. FY 2024-25)", required: true },
    { key: "start_date", label: "Start Date", type: "date" },
    { key: "end_date", label: "End Date", type: "date" },
  ],

  columns: [
    { key: "name", label: "Fiscal Year" },
    { key: "start_date", label: "Start" },
  ],
};
