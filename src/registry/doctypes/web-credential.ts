import type { DocTypeDef } from "../types";

export const webCredential: DocTypeDef = {
  name: "Credential",
  tableName: "web_credentials",
  module: "website",
  showItems: false,

  headerFields: [
    { key: "credential_no", label: "Credential No", type: "text", required: true, placeholder: "CRED-2026-001" },
    { key: "credential_type", label: "Type", type: "select", options: [
      { value: "certificate", label: "Certificate" },
      { value: "badge", label: "Badge" },
      { value: "license", label: "License" },
      { value: "diploma", label: "Diploma" },
      { value: "achievement", label: "Achievement" },
    ]},
    { key: "recipient_name", label: "Recipient Name", type: "text", required: true },
    { key: "item_name", label: "Item Name", type: "text" },
    { key: "registration_id", label: "Registration", type: "select", required: true, lookupTable: "web_registrations", lookupLabel: "registration_no", lookupValue: "id" },
    { key: "item_id", label: "Item / Service", type: "select", lookupTable: "master_items", lookupLabel: "item_name", lookupValue: "id" },
    { key: "issue_date", label: "Issue Date", type: "date" },
    { key: "expiry_date", label: "Expiry Date", type: "date" },
    { key: "grade", label: "Grade", type: "text" },
    { key: "score", label: "Score", type: "number" },
    { key: "verification_code", label: "Verification Code", type: "text", placeholder: "Auto-generated" },
    { key: "document_url", label: "Document URL", type: "text", placeholder: "PDF / image URL" },
    { key: "template_id", label: "Template", type: "select", lookupTable: "web_templates", lookupLabel: "name", lookupValue: "id" },
    { key: "status", label: "Status", type: "select", options: [
      { value: "draft", label: "Draft" },
      { value: "issued", label: "Issued" },
      { value: "revoked", label: "Revoked" },
      { value: "expired", label: "Expired" },
    ]},
    { key: "notes", label: "Notes", type: "textarea", width: "full" },
  ],

  columns: [
    { key: "credential_no", label: "No" },
    { key: "credential_type", label: "Type" },
    { key: "recipient_name", label: "Recipient" },
    { key: "item_name", label: "Item" },
    { key: "issue_date", label: "Issued" },
    { key: "status", label: "Status" },
  ],

  statusField: "status",
  defaults: { status: "issued", credential_type: "certificate" },
  referencePrefix: "CRED",
  searchableFields: ["credential_no", "recipient_name", "verification_code"],
};
