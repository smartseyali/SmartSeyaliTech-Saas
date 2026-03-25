import { useState } from "react";
import { 
    Ruler, Scale, Box, 
    Plus, Search, Filter, RefreshCw, 
    CheckCircle2, AlertCircle, Clock,
    ChevronRight, Layers, LayoutGrid
} from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

export default function UOMMaster() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingUOM, setEditingUOM] = useState<any>(null);
    
    const { data: uoms, loading, fetchItems, createItem, updateItem } = useCrud("uoms", "*", { isGlobal: true });

    const uomFields = [
        { key: "name", label: "Data", required: true, ph: "Killogram (Kg), Liters (L)..." },
        { 
            key: "category_id", label: "Universal Dimension category", type: "select" as const, 
            options: [
                { label: "Unit / Count", value: "1" },
                { label: "Weight / Mass", value: "2" },
                { label: "Volume / Capacity", value: "3" },
                { label: "Length / Distance", value: "4" }
            ]
        },
        { 
            key: "type", label: "Scale", type: "select" as const,
            options: [
                { label: "Reference (Standard)", value: "reference" },
                { label: "Bigger Magnitude", value: "bigger" },
                { label: "Smaller Magnitude", value: "smaller" }
            ]
        },
        { key: "ratio", label: "Conversion Ratio", type: "number" as const, ph: "1.0000" }
    ];

    const handleSave = async (header: any) => {
        if (editingUOM) {
            await updateItem(editingUOM.id, header);
        } else {
            await createItem(header);
        }
        setView("list");
        setEditingUOM(null);
    };

    const uomColumns = [
        { 
            key: "identity", 
            label: "UOM",
            render: (u: any) => (
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                        <Scale className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900   tracking-tight">{u.name}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-gray-400 font-bold  tracking-widest leading-none border-r pr-2 border-slate-200">
                                {u.category_name || "UNIVERSAL DIMENSION"}
                            </span>
                            <span className="text-[10px] text-indigo-400 font-bold  tracking-widest leading-none">
                                {u.type?.toUpperCase()} SCALING
                            </span>
                        </div>
                    </div>
                </div>
            )
        },
        { 
            key: "conversion", 
            label: "Equivalence",
            render: (u: any) => (
                <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-slate-900 tracking-tighter">
                        {u.ratio || "1.0000"} UNITS
                    </span>
                    <span className="text-[9px] font-bold text-slate-400  tracking-widest">Protocol Baseline Conversion</span>
                </div>
            )
        },
        { 
            key: "state", 
            label: "Status",
            render: (u: any) => <StatusBadge status={u.is_active !== false ? "active" : "disabled"} />
        }
    ];

    if (view === "form") {
        return (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <ERPEntryForm
                    title={editingUOM ? "Refine UOM Identity" : "Initialize Dimension protocol"}
                    subtitle="Universal Measurement Infrastructure"
                    headerFields={uomFields}
                    onAbort={() => { setView("list"); setEditingUOM(null); }}
                    onSave={handleSave}
                    initialData={editingUOM}
                    showItems={false}
                />
            </div>
        );
    }

    return (
        <ERPListView
            title="UOM"
            data={uoms || []}
            columns={uomColumns}
            onNew={() => { setEditingUOM(null); setView("form"); }}
            onRefresh={fetchItems}
            onRowClick={(u) => { setEditingUOM(u); setView("form"); }}
            isLoading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            primaryKey="id"
            headerActions={
                <div className="flex items-center gap-2">
                    <button className="h-8 px-4 rounded-xl font-bold text-[10px]  tracking-widest bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5" /> Logical Clusters
                    </button>
                </div>
            }
        />
    );
}
