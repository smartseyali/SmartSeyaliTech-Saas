import type { DocTypeDef } from "../types";

export const whatsappBotRule: DocTypeDef = {
  name: "WhatsApp Bot Rule",
  tableName: "whatsapp_bot_rules",
  module: "whatsapp",
  icon: "Bot",
  listTitle: "Bot Rules",
  formTitle: "Bot Rule",
  showItems: false,

  defaults: {
    rule_type: "keyword",
    is_active: true,
    priority: 100,
    response_type: "text",
  },

  headerFields: [
    { key: "name", label: "Rule Name", required: true, placeholder: "Pricing enquiry auto-reply" },
    {
      key: "rule_type", label: "Trigger Type", type: "select",
      options: [
        { label: "Keyword Match", value: "keyword" },
        { label: "Menu Selection", value: "menu" },
        { label: "Welcome Message", value: "welcome" },
        { label: "Fallback (No Match)", value: "fallback" },
        { label: "Regex Pattern", value: "regex" },
      ],
    },
    { key: "priority", label: "Priority (lower = first)", type: "number" },
    { key: "is_active", label: "Active", type: "checkbox" },
    { key: "trigger_keywords", label: "Keywords (comma-separated)", type: "text", placeholder: "price, pricing, cost, rate" },
    { key: "trigger_pattern", label: "Regex Pattern", type: "text", placeholder: "order\\s*#?\\d+" },
    {
      key: "response_type", label: "Response Type", type: "select",
      options: [
        { label: "Text Message", value: "text" },
        { label: "Template Message", value: "template" },
        { label: "Interactive Buttons", value: "interactive" },
        { label: "Transfer to Agent", value: "transfer" },
      ],
    },
    { key: "response_body", label: "Response Text", type: "textarea", placeholder: "Thanks for your interest! Our pricing starts at..." },
    {
      key: "response_template_id", label: "Response Template", type: "select",
      lookupTable: "whatsapp_templates",
      lookupLabel: "name",
      lookupValue: "id",
      lookupFilter: { status: "approved" },
    },
  ],

  tabFields: {
    config: [
      { key: "response_buttons", label: "Button Config (JSON)", type: "textarea", placeholder: '[{"id":"1","title":"View Pricing"},{"id":"2","title":"Talk to Agent"}]' },
      {
        key: "transfer_to", label: "Transfer to Agent", type: "select",
        lookupTable: "master_users",
        lookupLabel: "full_name",
        lookupValue: "id",
      },
    ],
  },

  columns: [
    { key: "name", label: "Rule Name" },
    { key: "rule_type", label: "Trigger" },
    { key: "priority", label: "Priority" },
    { key: "response_type", label: "Response" },
    { key: "is_active", label: "Active" },
  ],

  defaultSort: { key: "priority", dir: "asc" },
  searchableFields: ["name", "trigger_keywords"],
};
