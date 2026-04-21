import type { DocTypeDef } from "../types";

export const platformLanguage: DocTypeDef = {
  name: "Language",
  tableName: "system_languages",
  module: "platform",
  icon: "Languages",
  listTitle: "Languages",
  formTitle: "Language",
  showItems: false,
  isGlobal: true,

  defaults: {
    direction: "ltr",
    is_default: false,
    is_active: true,
  },

  searchableFields: ["code", "name", "native_name"],

  headerFields: [
    { key: "code", label: "Locale Code", type: "text", required: true, placeholder: "en, ta, hi, ar" },
    { key: "name", label: "English Name", type: "text", required: true, placeholder: "Tamil" },
    { key: "native_name", label: "Native Name", type: "text", placeholder: "தமிழ்" },
    {
      key: "direction", label: "Text Direction", type: "select",
      options: [{ label: "Left to Right (LTR)", value: "ltr" }, { label: "Right to Left (RTL)", value: "rtl" }],
    },
    { key: "is_default", label: "Default Language", type: "checkbox" },
    { key: "is_active", label: "Active", type: "checkbox" },
  ],

  columns: [
    { key: "code", label: "Code", className: "font-semibold text-gray-900 dark:text-foreground" },
    { key: "name", label: "Name" },
    { key: "native_name", label: "Native" },
    { key: "direction", label: "Direction" },
    { key: "is_default", label: "Default" },
    { key: "is_active", label: "Active" },
  ],
};
