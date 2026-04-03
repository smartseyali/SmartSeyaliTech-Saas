import type { DocTypeDef } from "../types";

export const crmDeal: DocTypeDef = {
  name: "Deal",
  tableName: "crm_deals",
  module: "crm",
  icon: "Target",
  listTitle: "Active Deals",
  formTitle: "Deal",
  showItems: false,

  defaults: {
    stage: "discovery",
    priority: "medium",
  },

  headerFields: [
    { key: "title", label: "Deal Title", required: true, placeholder: "Enterprise Plan Upgrade..." },
    { key: "amount", label: "Amount", type: "currency", placeholder: "0.00" },
    {
      key: "stage", label: "Stage", type: "select",
      options: [
        { label: "Discovery", value: "discovery" },
        { label: "Proposal", value: "proposal" },
        { label: "Negotiation", value: "negotiation" },
        { label: "Closing", value: "closing" },
        { label: "Won", value: "won" },
        { label: "Lost", value: "lost" },
      ],
    },
    { key: "expected_closing", label: "Forecasted Close Date", type: "date" },
    {
      key: "priority", label: "Priority", type: "select",
      options: [
        { label: "Low", value: "low" },
        { label: "Medium", value: "medium" },
        { label: "High", value: "high" },
      ],
    },
    { key: "notes", label: "Notes", placeholder: "Key deal points..." },
  ],

  columns: [
    { key: "title", label: "Deal" },
    { key: "amount", label: "Amount", className: "text-right" },
    { key: "stage", label: "Stage" },
    { key: "expected_closing", label: "Closing Date" },
  ],

  statusFlow: [
    {
      field: "stage",
      options: [
        { label: "Discovery", value: "discovery" },
        { label: "Proposal", value: "proposal" },
        { label: "Negotiation", value: "negotiation" },
        { label: "Closing", value: "closing" },
        { label: "Won", value: "won" },
        { label: "Lost", value: "lost" },
      ],
    },
  ],
};
