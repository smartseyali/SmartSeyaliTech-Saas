import { useState } from "react";
import { MessageSquare, Send, Inbox, CheckCheck, Clock, Search, RefreshCw, Filter, Phone, Trash2 } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";

export default function Logs() {
    const [searchTerm, setSearchTerm] = useState("");
    const { data: logs, loading, fetchItems, deleteItem } = useCrud("wa_logs", "*, contacts(name)");

    const logColumns = [
        { 
            key: "created_at", 
            label: "Time Synchronized",
            render: (log: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900 tracking-tight italic uppercase">
                        {new Date(log.created_at).toLocaleTimeString()}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">
                        {new Date(log.created_at).toLocaleDateString()}
                    </span>
                </div>
            )
        },
        { 
            key: "contact", 
            label: "Target Subscriber",
            render: (log: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-800 uppercase italic tracking-tight">
                        {log.contacts?.name || "Anonymous Node"}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        Channel Integrated
                    </span>
                </div>
            )
        },
        { 
            key: "direction", 
            label: "Direction",
            render: (log: any) => (
                <div className="flex items-center gap-2">
                    {log.direction === 'outbound' ? (
                        <Send className="w-3 h-3 text-blue-500" />
                    ) : (
                        <Inbox className="w-3 h-3 text-emerald-500" />
                    )}
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">
                        {log.direction}
                    </span>
                </div>
            )
        },
        { 
            key: "message", 
            label: "Data Payload",
            render: (log: any) => (
                <div className="max-w-sm truncate text-slate-500 font-medium italic text-[11px] leading-relaxed">
                    "{log.message}"
                </div>
            )
        },
        { 
            key: "status", 
            label: "Status",
            render: (log: any) => <StatusBadge status={log.status} />
        }
    ];

    const filteredLogs = (logs || []).filter(log => 
        log.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.contacts?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const headerActions = (
        <div className="flex items-center gap-2">
            <button className="h-8 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest bg-slate-900 text-white hover:bg-black transition-all flex items-center gap-2 shadow-lg shadow-slate-200">
                <MessageSquare className="w-3.5 h-3.5" /> Direct Broadcast
            </button>
        </div>
    );

    return (
        <ERPListView
            title="Communication"
            data={filteredLogs}
            columns={logColumns}
            onNew={() => {}} // Could be a broadast dialog
            onRefresh={fetchItems}
            isLoading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            primaryKey="id"
            headerActions={headerActions}
        />
    );
}
