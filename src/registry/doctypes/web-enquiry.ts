import type { DocTypeDef } from "../types";

export const webEnquiry: DocTypeDef = {
  name: "Enquiry",
  tableName: "web_enquiries",
  module: "website",
  showItems: false,

  headerFields: [
    { key: "name", label: "Full Name", type: "text", required: true },
    { key: "email", label: "Email", type: "email", required: true },
    { key: "phone", label: "Phone", type: "phone" },
    { key: "subject", label: "Subject", type: "text", placeholder: "Enquiry subject" },
    { key: "source", label: "Source", type: "select", options: [
      { value: "website", label: "Website" },
      { value: "social", label: "Social Media" },
      { value: "referral", label: "Referral" },
      { value: "walk-in", label: "Walk-in" },
    ]},
    { key: "program_name", label: "Program / Service", type: "text" },
    { key: "program_id", label: "Related Item", type: "select", lookupTable: "master_items", lookupLabel: "item_name", lookupValue: "id" },
    { key: "status", label: "Status", type: "select", options: [
      { value: "new", label: "New" },
      { value: "contacted", label: "Contacted" },
      { value: "qualified", label: "Qualified" },
      { value: "enrolled", label: "Enrolled / Converted" },
      { value: "rejected", label: "Closed / Rejected" },
    ]},
    { key: "contact_id", label: "Linked Contact", type: "select", lookupTable: "master_contacts", lookupLabel: "full_name", lookupValue: "id" },
    { key: "assigned_to", label: "Assigned To", type: "select", lookupTable: "users", lookupLabel: "full_name", lookupValue: "id" },
    { key: "message", label: "Message", type: "textarea", width: "full" },
    { key: "notes", label: "Internal Notes", type: "textarea", width: "full" },
  ],

  columns: [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "program_name", label: "Program" },
    { key: "source", label: "Source" },
    { key: "status", label: "Status" },
    { key: "created_at", label: "Date" },
  ],

  statusField: "status",
};
