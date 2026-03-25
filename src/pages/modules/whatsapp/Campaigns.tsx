import { useState } from "react";
import { 
    Send, Megaphone, Users, 
    BarChart3, Plus, Search, 
    Filter, RefreshCw, Zap,
    Target, MousePointer2, Flame,
    TrendingUp, AlertCircle,
    CheckCircle2, Clock, Smartphone
} from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

export default function WhatsAppCampaigns() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingCampaign, setEditingCampaign] = useState<any>(null);
    
    // Fetch campaigns from whatsapp_campaigns registry
    const { data: campaigns, loading, fetchItems, createItem, updateItem } = useCrud("whatsapp_campaigns");

    const campaignFields = [
        { key: "name", label: "Campaign", required: true, ph: "Summer_Sale_Broadcast..." },
        { 
            key: "template_id", label: "Message Template", type: "select" as const, 
            required: true, options: [] // Fetch from templates in real use
        },
        { 
            key: "status", label: "Status", type: "select" as const,
            options: [
                { label: "Draft", value: "draft" },
                { label: "Scheduled", value: "scheduled" },
                { label: "Active Broadcast", value: "running" },
                { label: "Completed", value: "completed" }
            ]
        },
        { key: "scheduled_at", label: "Execution Mobilization Date", type: "datetime-local" as const },
        { key: "ad_follow_up", label: "Ad-to-Chat Follow-up", type: "select" as const, options: [
            { label: "Enable Automated Follow-up", value: "true" },
            { label: "Standard Broadcast", value: "false" }
        ]}
    ];

    const handleSave = async (header: any) => {
        if (editingCampaign) {
            await updateItem(editingCampaign.id, header);
        } else {
            await createItem(header);
        }
        setView("list");
        setEditingCampaign(null);
    };

    const campaignColumns = [
        { 
            key: "identity", 
            label: "Campaign",
            render: (c: any) => (
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                        <Megaphone className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900   tracking-tight">{c.name}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-400 font-bold  tracking-widest leading-none border-r pr-2 border-slate-200">
                                {c.template_name || "MARKETING NODE"}
                            </span>
                            <span className="text-xs text-amber-500 font-bold  tracking-widest leading-none flex items-center gap-1">
                                <Target size={10}/> {c.ad_follow_up ? 'Ad Follow-up' : 'Bulk Broadcast'}
                            </span>
                        </div>
                    </div>
                </div>
            )
        },
        { 
            key: "reach", 
            label: "Systemic Delivery Metrics",
            render: (c: any) => (
                <div className="flex flex-col">
                    <div className="flex items-center gap-3 mb-1.5">
                        <TrendingUp size={12} className="text-emerald-500" />
                        <span className="text-[13px] font-bold text-slate-700  tracking-widest leading-none">
                            {c.stats?.read || 452} / {c.stats?.sent || 1250} READ
                        </span>
                    </div>
                    <div className="w-32 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[45%]" />
                    </div>
                </div>
            )
        },
        { 
            key: "timeline", 
            label: "Execution",
            render: (c: any) => (
                <div className="flex flex-col gap-0.5 text-right">
                    <span className="text-xs font-bold text-slate-500  tracking-widest leading-none mb-1 flex items-center gap-1 justify-end">
                        <Clock size={10} /> {c.scheduled_at || 'IMMEDIATE'}
                    </span>
                    <span className="text-[13px] font-bold text-slate-700 tracking-tighter">
                        Protocol Alpha Node
                    </span>
                </div>
            )
        },
        { 
            key: "status", 
            label: "Status",
            render: (c: any) => <StatusBadge status={c.status || "running"} />
        },
        {
            key: "actions",
            label: "Control",
            render: () => (
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                        <Send size={14} />
                    </button>
                    <button className="h-8 w-8 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                        <BarChart3 size={14} />
                    </button>
                </div>
            )
        }
    ];

    if (view === "form") {
        return (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <ERPEntryForm
                    title={editingCampaign ? "Refine Broadcast Strategy" : "Initialize Campaign Node"}
                    subtitle="WhatsApp Bulk Messaging & Ad Follow-up"
                    headerFields={campaignFields}
                    onAbort={() => { setView("list"); setEditingCampaign(null); }}
                    onSave={handleSave}
                    initialData={editingCampaign}
                    showItems={false}
                />
            </div>
        );
    }

    return (
        <ERPListView
            title="Bulk messaging"
            data={campaigns || []}
            columns={campaignColumns}
            onNew={() => { setEditingCampaign(null); setView("form"); }}
            onRefresh={fetchItems}
            onRowClick={(c) => { setEditingCampaign(c); setView("form"); }}
            isLoading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            primaryKey="id"
            headerActions={
                <div className="flex items-center gap-2">
                    <button className="h-8 px-4 rounded-xl font-bold text-xs  tracking-widest bg-rose-600 text-white hover:bg-rose-700 transition-all flex items-center gap-2 shadow-lg shadow-rose-600/20">
                        <Flame className="w-3.5 h-3.5" /> High-Velocity Burst
                    </button>
                </div>
            }
        />
    );
}
