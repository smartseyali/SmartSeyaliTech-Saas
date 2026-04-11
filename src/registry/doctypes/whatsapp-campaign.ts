import type { DocTypeDef } from "../types";

export const whatsappCampaign: DocTypeDef = {
  name: "WhatsApp Campaign",
  tableName: "whatsapp_campaigns",
  module: "whatsapp",
  icon: "Megaphone",
  listTitle: "Campaigns",
  formTitle: "WhatsApp Campaign",
  showItems: false,

  defaults: {
    status: "draft",
    campaign_type: "marketing",
  },

  headerFields: [
    { key: "name", label: "Campaign Name", required: true, placeholder: "Summer Sale 2026" },
    {
      key: "campaign_type", label: "Type", type: "select",
      options: [
        { label: "Marketing Broadcast", value: "marketing" },
        { label: "Transactional Notification", value: "transactional" },
      ],
    },
    {
      key: "template_id", label: "Message Template", type: "select",
      lookupTable: "whatsapp_templates",
      lookupLabel: "name",
      lookupValue: "id",
      lookupFilter: { status: "approved" },
    },
    {
      key: "status", label: "Status", type: "select",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Scheduled", value: "scheduled" },
        { label: "Running", value: "running" },
        { label: "Paused", value: "paused" },
        { label: "Completed", value: "completed" },
        { label: "Failed", value: "failed" },
      ],
    },
    { key: "scheduled_at", label: "Schedule Date/Time", type: "datetime-local" },
  ],

  tabFields: {
    basic: [
      { key: "segment_tags", label: "Target Tags (comma-separated)", type: "text", placeholder: "vip, repeat-buyer" },
      { key: "variable_map", label: "Variable Mapping (JSON)", type: "textarea", placeholder: '{"name": "contact.name", "order_id": "contact.attributes.last_order"}' },
    ],
    audit: [
      { key: "total_recipients", label: "Total Recipients", type: "number", readOnly: true },
      { key: "sent_count", label: "Sent", type: "number", readOnly: true },
      { key: "delivered_count", label: "Delivered", type: "number", readOnly: true },
      { key: "read_count", label: "Read", type: "number", readOnly: true },
      { key: "failed_count", label: "Failed", type: "number", readOnly: true },
      { key: "started_at", label: "Started At", type: "datetime-local", readOnly: true },
      { key: "completed_at", label: "Completed At", type: "datetime-local", readOnly: true },
    ],
  },

  columns: [
    { key: "name", label: "Campaign" },
    { key: "campaign_type", label: "Type" },
    { key: "status", label: "Status" },
    { key: "total_recipients", label: "Recipients" },
    { key: "sent_count", label: "Sent" },
    { key: "delivered_count", label: "Delivered" },
    { key: "read_count", label: "Read" },
  ],

  statusFlow: [
    {
      field: "status",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Scheduled", value: "scheduled" },
        { label: "Running", value: "running" },
        { label: "Paused", value: "paused" },
        { label: "Completed", value: "completed" },
        { label: "Failed", value: "failed" },
      ],
      transitions: {
        draft: ["scheduled", "running"],
        scheduled: ["running", "draft"],
        running: ["paused", "completed", "failed"],
        paused: ["running", "draft"],
      },
    },
  ],

  searchableFields: ["name"],
};
