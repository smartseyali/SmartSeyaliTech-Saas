import { useState } from "react";
import { useCrud } from "@/hooks/useCrud";
import DocForm from "@/components/modules/DocForm";
import DocList from "@/components/modules/DocList";
import { getDocType } from "@/registry";
import { StatusBadge } from "@/components/ui/status-badge";

export default function PlatformModules() {
  const def = getDocType("platformModule");
  const [view, setView] = useState<"list" | "form">("list");
  const [editing, setEditing] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data, loading, fetchItems, createItem, updateItem, deleteItem, deleteItems } =
    useCrud(def.tableName, "*", { isGlobal: true });


  /* ── Array ↔ string helpers ─────────────────────────────────────────────── */

  const toFormData = (record: any) => {
    if (!record) return record;
    return {
      ...record,
      features: Array.isArray(record.features) ? record.features.join(", ") : (record.features || ""),
      screenshots: Array.isArray(record.screenshots) ? record.screenshots.join(", ") : (record.screenshots || ""),
      technologies: Array.isArray(record.technologies) ? record.technologies.join(", ") : (record.technologies || ""),
      included_in_plans: Array.isArray(record.included_in_plans) ? record.included_in_plans.join(", ") : (record.included_in_plans || ""),
      use_cases: Array.isArray(record.use_cases) ? JSON.stringify(record.use_cases, null, 2) : (record.use_cases || "[]"),
    };
  };

  const toPayload = (header: any) => {
    const p = { ...header };

    const csvFields = ["features", "screenshots", "technologies", "included_in_plans"];
    csvFields.forEach((f) => {
      if (typeof p[f] === "string") {
        p[f] = p[f].split(/[,\n]/).map((s: string) => s.trim()).filter(Boolean);
      }
    });

    if (typeof p.use_cases === "string") {
      try { p.use_cases = JSON.parse(p.use_cases); } catch { p.use_cases = []; }
    }

    ["is_active", "is_core", "needs_template", "is_free"].forEach((f) => {
      if (p[f] === "true") p[f] = true;
      if (p[f] === "false") p[f] = false;
    });

    if (p.price_monthly !== undefined) p.price_monthly = parseInt(p.price_monthly, 10) || 0;
    if (p.price_yearly  !== undefined) p.price_yearly  = parseInt(p.price_yearly,  10) || 0;

    return p;
  };

  /* ── Handlers ───────────────────────────────────────────────────────────── */

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

  /* ── Filtered data ──────────────────────────────────────────────────────── */

  const filtered = data.filter((item) => {
    if (!searchTerm) return true;
    const t = searchTerm.toLowerCase();
    return (
      (item.name || "").toLowerCase().includes(t) ||
      (item.slug || "").toLowerCase().includes(t)
    );
  });

  /* ── Columns ────────────────────────────────────────────────────────────── */

  const columns = def.columns.map((col) => ({
    ...col,
    render:
      col.key === "status"
        ? (item: any) => <StatusBadge status={item.status} />
        : col.key === "is_active"
          ? (item: any) => <StatusBadge status={item.is_active ? "active" : "disabled"} />
          : col.key === "is_core"
            ? (item: any) => <span className={item.is_core ? "text-green-600 font-semibold" : "text-slate-400"}>
                {item.is_core ? "Yes" : "No"}
              </span>
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
      title={def.listTitle || "Platform Modules"}
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
      statusField="status"
      newLabel="New Module"
    />
  );
}
