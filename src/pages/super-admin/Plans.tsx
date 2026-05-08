import { useState } from "react";
import { useCrud } from "@/hooks/useCrud";
import DocForm from "@/components/modules/DocForm";
import DocList from "@/components/modules/DocList";
import { getDocType } from "@/registry";
import { StatusBadge } from "@/components/ui/status-badge";

export default function PlatformPlans() {
  const def = getDocType("platformPlan");
  const [view, setView]             = useState<"list" | "form">("list");
  const [editing, setEditing]       = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data, loading, fetchItems, createItem, updateItem, deleteItem, deleteItems } =
    useCrud(def.tableName, "*", { isGlobal: true });

  /* ── Serialize feature arrays for the form textarea ──────────────────── */

  const toFormData = (record: any) => {
    if (!record) return record;

    const toLines = (val: any): string => {
      if (!val) return "";
      if (typeof val === "string") {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) return parsed.map(itemToString).join("\n");
        } catch { /* not JSON */ }
        return val;
      }
      if (Array.isArray(val)) return val.map(itemToString).join("\n");
      return String(val);
    };

    const itemToString = (v: any): string =>
      typeof v === "string" ? v : typeof v === "object" ? JSON.stringify(v) : String(v);

    return {
      ...record,
      features:          toLines(record.features),
      not_included:      toLines(record.not_included),
      modules_included:  Array.isArray(record.modules_included)
        ? record.modules_included
        : (record.modules_included ? [record.modules_included] : []),
    };
  };

  const toPayload = (header: any) => {
    const payload = { ...header };

    if (typeof payload.features === "string") {
      payload.features = payload.features.split(/[,\n]/).map((s: string) => s.trim()).filter(Boolean);
    }
    if (typeof payload.not_included === "string") {
      payload.not_included = payload.not_included.split(/[,\n]/).map((s: string) => s.trim()).filter(Boolean);
    }
    if (!Array.isArray(payload.modules_included)) {
      payload.modules_included = payload.modules_included
        ? String(payload.modules_included).split(/[,\n]/).map((s: string) => s.trim()).filter(Boolean)
        : [];
    }

    if (payload.is_highlighted === "true")  payload.is_highlighted = true;
    if (payload.is_highlighted === "false") payload.is_highlighted = false;
    if (payload.is_published   === "true")  payload.is_published   = true;
    if (payload.is_published   === "false") payload.is_published   = false;

    if (payload.price_monthly !== undefined) payload.price_monthly = parseInt(payload.price_monthly, 10) || 0;
    if (payload.price_yearly  !== undefined) payload.price_yearly  = parseInt(payload.price_yearly,  10) || 0;

    return payload;
  };

  /* ── Handlers ─────────────────────────────────────────────────────────── */

  const handleNew = () => {
    setEditing({ ...(def.defaults || {}), sort_order: data.length });
    setView("form");
  };

  const handleEdit = (record: any) => {
    setEditing(toFormData(record));
    setView("form");
  };

  const handleAbort = () => {
    setEditing(null);
    setView("list");
  };

  const handleSave = async (header: any) => {
    const payload = toPayload(header);
    if (editing?.id) {
      await updateItem(editing.id, payload);
    } else {
      await createItem(payload);
    }
    handleAbort();
    fetchItems();
  };

  const handleDelete = async (id: any) => {
    await deleteItem(id);
    if (view === "form") handleAbort();
  };

  /* ── Filtered data ────────────────────────────────────────────────────── */

  const filtered = data.filter((item) => {
    if (!searchTerm) return true;
    const t = searchTerm.toLowerCase();
    return (item.name || "").toLowerCase().includes(t);
  });

  /* ── Columns ──────────────────────────────────────────────────────────── */

  const columns = def.columns.map((col) => ({
    ...col,
    render:
      col.key === "is_published"
        ? (item: any) => (
            <StatusBadge
              status={item.is_published ? "active" : "disabled"}
              label={item.is_published ? "Published" : "Draft"}
            />
          )
        : col.key === "is_highlighted"
        ? (item: any) =>
            item.is_highlighted
              ? <StatusBadge status="active" label="Featured" />
              : null
        : col.render,
  }));

  /* ── Render ───────────────────────────────────────────────────────────── */

  if (view === "form") {
    return (
      <DocForm
        title={editing?.id ? `Edit ${def.name}` : `New ${def.name}`}
        subtitle="Shown on the pricing page under SmartOne Plans"
        headerFields={def.headerFields}
        showItems={false}
        onSave={handleSave}
        onAbort={handleAbort}
        onDelete={editing?.id ? () => handleDelete(editing.id) : undefined}
        initialData={editing}
      />
    );
  }

  return (
    <DocList
      title="Pricing Plans"
      data={filtered}
      columns={columns}
      onNew={handleNew}
      onRefresh={fetchItems}
      onRowClick={handleEdit}
      onDeleteItem={handleDelete}
      onDeleteIds={deleteItems}
      isLoading={loading}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      primaryKey="id"
      statusField="is_published"
      newLabel="New Plan"
    />
  );
}
