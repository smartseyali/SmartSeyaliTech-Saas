import { useState } from "react";
import { useCrud } from "@/hooks/useCrud";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

export default function GoodsReceipts() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingItem, setEditingItem] = useState<any>(null);
    
    const { data: items, loading, fetchItems, createItem, updateItem } = useCrud("purchase_receipts");

    const fields = [ 
      { key: 'name', label: 'Receipt Reference', required: true }, 
      { key: 'po_reference', label: 'Purchase Order Ref' }, 
      { key: 'supplier_name', label: 'Supplier' }, 
      { key: 'receipt_date', label: 'Date', type: 'date' as const } 
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
      { key: 'name', label: 'GRN No', render: (i: any) => <span className="font-bold text-gray-900">{i.name || "N/A"}</span> }, 
      { key: 'supplier_name', label: 'Supplier' },
      { key: 'receipt_date', label: 'Receiving Date' }
    ];

    if (view === "form") {
        return (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <ERPEntryForm
                    title={editingItem ? "Edit Goods Receipts (GRN)" : "New Goods Receipts (GRN)"}
                    subtitle="Inbound GRN Protocol"
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
            title="Goods Receipts (GRN)"
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
