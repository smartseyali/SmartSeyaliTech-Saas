import type { DocTypeDef } from "../types";

export const crmAccount: DocTypeDef = {
  name: "CRM Account",
  tableName: "crm_accounts",
  module: "crm",
  icon: "Building2",
  listTitle: "B2B Accounts",
  formTitle: "B2B Account",
  showItems: false,

  headerFields: [
    { key: "name", label: "Company Name", required: true },
    { key: "industry", label: "Industry Vertical" },
    { key: "website", label: "Domain" },
  ],

  columns: [
    { key: "name", label: "Account Name" },
    { key: "industry", label: "Sector" },
  ],
};
