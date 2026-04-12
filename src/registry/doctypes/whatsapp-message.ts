import type { DocTypeDef } from "../types";

export const whatsappMessage: DocTypeDef = {
  name: "WhatsApp Message",
  tableName: "whatsapp_messages",
  module: "whatsapp",
  icon: "MessageSquare",
  listTitle: "Messages",
  formTitle: "Message",
  showItems: false,
  selectQuery: "*, whatsapp_conversations(id, whatsapp_contacts(name, phone))",

  defaults: {
    direction: "outbound",
    message_type: "text",
    status: "pending",
  },

  headerFields: [
    {
      key: "conversation_id", label: "Conversation", type: "select",
      lookupTable: "whatsapp_conversations",
      lookupLabel: "id",
      lookupValue: "id",
    },
    {
      key: "direction", label: "Direction", type: "select",
      options: [
        { label: "Inbound", value: "inbound" },
        { label: "Outbound", value: "outbound" },
      ],
    },
    {
      key: "message_type", label: "Type", type: "select",
      options: [
        { label: "Text", value: "text" },
        { label: "Image", value: "image" },
        { label: "Video", value: "video" },
        { label: "Document", value: "document" },
        { label: "Audio", value: "audio" },
        { label: "Template", value: "template" },
        { label: "Interactive", value: "interactive" },
        { label: "Location", value: "location" },
      ],
    },
    { key: "body", label: "Message Body", type: "textarea" },
    { key: "media_url", label: "Media URL", type: "text" },
    {
      key: "status", label: "Status", type: "select",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Sent", value: "sent" },
        { label: "Delivered", value: "delivered" },
        { label: "Read", value: "read" },
        { label: "Failed", value: "failed" },
      ],
    },
  ],

  tabFields: {
    audit: [
      { key: "wa_message_id", label: "WA Message ID", readOnly: true },
      { key: "sent_at", label: "Sent At", type: "datetime-local", readOnly: true },
      { key: "delivered_at", label: "Delivered At", type: "datetime-local", readOnly: true },
      { key: "read_at", label: "Read At", type: "datetime-local", readOnly: true },
      { key: "error_code", label: "Error Code", readOnly: true },
      { key: "error_message", label: "Error Message", readOnly: true },
    ],
  },

  columns: [
    {
      key: "conversation_id", label: "Contact",
      render: (item: any) => {
        const conv = item.whatsapp_conversations;
        const contact = conv?.whatsapp_contacts;
        return contact ? `${contact.name}` : `#${item.conversation_id}`;
      },
    },
    { key: "direction", label: "Direction" },
    { key: "message_type", label: "Type" },
    { key: "body", label: "Message" },
    { key: "status", label: "Status" },
    { key: "created_at", label: "Time" },
  ],

  defaultSort: { key: "created_at", dir: "desc" },
  searchableFields: ["body", "wa_message_id"],
};
