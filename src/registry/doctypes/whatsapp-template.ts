import type { DocTypeDef } from "../types";

export const whatsappTemplate: DocTypeDef = {
  name: "WhatsApp Template",
  tableName: "whatsapp_templates",
  module: "whatsapp",
  icon: "FileText",
  listTitle: "Message Templates",
  formTitle: "WhatsApp Template",
  showItems: false,

  defaults: {
    status: "pending",
    category: "MARKETING",
    language: "en_US",
    header_type: "none",
  },

  headerFields: [
    { key: "name", label: "Template Name", required: true, placeholder: "summer_promo_2026" },
    {
      key: "category", label: "Category", type: "select",
      options: [
        { label: "Marketing", value: "MARKETING" },
        { label: "Utility", value: "UTILITY" },
        { label: "Authentication", value: "AUTHENTICATION" },
      ],
    },
    { key: "language", label: "Language Code", placeholder: "en_US" },
    {
      key: "status", label: "Approval Status", type: "select",
      options: [
        { label: "Pending Approval", value: "pending" },
        { label: "Approved", value: "approved" },
        { label: "Rejected", value: "rejected" },
      ],
    },
    { key: "meta_template_id", label: "Meta Template ID", placeholder: "Auto-filled on submission" },
    {
      key: "header_type", label: "Header Type", type: "select",
      options: [
        { label: "None", value: "none" },
        { label: "Text", value: "text" },
        { label: "Image", value: "image" },
        { label: "Video", value: "video" },
        { label: "Document", value: "document" },
      ],
    },
    { key: "header_content", label: "Header Content / Media URL", type: "text", placeholder: "Header text or media URL" },
    { key: "body", label: "Message Body", type: "textarea", placeholder: "Hello {{1}}, your order {{2}} has been shipped!" },
    { key: "footer_text", label: "Footer Text", type: "text", placeholder: "Reply STOP to unsubscribe" },
    { key: "variables", label: "Variables (comma-separated)", type: "text", placeholder: "name, order_id, amount" },
    { key: "buttons", label: "Buttons (JSON)", type: "textarea", placeholder: '[{"type":"QUICK_REPLY","text":"Track Order"},{"type":"URL","text":"Visit Store","url":"https://..."}]' },
    { key: "sample_values", label: "Sample Values (JSON)", type: "textarea", placeholder: '{"1":"John","2":"ORD-1234"}' },
  ],

  columns: [
    { key: "name", label: "Template Name" },
    { key: "category", label: "Category" },
    { key: "language", label: "Language" },
    { key: "status", label: "Status" },
    { key: "meta_template_id", label: "Meta ID" },
  ],

  statusFlow: [
    {
      field: "status",
      options: [
        { label: "Pending Approval", value: "pending" },
        { label: "Approved", value: "approved" },
        { label: "Rejected", value: "rejected" },
      ],
    },
  ],

  searchableFields: ["name", "meta_template_id"],
};
