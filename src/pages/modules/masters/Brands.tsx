import { useState } from "react";
import { 
    Flag, Globe, Building2, 
    Plus, Search, Filter, RefreshCw, 
    CheckCircle2, AlertCircle, Clock,
    Link2, Image as ImageIcon, ExternalLink,
    ChevronRight, Library
} from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

export default function BrandMaster() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingBrand, setEditingBrand] = useState<any>(null);
    
    const { data: brands, loading, fetchItems, createItem, updateItem } = useCrud("product_brands");

    const brandFields = [
        { key: "name", label: "Registry Brand identity", required: true, ph: "Nike, Apple, Samsung..." },
        { key: "logo_url", label: "Identity visual Node (URL)", ph: "https://cdn.brand.com/logo.png" },
        { key: "website", label: "Discovery Hub (URL)", ph: "https://www.brand.com" },
        { 
            key: "is_active", label: "Registry status", type: "select" as const,
            options: [
                { label: "Active Authorized Entity", value: "true" },
                { label: "Archived Identity Node", value: "false" }
            ]
        }
    ];

    const subBrandFields = [
        { key: "name", label: "Sub-Brand Registry identity", ph: "Air Max, iPhone, Galaxy..." }
    ];

    const handleSave = async (header: any, items: any[]) => {
        const payload = { ...header, sub_brands: items };
        if (editingBrand) {
            await updateItem(editingBrand.id, payload);
        } else {
            await createItem(payload);
        }
        setView("list");
        setEditingBrand(null);
    };

    const brandColumns = [
        { 
            key: "identity", 
            label: "Brand Entity / Logic",
            render: (b: any) => (
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm group-hover:bg-slate-900 group-hover:border-slate-800 transition-all duration-500 overflow-hidden">
                        {b.logo_url ? (
                            <img src={b.logo_url} alt={b.name} className="w-full h-full object-cover group-hover:opacity-80" />
                        ) : (
                            <Flag className="w-6 h-6 text-slate-400 group-hover:text-white" />
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 uppercase italic tracking-tight">{b.name}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none border-r pr-2 border-slate-200">
                                {b.website ? 'GLOBAL HUB AUTHORIZED' : 'INTERNAL NODE'}
                            </span>
                            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest leading-none flex items-center gap-1">
                                <Library size={10}/> {b.sub_brand_count || 0} SUB-NODES
                            </span>
                        </div>
                    </div>
                </div>
            )
        },
        { 
            key: "discovery", 
            label: "Global discovery Hub",
            render: (b: any) => (
                <div className="flex items-center gap-2">
                    {b.website && (
                        <a href={b.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">
                            <Globe size={10} /> Visit Hub <ExternalLink size={8} />
                        </a>
                    )}
                </div>
            )
        },
        { 
            key: "state", 
            label: "Registry state",
            render: (b: any) => <StatusBadge status={b.is_active !== false ? "active" : "disabled"} />
        }
    ];

    if (view === "form") {
        return (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <ERPEntryForm
                    title={editingBrand ? "Refine Brand Identity" : "Initialize Brand Entity"}
                    subtitle="Universal Label & Sub-Identity Registry"
                    headerFields={brandFields}
                    itemFields={subBrandFields}
                    onAbort={() => { setView("list"); setEditingBrand(null); }}
                    onSave={handleSave}
                    initialData={editingBrand}
                    itemTitle="Sub-Brand Identity cluster"
                />
            </div>
        );
    }

    return (
        <ERPListView
            title="Global Brand Registry"
            data={brands || []}
            columns={brandColumns}
            onNew={() => { setEditingBrand(null); setView("form"); }}
            onRefresh={fetchItems}
            onRowClick={(b) => { setEditingBrand(b); setView("form"); }}
            isLoading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            primaryKey="id"
            headerActions={
                <div className="flex items-center gap-2">
                    <button className="h-8 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5" /> Corporation Matrix
                    </button>
                </div>
            }
        />
    );
}
