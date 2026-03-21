import { useState } from "react";
import { useCrud } from "@/hooks/useCrud";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

export default function StockAudits() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingItem, setEditingItem] = useState<any>(null);
    
    const { data: items, loading, fetchItems, createItem, updateItem } = useCrud("inventory_audits");

    const fields = [ 
      { key: 'name', label: 'Audit Reference', required: true }, 
      { key: 'warehouse', label: 'Location' }, 
      { key: 'reconciliation_status', label: 'Status' } 
    ];

    const handleSave = async (header: any) => {
        if (editingItem) {
            await updateItem(editingItem.id, header);
        } else {
            await createItem(header);
        }
        setView("list");
        setEditingItem(null);
    };

    const columns = [ 
      { key: 'name', label: 'Reference', render: (i: any) => <span className="font-bold text-gray-900">{i.name || "N/A"}</span> }, 
      { key: 'warehouse', label: 'Location' } 
    ];

    if (view === "form") {
        return (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <ERPEntryForm
                    title={editingItem ? "Edit Stock Audits" : "New Stock Audits"}
                    subtitle="Physical Verification Ledger"
                    headerFields={fields}
                    onAbort={() => { setView("list"); setEditingItem(null); }}
                    onSave={handleSave}
                    initialData={editingItem}
                />
            </div>
        );
    }

    return (
        <ERPListView
            title="Stock Audits"
            data={items || []}
            columns={columns}
            onNew={() => { setEditingItem(null); setView("form"); }}
            onRefresh={fetchItems}
            onRowClick={(i) => { setEditingItem(i); setView("form"); }}
            isLoading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            primaryKey="id"
        />
    );
}
