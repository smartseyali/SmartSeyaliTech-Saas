import { useState } from "react";
import { useCrud } from "@/hooks/useCrud";
import { Package, TrendingUp, Save, X, Plus } from "lucide-react";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

export default function Items() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingItem, setEditingItem] = useState<any>(null);
    
    const { data: products, loading, fetchItems, createItem, updateItem } = useCrud("products");

    const itemHeaderFields = [
        { key: "name", label: "Legal product Identity", required: true, ph: "Enterprise Logic Pro..." },
        { key: "sku", label: "Registry SKU node", ph: "ELP-2026-00X" },
        { key: "rate", label: "Standard unit rate", type: "number" as const, ph: "0.00" },
        { key: "category", label: "ledger group", ph: "Hardware / Software" },
        { key: "status", label: "operational state", type: "select" as const, 
            options: [
                { label: "Active Nodes", value: "active" },
                { label: "Archived Assets", value: "inactive" }
            ]
        },
        { key: "description", label: "Registry Narrative", ph: "Technical specifications..." }
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

    const fmt = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

    const itemColumns = [
        { 
            key: "name", 
            label: "Item Entity Identity",
            render: (item: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                        <Package className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 uppercase italic tracking-tight">{item.name}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{item.category || "General Ledger Group"}</span>
                    </div>
                </div>
            )
        },
        { 
            key: "sku", 
            label: "Registry SKU",
            render: (item: any) => <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{item.sku || "UNASSIGNED"}</span>
        },
        { 
            key: "rate", 
            label: "Unit Value",
            render: (item: any) => <span className="font-black text-indigo-600 tracking-tight">{fmt(item.rate)}</span>,
        },
        { 
            key: "stock", 
            label: "Inventory Level",
            render: (item: any) => (
                <div className="flex items-center gap-3">
                    <span className="text-[11px] font-black text-slate-700">{item.current_stock || 0}</span>
                    <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                            className={`h-full rounded-full transition-all duration-1000 ${
                                (item.current_stock || 0) > 10 ? "bg-emerald-500" : (item.current_stock || 0) > 0 ? "bg-amber-500" : "bg-rose-500"
                            }`} 
                            style={{ width: `${Math.min(100, ((item.current_stock || 0) / 50) * 100)}%` }} 
                        />
                    </div>
                </div>
            )
        },
        { 
            key: "status", 
            label: "Ledger state",
            render: (item: any) => <StatusBadge status={ (item.current_stock || 0) > 0 ? "In Stock" : "Out of Stock"} />
        }
    ];

    const filteredItems = (products || []).filter(item => 
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (view === "form") {
        return (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <ERPEntryForm
                    title={editingItem ? "Refine Entity identity" : "Initialize Resource entry"}
                    subtitle="Inventory Management Protocol"
                    headerFields={itemHeaderFields}
                    onAbort={() => { setView("list"); setEditingItem(null); }}
                    onSave={handleSave}
                    initialData={editingItem}
                    showItems={false}
                />
            </div>
        );
    }

    return (
        <ERPListView
            title="Registry Items"
            data={filteredItems}
            columns={itemColumns}
            onNew={() => { setEditingItem(null); setView("form"); }}
            onRefresh={fetchItems}
            onRowClick={(item) => { setEditingItem(item); setView("form"); }}
            isLoading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            primaryKey="id"
            headerActions={
                <div className="flex items-center gap-2">
                    <button className="h-8 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-all flex items-center gap-2">
                        <TrendingUp className="w-3.5 h-3.5" /> Stock Adjustment
                    </button>
                </div>
            }
        />
    );
}
