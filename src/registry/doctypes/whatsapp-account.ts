import type { DocTypeDef } from "../types";

export const whatsappAccount: DocTypeDef = {
  name: "WhatsApp Account",
  tableName: "whatsapp_accounts",
  module: "whatsapp",
  icon: "Smartphone",
  listTitle: "Meta Accounts",
  formTitle: "WhatsApp Account",
  showItems: false,

  defaults: {
    status: "pending",
  },

  headerFields: [
    { key: "display_name", label: "Account Name", required: true, placeholder: "Primary Business API..." },
    { key: "phone_number_id", label: "Meta Phone Number ID", required: true, placeholder: "1092837465..." },
    { key: "waba_id", label: "WhatsApp Business Account ID", required: true, placeholder: "987654321..." },
    { key: "access_token", label: "Permanent access Token", type: "text", placeholder: "EAAG..." },
    {
      key: "status", label: "Verification", type: "select",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Infrastructure Verified", value: "verified" },
        { label: "Connection Interrupted", value: "disconnected" },
      ],
    },
  ],

  columns: [
    { key: "identity", label: "Account Name" },
    { key: "infrastructure", label: "Status" },
    { key: "security", label: "Verified" },
    { key: "status", label: "Status" },
  ],
};
