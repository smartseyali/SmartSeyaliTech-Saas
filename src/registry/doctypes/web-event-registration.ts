import type { DocTypeDef } from "../types";

export const webEventRegistration: DocTypeDef = {
  name: "Event Registration",
  tableName: "web_event_registrations",
  module: "website",
  showItems: false,

  headerFields: [
    { key: "event_id", label: "Event", type: "select", required: true, lookupTable: "web_events", lookupLabel: "title", lookupValue: "id" },
    { key: "attendee_name", label: "Attendee Name", type: "text", required: true },
    { key: "attendee_email", label: "Attendee Email", type: "email" },
    { key: "attendee_phone", label: "Attendee Phone", type: "phone" },
    { key: "contact_id", label: "Contact", type: "select", lookupTable: "master_contacts", lookupLabel: "full_name", lookupValue: "id" },
    { key: "ticket_no", label: "Ticket No", type: "text" },
    { key: "status", label: "Status", type: "select", options: [
      { value: "registered", label: "Registered" },
      { value: "confirmed", label: "Confirmed" },
      { value: "attended", label: "Attended" },
      { value: "no_show", label: "No Show" },
      { value: "cancelled", label: "Cancelled" },
    ]},
    { key: "notes", label: "Notes", type: "textarea", width: "full" },
  ],

  columns: [
    { key: "attendee_name", label: "Name" },
    { key: "attendee_email", label: "Email" },
    { key: "status", label: "Status" },
    { key: "ticket_no", label: "Ticket No" },
    { key: "created_at", label: "Registered At" },
  ],

  statusField: "status",
  defaults: { status: "registered" },
  searchableFields: ["attendee_name", "attendee_email", "ticket_no"],
};
