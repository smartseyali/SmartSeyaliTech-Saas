import type { DocTypeDef } from "../types";

export const crmContact: DocTypeDef = {
  name: "CRM Contact",
  tableName: "master_contacts",
  module: "crm",
  icon: "User",
  listTitle: "Directory",
  formTitle: "CRM Contact",
  showItems: false,

  defaults: {
    type: "customer",
    status: "active",
  },

  headerFields: [
    { key: "name", label: "Contact Name", required: true, placeholder: "First Last or Company..." },
    { key: "email", label: "Email Address", placeholder: "email@domain.com" },
    { key: "phone", label: "Phone Number", placeholder: "+91 ..." },
    { key: "company_name", label: "Company Name", placeholder: "Acme Corp" },
    { key: "job_title", label: "Job Title", placeholder: "Manager / Director" },
    {
      key: "type", label: "Type", type: "select",
      options: [
        { label: "Standard Customer", value: "customer" },
        { label: "Strategic Vendor", value: "vendor" },
        { label: "Prospect Lead", value: "lead" },
      ],
    },
    { key: "city", label: "City", placeholder: "City" },
    {
      key: "status", label: "Status", type: "select",
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
        { label: "Blocked", value: "blocked" },
      ],
    },
  ],

  columns: [
    { key: "name", label: "Entity Name" },
    { key: "company_name", label: "Corporate Unit" },
    { key: "email", label: "Communication" },
    { key: "status", label: "Status" },
  ],
};
