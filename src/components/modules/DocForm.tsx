/**
 * DocForm — ERPNext-style Document Form
 *
 * Layout inspired by ERPNext/Frappe:
 * - Full-width form with fields in the main body (no sidebar)
 * - Fields arranged in 2-column grid rows within white card sections
 * - Section breaks with labels for grouping
 * - Prominent items table with totals footer
 * - Clean header with breadcrumb, status indicator, and action buttons
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import db from "@/lib/db";
import {
  Plus, Trash2, Save, X, ChevronDown, ChevronRight, ChevronLeft, ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { ERPField, FieldType } from "@/types/erp";
import { formatINR } from "@/lib/services/calculationService";
import { StatusBadge } from "@/components/ui/status-badge";
import { MediaUpload } from "@/components/common/MediaUpload";
import { useTenant } from "@/contexts/TenantContext";

/* ── Props ─────────────────────────────────────────────────────────────────── */

interface DocFormProps {
  title: string;
  subtitle?: string;
  headerFields?: ERPField[];
  tabFields?: {
    basic?: ERPField[];
    config?: ERPField[];
    mapping?: ERPField[];
    audit?: ERPField[];
  };
  itemFields?: ERPField[];
  showItems?: boolean;
  itemTitle?: string;
  onSave: (header: any, items: any[]) => Promise<void>;
  onAbort: () => void;
  onDelete?: (id: any) => Promise<void>;
  initialData?: any;
  initialItems?: any[];
  customActions?: React.ReactNode;
  /** Navigate between records */
  onNavigate?: (direction: "prev" | "next") => void;
  currentIndex?: number;
  totalRecords?: number;
}

/* ── Section labels for tabs ───────────────────────────────────────────────── */

const SECTION_LABELS: Record<string, { title: string; description?: string }> = {
  basic: { title: "General Information", description: "Primary details for this document" },
  config: { title: "Configuration & Pricing", description: "Rates, taxes, and operational settings" },
  mapping: { title: "Web & Integration", description: "Online presence and external system mapping" },
  audit: { title: "Inventory & Tracking", description: "Stock levels, warehouses, and audit fields" },
  custom: { title: "Custom Fields", description: "Additional fields configured for your organization" },
};

type TabId = "basic" | "config" | "mapping" | "audit" | "custom";

/* ── Component ─────────────────────────────────────────────────────────────── */

export default function DocForm({
  title, subtitle, headerFields, tabFields, itemFields,
  onSave, onAbort, onDelete, initialData, initialItems,
  showItems = true, itemTitle = "Items", customActions,
  onNavigate, currentIndex = -1, totalRecords = 0,
}: DocFormProps) {
  const { activeCompany } = useTenant();
  const [header, setHeader] = useState<Record<string, any>>(initialData || {});
  const [items, setItems] = useState<any[]>(initialItems || [{}]);
  const [lookupData, setLookupData] = useState<Record<string, any[]>>({});
  const [saving, setSaving] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  // Sync form state when navigating between records
  useEffect(() => {
    setHeader(initialData || {});
  }, [initialData]);

  useEffect(() => {
    setItems(initialItems || [{}]);
  }, [initialItems]);

  // For headerFields mode, determine which fields go in top vs body
  const isTabMode = !!tabFields;

  // Collect all tab sections that have fields
  const sections = useMemo(() => {
    if (!isTabMode) return [];
    return (["basic", "config", "mapping", "audit", "custom"] as TabId[])
      .filter(id => (tabFields as any)?.[id]?.length)
      .map(id => ({
        id,
        ...SECTION_LABELS[id],
        fields: tabFields![id]!,
      }));
  }, [tabFields, isTabMode]);

  /* ── Lookup data fetch ──────────────────────────────────────────────────── */

  useEffect(() => {
    const allFields = [
      ...(headerFields || []),
      ...(tabFields?.basic || []), ...(tabFields?.config || []),
      ...(tabFields?.mapping || []), ...(tabFields?.audit || []),
      ...((tabFields as any)?.custom || []),
      ...(itemFields || []),
    ];
    const lookupsNeeded = allFields.filter(f => f.type === "select" && f.lookupTable);

    const fetchLookups = async () => {
      // System/global tables that don't need company_id
      const globalTables = new Set(['system_modules', 'subscription_plans', 'users', 'companies']);

      for (const field of lookupsNeeded) {
        try {
          let query = db.from(field.lookupTable!).select(`${field.lookupValue || "id"}, ${field.lookupLabel || "name"}`);
          // Scope to active company unless it's a global table
          if (activeCompany && !globalTables.has(field.lookupTable!)) {
            query = query.eq('company_id', activeCompany.id);
          }
          if (field.lookupFilter) {
            Object.entries(field.lookupFilter).forEach(([key, val]) => { query = query.eq(key, val); });
          }
          const { data, error } = await query;
          if (!error && data) setLookupData(prev => ({ ...prev, [field.key]: data }));
        } catch (err) {
            console.error(`Lookup fetch failed for ${field.key}:`, err);
            toast.error(`Failed to load options for "${field.label}"`);
          }
      }
    };
    fetchLookups();
  }, [headerFields, tabFields, itemFields]);

  /* ── Items ──────────────────────────────────────────────────────────────── */

  const handleAddItem = () => setItems([...items, { id: Date.now() }]);
  const handleRemoveItem = (idx: number) => { if (items.length > 1) setItems(items.filter((_, i) => i !== idx)); };
  const updateItem = (idx: number, field: string, value: any) => {
    setItems(items.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  };

  /* ── Save ────────────────────────────────────────────────────────────────── */

  const handleSave = useCallback(async () => {
    const allFields = [
      ...(headerFields || []),
      ...(tabFields?.basic || []), ...(tabFields?.config || []),
      ...(tabFields?.mapping || []), ...(tabFields?.audit || []),
      ...((tabFields as any)?.custom || []),
    ];
    const missing = allFields.filter(f => f.required && !header[f.key]);
    if (missing.length > 0) {
      alert(`Required: ${missing.map(f => f.label.replace("*", "").trim()).join(", ")}`);
      return;
    }
    setSaving(true);
    try { await onSave(header, items); } finally { setSaving(false); }
  }, [header, items, headerFields, tabFields, onSave]);

  /* ── Section collapse toggle ────────────────────────────────────────────── */

  const toggleSection = (id: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  /* ── Field Renderer ─────────────────────────────────────────────────────── */

  const renderField = (field: ERPField, value: any, onChange: (val: any) => void, compact = false) => {
    const baseClass = cn(
      "w-full border border-slate-300 bg-white text-[13px] rounded",
      "outline-none transition-all",
      "focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30",
      "placeholder:text-slate-400",
      compact ? "h-[30px] px-2 text-xs" : "h-[34px] px-3"
    );

    if (field.readOnly || field.type === "readonly") {
      return <div className={cn(baseClass, "bg-slate-50 text-slate-500 flex items-center")}>{field.type === "currency" ? formatINR(value) : value || "—"}</div>;
    }

    if (field.type === "select") {
      const options = field.lookupTable
        ? (lookupData[field.key] || []).map(d => ({ label: d[field.lookupLabel || "name"], value: d[field.lookupValue || "id"] }))
        : field.options || [];
      return (
        <div className="relative">
          <select className={cn(baseClass, "pr-7 appearance-none cursor-pointer")} value={value ?? ""} onChange={e => onChange(e.target.value)}>
            <option value=""></option>
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>
      );
    }

    if (field.type === "checkbox") {
      return (
        <label className="inline-flex items-center gap-2 cursor-pointer h-[34px]">
          <input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30" />
          <span className="text-[13px] text-slate-600">{value ? "Yes" : "No"}</span>
        </label>
      );
    }

    if (field.type === "image") {
      return (
        <MediaUpload
          value={value || ""}
          onChange={onChange}
          folder="products"
          bucket="ecommerce"
          type="image"
          compact={compact}
        />
      );
    }

    if (field.type === "textarea") {
      return (
        <textarea placeholder={field.placeholder || ""} value={value || ""} onChange={e => onChange(e.target.value)} rows={3}
          className="w-full border border-slate-300 bg-white text-[13px] rounded px-3 py-2 outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 placeholder:text-slate-400 resize-y" />
      );
    }

    if (field.type === "currency") {
      return (
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 font-medium">₹</span>
          <input type="number" step="0.01" placeholder={field.placeholder || "0.00"} value={value ?? ""} onChange={e => onChange(Number(e.target.value))}
            className={cn(baseClass, "pl-6 text-right font-mono tabular-nums")} />
        </div>
      );
    }

    if (field.type === "percentage") {
      return (
        <div className="relative">
          <input type="number" step="0.01" placeholder={field.placeholder || "0"} value={value ?? ""} onChange={e => onChange(Number(e.target.value))}
            className={cn(baseClass, "pr-6 text-right font-mono tabular-nums")} />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 font-medium">%</span>
        </div>
      );
    }

    const inputType = field.type === "phone" ? "tel" : field.type === "email" ? "email" : field.type || "text";
    return (
      <input type={inputType} placeholder={field.placeholder || ""} value={value ?? ""}
        onChange={e => onChange(field.type === "number" ? Number(e.target.value) : e.target.value)}
        className={cn(baseClass, field.type === "number" && "text-right font-mono tabular-nums")} />
    );
  };

  /* ── Render a 2-column field grid (ERPNext style) ───────────────────────── */

  const renderFieldGrid = (fields: ERPField[]) => {
    const visible = fields.filter(f => !f.hidden);
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 px-4 py-4">
        {visible.map((f) => {
          const isFullWidth = f.type === "textarea" || f.width === "full" || f.colSpan === 2;
          return (
            <div key={f.key}
              className={cn(
                "flex flex-col gap-1",
                isFullWidth && "md:col-span-2",
              )}>
              <label className="text-[12px] font-medium text-slate-500">
                {f.label.replace(" *", "")}
                {f.required && <span className="text-red-400 ml-0.5">*</span>}
              </label>
              <div>
                {renderField(f, header[f.key], val => setHeader({ ...header, [f.key]: val }))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  /* ── Calculate item totals for display ──────────────────────────────────── */

  const totals = useMemo(() => {
    if (!itemFields?.length) return null;
    let subtotal = 0, taxAmt = 0, discAmt = 0, totalQty = 0;
    items.forEach(item => {
      const qty = Number(item.quantity || 0);
      const rate = Number(item.unit_price || 0);
      const tax = Number(item.tax_rate || 0);
      const disc = Number(item.discount_pct || 0);
      const base = qty * rate;
      const d = (base * disc) / 100;
      const t = ((base - d) * tax) / 100;
      subtotal += base; taxAmt += t; discAmt += d; totalQty += qty;
    });
    return { subtotal, taxAmt, discAmt, grandTotal: subtotal - discAmt + taxAmt, totalQty };
  }, [items, itemFields]);

  /* ── Layout ─────────────────────────────────────────────────────────────── */

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* ── Sticky Header Bar ─────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between h-12 px-4">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={onAbort} className="p-1 hover:bg-slate-100 rounded transition-colors text-slate-400 hover:text-slate-700">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              {subtitle && (
                <>
                  <span className="text-[12px] text-slate-400 font-medium whitespace-nowrap">{subtitle}</span>
                  <span className="text-slate-300">/</span>
                </>
              )}
              <h1 className="text-[14px] font-semibold text-slate-900 truncate">{title}</h1>
              {header.status && <StatusBadge status={header.status} className="ml-1" />}
            </div>
            {/* Record navigation */}
            {onNavigate && totalRecords > 0 && (
              <div className="flex items-center gap-1 ml-2 border-l border-slate-200 pl-3">
                <button
                  onClick={() => onNavigate("prev")}
                  disabled={currentIndex <= 0}
                  className="p-1 rounded hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-slate-500 hover:text-slate-700"
                  title="Previous record"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[11px] text-slate-400 font-medium tabular-nums min-w-[3ch] text-center">
                  {currentIndex + 1} / {totalRecords}
                </span>
                <button
                  onClick={() => onNavigate("next")}
                  disabled={currentIndex >= totalRecords - 1}
                  className="p-1 rounded hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-slate-500 hover:text-slate-700"
                  title="Next record"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {customActions}
            {onDelete && initialData?.id && (
              <Button variant="ghost" size="sm" onClick={async () => { if (window.confirm("Delete this record permanently?")) { await onDelete(initialData.id); onAbort(); } }}
                className="h-7 px-2.5 text-[12px] font-medium text-red-500 hover:text-red-600 hover:bg-red-50">
                <Trash2 className="w-3 h-3 mr-1" /> Delete
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onAbort} className="h-7 px-3 text-[12px] font-medium">
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}
              className="h-7 px-4 text-[12px] font-semibold bg-blue-600 hover:bg-blue-700 text-white">
              <Save className="w-3 h-3 mr-1.5" />
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Form Body ─────────────────────────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-4 py-5 space-y-4">

        {/* ── headerFields mode: all fields in one card (ERPNext flat form) ── */}
        {!isTabMode && headerFields && headerFields.length > 0 && (
          <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
            {renderFieldGrid(headerFields)}
          </div>
        )}

        {/* ── tabFields mode: each tab is a collapsible section ─────────── */}
        {isTabMode && sections.map(section => {
          const isCollapsed = collapsedSections.has(section.id);
          return (
            <div key={section.id} className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
              {/* Section header */}
              <button onClick={() => toggleSection(section.id)}
                className="w-full flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200 hover:bg-slate-100 transition-colors text-left">
                {isCollapsed
                  ? <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                <span className="text-[13px] font-semibold text-slate-700">{section.title}</span>
                {section.description && (
                  <span className="text-[11px] text-slate-400 font-normal ml-1 hidden sm:inline">— {section.description}</span>
                )}
              </button>
              {/* Section body */}
              {!isCollapsed && renderFieldGrid(section.fields)}
            </div>
          );
        })}

        {/* ── Items Table ─────────────────────────────────────────────────── */}
        {showItems && itemFields && itemFields.length > 0 && (
          <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
            {/* Section header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-slate-700">{itemTitle}</span>
                <span className="text-[11px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                  {items.length} {items.length === 1 ? "row" : "rows"}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={handleAddItem} className="h-6 px-2 text-[11px] font-medium gap-1">
                <Plus className="w-3 h-3" /> Add Row
              </Button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50">
                    <th className="w-9 px-2 py-2 text-center text-[10px] font-semibold text-slate-400">No.</th>
                    {itemFields.map(f => (
                      <th key={f.key} className={cn(
                        "px-2 py-2 text-[11px] font-semibold text-slate-500 text-left whitespace-nowrap",
                        (f.type === "number" || f.type === "currency" || f.type === "percentage") && "text-right",
                      )}>
                        {f.label}
                      </th>
                    ))}
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((row, idx) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-blue-50/20 transition-colors group">
                      <td className="px-2 py-1 text-center text-[11px] font-medium text-slate-400">{idx + 1}</td>
                      {itemFields.map(f => (
                        <td key={f.key} className="px-1 py-1">
                          {renderField(f, row[f.key], val => updateItem(idx, f.key, val), true)}
                        </td>
                      ))}
                      <td className="px-1 py-1 text-center">
                        <button onClick={() => handleRemoveItem(idx)} className="p-0.5 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals footer (ERPNext style — aligned right) */}
            {totals && totals.subtotal > 0 && (
              <div className="border-t border-slate-200 bg-slate-50/30">
                <div className="flex justify-end px-4 py-3">
                  <div className="w-[280px] space-y-1.5">
                    <div className="flex justify-between text-[12px]">
                      <span className="text-slate-500">Total Quantity</span>
                      <span className="font-medium text-slate-700 tabular-nums">{totals.totalQty}</span>
                    </div>
                    <div className="flex justify-between text-[12px]">
                      <span className="text-slate-500">Subtotal</span>
                      <span className="font-medium text-slate-700 tabular-nums">{formatINR(totals.subtotal)}</span>
                    </div>
                    {totals.discAmt > 0 && (
                      <div className="flex justify-between text-[12px]">
                        <span className="text-slate-500">Discount</span>
                        <span className="font-medium text-red-500 tabular-nums">-{formatINR(totals.discAmt)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[12px]">
                      <span className="text-slate-500">Tax</span>
                      <span className="font-medium text-slate-700 tabular-nums">{formatINR(totals.taxAmt)}</span>
                    </div>
                    <div className="flex justify-between text-[13px] pt-1.5 border-t border-slate-200">
                      <span className="font-semibold text-slate-700">Grand Total</span>
                      <span className="font-bold text-slate-900 tabular-nums">{formatINR(totals.grandTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Add Comment / Activity section placeholder ──────────────────── */}
        {initialData?.id && (
          <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200">
              <span className="text-[13px] font-semibold text-slate-700">Add a comment</span>
            </div>
            <div className="px-4 py-3">
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-[11px] font-bold text-blue-600">U</div>
                <textarea placeholder="Type a comment..." rows={2}
                  className="flex-1 border border-slate-200 rounded text-[13px] px-3 py-2 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 resize-none" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
