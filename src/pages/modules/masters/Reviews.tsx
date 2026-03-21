import { useState } from "react";
import { 
    Star, MessageSquare, User, 
    Plus, Search, Filter, RefreshCw, 
    CheckCircle2, AlertCircle, Clock,
    ThumbsUp, ShieldCheck, Eye,
    ChevronRight, ExternalLink
} from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

export default function ReviewMaster() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingReview, setEditingReview] = useState<any>(null);
    
    const { data: reviews, loading, fetchItems, createItem, updateItem } = useCrud("product_reviews");

    const reviewFields = [
        { 
            key: "product_id", label: "Product", type: "select" as const, 
            required: true, options: [] 
        },
        { 
            key: "user_id", label: "Consumer", type: "select" as const, 
            required: true, options: [] 
        },
        { key: "rating", label: "Magnitude (1-5)", type: "number" as const, required: true },
        { key: "comment", label: "Consumer Narrative", type: "text" as const, ph: "Experience protocol..." },
        { 
            key: "status", label: "Moderation", type: "select" as const,
            options: [
                { label: "Pending Authorization", value: "pending" },
                { label: "Authorized (Public)", value: "approved" },
                { label: "Hidden", value: "hidden" }
            ]
        }
    ];

    const handleSave = async (header: any) => {
        if (editingReview) {
            await updateItem(editingReview.id, header);
        } else {
            await createItem(header);
        }
        setView("list");
        setEditingReview(null);
    };

    const reviewColumns = [
        { 
            key: "identity", 
            label: "Review / Narrative",
            render: (r: any) => (
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                        <MessageSquare className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 uppercase italic tracking-tight">{r.product_name || 'PRODUCT ENTITY NODE'}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none border-r pr-2 border-slate-200">
                                {r.user_name || 'ANONYMOUS CONSUMER'}
                            </span>
                            <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <Star 
                                        key={i} 
                                        size={10} 
                                        className={i < (r.rating || 5) ? "text-amber-400 fill-amber-400" : "text-slate-200"} 
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        { 
            key: "narrative", 
            label: "Content",
            render: (r: any) => (
                <div className="max-w-xs overflow-hidden">
                    <p className="text-[11px] font-medium text-slate-500 line-clamp-2 italic">
                        "{r.comment || 'Performance protocol authorized successfully.'}"
                    </p>
                </div>
            )
        },
        { 
            key: "verification", 
            label: "Trust",
            render: (r: any) => (
                <div className="flex items-center gap-2">
                    {r.is_verified_purchase !== false ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-black uppercase tracking-widest">
                            <ShieldCheck size={10} /> Verified Protocol
                        </span>
                    ) : (
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Standard Entry</span>
                    )}
                </div>
            )
        },
        { 
            key: "status", 
            label: "Moderation",
            render: (r: any) => <StatusBadge status={r.status || "approved"} />
        }
    ];

    if (view === "form") {
        return (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <ERPEntryForm
                    title={editingReview ? "Refine Moderation Node" : "Initialize Review protocol"}
                    subtitle="Consumer Feedback Governance & Authorization"
                    headerFields={reviewFields}
                    onAbort={() => { setView("list"); setEditingReview(null); }}
                    onSave={handleSave}
                    initialData={editingReview}
                    showItems={false}
                />
            </div>
        );
    }

    return (
        <ERPListView
            title="Consumer Feedback"
            data={reviews || []}
            columns={reviewColumns}
            onNew={() => { setEditingReview(null); setView("form"); }}
            onRefresh={fetchItems}
            onRowClick={(r) => { setEditingReview(r); setView("form"); }}
            isLoading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            primaryKey="id"
            headerActions={
                <div className="flex items-center gap-2">
                    <button className="h-8 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Batch Authorization
                    </button>
                    <button className="h-8 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 transition-all flex items-center gap-2">
                        <Eye className="w-3.5 h-3.5" /> Hidden Nodes
                    </button>
                </div>
            }
        />
    );
}
