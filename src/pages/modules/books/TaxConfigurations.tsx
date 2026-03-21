import { useState } from "react";
import { useCrud } from "@/hooks/useCrud";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

export default function TaxConfigurations() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingItem, setEditingItem] = useState<any>(null);
    
    const { data: items, loading, fetchItems, createItem, updateItem } = useCrud("books_tax_slabs");

    const fields = [ 
      { key: 'name', label: 'Tax Profile Name', required: true }, 
      { key: 'percentage', label: 'Tax Rate %', type: 'number' }, 
      { key: 'region', label: 'Jurisdiction / Region' } 
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
      { key: 'name', label: 'Profile', render: (i: any) => <span className="font-bold text-gray-900">{i.name || "N/A"}</span> }, 
      { key: 'percentage', label: 'Rate %' } 
    ];

    if (view === "form") {
        return (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <ERPEntryForm
                    title={editingItem ? "Edit Tax Configurations" : "New Tax Configurations"}
                    subtitle="Compliance Tax Slabs"
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
            title="Tax Configurations"
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
