import { useState } from "react";
import { 
    Layers, Package, Hash, 
    Plus, Search, Filter, RefreshCw, 
    CheckCircle2, AlertCircle, Clock,
    Barcode, DollarSign, TrendingUp,
    ChevronRight, Binary, Box
} from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

export default function VariantMaster() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingVariant, setEditingVariant] = useState<any>(null);
    
    const { data: variants, loading, fetchItems, createItem, updateItem } = useCrud("product_variants");

    const variantFields = [
        { 
            key: "product_id", label: "Parent", type: "select" as const, 
            required: true, options: [] // Fetch products
        },
        { key: "sku", label: "SKU", required: true, ph: "SKU-PRO-001-RED-XL..." },
        { key: "barcode", label: "Systemic Barcode", ph: "1092837465..." },
        { key: "price_extra", label: "Incremental Magnitude (Extra Price)", type: "number" as const, ph: "500.00" },
        { key: "stock_qty", label: "Current Inventory", type: "number" as const, ph: "0.00" }
    ];

    const attributeValueFields = [
        { 
            key: "attribute_value_id", label: "Attribute Magnitude", type: "select" as const,
            options: [] // Fetch attribute values
        }
    ];

    const handleSave = async (header: any, items: any[]) => {
        const payload = { ...header, attributes: items };
        if (editingVariant) {
            await updateItem(editingVariant.id, payload);
        } else {
            await createItem(payload);
        }
        setView("list");
        setEditingVariant(null);
    };

    const variantColumns = [
        { 
            key: "identity", 
            label: "Variant / Parent",
            render: (v: any) => (
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                        <Layers className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 uppercase italic tracking-tight">{v.product_name || 'PARENT PRODUCT NODE'}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none border-r pr-2 border-slate-200">
                                SKU: {v.sku}
                            </span>
                            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest leading-none flex items-center gap-1">
                                <Binary size={10}/> {v.attribute_summary || 'RED / XL'}
                            </span>
                        </div>
                    </div>
                </div>
            )
        },
        { 
            key: "financials", 
            label: "Modification Magnitude",
            render: (v: any) => (
                <div className="flex flex-col">
                    <span className="text-[12px] font-black text-slate-700 tracking-tighter">
                        +{v.price_extra || 0} INR
                    </span>
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Base Premium Node</span>
                </div>
            )
        },
        { 
            key: "inventory", 
            label: "Systemic Stock",
            render: (v: any) => (
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <span className="text-[12px] font-black text-slate-900 tracking-tighter">{v.stock_qty || 0} NOS</span>
                        <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden mt-1">
                            <div className="h-full bg-indigo-500 w-[65%]" />
                        </div>
                    </div>
                    <Box size={14} className="text-slate-300" />
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
                    title={editingVariant ? "Refine Variant Protocol" : "Initialize Variant node"}
                    subtitle="Systemic Catalog Extension & SKUs"
                    headerFields={variantFields}
                    itemFields={attributeValueFields}
                    onAbort={() => { setView("list"); setEditingVariant(null); }}
                    onSave={handleSave}
                    initialData={editingVariant}
                    itemTitle="Attribute Mapping Hub"
                />
            </div>
        );
    }

    return (
        <ERPListView
            title="Item Variant"
            data={variants || []}
            columns={variantColumns}
            onNew={() => { setEditingVariant(null); setView("form"); }}
            onRefresh={fetchItems}
            onRowClick={(v) => { setEditingVariant(v); setView("form"); }}
            isLoading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            primaryKey="id"
            headerActions={
                <div className="flex items-center gap-2">
                    <button className="h-8 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2">
                        <Barcode className="w-3.5 h-3.5" /> Bulk SKU Generation
                    </button>
                </div>
            }
        />
    );
}
