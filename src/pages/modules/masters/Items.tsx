import { useState } from "react";
import { useCrud } from "@/hooks/useCrud";
import { Package, TrendingUp, Save, X, Plus, Tag, Search, Filter, RefreshCw } from "lucide-react";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

export default function Items() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingItem, setEditingItem] = useState<any>(null);
    
    // Fetch all products from unified master table
    const { data: products, loading, fetchItems, createItem, updateItem } = useCrud("products");

    const itemHeaderFields = [
        { key: "name", label: "Registry Product Identity", required: true, ph: "Enterprise Logic Pro..." },
        { key: "sku", label: "Operational SKU node", ph: "ELP-2026-00X" },
        { key: "rate", label: "Standard Unit Rate", type: "number" as const, ph: "0.00" },
        { key: "price", label: "Registry Sales Price", type: "number" as const, ph: "0.00" },
        { 
            key: "status", label: "Operational State", type: "select" as const, 
            options: [
                { label: "Active Registry Node", value: "active" },
                { label: "Dormant / Archive Asset", value: "inactive" }
            ]
        },
        { key: "description", label: "Technical Registry Narrative", ph: "Detailed specifications..." }
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
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                        <Package className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 uppercase italic tracking-tight">{item.name}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none border-r pr-2 border-slate-200">
                                {item.sku || "UNASSIGNED"}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">
                                {item.category || "General Ledger"}
                            </span>
                        </div>
                    </div>
                </div>
            )
        },
        { 
            key: "rate", 
            label: "Valuation Hub / Rate",
            render: (item: any) => (
                <div className="flex flex-col">
                    <span className="font-black text-indigo-600 tracking-tight">{fmt(item.rate)}</span>
                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest leading-none mt-1">Cost Valuation</span>
                </div>
            ),
        },
        { 
            key: "price", 
            label: "Operational Market Price",
            render: (item: any) => (
                <div className="flex flex-col">
                    <span className="font-black text-rose-600 tracking-tight">{fmt(item.price)}</span>
                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest leading-none mt-1">Registry Sale Unit</span>
                </div>
            ),
        },
        { 
            key: "status", 
            label: "Ledger status",
            render: (item: any) => <StatusBadge status={item.status || "active"} />
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
                    title={editingItem ? "Refine Entity Identity" : "Initialize Resource Entry"}
                    subtitle="Global Item Registry Protocol"
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
            title="Global Item Registry"
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
                    <button className="h-8 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-all flex items-center gap-2 shadow-sm">
                        <TrendingUp className="w-3.5 h-3.5" /> Stock Adjustment
                    </button>
                    <button className="h-8 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100 transition-all flex items-center gap-2 shadow-sm">
                        Matrix Export
                    </button>
                </div>
            }
        />
    );
}
