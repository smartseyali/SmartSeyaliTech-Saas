import type { DocTypeDef } from "../types";

export const crmLead: DocTypeDef = {
  name: "Lead",
  tableName: "crm_leads",
  module: "crm",
  icon: "UserPlus",
  listTitle: "Revenue Pipeline",
  formTitle: "Lead",
  showItems: false,

  defaults: {
    status: "new",
    priority: "2",
  },

  headerFields: [
    { key: "full_name", label: "Lead Name", required: true, placeholder: "Prospective Client..." },
    {
      key: "status", label: "Pipeline Stage", type: "select",
      options: [
        { label: "New Inquiry", value: "new" },
        { label: "Contacted", value: "contacted" },
        { label: "Qualified Opportunity", value: "qualified" },
        { label: "Closed / Won", value: "won" },
        { label: "Lost", value: "lost" },
      ],
    },
    { key: "email", label: "Email Address", placeholder: "lead@example.com" },
    { key: "phone", label: "Phone Number", placeholder: "+91..." },
    { key: "company_name", label: "Corporate", placeholder: "Lead Organization..." },
    {
      key: "priority", label: "Priority", type: "select",
      options: [
        { label: "High", value: "3" },
        { label: "Medium", value: "2" },
        { label: "Low", value: "1" },
      ],
    },
  ],

  columns: [
    { key: "name", label: "Lead" },
    { key: "contact", label: "Email" },
    { key: "pipeline", label: "Pipeline" },
    { key: "status", label: "Status" },
  ],

  statusFlow: [
    {
      field: "status",
      options: [
        { label: "New Inquiry", value: "new" },
        { label: "Contacted", value: "contacted" },
        { label: "Qualified Opportunity", value: "qualified" },
        { label: "Closed / Won", value: "won" },
        { label: "Lost", value: "lost" },
      ],
    },
  ],
};
