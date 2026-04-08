import type { DocTypeDef } from "../types";

export const printFormat: DocTypeDef = {
  name: "Print Format",
  tableName: "print_formats",
  module: "masters",
  icon: "FileText",
  listTitle: "Print Formats",
  formTitle: "Print Format",
  showItems: false,

  defaults: {
    format_type: "custom",
    is_default: false,
    is_active: true,
    paper_size: "A4",
    orientation: "portrait",
    margin_top: 20,
    margin_bottom: 20,
    margin_left: 15,
    margin_right: 15,
  },

  tabFields: {
    basic: [
      { key: "name", label: "Template Name *", type: "text", required: true, placeholder: "e.g. Standard Invoice" },
      { key: "doctype_key", label: "Applies To (DocType) *", type: "text", required: true, placeholder: "e.g. salesInvoice, salesOrder, ecomCustomer" },
      {
        key: "format_type", label: "Type", type: "select",
        options: [
          { value: "standard", label: "Standard" },
          { value: "custom", label: "Custom" },
        ],
      },
      {
        key: "is_default", label: "Default Template?", type: "select",
        options: [
          { value: "true", label: "Yes" },
          { value: "false", label: "No" },
        ],
      },
      {
        key: "is_active", label: "Active", type: "select",
        options: [
          { value: "true", label: "Yes" },
          { value: "false", label: "No" },
        ],
      },
    ],
    config: [
      { key: "html_template", label: "HTML Template *", type: "textarea", required: true, placeholder: "Use {{field_name}} for placeholders, {% for item in items %}...{% endfor %} for line items.\n\nAvailable variables:\n- {{field_name}} — any field from the document\n- {{company_name}}, {{company_email}}, {{company_phone}}\n- {{company_address}}, {{company_city}}, {{company_state}}, {{company_gst}}\n- {{today}}, {{now}}\n- {% for item in items %}{{item.field}}{% endfor %}" },
      { key: "css", label: "Custom CSS", type: "textarea", placeholder: "Additional styles for this template" },
    ],
    mapping: [
      { key: "header_html", label: "Page Header (repeats on each page)", type: "textarea", placeholder: "Optional header HTML with {{placeholders}}" },
      { key: "footer_html", label: "Page Footer (repeats on each page)", type: "textarea", placeholder: "Optional footer HTML with {{placeholders}}" },
    ],
    audit: [
      {
        key: "paper_size", label: "Paper Size", type: "select",
        options: [
          { value: "A4", label: "A4" },
          { value: "A5", label: "A5" },
          { value: "Letter", label: "Letter" },
        ],
      },
      {
        key: "orientation", label: "Orientation", type: "select",
        options: [
          { value: "portrait", label: "Portrait" },
          { value: "landscape", label: "Landscape" },
        ],
      },
      { key: "margin_top", label: "Top Margin (mm)", type: "number", placeholder: "20" },
      { key: "margin_bottom", label: "Bottom Margin (mm)", type: "number", placeholder: "20" },
      { key: "margin_left", label: "Left Margin (mm)", type: "number", placeholder: "15" },
      { key: "margin_right", label: "Right Margin (mm)", type: "number", placeholder: "15" },
    ],
  },

  columns: [
    { key: "name", label: "Template Name" },
    { key: "doctype_key", label: "DocType" },
    { key: "format_type", label: "Type" },
    { key: "is_default", label: "Default" },
    { key: "is_active", label: "Active" },
  ],
};
