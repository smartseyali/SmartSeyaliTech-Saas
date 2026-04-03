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

  columns: [
    { key: "created_at", label: "Date" },
    { key: "contact", label: "Contact" },
    { key: "direction", label: "Direction" },
    { key: "message", label: "Message" },
    { key: "status", label: "Status" },
  ],
};
