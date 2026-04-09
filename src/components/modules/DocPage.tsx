/**
 * DocPage — Generic Document Page Component
 *
 * Orchestrates the list ↔ form toggle, data fetching via useCrud,
 * item loading/saving for transactional documents, and document conversions.
 *
 * Usage:
 *   <DocPage doctype="sales-order" />
 *
 * This replaces the repeated ~100 line pattern in every module page.
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useCrud } from "@/hooks/useCrud";
import { getDocType } from "@/registry";
import DocForm from "./DocForm";
import DocList from "./DocList";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  calculateTransaction,
  generateRefNo,
  formatINR,
} from "@/lib/services/calculationService";
import type { DocTypeDef, ERPField, TabFields } from "@/types/erp";
import { useCustomFields } from "@/hooks/useCustomFields";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { lazy, Suspense } from "react";

const PrintPreview = lazy(() => import("./PrintPreview"));

/* ── Props ─────────────────────────────────────────────────────────────────── */

interface DocPageProps {
  doctype: string;
  /** Extra actions to render in the form header */
  customFormActions?: (record: any, navigate: any) => React.ReactNode;
  /** Extra columns to append to the list */
  extraColumns?: any[];
  /** Extra header actions for the list toolbar */
  headerActions?: React.ReactNode;
}

/* ── Component ─────────────────────────────────────────────────────────────── */

export default function DocPage({
  doctype,
  customFormActions,
  extraColumns,
  headerActions,
}: DocPageProps) {
  const def = getDocType(doctype);

  const [view, setView] = useState<"list" | "form">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [editing, setEditing] = useState<any>(null);
  const [editingItems, setEditingItems] = useState<any[] | undefined>(
    undefined
  );
  const [showPrint, setShowPrint] = useState(false);

  const { activeCompany } = useTenant();
  const location = useLocation();
  const navigate = useNavigate();

  // Use selectQuery if defined, otherwise just "*"
  // Joins must be explicit via selectQuery because Supabase requires FK relationships
  const selectQuery = def.selectQuery || "*";

  const {
    data,
    loading,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    deleteItems,
  } = useCrud(def.tableName, selectQuery, { isGlobal: def.isGlobal });

  /* ── Custom Fields ───────────────────────────────────────────────────── */

  const {
    customFields,
    hasCustomFields,
    unpackCustomFields,
    packCustomFields,
  } = useCustomFields(def.tableName);

  // Merge custom fields into the DocType field definitions
  const mergedHeaderFields: ERPField[] | undefined =
    def.headerFields && hasCustomFields
      ? [...def.headerFields, ...customFields]
      : def.headerFields;

  const mergedTabFields: TabFields | undefined =
    def.tabFields && hasCustomFields
      ? { ...def.tabFields, custom: customFields }
      : def.tabFields;

  /* ── Reset form on company switch ──────────────────────────────────────── */

  useEffect(() => {
    setView("list");
    setEditing(null);
    setEditingItems(undefined);
    setSearchTerm("");
  }, [activeCompany?.id]);

  /* ── Document conversion from router state ─────────────────────────────── */

  useEffect(() => {
    if (!location.state?.conversionType || !location.state?.sourceRecord) return;

    const source = location.state.sourceRecord;
    const conversionType = location.state.conversionType;

    // Find matching conversion definition
    const conversion = (def.conversions || []).find(
      (c) => conversionType.includes((c.target || c.targetDoctype || "").replace(/-/g, "_"))
    );

    if (conversion) {
      const mapped: Record<string, any> = {};
      const fieldMap = conversion.headerMap || conversion.mapFields || {};
      Object.entries(fieldMap).forEach(([from, to]) => {
        mapped[to] = source[from];
      });

      if (def.referencePrefix) {
        mapped[def.referenceField || "reference_no"] = generateRefNo(def.referencePrefix);
      }
      const convFields = [...(def.headerFields || []), ...(def.tabFields?.basic || []), ...(def.tabFields?.config || [])];
      if (convFields.some(f => f.key === "status")) {
        mapped.status = "draft";
      }
      if (convFields.some(f => f.key === "date")) {
        mapped.date = new Date().toISOString().split("T")[0];
      }

      setEditing(mapped);
      setEditingItems([{}]);
      setView("form");
    }

    // Clear navigation state to prevent re-trigger
    window.history.replaceState({}, document.title);
  }, [location.state, def]);

  /* ── Load items for a record ───────────────────────────────────────────── */

  const loadItems = useCallback(
    async (parentId: string) => {
      if (!def.itemTableName || !def.itemForeignKey) return [];

      let query = supabase
        .from(def.itemTableName)
        .select("*")
        .eq(def.itemForeignKey, parentId);

      // Scope by company_id for tenant isolation
      if (activeCompany && !def.isGlobal) {
        query = query.eq("company_id", activeCompany.id);
      }

      const { data, error } = await query.order("created_at", { ascending: true });
      if (error) console.error("loadItems error:", error);
      return data || [];
    },
    [def, activeCompany]
  );

  /* ── Open handlers ─────────────────────────────────────────────────────── */

  const handleOpenNew = () => {
    // Start with DocType-defined defaults
    const defaults: Record<string, any> = { ...(def.defaults || {}) };

    // Only set date if the DocType has a date field
    const allFields = [
      ...(def.headerFields || []),
      ...(def.tabFields?.basic || []),
      ...(def.tabFields?.config || []),
    ];
    const hasDateField = allFields.some(f => f.key === "date");
    if (hasDateField) {
      defaults.date = new Date().toISOString().split("T")[0];
    }

    if (def.referencePrefix) {
      defaults[def.referenceField || "reference_no"] = generateRefNo(
        def.referencePrefix
      );
    }

    setEditing(defaults);
    setEditingItems(def.itemTableName ? [{}] : undefined);
    setView("form");
  };

  const handleOpenEdit = async (record: any) => {
    // Unpack custom_fields JSONB into flat __cf__ prefixed keys for the form
    setEditing(unpackCustomFields(record));

    if (def.itemTableName && def.itemForeignKey) {
      const items = await loadItems(record.id);
      setEditingItems(items.length > 0 ? items : [{}]);
    } else {
      setEditingItems(undefined);
    }

    setView("form");
  };

  const handleAbort = () => {
    setView("list");
    setEditing(null);
    setEditingItems(undefined);
  };

  /* ── Save handler ──────────────────────────────────────────────────────── */

  const handleSave = async (header: any, items: any[]) => {
    if (!activeCompany && !def.isGlobal) {
      toast.error("No active company selected");
      return;
    }

    try {
      // Pack __cf__ prefixed fields back into custom_fields JSONB
      let payload = packCustomFields({ ...header });

      // Calculate totals for transactional documents
      if (def.calculation === "transaction" && items.length > 0) {
        const result = calculateTransaction(items);
        payload = {
          ...payload,
          subtotal: result.totals.subtotal,
          tax_amount: result.totals.tax_amount,
          discount_amount: result.totals.discount_amount,
          grand_total: result.totals.grand_total,
          total_qty: result.totals.total_qty,
        };
        items = result.items;
      }

      // Upsert header record
      let savedHeader: any;
      if (editing?.id) {
        savedHeader = await updateItem(editing.id, payload);
      } else {
        savedHeader = await createItem(payload);
      }

      // Save line items if transactional
      if (def.itemTableName && def.itemForeignKey && savedHeader) {
        // Delete existing items (scoped by company_id)
        let delQuery = supabase
          .from(def.itemTableName)
          .delete()
          .eq(def.itemForeignKey, savedHeader.id);
        if (activeCompany && !def.isGlobal) {
          delQuery = delQuery.eq("company_id", activeCompany.id);
        }
        await delQuery;

        // Insert new items (filter out empty rows)
        const lineItems = items
          .filter((item) => {
            // Consider a row valid if it has any meaningful data
            return Object.entries(item).some(
              ([key, val]) =>
                key !== "id" &&
                key !== "sort_order" &&
                val !== null &&
                val !== undefined &&
                val !== "" &&
                val !== 0
            );
          })
          .map((item) => {
            const { id, ...rest } = item;
            return {
              ...rest,
              [def.itemForeignKey!]: savedHeader.id,
              ...(def.isGlobal ? {} : { company_id: activeCompany?.id }),
            };
          });

        if (lineItems.length > 0) {
          const { error } = await supabase
            .from(def.itemTableName)
            .insert(lineItems);
          if (error) {
            console.error("Variant insert error:", error);
            toast.error(`Variants failed: ${error.message}`);
          }
        }
      }

      toast.success(`${def.name} saved successfully`);

      // Always refresh the list so the parent record shows up
      await fetchItems();
      if (savedHeader) {
        const updated = unpackCustomFields(savedHeader);
        setEditing(updated);
        if (def.itemTableName && def.itemForeignKey) {
          const freshItems = await loadItems(savedHeader.id);
          setEditingItems(freshItems.length > 0 ? freshItems : [{}]);
        }
      }
    } catch (err: any) {
      toast.error(`Save failed: ${err.message}`);
      // Still refresh list in case the parent was already saved
      await fetchItems();
    }
  };

  /* ── Delete handler ────────────────────────────────────────────────────── */

  const handleDelete = async (id: any) => {
    await deleteItem(id);
    toast.success(`${def.name} deleted`);
    handleAbort();
    fetchItems();
  };

  /* ── Search filter ─────────────────────────────────────────────────────── */

  const filteredData = data.filter((item) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (def.searchableFields || Object.keys(item)).some((key) =>
      String(item[key] || "")
        .toLowerCase()
        .includes(term)
    );
  });

  /* ── Build lookup map: field key → { table, label } ────────────────────── */

  const lookupMap = useMemo(() => {
    const map: Record<string, { table: string; label: string }> = {};
    const allFields = [
      ...(def.headerFields || []),
      ...(def.tabFields?.basic || []),
      ...(def.tabFields?.config || []),
      ...(def.tabFields?.mapping || []),
      ...(def.tabFields?.audit || []),
    ];
    for (const f of allFields) {
      if (f.lookupTable && f.key.endsWith("_id")) {
        map[f.key] = { table: f.lookupTable, label: f.lookupLabel || "name" };
      }
    }
    return map;
  }, [def]);

  /* ── Columns with StatusBadge + lookup name resolution ───────────────── */

  const columns = [
    ...def.columns.map((col) => {
      // If column already has a custom render, use it
      if (col.render) return col;

      // Status badge rendering
      if (col.key === (def.statusField || "status")) {
        return { ...col, render: (item: any) => <StatusBadge status={item[col.key]} /> };
      }

      // Lookup name resolution: show joined name instead of UUID
      const lookup = lookupMap[col.key];
      if (lookup) {
        return {
          ...col,
          render: (item: any) => {
            // Supabase join returns: { master_categories: { name: "Health" } }
            const joined = item[lookup.table];
            if (joined && typeof joined === "object") {
              return joined[lookup.label] || item[col.key] || "—";
            }
            return item[col.key] || "—";
          },
        };
      }

      // Boolean rendering
      if (col.key.startsWith("is_")) {
        return {
          ...col,
          render: (item: any) => (
            <span className={item[col.key] ? "text-emerald-600" : "text-slate-400"}>
              {item[col.key] ? "Yes" : "No"}
            </span>
          ),
        };
      }

      return { ...col, render: undefined as any };
    }),
    ...(extraColumns || []),
  ];

  /* ── Record navigation (next / previous) ────────────────────────────── */

  const currentIndex = editing?.id
    ? filteredData.findIndex((r) => r.id === editing.id)
    : -1;

  const handleNavigate = async (direction: "prev" | "next") => {
    if (currentIndex < 0) return;
    const newIndex = direction === "prev" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= filteredData.length) return;
    await handleOpenEdit(filteredData[newIndex]);
  };

  /* ── Render ────────────────────────────────────────────────────────────── */

  if (view === "form") {
    return (
      <>
      <DocForm
        title={editing?.id ? `Edit ${def.name}` : `New ${def.name}`}
        subtitle={def.name}
        headerFields={mergedHeaderFields}
        tabFields={mergedTabFields}
        itemFields={def.itemFields}
        itemTitle={def.itemTitle}
        showItems={def.showItems ?? !!def.itemFields}
        onSave={handleSave}
        onAbort={handleAbort}
        onDelete={editing?.id ? handleDelete : undefined}
        initialData={editing}
        initialItems={editingItems}
        customActions={
          <>
            {editing?.id && (
              <Button variant="outline" size="sm" onClick={() => setShowPrint(true)} className="h-8 px-2.5 text-[12px] font-medium hover:bg-slate-50">
                <Printer className="w-3 h-3 mr-1" /> <span className="hidden sm:inline">Print</span>
              </Button>
            )}
            {customFormActions?.(editing, navigate)}
          </>
        }
        onNavigate={editing?.id ? handleNavigate : undefined}
        currentIndex={currentIndex}
        totalRecords={filteredData.length}
      />
      {showPrint && editing && (
        <Suspense fallback={null}>
          <PrintPreview
            doctype={doctype}
            record={editing}
            items={editingItems}
            onClose={() => setShowPrint(false)}
          />
        </Suspense>
      )}
    </>
    );
  }

  return (
    <DocList
      title={`${def.name}s`}
      data={filteredData}
      columns={columns}
      onNew={handleOpenNew}
      onRefresh={fetchItems}
      onRowClick={handleOpenEdit}
      onDeleteItem={handleDelete}
      onDeleteIds={deleteItems}
      isLoading={loading}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      primaryKey={def.primaryKey || "id"}
      statusField={def.statusField || "status"}
      headerActions={headerActions}
    />
  );
}
