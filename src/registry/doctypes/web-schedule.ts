import type { DocTypeDef } from "../types";

export const webSchedule: DocTypeDef = {
  name: "Schedule",
  tableName: "web_schedules",
  module: "website",
  showItems: false,

  headerFields: [
    { key: "title", label: "Title", type: "text", required: true },
    { key: "group_id", label: "Group", type: "select", required: true, lookupTable: "web_groups", lookupLabel: "name", lookupValue: "id" },
    { key: "schedule_date", label: "Date", type: "date", required: true },
    { key: "start_time", label: "Start Time", type: "text", placeholder: "09:00" },
    { key: "end_time", label: "End Time", type: "text", placeholder: "11:00" },
    { key: "duration_minutes", label: "Duration (min)", type: "number" },
    { key: "schedule_type", label: "Type", type: "select", options: [
      { value: "session", label: "Session" },
      { value: "appointment", label: "Appointment" },
      { value: "meeting", label: "Meeting" },
      { value: "class", label: "Class" },
      { value: "webinar", label: "Webinar" },
      { value: "consultation", label: "Consultation" },
    ]},
    { key: "facilitator_name", label: "Instructor", type: "text" },
    { key: "facilitator_id", label: "Instructor", type: "select", lookupTable: "users", lookupLabel: "full_name", lookupValue: "id" },
    { key: "venue", label: "Venue", type: "text" },
    { key: "meeting_link", label: "Meeting Link", type: "text" },
    { key: "recording_url", label: "Recording URL", type: "text" },
    { key: "materials_url", label: "Materials URL", type: "text" },
    { key: "status", label: "Status", type: "select", options: [
      { value: "scheduled", label: "Scheduled" },
      { value: "in_progress", label: "In Progress" },
      { value: "completed", label: "Completed" },
      { value: "cancelled", label: "Cancelled" },
      { value: "postponed", label: "Postponed" },
    ]},
    { key: "attendance_count", label: "Attendance", type: "number" },
    { key: "description", label: "Description", type: "textarea", width: "full" },
    { key: "notes", label: "Notes", type: "textarea", width: "full" },
  ],

  columns: [
    { key: "title", label: "Title" },
    { key: "schedule_date", label: "Date" },
    { key: "schedule_type", label: "Type" },
    { key: "facilitator_name", label: "Instructor" },
    { key: "status", label: "Status" },
    { key: "attendance_count", label: "Attendance" },
  ],

  statusField: "status",
  defaults: { status: "scheduled", schedule_type: "session", attendance_count: 0 },
};
