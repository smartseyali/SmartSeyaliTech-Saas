import type { DocTypeDef } from "../types";

/**
 * Read-only log view. Records are inserted by triggers / server-side RPC.
 * Deleting from the list is permitted for housekeeping, but no "New" form.
 */
export const platformAuditLog: DocTypeDef = {
  name: "Audit Log",
  tableName: "system_audit_logs",
  module: "platform",
  icon: "History",
  listTitle: "Audit Trail",
  formTitle: "Audit Entry",
  showItems: false,
  isGlobal: true,

  defaults: {},

  searchableFields: ["actor_email", "action", "entity", "entity_id"],

  headerFields: [
    { key: "actor_email", label: "Actor", type: "text", readOnly: true },
    { key: "action", label: "Action", type: "text", readOnly: true },
    { key: "entity", label: "Entity", type: "text", readOnly: true },
    { key: "entity_id", label: "Entity ID", type: "text", readOnly: true },
    { key: "ip_address", label: "IP Address", type: "text", readOnly: true },
    { key: "created_at", label: "Timestamp", type: "text", readOnly: true },
    { key: "metadata", label: "Metadata", type: "textarea", readOnly: true, width: "full" },
  ],

  columns: [
    { key: "created_at", label: "When" },
    { key: "actor_email", label: "Actor", className: "font-medium text-gray-900 dark:text-foreground" },
    { key: "action", label: "Action" },
    { key: "entity", label: "Entity" },
    { key: "entity_id", label: "Entity ID" },
    { key: "ip_address", label: "IP" },
  ],
};
