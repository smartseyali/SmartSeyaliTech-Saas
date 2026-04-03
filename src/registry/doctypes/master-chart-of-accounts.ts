import type { DocTypeDef } from "../types";

export const masterChartOfAccounts: DocTypeDef = {
  name: "Chart of Accounts",
  tableName: "master_chart_of_accounts",
  module: "masters",
  icon: "BookOpen",
  listTitle: "Chart of Accounts",
  formTitle: "Account",
  showItems: false,

  defaults: {
    is_group: false,
  },

  headerFields: [
    { key: "account_code", label: "Account Code", required: true, placeholder: "1000-001" },
    { key: "account_name", label: "Account Name", required: true, placeholder: "e.g. Cash, Sales..." },
    {
      key: "account_type", label: "Account Type", type: "select",
      options: [
        { label: "Asset", value: "asset" },
        { label: "Liability", value: "liability" },
        { label: "Equity", value: "equity" },
        { label: "Income", value: "income" },
        { label: "Expense", value: "expense" },
      ],
    },
    {
      key: "parent_account_id", label: "Parent Account", type: "select",
      options: [{ value: "none", label: "None" }],
    },
    {
      key: "is_group", label: "Ledger Type", type: "select",
      options: [
        { label: "Group", value: "true" },
        { label: "Ledger (Transactable)", value: "false" },
      ],
    },
    { key: "notes", label: "Description", type: "text", placeholder: "Enter account description..." },
  ],

  columns: [
    { key: "account_code", label: "Account" },
    { key: "account_type", label: "Type" },
    { key: "balance", label: "Balance" },
    { key: "status", label: "Status" },
  ],
};
