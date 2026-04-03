import type { DocTypeDef } from "../types";

export const webFaq: DocTypeDef = {
  name: "FAQ",
  tableName: "web_faqs",
  module: "website",
  showItems: false,

  headerFields: [
    { key: "question", label: "Question", type: "text", required: true, placeholder: "Frequently asked question" },
    { key: "answer", label: "Answer", type: "textarea", required: true, placeholder: "Detailed answer (supports HTML)" },
    { key: "category", label: "Category", type: "select", options: [
      { value: "General", label: "General" },
      { value: "Admission", label: "Admission" },
      { value: "Programs", label: "Programs" },
      { value: "Fees", label: "Fees & Payment" },
      { value: "Technical", label: "Technical" },
    ]},
    { key: "sort_order", label: "Sort Order", type: "number" },
    { key: "is_published", label: "Published", type: "checkbox" },
  ],

  columns: [
    { key: "question", label: "Question" },
    { key: "category", label: "Category" },
    { key: "is_published", label: "Published" },
    { key: "sort_order", label: "Order" },
  ],
};
