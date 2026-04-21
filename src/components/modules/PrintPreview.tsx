/**
 * PrintPreview — ERPNext-style print template renderer
 *
 * Uses an iframe with srcdoc for full HTML/CSS isolation.
 * Supports {{field_name}}, {% for item in items %}, and {{company_*}} placeholders.
 */
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { Printer, Download, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PrintFormat {
  id: string;
  name: string;
  html_template: string;
  css?: string;
  header_html?: string;
  footer_html?: string;
  paper_size: string;
  orientation: string;
  margin_top: number;
  margin_bottom: number;
  margin_left: number;
  margin_right: number;
}

interface PrintPreviewProps {
  doctype: string;
  record: any;
  items?: any[];
  /** Batch mode — if provided, renders every entry in the array with page-breaks between.
   *  `record` and `items` props are used only as a fallback when `batchRecords` is absent. */
  batchRecords?: Array<{ record: any; items?: any[] }>;
  /** Pre-select this print format id (otherwise picks the company's default). */
  initialFormatId?: string | null;
  onClose: () => void;
}

function renderTemplate(template: string, data: any, items: any[], company: any): string {
  let html = template;

  if (company) {
    html = html.replace(/\{\{company_name\}\}/g, company.name || "");
    html = html.replace(/\{\{company_email\}\}/g, company.contact_email || "");
    html = html.replace(/\{\{company_phone\}\}/g, company.contact_phone || "");
    html = html.replace(/\{\{company_address\}\}/g, company.address || "");
    html = html.replace(/\{\{company_city\}\}/g, company.city || "");
    html = html.replace(/\{\{company_state\}\}/g, company.state || "");
    html = html.replace(/\{\{company_gst\}\}/g, company.gst_no || "");
    html = html.replace(/\{\{company_logo\}\}/g, company.logo_url || "");
    html = html.replace(/\{\{company_pincode\}\}/g, company.pincode || "");
    html = html.replace(/\{\{company_country\}\}/g, company.country || "");
  }

  html = html.replace(/\{\{today\}\}/g, new Date().toLocaleDateString("en-IN"));
  html = html.replace(/\{\{now\}\}/g, new Date().toLocaleString("en-IN"));

  const loopRegex = /\{%\s*for\s+item\s+in\s+items\s*%\}([\s\S]*?)\{%\s*endfor\s*%\}/g;
  html = html.replace(loopRegex, (_match, loopBody) => {
    if (!items || items.length === 0) return "";
    return items
      .map((item, idx) => {
        let row = loopBody;
        row = row.replace(/\{\{item\.index\}\}/g, String(idx + 1));
        row = row.replace(/\{\{item\.(\w+)\}\}/g, (_: string, field: string) => {
          const val = item[field];
          if (val === null || val === undefined) return "";
          if (typeof val === "number") return val.toLocaleString("en-IN");
          return String(val);
        });
        return row;
      })
      .join("");
  });

  html = html.replace(/\{\{(\w+)\}\}/g, (_match, field) => {
    const val = data[field];
    if (val === null || val === undefined) return "";
    if (val instanceof Date) return val.toLocaleDateString("en-IN");
    if (typeof val === "number") return val.toLocaleString("en-IN");
    if (typeof val === "boolean") return val ? "Yes" : "No";
    return String(val);
  });

  return html;
}

function generateDefaultTemplate(record: any, items: any[]): string {
  const headerRows = Object.entries(record)
    .filter(([k]) => !["id", "company_id", "created_at", "updated_at", "custom_fields"].includes(k))
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(([k, v]) => {
      const label = k.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
      const val = typeof v === "object" ? JSON.stringify(v) : String(v);
      return `<tr><td style="padding:6px 12px;font-weight:600;color:#374151;width:35%;border-bottom:1px solid #f1f5f9;">${label}</td><td style="padding:6px 12px;color:#1f2937;border-bottom:1px solid #f1f5f9;">${val}</td></tr>`;
    })
    .join("");

  let itemsHtml = "";
  if (items && items.length > 0) {
    const itemKeys = Object.keys(items[0]).filter(k => !["id", "company_id", "sort_order", "created_at", "updated_at"].includes(k) && !k.endsWith("_id"));
    const ths = itemKeys.map(k => `<th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;border-bottom:2px solid #e5e7eb;">${k.replace(/_/g, " ")}</th>`).join("");
    const rows = items.map(item => {
      const tds = itemKeys.map(k => {
        let v = item[k];
        if (v === null || v === undefined) v = "";
        if (typeof v === "number") v = v.toLocaleString("en-IN");
        return `<td style="padding:6px 12px;font-size:13px;color:#1f2937;border-bottom:1px solid #f1f5f9;">${v}</td>`;
      }).join("");
      return `<tr>${tds}</tr>`;
    }).join("");
    itemsHtml = `<h3 style="font-size:14px;font-weight:700;color:#111827;margin:24px 0 12px;padding-bottom:8px;border-bottom:2px solid #2563eb;">Line Items</h3><table style="width:100%;border-collapse:collapse;"><thead><tr>${ths}</tr></thead><tbody>${rows}</tbody></table>`;
  }

  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:800px;margin:0 auto;color:#1f2937;">
    <div style="text-align:center;padding:20px 0;border-bottom:3px solid #2563eb;margin-bottom:24px;">
      <h1 style="font-size:22px;font-weight:800;color:#111827;margin:0;">{{company_name}}</h1>
      <p style="font-size:12px;color:#6b7280;margin:4px 0 0;">{{company_address}} {{company_city}} {{company_state}}</p>
      <p style="font-size:11px;color:#9ca3af;margin:2px 0 0;">Phone: {{company_phone}} | Email: {{company_email}}</p>
    </div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">${headerRows}</table>
    ${itemsHtml}
    <div style="text-align:center;padding:16px 0;margin-top:32px;border-top:1px solid #e5e7eb;">
      <p style="font-size:10px;color:#9ca3af;">Printed on {{today}}</p>
    </div>
  </div>`;
}

/** Render a single document body (no outer <html>) — used for both single and batch output. */
function renderDocumentBody(
  selectedFormat: PrintFormat | null,
  record: any,
  items: any[],
  company: any,
): string {
  const template = selectedFormat?.html_template || generateDefaultTemplate(record, items);
  const rendered = renderTemplate(template, record, items, company);
  const headerHtml = selectedFormat?.header_html ? renderTemplate(selectedFormat.header_html, record, items, company) : "";
  const footerHtml = selectedFormat?.footer_html ? renderTemplate(selectedFormat.footer_html, record, items, company) : "";
  return `${headerHtml}${rendered}${footerHtml}`;
}

function buildFullHtml(
  selectedFormat: PrintFormat | null,
  documents: Array<{ record: any; items: any[] }>,
  company: any,
): string {
  const customCss = selectedFormat?.css || "";
  const mt = selectedFormat?.margin_top ?? 20;
  const mb = selectedFormat?.margin_bottom ?? 20;
  const ml = selectedFormat?.margin_left ?? 15;
  const mr = selectedFormat?.margin_right ?? 15;
  const paperSize = selectedFormat?.paper_size || "A4";
  const orientation = selectedFormat?.orientation || "portrait";

  const body = documents
    .map((doc, idx) => {
      const rendered = renderDocumentBody(selectedFormat, doc.record, doc.items || [], company);
      // Last document has no forced page-break — lets print use natural pagination.
      const breakAfter = idx < documents.length - 1 ? ' style="page-break-after: always; break-after: page;"' : "";
      return `<section${breakAfter}>${rendered}</section>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    color: #1f2937;
    line-height: 1.5;
    padding: ${mt}mm ${mr}mm ${mb}mm ${ml}mm;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  table { border-collapse: collapse; }
  img { max-width: 100%; }
  section + section { margin-top: ${mt}mm; }
  @media print {
    @page { size: ${paperSize} ${orientation}; margin: ${mt}mm ${mr}mm ${mb}mm ${ml}mm; }
    body { padding: 0; }
    section + section { margin-top: 0; }
  }
  ${customCss}
</style>
</head><body>
${body}
</body></html>`;
}

export default function PrintPreview({ doctype, record, items = [], batchRecords, initialFormatId, onClose }: PrintPreviewProps) {
  const { activeCompany } = useTenant();
  const [formats, setFormats] = useState<PrintFormat[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<PrintFormat | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFormats = async () => {
      if (!activeCompany) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("print_formats")
          .select("*")
          .eq("company_id", activeCompany.id)
          .eq("doctype_key", doctype)
          .eq("is_active", true)
          .order("is_default", { ascending: false });

        if (!error && data && data.length > 0) {
          setFormats(data);
          const preferred = initialFormatId
            ? data.find((f: any) => f.id === initialFormatId)
            : undefined;
          setSelectedFormat(preferred || data.find((f: any) => f.is_default) || data[0]);
        }
      } catch {}
      setLoading(false);
    };
    fetchFormats();
  }, [activeCompany?.id, doctype]);

  const documents = useMemo(
    () => batchRecords && batchRecords.length > 0
      ? batchRecords.map((r) => ({ record: r.record, items: r.items || [] }))
      : [{ record, items }],
    [batchRecords, record, items],
  );

  const fullHtml = useMemo(
    () => buildFullHtml(selectedFormat, documents, activeCompany),
    [selectedFormat, documents, activeCompany],
  );

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(fullHtml);
    printWindow.document.close();
    printWindow.onload = () => printWindow.print();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-foreground">
              Print Preview
              {documents.length > 1 && (
                <span className="ml-2 erp-pill bg-primary-100 text-primary-700">{documents.length} docs</span>
              )}
            </h3>

            {formats.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                >
                  {selectedFormat?.name || "Default"}
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
                {showDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-10 min-w-[200px]">
                    {formats.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => { setSelectedFormat(f); setShowDropdown(false); }}
                        className={cn(
                          "w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition",
                          selectedFormat?.id === f.id ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-700"
                        )}
                      >
                        {f.name}
                        {f.is_default && <span className="ml-2 text-[10px] text-slate-400">(default)</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {formats.length === 0 && !loading && (
              <span className="text-xs text-slate-400">Using default layout</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handlePrint} className="h-8 text-xs font-medium">
              <Printer className="w-3.5 h-3.5 mr-1.5" /> Print
            </Button>
            <Button size="sm" variant="outline" onClick={handlePrint} className="h-8 text-xs font-medium">
              <Download className="w-3.5 h-3.5 mr-1.5" /> Save as PDF
            </Button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-200 transition text-slate-500">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Preview — iframe with srcdoc for full HTML/CSS isolation */}
        <div className="flex-1 overflow-auto bg-slate-200 p-6 flex justify-center">
          <div className="bg-white shadow-xl" style={{ width: "210mm", minHeight: "297mm" }}>
            <iframe
              srcDoc={fullHtml}
              className="w-full border-0"
              style={{ width: "210mm", minHeight: "297mm", height: "100%" }}
              title="Print Preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
