import type { DocTypeDef } from "../types";

export const crmSegment: DocTypeDef = {
  name: "Segment",
  tableName: "crm_segments",
  module: "crm",
  icon: "Target",
  listTitle: "Marketing Segments",
  formTitle: "Marketing Segment",
  showItems: false,

  headerFields: [
    { key: "name", label: "Segment Tag", required: true },
    { key: "criteria", label: "Target Audience Profile" },
  ],

  columns: [
    { key: "name", label: "Segment" },
    { key: "criteria", label: "Audience" },
  ],
};
