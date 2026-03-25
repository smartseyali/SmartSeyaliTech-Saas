import { useState } from "react";
import { Headphones, LifeBuoy, Plus, User, Search, Filter, RefreshCw, X, Save, Tag } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

export default function Tickets() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingTicket, setEditingTicket] = useState<any>(null);
    
    const { data: tickets, loading, fetchItems, createItem, updateItem } = useCrud("helpdesk_tickets");

    const ticketHeaderFields = [
        { key: "subject", label: "Subject", required: true, ph: "Payment Gateway Integration Error..." },
        { 
            key: "priority", label: "Operational Priority", type: "select" as const,
            options: [
                { label: "Low Impact", value: "low" },
                { label: "Medium Flow", value: "medium" },
                { label: "High Criticality", value: "high" },
                { label: "Critical", value: "critical" }
            ]
        },
        { 
            key: "status", label: "Support", type: "select" as const,
            options: [
                { label: "Open Discovery", value: "open" },
                { label: "In-Progress", value: "in-progress" },
                { label: "Closed", value: "closed" }
            ]
        },
        { key: "message", label: "Narrative", ph: "Detailed inquiry description..." }
    ];

    const handleSave = async (header: any) => {
        if (editingTicket) {
            await updateItem(editingTicket.id, header);
        } else {
            await createItem(header);
        }
        setView("list");
        setEditingTicket(null);
    };

    const ticketColumns = [
        { 
            key: "subject", 
            label: "Ticket",
            render: (t: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600 border border-cyan-100">
                        <Tag className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 tracking-tight  ">{t.subject}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-gray-400 font-bold  tracking-widest leading-none border-r pr-2 border-gray-200">
                                {t.id?.slice(0,8).toUpperCase()}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold  tracking-widest leading-none">
                                {new Date(t.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
            )
        },
        { 
            key: "priority", 
            label: "Priority",
            render: (t: any) => (
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold  tracking-widest border ${
                    t.priority === 'critical' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                    t.priority === 'high' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                    'bg-slate-50 text-slate-500 border-slate-100'
                }`}>
                    {t.priority || "Medium"}
                </span>
            )
        },
        { 
            key: "status", 
            label: "Ledger",
            render: (t: any) => <StatusBadge status={t.status || "Open"} />
        }
    ];

    const filteredTickets = (tickets || []).filter(t => 
        t.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (view === "form") {
        return (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <ERPEntryForm
                    title={editingTicket ? "Refine Support Data" : "Initialize Ticket Matrix"}
                    subtitle="Customer Service"
                    headerFields={ticketHeaderFields}
                    onAbort={() => { setView("list"); setEditingTicket(null); }}
                    onSave={handleSave}
                    initialData={editingTicket}
                    showItems={false}
                />
            </div>
        );
    }

    return (
        <ERPListView
            title="Support"
            data={filteredTickets}
            columns={ticketColumns}
            onNew={() => { setEditingTicket(null); setView("form"); }}
            onRefresh={fetchItems}
            onRowClick={(t) => { setEditingTicket(t); setView("form"); }}
            isLoading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            primaryKey="id"
            headerActions={
                <div className="flex items-center gap-2">
                    <button className="h-8 px-4 rounded-xl font-bold text-[10px]  tracking-widest bg-cyan-50 text-cyan-600 border border-cyan-100 hover:bg-cyan-100 transition-all flex items-center gap-2">
                        <LifeBuoy className="w-3.5 h-3.5" /> help center
                    </button>
                </div>
            }
        />
    );
}
