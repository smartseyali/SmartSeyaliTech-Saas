import type { DocTypeDef } from "../types";

export const whatsappTemplate: DocTypeDef = {
  name: "WhatsApp Template",
  tableName: "whatsapp_templates",
  module: "whatsapp",
  icon: "MessageSquare",
  listTitle: "WhatsApp Templates",
  formTitle: "WhatsApp Template",
  showItems: false,

  defaults: {
    status: "pending",
    category: "MARKETING",
  },

  headerFields: [
    { key: "name", label: "Template Name", required: true, placeholder: "Summer_Promo_2026..." },
    {
      key: "category", label: "Category", type: "select",
      options: [
        { label: "Marketing Campaign", value: "MARKETING" },
        { label: "Utility Transactional", value: "UTILITY" },
        { label: "Authentication", value: "AUTHENTICATION" },
      ],
    },
    { key: "language", label: "Language", placeholder: "en_US..." },
    { key: "meta_template_id", label: "Meta Template ID", placeholder: "h_1029348123..." },
    {
      key: "status", label: "Status", type: "select",
      options: [
        { label: "Pending Meta Approval", value: "pending" },
        { label: "Authorized", value: "approved" },
        { label: "Rejected", value: "rejected" },
      ],
    },
  ],

  columns: [
    { key: "identity", label: "Template Name" },
    { key: "structure", label: "Message Components" },
    { key: "meta_id", label: "Meta ID" },
    { key: "status", label: "Status" },
  ],
};
