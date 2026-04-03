import type { DocTypeDef } from "../types";

export const webAutomationRule: DocTypeDef = {
  name: "Automation Rule",
  tableName: "web_automation_rules",
  module: "website",
  showItems: false,

  tabFields: {
    basic: [
      { key: "name", label: "Rule Name", type: "text", required: true },
      { key: "description", label: "Description", type: "textarea" },
      { key: "trigger_event", label: "Trigger Event", type: "select", required: true, options: [
        { value: "enrollment_created", label: "Enrollment Created" },
        { value: "payment_received", label: "Payment Received" },
        { value: "form_submitted", label: "Form Submitted" },
        { value: "enquiry_new", label: "New Enquiry" },
        { value: "event_registered", label: "Event Registered" },
        { value: "batch_started", label: "Batch Started" },
      ]},
      { key: "trigger_entity", label: "Target Entity", type: "select", options: [
        { value: "web_registrations", label: "Registrations" },
        { value: "web_payments", label: "Payments" },
        { value: "web_form_submissions", label: "Form Submissions" },
        { value: "web_enquiries", label: "Enquiries" },
        { value: "web_event_registrations", label: "Event Registrations" },
        { value: "web_groups", label: "Groups" },
        { value: "web_schedules", label: "Schedules" },
        { value: "web_credentials", label: "Credentials" },
        { value: "master_items", label: "Items" },
        { value: "master_contacts", label: "Contacts" },
      ]},
    ],
    config: [
      { key: "conditions", label: "Conditions", type: "textarea", width: "full", placeholder: "Define conditions for this rule" },
      { key: "actions", label: "Actions", type: "textarea", width: "full", placeholder: "Define actions to perform" },
      { key: "is_active", label: "Active", type: "checkbox" },
      { key: "run_count", label: "Run Count", type: "number", readOnly: true },
      { key: "last_run_at", label: "Last Run At", type: "datetime-local", readOnly: true },
    ],
  },

  columns: [
    { key: "name", label: "Rule Name" },
    { key: "trigger_event", label: "Trigger" },
    { key: "is_active", label: "Active" },
    { key: "run_count", label: "Runs" },
    { key: "last_run_at", label: "Last Run" },
  ],

  defaults: { is_active: true, run_count: 0 },
};
