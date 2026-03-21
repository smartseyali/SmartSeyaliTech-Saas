import { useState } from "react";
import { 
    Tag, Palette, Maximize, 
    Plus, Search, Filter, RefreshCw, 
    CheckCircle2, AlertCircle, Clock,
    LayoutGrid, ChevronRight, Binary,
    ListFilter
} from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

export default function AttributeMaster() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingAttr, setEditingAttr] = useState<any>(null);
    
    const { data: attributes, loading, fetchItems, createItem, updateItem } = useCrud("product_attributes");

    const attrFields = [
        { key: "name", label: "Attribute", required: true, ph: "Color, Size, Material..." },
        { 
            key: "display_type", label: "Visualization", type: "select" as const,
            options: [
                { label: "Standard textual", value: "text" },
                { label: "High-Fidelity Swatches", value: "swatches" },
                { label: "Selection Dropdown", value: "dropdown" }
            ]
        }
    ];

    const attrValueFields = [
        { key: "value", label: "Value", ph: "Red / XL / Silk..." },
        { key: "meta_data", label: "Logical Meta (JSON)", ph: '{"hex": "#FF0000"}' }
    ];

    const handleSave = async (header: any, items: any[]) => {
        const payload = { ...header, values: items };
        if (editingAttr) {
            await updateItem(editingAttr.id, payload);
        } else {
            await createItem(payload);
        }
        setView("list");
        setEditingAttr(null);
    };

    const attrColumns = [
        { 
            key: "identity", 
            label: "Attribute",
            render: (a: any) => (
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                        <Tag className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 uppercase italic tracking-tight">{a.name}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none border-r pr-2 border-slate-200">
                                {a.display_type?.toUpperCase() || "TEXT"} INTERFACE
                            </span>
                            <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest leading-none flex items-center gap-1">
                                <Binary size={10}/> {a.value_count || 0} NODES
                            </span>
                        </div>
                    </div>
                </div>
            )
        },
        { 
            key: "structure", 
            label: "Magnitude Cluster",
            render: (a: any) => (
                <div className="flex gap-1.5 flex-wrap max-w-xs">
                    {(a.sample_values || ['Red', 'Blue', 'Green']).map((v: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                            {v}
                        </span>
                    ))}
                    {a.value_count > 3 && <span className="text-[9px] font-black text-slate-300">+{a.value_count - 3} MORE</span>}
                </div>
            )
        },
        { 
            key: "state", 
            label: "Status",
            render: () => <StatusBadge status="active" />
        }
    ];

    if (view === "form") {
        return (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <ERPEntryForm
                    title={editingAttr ? "Refine Attribute Protocol" : "Initialize Identity Node"}
                    subtitle="Universal Catalog Variation Infrastructure"
                    headerFields={attrFields}
                    itemFields={attrValueFields}
                    onAbort={() => { setView("list"); setEditingAttr(null); }}
                    onSave={handleSave}
                    initialData={editingAttr}
                    itemTitle="Attribute Magnitude Registry"
                />
            </div>
        );
    }

    return (
        <ERPListView
            title="Product Attribute"
            data={attributes || []}
            columns={attrColumns}
            onNew={() => { setEditingAttr(null); setView("form"); }}
            onRefresh={fetchItems}
            onRowClick={(a) => { setEditingAttr(a); setView("form"); }}
            isLoading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            primaryKey="id"
            headerActions={
                <div className="flex items-center gap-2">
                    <button className="h-8 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2">
                        <Palette className="w-3.5 h-3.5" /> Visualize Hub
                    </button>
                </div>
            }
        />
    );
}
