import { useState } from "react";
import { useCrud } from "@/hooks/useCrud";
import DocForm from "@/components/modules/DocForm";
import DocList from "@/components/modules/DocList";
import { getDocType } from "@/registry";
import { StatusBadge } from "@/components/ui/status-badge";

export default function PlatformPlans() {
  const def = getDocType("platformPlan");
  const [view, setView] = useState<"list" | "form">("list");
  const [editing, setEditing] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data, loading, fetchItems, createItem, updateItem, deleteItem, deleteItems } =
    useCrud(def.tableName, "*", { isGlobal: true });

  /* ── Serialize arrays for the form textarea ─────────────────────────────── */

  const toFormData = (record: any) => {
    if (!record) return record;
    return {
      ...record,
      features: Array.isArray(record.features) ? record.features.join(", ") : (record.features || ""),
    };
  };

  /** Parse comma-separated textarea values back to arrays before saving */
  const toPayload = (header: any) => {
    const payload = { ...header };
    if (typeof payload.features === "string") {
      payload.features = payload.features.split(/[,\n]/).map((s: string) => s.trim()).filter(Boolean);
    }
    // Coerce boolean-as-string selects
    if (payload.is_active === "true") payload.is_active = true;
    if (payload.is_active === "false") payload.is_active = false;
    return payload;
  };

  /* ── Handlers ───────────────────────────────────────────────────────────── */

  const handleNew = () => {
    setEditing({ ...(def.defaults || {}), price_monthly: 0, sort_order: data.length });
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

  /* ── Filtered data ──────────────────────────────────────────────────────── */

  const filtered = data.filter((item) => {
    if (!searchTerm) return true;
    const t = searchTerm.toLowerCase();
    return (
      (item.name || "").toLowerCase().includes(t) ||
      (item.slug || "").toLowerCase().includes(t)
    );
  });

  /* ── Columns with status rendering ──────────────────────────────────────── */

  const columns = def.columns.map((col) => ({
    ...col,
    render: col.key === "is_active"
      ? (item: any) => <StatusBadge status={item.is_active ? "active" : "disabled"} />
      : col.render,
  }));

  /* ── Render ─────────────────────────────────────────────────────────────── */

  if (view === "form") {
    return (
      <DocForm
        title={editing?.id ? `Edit ${def.name}` : `New ${def.name}`}
        subtitle={def.name}
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
      title={def.listTitle || "Subscription Plans"}
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
      statusField="is_active"
      newLabel="New Plan"
    />
  );
}
