import type { DocTypeDef } from "../types";

export const whatsappMessage: DocTypeDef = {
  name: "WhatsApp Message",
  tableName: "whatsapp_messages",
  module: "whatsapp",
  icon: "MessageSquare",
  listTitle: "Messages",
  formTitle: "Message",
  showItems: false,

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

  columns: [
    { key: "direction", label: "Direction" },
    { key: "message_type", label: "Type" },
    { key: "body", label: "Message" },
    { key: "status", label: "Status" },
    { key: "created_at", label: "Time" },
  ],

  defaultSort: { key: "created_at", dir: "desc" },
};
