import type { DocTypeDef } from "../types";

/**
 * WhatsApp Logs is a read-only list view (no ERPEntryForm).
 * This doctype captures the list-view column metadata.
 */
export const whatsappLog: DocTypeDef = {
  name: "WhatsApp Log",
  tableName: "whatsapp_logs",
  module: "whatsapp",
  icon: "MessageSquare",
  listTitle: "Communication Logs",
  formTitle: "WhatsApp Log",
  showItems: false,

  headerFields: [
    { key: "created_at", label: "Date", type: "datetime-local", readOnly: true },
    { key: "contact", label: "Contact", readOnly: true },
    { key: "direction", label: "Direction", readOnly: true },
    { key: "event_type", label: "Event Type", readOnly: true },
    { key: "message", label: "Message", type: "textarea", readOnly: true },
    { key: "status", label: "Status", readOnly: true },
    { key: "wa_message_id", label: "WA Message ID", readOnly: true },
  ],

  columns: [
    { key: "created_at", label: "Date" },
    { key: "contact", label: "Contact" },
    { key: "direction", label: "Direction" },
    { key: "event_type", label: "Event" },
    { key: "message", label: "Message" },
    { key: "status", label: "Status" },
  ],

  defaultSort: { key: "created_at", dir: "desc" },
  searchableFields: ["contact", "message", "wa_message_id"],
};
