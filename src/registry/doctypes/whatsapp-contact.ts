import type { DocTypeDef } from "../types";

export const whatsappContact: DocTypeDef = {
  name: "WhatsApp Contact",
  tableName: "whatsapp_contacts",
  module: "whatsapp",
  icon: "Users",
  listTitle: "Contacts",
  formTitle: "WhatsApp Contact",
  showItems: false,

  defaults: {
    lifecycle_stage: "lead",
    opt_in: false,
    source: "manual",
  },

  headerFields: [
    { key: "name", label: "Full Name", required: true, placeholder: "John Doe" },
    { key: "phone", label: "Phone Number", type: "phone", required: true, placeholder: "+91 98765 43210" },
    { key: "email", label: "Email", type: "email", placeholder: "john@example.com" },
    {
      key: "lifecycle_stage", label: "Lifecycle Stage", type: "select",
      options: [
        { label: "Lead", value: "lead" },
        { label: "Prospect", value: "prospect" },
        { label: "Customer", value: "customer" },
        { label: "Inactive", value: "inactive" },
      ],
    },
    {
      key: "source", label: "Source", type: "select",
      options: [
        { label: "Manual Entry", value: "manual" },
        { label: "CSV Import", value: "csv" },
        { label: "API Import", value: "api" },
        { label: "WhatsApp Chat", value: "whatsapp" },
        { label: "Website Form", value: "website" },
      ],
    },
    { key: "opt_in", label: "Opt-in Consent", type: "checkbox" },
    { key: "opt_in_at", label: "Opt-in Date", type: "datetime-local" },
  ],

  tabFields: {
    basic: [
      { key: "tags", label: "Tags (comma-separated)", type: "text", placeholder: "vip, repeat-buyer, wholesale" },
      { key: "attributes", label: "Custom Attributes (JSON)", type: "textarea", placeholder: '{"city": "Chennai", "plan": "premium"}' },
    ],
    audit: [
      { key: "last_message_at", label: "Last Message", type: "datetime-local", readOnly: true },
      { key: "created_at", label: "Created", type: "datetime-local", readOnly: true },
      { key: "updated_at", label: "Updated", type: "datetime-local", readOnly: true },
    ],
  },

  columns: [
    { key: "name", label: "Contact" },
    { key: "phone", label: "Phone" },
    { key: "lifecycle_stage", label: "Stage" },
    {
      key: "opt_in", label: "Opt-in",
      render: (item: any) => item.opt_in ? "Yes" : "No",
    },
    { key: "source", label: "Source" },
  ],

  searchableFields: ["name", "phone", "email"],
};
