import { useState } from "react";
import { 
    Users, Target, Phone, 
    Mail, Calendar, TrendingUp, 
    Search, Plus, Filter, 
    RefreshCw, UserPlus, 
    MessageSquare, Briefcase,
    Zap, Star, Clock, MapPin
} from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

export default function CRMLeads() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingLead, setEditingLead] = useState<any>(null);
    
    // Fetch leads from crm_leads table
    const { data: leads, loading, fetchItems, createItem, updateItem } = useCrud("crm_leads");

    const leadFields = [
        { key: "full_name", label: "Registry Lead Name", required: true, ph: "Prospective Client..." },
        { 
            key: "status", label: "Pipeline Stage", type: "select" as const,
            options: [
                { label: "New Inquiry", value: "new" },
                { label: "Contacted Protocol", value: "contacted" },
                { label: "Qualified Opportunity", value: "qualified" },
                { label: "Closed / Won", value: "won" },
                { label: "Lost Node", value: "lost" }
            ]
        },
        { key: "email", label: "Communication Hub (Email)", ph: "lead@example.com" },
        { key: "phone", label: "Contact Channel (Phone)", ph: "+91..." },
        { key: "company_name", label: "Corporate Entity Identity", ph: "Lead Organization..." },
        { 
            key: "priority", label: "Lead Temperature", type: "select" as const,
            options: [
                { label: "High Velocity (Hot)", value: "3" },
                { label: "Medium Priority (Warm)", value: "2" },
                { label: "Low Priority (Cold)", value: "1" }
            ]
        }
    ];

    const handleSave = async (header: any) => {
        if (editingLead) {
            await updateItem(editingLead.id, header);
        } else {
            await createItem(header);
        }
        setView("list");
        setEditingLead(null);
    };

    const leadColumns = [
        { 
            key: "name", 
            label: "Lead Identity / Entity",
            render: (lead: any) => (
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-400 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 shadow-sm relative">
                        <UserPlus className="w-6 h-6" />
                        <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                            lead.priority === '3' ? 'bg-rose-500' : lead.priority === '2' ? 'bg-amber-500' : 'bg-slate-400'
                        }`} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 uppercase italic tracking-tight">{lead.full_name || "Lead Node"}</span>
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">{lead.company_name || "Independent Actor"}</span>
                    </div>
                </div>
            )
        },
        { 
            key: "contact", 
            label: "Communication Hub",
            render: (lead: any) => (
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 group-hover:text-slate-900 transition-colors">
                        <Mail size={12}/> {lead.email || 'N/A'}
                    </span>
                    <span className="text-[11px] font-black text-slate-700 tracking-tighter">
                        {lead.phone || '+91 0000 0000'}
                    </span>
                </div>
            )
        },
        { 
            key: "pipeline", 
            label: "Pipeline Velocity",
            render: (lead: any) => (
                <div className="flex flex-col">
                    <div className="flex items-center gap-3 mb-1.5">
                        <TrendingUp size={12} className="text-emerald-500" />
                        <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest leading-none">
                            {lead.status?.toUpperCase() || "NEW PROTOCOL"}
                        </span>
                    </div>
                    <div className="w-32 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-1000 ${
                            lead.status === 'won' ? 'bg-emerald-500 w-full' :
                            lead.status === 'qualified' ? 'bg-indigo-500 w-[60%]' : 'bg-amber-500 w-[20%]'
                        }`} />
                    </div>
                </div>
            )
        },
        { 
            key: "status", 
            label: "Registry State",
            render: (lead: any) => <StatusBadge status={lead.status || "new"} />
        }
    ];

    const filteredLeads = (leads || []).filter(lead =>
        (lead.full_name || lead.name)?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (view === "form") {
        return (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <ERPEntryForm
                    title={editingLead ? "Refine Lead Strategy" : "Initialize Lead Protocol"}
                    subtitle="Universal Customer acquisition Matrix"
                    headerFields={leadFields}
                    onAbort={() => { setView("list"); setEditingLead(null); }}
                    onSave={handleSave}
                    initialData={editingLead}
                    showItems={false}
                />
            </div>
        );
    }

    return (
        <ERPListView
            title="Revenue pipeline Registry"
            data={filteredLeads}
            columns={leadColumns}
            onNew={() => { setEditingLead(null); setView("form"); }}
            onRefresh={fetchItems}
            onRowClick={(lead) => { setEditingLead(lead); setView("form"); }}
            isLoading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            primaryKey="id"
            headerActions={
                <div className="flex items-center gap-2">
                    <button className="h-8 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-all flex items-center gap-2 shadow-sm">
                        <Star className="w-3.5 h-3.5 fill-emerald-600" /> Top Rated Nodes
                    </button>
                </div>
            }
        />
    );
}
