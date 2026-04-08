/**
 * PrintPreview — ERPNext-style print template renderer
 *
 * Renders an HTML template with {{field}} placeholders replaced by actual document data.
 * Supports:
 * - {{field_name}} for header fields
 * - {% for item in items %}...{% endfor %} for line items
 * - {{item.field_name}} inside loops
 * - {{company_name}}, {{company_email}} etc. for company context
 * - {{today}}, {{now}} for dates
 */
import { useState, useEffect, useRef } from "react";
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
  onClose: () => void;
}

/** Render template by replacing {{placeholders}} with data */
function renderTemplate(template: string, data: any, items: any[], company: any): string {
  let html = template;

  // Replace {{company_*}} placeholders
  if (company) {
    html = html.replace(/\{\{company_name\}\}/g, company.name || "");
    html = html.replace(/\{\{company_email\}\}/g, company.contact_email || "");
    html = html.replace(/\{\{company_phone\}\}/g, company.contact_phone || "");
    html = html.replace(/\{\{company_address\}\}/g, company.address || "");
    html = html.replace(/\{\{company_city\}\}/g, company.city || "");
    html = html.replace(/\{\{company_state\}\}/g, company.state || "");
    html = html.replace(/\{\{company_gst\}\}/g, company.gst_no || "");
  }

  // Replace {{today}} and {{now}}
  html = html.replace(/\{\{today\}\}/g, new Date().toLocaleDateString("en-IN"));
  html = html.replace(/\{\{now\}\}/g, new Date().toLocaleString("en-IN"));

  // Handle {% for item in items %}...{% endfor %} loops
  const loopRegex = /\{%\s*for\s+item\s+in\s+items\s*%\}([\s\S]*?)\{%\s*endfor\s*%\}/g;
  html = html.replace(loopRegex, (_match, loopBody) => {
    if (!items || items.length === 0) return "";
    return items
      .map((item, idx) => {
        let row = loopBody;
        // Replace {{item.field}} and {{item.index}}
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

  // Replace {{field_name}} for header fields
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

/** Default template when no print format exists */
function generateDefaultTemplate(record: any, items: any[]): string {
  const headerRows = Object.entries(record)
    .filter(([k]) => !["id", "company_id", "created_at", "updated_at", "custom_fields"].includes(k))
    .map(([k, v]) => {
      if (v === null || v === undefined || v === "") return "";
      const label = k.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
      const val = typeof v === "object" ? JSON.stringify(v) : String(v);
      return `<tr><td style="padding:6px 12px;font-weight:600;color:#374151;width:35%;border-bottom:1px solid #f1f5f9;">${label}</td><td style="padding:6px 12px;color:#1f2937;border-bottom:1px solid #f1f5f9;">${val}</td></tr>`;
    })
    .filter(Boolean)
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
    itemsHtml = `
      <h3 style="font-size:14px;font-weight:700;color:#111827;margin:24px 0 12px;padding-bottom:8px;border-bottom:2px solid #2563eb;">Line Items</h3>
      <table style="width:100%;border-collapse:collapse;"><thead><tr>${ths}</tr></thead><tbody>${rows}</tbody></table>
    `;
  }

  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:800px;margin:0 auto;color:#1f2937;">
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
    </div>
  `;
}

export default function PrintPreview({ doctype, record, items = [], onClose }: PrintPreviewProps) {
  const { activeCompany } = useTenant();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [formats, setFormats] = useState<PrintFormat[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<PrintFormat | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch available print formats for this doctype
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
          setSelectedFormat(data.find((f: any) => f.is_default) || data[0]);
        }
      } catch {}
      setLoading(false);
    };
    fetchFormats();
  }, [activeCompany?.id, doctype]);

  // Render the template into the iframe
  useEffect(() => {
    if (!iframeRef.current) return;
    const template = selectedFormat?.html_template || generateDefaultTemplate(record, items);
    const rendered = renderTemplate(template, record, items, activeCompany);
    const customCss = selectedFormat?.css || "";
    const headerHtml = selectedFormat?.header_html ? renderTemplate(selectedFormat.header_html, record, items, activeCompany) : "";
    const footerHtml = selectedFormat?.footer_html ? renderTemplate(selectedFormat.footer_html, record, items, activeCompany) : "";
    const paperSize = selectedFormat?.paper_size || "A4";
    const orientation = selectedFormat?.orientation || "portrait";
    const mt = selectedFormat?.margin_top ?? 20;
    const mb = selectedFormat?.margin_bottom ?? 20;
    const ml = selectedFormat?.margin_left ?? 15;
    const mr = selectedFormat?.margin_right ?? 15;

    const fullHtml = `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1f2937; line-height: 1.5; padding: ${mt}mm ${mr}mm ${mb}mm ${ml}mm; }
  table { border-collapse: collapse; }
  @media print {
    @page { size: ${paperSize} ${orientation}; margin: ${mt}mm ${mr}mm ${mb}mm ${ml}mm; }
    body { padding: 0; }
    .no-print { display: none !important; }
  }
  ${customCss}
</style>
</head><body>
${headerHtml}
${rendered}
${footerHtml}
</body></html>`;

    const doc = iframeRef.current.contentDocument;
    if (doc) {
      doc.open();
      doc.write(fullHtml);
      doc.close();
    }
  }, [selectedFormat, record, items, activeCompany]);

  const handlePrint = () => {
    iframeRef.current?.contentWindow?.print();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-slate-800">Print Preview</h3>

            {/* Template selector */}
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

        {/* Preview */}
        <div className="flex-1 overflow-auto bg-slate-100 p-6">
          <div className="bg-white shadow-lg mx-auto" style={{ maxWidth: "210mm", minHeight: "297mm" }}>
            <iframe
              ref={iframeRef}
              className="w-full h-full border-0"
              style={{ minHeight: "297mm" }}
              title="Print Preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
