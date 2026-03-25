import { useState } from "react";
import { 
    MessageSquare, Smartphone, Layout, 
    Plus, Search, Filter, RefreshCw, 
    CheckCircle2, AlertCircle, Clock,
    Type, Image as ImageIcon,
    MousePointer2, Settings2, ShieldCheck,
    Facebook, Globe
} from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

export default function WhatsAppTemplates() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingTemplate, setEditingTemplate] = useState<any>(null);
    
    // Fetch templates from whatsapp_templates table
    const { data: templates, loading, fetchItems, createItem, updateItem } = useCrud("whatsapp_templates");

    const templateFields = [
        { key: "name", label: "Template Name", required: true, ph: "Summer_Promo_2026..." },
        { 
            key: "category", label: "Category", type: "select" as const,
            options: [
                { label: "Marketing Campaign", value: "MARKETING" },
                { label: "Utility Transactional", value: "UTILITY" },
                { label: "Authentication", value: "AUTHENTICATION" }
            ]
        },
        { key: "language", label: "Language", ph: "en_US..." },
        { key: "meta_template_id", label: "Meta Infrastructure", ph: "h_1029348123..." },
        { 
            key: "status", label: "Status", type: "select" as const,
            options: [
                { label: "Pending Meta Approval", value: "pending" },
                { label: "Authorized", value: "approved" },
                { label: "Rejected", value: "rejected" }
            ]
        }
    ];

    const handleSave = async (header: any) => {
        if (editingTemplate) {
            await updateItem(editingTemplate.id, header);
        } else {
            await createItem(header);
        }
        setView("list");
        setEditingTemplate(null);
    };

    const templateColumns = [
        { 
            key: "identity", 
            label: "Template Name",
            render: (t: any) => (
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 relative">
                        <MessageSquare className="w-6 h-6" />
                        <div className="absolute -top-1 -right-1">
                           <Facebook size={12} className="text-blue-600 fill-white" />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900   tracking-tight">{t.name}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-400 font-bold  tracking-widest leading-none border-r pr-2 border-slate-200">
                                {t.category || "GENERAL"}
                            </span>
                            <span className="text-xs text-indigo-400 font-bold  tracking-widest leading-none flex items-center gap-1">
                                <Globe size={10}/> {t.language || 'en_US'}
                            </span>
                        </div>
                    </div>
                </div>
            )
        },
        { 
            key: "structure", 
            label: "Message Components",
            render: () => (
                <div className="flex gap-1.5">
                    <div className="w-6 h-6 rounded bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500"><ImageIcon size={12}/></div>
                    <div className="w-6 h-6 rounded bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500"><Type size={12}/></div>
                    <div className="w-6 h-6 rounded bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500"><MousePointer2 size={12}/></div>
                </div>
            )
        },
        { 
            key: "meta_id", 
            label: "Meta ID",
            render: (t: any) => (
                <span className="text-xs font-bold text-slate-500  tracking-widest font-mono">
                    {t.meta_template_id || 'PENDING_IND...'}
                </span>
            )
        },
        { 
            key: "status", 
            label: "Status",
            render: (t: any) => <StatusBadge status={t.status || "approved"} />
        }
    ];

    if (view === "form") {
        return (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <ERPEntryForm
                    title={editingTemplate ? "Refine Meta Protocol" : "Initialize Meta Template"}
                    subtitle="WhatsApp Business Infrastructure"
                    headerFields={templateFields}
                    onAbort={() => { setView("list"); setEditingTemplate(null); }}
                    onSave={handleSave}
                    initialData={editingTemplate}
                    showItems={false}
                />
            </div>
        );
    }

    return (
        <ERPListView
            title="WhatsApp"
            data={templates || []}
            columns={templateColumns}
            onNew={() => { setEditingTemplate(null); setView("form"); }}
            onRefresh={fetchItems}
            onRowClick={(t) => { setEditingTemplate(t); setView("form"); }}
            isLoading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            primaryKey="id"
            headerActions={
                <div className="flex items-center gap-2">
                    <button className="h-8 px-4 rounded-xl font-bold text-xs  tracking-widest bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5" /> Sync with Meta Hub
                    </button>
                </div>
            }
        />
    );
}
