import type { DocTypeDef } from "../types";

/**
 * Global print-format library — managed by super admin, read-only for tenants.
 * Keyed by `purpose` (quotation, sales_invoice, delivery_challan, ...).
 * Tenants can clone entries into their per-company `print_formats` table to customise.
 */
export const masterPrintFormat: DocTypeDef = {
  name: "Print Format (Global)",
  tableName: "master_print_formats",
  module: "masters",
  icon: "FileText",
  listTitle: "Print Format Library",
  formTitle: "Global Print Format",
  showItems: false,
  isGlobal: true,

  defaults: {
    format_type: "standard",
    is_default: false,
    is_active: true,
    paper_size: "A4",
    orientation: "portrait",
    margin_top: 20,
    margin_bottom: 20,
    margin_left: 15,
    margin_right: 15,
    sort_order: 0,
  },

  tabFields: {
    basic: [
      { key: "name", label: "Template Name *", type: "text", required: true, placeholder: "e.g. Standard Quotation" },
      {
        key: "purpose", label: "Purpose *", type: "select", required: true,
        options: [
          { value: "quotation",         label: "Quotation" },
          { value: "sales_order",       label: "Sales Order" },
          { value: "sales_invoice",     label: "Sales Invoice" },
          { value: "delivery_challan",  label: "Delivery Challan" },
          { value: "purchase_order",    label: "Purchase Order" },
          { value: "purchase_bill",     label: "Purchase Bill" },
          { value: "receipt",           label: "Receipt Voucher" },
          { value: "payment",           label: "Payment Voucher" },
          { value: "ecom_invoice",      label: "Ecom Invoice" },
          { value: "credit_note",       label: "Credit Note" },
          { value: "debit_note",        label: "Debit Note" },
          { value: "generic",           label: "Generic" },
        ],
      },
      { key: "doctype_key", label: "DocType Key (optional)", type: "text", placeholder: "e.g. salesQuotation" },
      {
        key: "format_type", label: "Type", type: "select",
        options: [
          { value: "standard", label: "Standard" },
          { value: "custom",   label: "Custom" },
        ],
      },
      { key: "description", label: "Description", type: "textarea", placeholder: "Short summary shown to merchants" },
      {
        key: "is_default", label: "Default for Purpose?", type: "select",
        options: [
          { value: "true",  label: "Yes" },
          { value: "false", label: "No" },
        ],
      },
      {
        key: "is_active", label: "Active", type: "select",
        options: [
          { value: "true",  label: "Yes" },
          { value: "false", label: "No" },
        ],
      },
    ],
    config: [
      {
        key: "html_template", label: "HTML Template *", type: "textarea", required: true,
        placeholder:
          "Use {{field_name}} placeholders and {% for item in items %}...{% endfor %} loops.\n\n" +
          "Common variables:\n" +
          "- {{reference_no}}, {{today}}, {{now}}\n" +
          "- {{customer_name}}, {{customer_address}}, {{vendor_name}}\n" +
          "- {{company_name}}, {{company_gst}}, {{company_address}}\n" +
          "- {{grand_total}}, {{amount}}, {{tax_total}}\n" +
          "- {% for item in items %}{{item.name}} {{item.qty}} {{item.rate}}{% endfor %}",
      },
      { key: "css", label: "Custom CSS", type: "textarea", placeholder: "Additional styles" },
    ],
    mapping: [
      { key: "header_html", label: "Page Header (repeats on each page)", type: "textarea" },
      { key: "footer_html", label: "Page Footer (repeats on each page)", type: "textarea" },
    ],
    audit: [
      {
        key: "paper_size", label: "Paper Size", type: "select",
        options: [
          { value: "A4",     label: "A4" },
          { value: "A5",     label: "A5" },
          { value: "Letter", label: "Letter" },
        ],
      },
      {
        key: "orientation", label: "Orientation", type: "select",
        options: [
          { value: "portrait",  label: "Portrait" },
          { value: "landscape", label: "Landscape" },
        ],
      },
      { key: "margin_top",    label: "Top Margin (mm)",    type: "number" },
      { key: "margin_bottom", label: "Bottom Margin (mm)", type: "number" },
      { key: "margin_left",   label: "Left Margin (mm)",   type: "number" },
      { key: "margin_right",  label: "Right Margin (mm)",  type: "number" },
      { key: "sort_order",    label: "Sort Order",         type: "number" },
    ],
  },

  columns: [
    { key: "name",        label: "Template",  className: "font-bold text-slate-900" },
    { key: "purpose",     label: "Purpose" },
    { key: "format_type", label: "Type" },
    { key: "is_default",  label: "Default" },
    { key: "is_active",   label: "Active" },
  ],

  searchableFields: ["name", "purpose", "doctype_key", "description"],
  defaultSort: { key: "sort_order", dir: "asc" },
};
