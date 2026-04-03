import type { DocTypeDef } from "../types";

export const webGroup: DocTypeDef = {
  name: "Group",
  tableName: "web_groups",
  module: "website",
  showItems: false,

  headerFields: [
    { key: "name", label: "Group Name", type: "text", required: true, placeholder: "e.g. Batch A, Morning Slot" },
    { key: "code", label: "Code", type: "text" },
    { key: "item_id", label: "Item / Service", type: "select", required: true, lookupTable: "master_items", lookupLabel: "item_name", lookupValue: "id" },
    { key: "start_date", label: "Start Date", type: "date" },
    { key: "end_date", label: "End Date", type: "date" },
    { key: "schedule", label: "Schedule", type: "text", placeholder: "e.g. Mon/Wed/Fri 9-11 AM" },
    { key: "max_capacity", label: "Max Capacity", type: "number" },
    { key: "registered_count", label: "Registered", type: "number", readOnly: true },
    { key: "facilitator_name", label: "Instructor", type: "text" },
    { key: "facilitator_id", label: "Instructor", type: "select", lookupTable: "users", lookupLabel: "full_name", lookupValue: "id" },
    { key: "venue", label: "Venue / Location", type: "text" },
    { key: "delivery_mode", label: "Delivery Mode", type: "select", options: [
      { value: "online", label: "Online" },
      { value: "offline", label: "Offline" },
      { value: "hybrid", label: "Hybrid" },
    ]},
    { key: "meeting_link", label: "Meeting Link", type: "text", placeholder: "Zoom / Meet link" },
    { key: "status", label: "Status", type: "select", options: [
      { value: "upcoming", label: "Upcoming" },
      { value: "active", label: "Active" },
      { value: "completed", label: "Completed" },
      { value: "cancelled", label: "Cancelled" },
    ]},
    { key: "is_registration_open", label: "Registration Open", type: "checkbox" },
    { key: "notes", label: "Notes", type: "textarea", width: "full" },
  ],

  columns: [
    { key: "name", label: "Group" },
    { key: "code", label: "Code" },
    { key: "start_date", label: "Start" },
    { key: "end_date", label: "End" },
    { key: "status", label: "Status" },
    { key: "registered_count", label: "Registered" },
    { key: "is_registration_open", label: "Open" },
  ],

  statusField: "status",
  defaults: { status: "upcoming", delivery_mode: "offline", is_registration_open: true, registered_count: 0 },
  searchableFields: ["name", "code"],
};
