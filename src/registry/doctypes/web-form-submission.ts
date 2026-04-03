import type { DocTypeDef } from "../types";

export const webFormSubmission: DocTypeDef = {
  name: "Web Form Submission",
  tableName: "web_form_submissions",
  module: "website",
  showItems: false,

  headerFields: [
    { key: "form_id", label: "Form", type: "select", required: true, lookupTable: "web_forms", lookupLabel: "name", lookupValue: "id" },
    { key: "submitter_name", label: "Submitter Name", type: "text" },
    { key: "submitter_email", label: "Submitter Email", type: "email" },
    { key: "status", label: "Status", type: "select", options: [
      { value: "new", label: "New" },
      { value: "reviewed", label: "Reviewed" },
      { value: "archived", label: "Archived" },
    ]},
    { key: "data", label: "Submitted Data", type: "textarea", width: "full", readOnly: true },
    { key: "notes", label: "Notes", type: "textarea", width: "full" },
  ],

  columns: [
    { key: "submitter_name", label: "Name" },
    { key: "submitter_email", label: "Email" },
    { key: "status", label: "Status" },
    { key: "created_at", label: "Submitted" },
  ],

  statusField: "status",
};
