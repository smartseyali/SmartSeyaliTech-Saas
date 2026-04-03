import type { DocTypeDef } from "../types";

export const webEvent: DocTypeDef = {
  name: "Event",
  tableName: "web_events",
  module: "website",
  showItems: false,

  tabFields: {
    basic: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "slug", label: "Slug", type: "text" },
      { key: "event_type", label: "Event Type", type: "select", options: [
        { value: "event", label: "Event" },
        { value: "webinar", label: "Webinar" },
        { value: "workshop", label: "Workshop" },
        { value: "open_house", label: "Open House" },
        { value: "conference", label: "Conference" },
      ]},
      { key: "start_date", label: "Start Date", type: "datetime-local", required: true },
      { key: "end_date", label: "End Date", type: "datetime-local" },
      { key: "mode", label: "Mode", type: "select", options: [
        { value: "online", label: "Online" },
        { value: "offline", label: "Offline" },
        { value: "hybrid", label: "Hybrid" },
      ]},
      { key: "venue", label: "Venue", type: "text" },
      { key: "address", label: "Address", type: "textarea" },
      { key: "meeting_link", label: "Meeting Link", type: "text" },
      { key: "image_url", label: "Image", type: "image", width: "full" },
      { key: "description", label: "Description", type: "textarea", width: "full" },
    ],
    config: [
      { key: "max_attendees", label: "Max Attendees", type: "number" },
      { key: "registration_count", label: "Registration Count", type: "number", readOnly: true },
      { key: "is_free", label: "Is Free", type: "checkbox" },
      { key: "ticket_price", label: "Ticket Price", type: "currency" },
      { key: "registration_url", label: "Registration URL", type: "text" },
      { key: "organizer_name", label: "Organizer Name", type: "text" },
      { key: "contact_email", label: "Contact Email", type: "email" },
      { key: "tags", label: "Tags", type: "text", placeholder: "comma separated" },
      { key: "status", label: "Status", type: "select", options: [
        { value: "draft", label: "Draft" },
        { value: "upcoming", label: "Upcoming" },
        { value: "live", label: "Live" },
        { value: "completed", label: "Completed" },
        { value: "cancelled", label: "Cancelled" },
      ]},
      { key: "is_published", label: "Published", type: "checkbox" },
      { key: "is_featured", label: "Featured", type: "checkbox" },
      { key: "sort_order", label: "Sort Order", type: "number" },
    ],
  },

  columns: [
    { key: "title", label: "Title" },
    { key: "event_type", label: "Type" },
    { key: "start_date", label: "Start Date" },
    { key: "mode", label: "Mode" },
    { key: "status", label: "Status" },
    { key: "is_published", label: "Published" },
    { key: "registration_count", label: "Registrations" },
  ],

  statusField: "status",
  defaults: { status: "upcoming", mode: "offline", is_free: true, ticket_price: 0, registration_count: 0 },
  searchableFields: ["title", "slug", "organizer_name"],
};
