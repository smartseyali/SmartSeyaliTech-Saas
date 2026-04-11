import type { DocTypeDef } from "../types";

export const whatsappConversation: DocTypeDef = {
  name: "WhatsApp Conversation",
  tableName: "whatsapp_conversations",
  module: "whatsapp",
  icon: "MessageCircle",
  listTitle: "Conversations",
  formTitle: "Conversation",
  showItems: false,
  selectQuery: "*, whatsapp_contacts(name, phone)",

  defaults: {
    status: "bot",
    unread_count: 0,
  },

  headerFields: [
    {
      key: "contact_id", label: "Contact", type: "select", required: true,
      lookupTable: "whatsapp_contacts",
      lookupLabel: "name",
      lookupValue: "id",
    },
    {
      key: "account_id", label: "WhatsApp Account", type: "select",
      lookupTable: "whatsapp_accounts",
      lookupLabel: "display_name",
      lookupValue: "id",
    },
    {
      key: "assigned_to", label: "Assigned Agent", type: "select",
      lookupTable: "master_users",
      lookupLabel: "full_name",
      lookupValue: "id",
    },
    {
      key: "status", label: "Status", type: "select",
      options: [
        { label: "Bot Handling", value: "bot" },
        { label: "Waiting for Agent", value: "waiting" },
        { label: "Open (Agent)", value: "open" },
        { label: "Resolved", value: "resolved" },
        { label: "Session Expired", value: "expired" },
      ],
    },
    { key: "tags", label: "Tags", type: "text", placeholder: "support, billing" },
  ],

  tabFields: {
    audit: [
      { key: "last_message_at", label: "Last Message", type: "datetime-local", readOnly: true },
      { key: "last_message_preview", label: "Last Message Preview", type: "text", readOnly: true },
      { key: "unread_count", label: "Unread Count", type: "number", readOnly: true },
      { key: "session_expires_at", label: "Session Expires", type: "datetime-local", readOnly: true },
      { key: "created_at", label: "Created", type: "datetime-local", readOnly: true },
    ],
  },

  columns: [
    { key: "contact_id", label: "Contact" },
    { key: "status", label: "Status" },
    { key: "assigned_to", label: "Agent" },
    { key: "last_message_preview", label: "Last Message" },
    { key: "unread_count", label: "Unread" },
    { key: "last_message_at", label: "Last Active" },
  ],

  searchableFields: ["last_message_preview"],
};
