/**
 * DocForm — ERPNext v16 (Frappe Desk) Document Form
 *
 * - Sticky toolbar with back arrow, breadcrumb, status pill, record navigator
 * - Section cards with collapsible headers
 * - 2-column field grid with small Frappe-style labels
 * - Items table with reorder / align / resize controls and totals footer
 * - Activity/comment placeholder at bottom
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import db from "@/lib/db";
import {
  Plus, Trash2, Save, ChevronDown, ChevronRight, ChevronLeft, ArrowLeft,
  AlignLeft, AlignCenter, AlignRight, MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { ERPField } from "@/types/erp";
import { formatINR } from "@/lib/services/calculationService";
import { StatusBadge } from "@/components/ui/status-badge";
import { MediaUpload } from "@/components/common/MediaUpload";
import { useTenant } from "@/contexts/TenantContext";

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
  onNavigate?: (direction: "prev" | "next") => void;
  currentIndex?: number;
  totalRecords?: number;
}

const SECTION_LABELS: Record<string, { title: string; description?: string }> = {
  basic:   { title: "Details" },
  config:  { title: "Pricing & Configuration" },
  mapping: { title: "Web & Integration" },
  audit:   { title: "Inventory & Tracking" },
  custom:  { title: "Custom Fields" },
};

type TabId = "basic" | "config" | "mapping" | "audit" | "custom";

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

  useEffect(() => { setHeader(initialData || {}); }, [initialData]);
  useEffect(() => { setItems(initialItems || [{}]); }, [initialItems]);

  const isTabMode = !!tabFields;

  const sections = useMemo(() => {
    if (!isTabMode) return [];
    return (["basic", "config", "mapping", "audit", "custom"] as TabId[])
      .filter((id) => (tabFields as any)?.[id]?.length)
      .map((id) => ({
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
    const lookupsNeeded = allFields.filter((f) => f.type === "select" && f.lookupTable);

    const fetchLookups = async () => {
      const globalTables = new Set(["system_modules", "subscription_plans", "users", "companies"]);
      for (const field of lookupsNeeded) {
        try {
          let query = db
            .from(field.lookupTable!)
            .select(`${field.lookupValue || "id"}, ${field.lookupLabel || "name"}`);
          if (activeCompany && !globalTables.has(field.lookupTable!)) {
            query = query.eq("company_id", activeCompany.id);
          }
          if (field.lookupFilter) {
            Object.entries(field.lookupFilter).forEach(([key, val]) => { query = query.eq(key, val); });
          }
          const { data, error } = await query;
          if (!error && data) setLookupData((prev) => ({ ...prev, [field.key]: data }));
        } catch (err) {
          console.error(`Lookup fetch failed for ${field.key}:`, err);
          toast.error(`Failed to load options for "${field.label}"`);
        }
      }
    };
    fetchLookups();
  }, [headerFields, tabFields, itemFields]);

  /* ── Item column controls ──────────────────────────────────────────────── */
  type ColAlign = "left" | "center" | "right";
  const [columnOrder, setColumnOrder] = useState<string[]>(() => (itemFields || []).map((f) => f.key));
  const [columnAligns, setColumnAligns] = useState<Record<string, ColAlign>>(() => {
    const init: Record<string, ColAlign> = {};
    (itemFields || []).forEach((f) => {
      init[f.key] = f.type === "number" || f.type === "currency" || f.type === "percentage" ? "right" : "left";
    });
    return init;
  });
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!itemFields) return;
    const keys = itemFields.map((f) => f.key);
    setColumnOrder((prev) => {
      const filtered = prev.filter((k) => keys.includes(k));
      const added = keys.filter((k) => !filtered.includes(k));
      return [...filtered, ...added];
    });
    setColumnAligns((prev) => {
      const next = { ...prev };
      itemFields.forEach((f) => {
        if (!next[f.key]) {
          next[f.key] = f.type === "number" || f.type === "currency" || f.type === "percentage" ? "right" : "left";
        }
      });
      return next;
    });
  }, [itemFields]);

  const orderedItemFields = useMemo(() => {
    if (!itemFields) return [];
    const byKey = Object.fromEntries(itemFields.map((f) => [f.key, f]));
    return columnOrder.map((k) => byKey[k]).filter(Boolean) as ERPField[];
  }, [itemFields, columnOrder]);

  const moveColumn = (key: string, direction: -1 | 1) => {
    setColumnOrder((prev) => {
      const idx = prev.indexOf(key);
      if (idx < 0) return prev;
      const j = idx + direction;
      if (j < 0 || j >= prev.length) return prev;
      const next = prev.slice();
      [next[idx], next[j]] = [next[j], next[idx]];
      return next;
    });
  };

  const cycleAlign = (key: string) => {
    setColumnAligns((prev) => {
      const cur = prev[key] || "left";
      const nextAlign: ColAlign = cur === "left" ? "center" : cur === "center" ? "right" : "left";
      return { ...prev, [key]: nextAlign };
    });
  };

  const startResize = (key: string, startWidth: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const onMove = (me: MouseEvent) => {
      const w = Math.max(72, startWidth + me.clientX - startX);
      setColumnWidths((prev) => ({ ...prev, [key]: w }));
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
    };
    document.body.style.cursor = "col-resize";
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  /* ── Items ──────────────────────────────────────────────────────────────── */
  const handleAddItem = () => setItems([...items, { id: Date.now() }]);
  const handleRemoveItem = (idx: number) => { if (items.length > 1) setItems(items.filter((_, i) => i !== idx)); };
  const updateItem = (idx: number, field: string, value: any) => {
    if (field === "is_default" && value) {
      setItems(items.map((item, i) => ({ ...item, is_default: i === idx })));
    } else {
      setItems(items.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
    }
  };

  /* ── Save ────────────────────────────────────────────────────────────────── */
  const handleSave = useCallback(async () => {
    const allFields = [
      ...(headerFields || []),
      ...(tabFields?.basic || []), ...(tabFields?.config || []),
      ...(tabFields?.mapping || []), ...(tabFields?.audit || []),
      ...((tabFields as any)?.custom || []),
    ];
    const missing = allFields.filter((f) => f.required && !header[f.key]);
    if (missing.length > 0) {
      toast.error(`Required: ${missing.map((f) => f.label.replace("*", "").trim()).join(", ")}`);
      return;
    }
    setSaving(true);
    try { await onSave(header, items); } finally { setSaving(false); }
  }, [header, items, headerFields, tabFields, onSave]);

  /* ── Keyboard shortcut: Ctrl/Cmd+S to save ───────────────────────────── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [handleSave]);

  const toggleSection = (id: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  /* ── Field Renderer ─────────────────────────────────────────────────────── */
  const renderField = (field: ERPField, value: any, onChange: (val: any) => void, compact = false) => {
    const baseClass = cn(
      "w-full border border-gray-200 bg-white text-gray-900 rounded-md",
      "outline-none transition-colors",
      "hover:border-gray-300",
      "focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white",
      "placeholder:text-gray-400",
      "dark:bg-card dark:text-foreground dark:border-border",
      compact ? "h-8 px-2.5 text-xs" : "h-9 px-3 text-sm",
    );

    if (field.readOnly || field.type === "readonly") {
      return (
        <div className={cn(baseClass, "bg-gray-50 text-gray-600 flex items-center cursor-default hover:border-gray-200 dark:bg-accent/30")}>
          {field.type === "currency" ? formatINR(value) : value || "—"}
        </div>
      );
    }

    if (field.type === "select") {
      const options = field.lookupTable
        ? (lookupData[field.key] || []).map((d) => ({
            label: d[field.lookupLabel || "name"],
            value: d[field.lookupValue || "id"],
          }))
        : field.options || [];
      return (
        <div className="relative">
          <select
            className={cn(baseClass, "pr-7 appearance-none cursor-pointer")}
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value=""></option>
            {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
        </div>
      );
    }

    if (field.type === "checkbox") {
      return (
        <label className="inline-flex items-center gap-2 cursor-pointer h-8 group">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            className="w-4 h-4 rounded-sm border-gray-300 text-primary focus:ring-2 focus:ring-primary/30 cursor-pointer"
          />
          <span className={cn("text-xs font-medium transition-colors", value ? "text-gray-800" : "text-gray-500")}>
            {value ? "Yes" : "No"}
          </span>
        </label>
      );
    }

    if (field.type === "image") {
      return (
        <MediaUpload value={value || ""} onChange={onChange} folder="products" bucket="ecommerce" type="image" compact={compact} />
      );
    }

    if (field.type === "textarea") {
      return (
        <textarea
          placeholder={field.placeholder || ""}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full border border-gray-200 bg-white text-gray-900 text-sm rounded-md px-2.5 py-2 outline-none transition-colors hover:border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-gray-400 resize-y dark:bg-card dark:text-foreground dark:border-border"
        />
      );
    }

    if (field.type === "currency") {
      return (
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">₹</span>
          <input
            type="number"
            step="0.01"
            placeholder={field.placeholder || "0.00"}
            value={value ?? ""}
            onChange={(e) => onChange(Number(e.target.value))}
            className={cn(baseClass, "pl-6 text-right font-mono tabular-nums")}
          />
        </div>
      );
    }

    if (field.type === "percentage") {
      return (
        <div className="relative">
          <input
            type="number"
            step="0.01"
            placeholder={field.placeholder || "0"}
            value={value ?? ""}
            onChange={(e) => onChange(Number(e.target.value))}
            className={cn(baseClass, "pr-6 text-right font-mono tabular-nums")}
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">%</span>
        </div>
      );
    }

    const inputType = field.type === "phone" ? "tel" : field.type === "email" ? "email" : field.type || "text";
    return (
      <input
        type={inputType}
        placeholder={field.placeholder || ""}
        value={value ?? ""}
        onChange={(e) => onChange(field.type === "number" ? Number(e.target.value) : e.target.value)}
        className={cn(baseClass, field.type === "number" && "text-right font-mono tabular-nums")}
      />
    );
  };

  const renderFieldGrid = (fields: ERPField[]) => {
    const visible = fields.filter((f) => !f.hidden);
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3.5 px-4 py-4">
        {visible.map((f) => {
          const isFullWidth = f.type === "textarea" || f.width === "full" || f.colSpan === 2;
          return (
            <div key={f.key} className={cn("flex flex-col gap-1", isFullWidth && "md:col-span-2")}>
              <label className="text-xs font-medium text-gray-500">
                {f.label.replace(" *", "")}
                {f.required && <span className="text-destructive ml-0.5">*</span>}
              </label>
              <div>
                {renderField(f, header[f.key], (val) => setHeader({ ...header, [f.key]: val }))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const totals = useMemo(() => {
    if (!itemFields?.length) return null;
    let subtotal = 0, taxAmt = 0, discAmt = 0, totalQty = 0;
    items.forEach((item) => {
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

  return (
    <div className="min-h-full bg-background">
      {/* ── Sticky Toolbar ─────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-card border-b border-gray-200 dark:border-border">
        <div className="max-w-[1200px] mx-auto flex flex-wrap items-center justify-between gap-2 min-h-[44px] px-4 py-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={onAbort}
              className="inline-flex items-center justify-center w-7 h-7 rounded text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors dark:hover:bg-accent dark:hover:text-foreground"
              title="Back"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-2 min-w-0">
              {subtitle && (
                <>
                  <span className="text-xs text-gray-400 whitespace-nowrap hidden sm:inline">{subtitle}</span>
                  <span className="text-gray-300 hidden sm:inline">›</span>
                </>
              )}
              <h1 className="text-sm font-semibold text-gray-900 dark:text-foreground truncate">{title}</h1>
              {header.status && <StatusBadge status={header.status} className="ml-1" />}
            </div>

            {onNavigate && totalRecords > 0 && (
              <div className="flex items-center gap-0.5 ml-2 border-l border-gray-200 pl-2 dark:border-border">
                <button
                  onClick={() => onNavigate("prev")}
                  disabled={currentIndex <= 0}
                  className="inline-flex items-center justify-center w-6 h-6 rounded text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed dark:hover:bg-accent"
                  title="Previous (Ctrl+←)"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] text-gray-500 tabular-nums min-w-[3ch] text-center">
                  {currentIndex + 1}/{totalRecords}
                </span>
                <button
                  onClick={() => onNavigate("next")}
                  disabled={currentIndex >= totalRecords - 1}
                  className="inline-flex items-center justify-center w-6 h-6 rounded text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed dark:hover:bg-accent"
                  title="Next (Ctrl+→)"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0 flex-wrap">
            {customActions}
            {onDelete && initialData?.id && (
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  if (window.confirm("Delete this record permanently?")) {
                    await onDelete(initialData.id);
                    onAbort();
                  }
                }}
                className="text-destructive hover:text-destructive hover:bg-destructive-50"
              >
                <Trash2 className="w-3 h-3" /> <span className="hidden sm:inline">Delete</span>
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onAbort}>Cancel</Button>
            <Button size="sm" onClick={handleSave} disabled={saving} title="Save — Ctrl+S">
              <Save className="w-3 h-3" />
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Form Body ─────────────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-4 py-4 space-y-3">
        {/* Header card */}
        {headerFields && headerFields.length > 0 && (
          <div className="bg-card rounded-lg border border-gray-200 dark:border-border overflow-hidden">
            {renderFieldGrid(headerFields)}
          </div>
        )}

        {/* Collapsible tab sections */}
        {isTabMode && sections.map((section) => {
          const isCollapsed = collapsedSections.has(section.id);
          return (
            <div key={section.id} className="bg-card rounded-lg border border-gray-200 dark:border-border overflow-hidden">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center gap-2 px-4 h-10 border-b border-gray-200 hover:bg-gray-50 transition-colors text-left dark:border-border dark:hover:bg-accent/40"
              >
                {isCollapsed ? <ChevronRight className="w-3 h-3 text-gray-400" /> : <ChevronDown className="w-3 h-3 text-gray-400" />}
                <span className="erp-section-header text-sm">{section.title}</span>
                {section.description && (
                  <span className="text-[11px] text-gray-400 font-normal ml-1 hidden sm:inline">— {section.description}</span>
                )}
              </button>
              {!isCollapsed && renderFieldGrid(section.fields)}
            </div>
          );
        })}

        {/* Items Table */}
        {showItems && itemFields && itemFields.length > 0 && (
          <div className="bg-card rounded-lg border border-gray-200 dark:border-border overflow-hidden">
            <div className="flex items-center justify-between px-4 h-10 border-b border-gray-200 dark:border-border">
              <div className="flex items-center gap-2">
                <span className="erp-section-header text-sm">{itemTitle}</span>
                <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded dark:bg-accent/40 dark:text-foreground">
                  {items.length} {items.length === 1 ? "row" : "rows"}
                </span>
              </div>
              <Button variant="ghost" size="xs" onClick={handleAddItem}>
                <Plus className="w-3 h-3" /> Add Row
              </Button>
            </div>

            <div className="overflow-x-auto erp-scrollbar">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 dark:border-border dark:bg-accent/30">
                    <th className="w-8 px-2 py-1.5 text-center text-[10px] font-medium text-gray-400">#</th>
                    {orderedItemFields.map((f, i) => {
                      const align = columnAligns[f.key] || "left";
                      const alignCls = align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";
                      const justifyCls = align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start";
                      const width = columnWidths[f.key];
                      const AlignIcon = align === "right" ? AlignRight : align === "center" ? AlignCenter : AlignLeft;
                      return (
                        <th
                          key={f.key}
                          style={width ? { width, minWidth: width } : undefined}
                          className={cn("relative px-2 py-1.5 text-[11px] font-medium text-gray-500 whitespace-nowrap select-none group/col", alignCls)}
                        >
                          <div className={cn("flex items-center gap-1", justifyCls)}>
                            <button
                              type="button"
                              onClick={() => moveColumn(f.key, -1)}
                              disabled={i === 0}
                              title="Move left"
                              className="opacity-0 group-hover/col:opacity-100 disabled:opacity-20 disabled:cursor-not-allowed p-0.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-all"
                            >
                              <ChevronLeft className="w-3 h-3" />
                            </button>
                            <span className="truncate">{f.label}</span>
                            <button
                              type="button"
                              onClick={() => cycleAlign(f.key)}
                              title={`Align: ${align} (cycle)`}
                              className="opacity-0 group-hover/col:opacity-100 p-0.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-all"
                            >
                              <AlignIcon className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveColumn(f.key, 1)}
                              disabled={i === orderedItemFields.length - 1}
                              title="Move right"
                              className="opacity-0 group-hover/col:opacity-100 disabled:opacity-20 disabled:cursor-not-allowed p-0.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-all"
                            >
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                          <span
                            role="separator"
                            aria-orientation="vertical"
                            title="Drag to resize column"
                            onMouseDown={(e) => {
                              const th = e.currentTarget.parentElement as HTMLElement | null;
                              const current = width ?? (th?.offsetWidth ?? 140);
                              startResize(f.key, current, e);
                            }}
                            className="absolute right-0 top-1 bottom-1 w-1 cursor-col-resize bg-transparent hover:bg-primary transition-colors"
                          />
                        </th>
                      );
                    })}
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors group dark:border-border dark:hover:bg-accent/30">
                      <td className="px-2 py-1 text-center text-[11px] text-gray-400 tabular-nums">{idx + 1}</td>
                      {orderedItemFields.map((f) => {
                        const align = columnAligns[f.key] || "left";
                        const alignCls = align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";
                        const width = columnWidths[f.key];
                        return (
                          <td key={f.key} style={width ? { width, minWidth: width } : undefined} className={cn("px-1 py-0.5", alignCls)}>
                            {renderField(f, row[f.key], (val) => updateItem(idx, f.key, val), true)}
                          </td>
                        );
                      })}
                      <td className="px-1 py-0.5 text-center">
                        <button
                          onClick={() => handleRemoveItem(idx)}
                          className="p-0.5 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-destructive transition-all"
                          title="Remove row"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totals && totals.subtotal > 0 && (
              <div className="border-t border-gray-200 bg-gray-50 dark:border-border dark:bg-accent/20">
                <div className="flex justify-end px-4 py-3">
                  <div className="w-[280px] space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Total Qty</span>
                      <span className="font-medium text-gray-700 tabular-nums dark:text-foreground">{totals.totalQty}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="font-medium text-gray-700 tabular-nums dark:text-foreground">{formatINR(totals.subtotal)}</span>
                    </div>
                    {totals.discAmt > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Discount</span>
                        <span className="font-medium text-destructive tabular-nums">-{formatINR(totals.discAmt)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Tax</span>
                      <span className="font-medium text-gray-700 tabular-nums dark:text-foreground">{formatINR(totals.taxAmt)}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-1.5 border-t border-gray-200 dark:border-border">
                      <span className="font-semibold text-gray-700 dark:text-foreground">Grand Total</span>
                      <span className="font-bold text-gray-900 tabular-nums dark:text-foreground">{formatINR(totals.grandTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Activity / Comment */}
        {initialData?.id && (
          <div className="bg-card rounded-lg border border-gray-200 dark:border-border overflow-hidden">
            <div className="px-4 h-10 flex items-center gap-2 border-b border-gray-200 dark:border-border">
              <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
              <span className="erp-section-header text-sm">Activity</span>
            </div>
            <div className="px-4 py-3">
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-md bg-primary-100 flex items-center justify-center shrink-0 text-[10px] font-semibold text-primary-700">
                  U
                </div>
                <textarea
                  placeholder="Add a comment…"
                  rows={2}
                  className="flex-1 border border-gray-200 rounded-md text-sm text-gray-900 px-2.5 py-1.5 placeholder:text-gray-400 outline-none transition-colors hover:border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none dark:bg-card dark:text-foreground dark:border-border"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
