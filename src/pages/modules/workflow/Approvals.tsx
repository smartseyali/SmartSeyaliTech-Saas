import { useState } from "react";
import { 
    GitPullRequest, CheckCircle2, XCircle, 
    AlarmClock, ShieldCheck, Search, 
    Filter, RefreshCw, Layers, 
    UserCheck, FileCheck, ExternalLink,
    AlertCircle
} from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

export default function Approvals() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingApproval, setEditingApproval] = useState<any>(null);
    
    // Fetch approval requests from approval_requests table
    const { data: approvals, loading, fetchItems, updateItem } = useCrud("approval_requests");

    const approvalFields = [
        { key: "resource_type", label: "Type", required: true, ph: "sales_orders, purchase_orders...", disabled: true },
        { key: "resource_id", label: "Target ID", required: true, ph: "UUID...", disabled: true },
        { 
            key: "status", label: "Operational Decision", type: "select" as const,
            options: [
                { label: "Pending Review", value: "pending" },
                { label: "Authorized", value: "approved" },
                { label: "Rejected", value: "rejected" }
            ]
        },
        { key: "remarks", label: "Decision Rationale", ph: "Outline why this was approved/rejected..." }
    ];

    const handleSave = async (header: any) => {
        if (editingApproval) {
            await updateItem(editingApproval.id, header);
        }
        setView("list");
        setEditingApproval(null);
    };

    const approvalColumns = [
        { 
            key: "resource", 
            label: "Authorization",
            render: (app: any) => (
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-500 shadow-sm ${
                        app.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        app.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                        'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400  tracking-widest leading-none mb-1">
                            {app.resource_type?.replace(/_/g, ' ').toUpperCase() || "CORE PROTOCOL"}
                        </span>
                        <span className="font-bold text-gray-900   tracking-tight flex items-center gap-2">
                            {app.reference_no || `REQ-${app.id?.substring(0, 8).toUpperCase()}`}
                            <ExternalLink size={12} className="text-slate-300 pointer-events-none" />
                        </span>
                    </div>
                </div>
            )
        },
        { 
            key: "requester", 
            label: "Contact",
            render: (app: any) => (
                <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-slate-400" />
                    <span className="text-[11px] font-bold text-slate-600  tracking-widest leading-none">
                        {app.requester_name || "System Admin"}
                    </span>
                </div>
            )
        },
        { 
            key: "timeline", 
            label: "Governance Timeline",
            render: (app: any) => (
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400  tracking-widest leading-none mb-1 flex items-center gap-1">
                        <AlarmClock size={10} /> {app.created_at ? new Date(app.created_at).toLocaleDateString() : 'Active'}
                    </span>
                    <span className="text-[11px] font-bold text-slate-700 tracking-tighter">
                        {app.current_step_name || 'Protocol Finalization'}
                    </span>
                </div>
            )
        },
        { 
            key: "status", 
            label: "Decision",
            render: (app: any) => <StatusBadge status={app.status || "pending"} />
        }
    ];

    const filteredApprovals = (approvals || []).filter(app =>
        app.resource_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (view === "form") {
        return (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <ERPEntryForm
                    title="Governance Decision"
                    subtitle="Universal Workflow Approval"
                    headerFields={approvalFields}
                    onAbort={() => { setView("list"); setEditingApproval(null); }}
                    onSave={handleSave}
                    initialData={editingApproval}
                    showItems={false}
                />
            </div>
        );
    }

    return (
        <ERPListView
            title="Approval"
            data={filteredApprovals}
            columns={approvalColumns}
            onNew={null} // Usually created by system
            onRefresh={fetchItems}
            onRowClick={(app) => { setEditingApproval(app); setView("form"); }}
            isLoading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            primaryKey="id"
            headerActions={
                <div className="flex items-center gap-2">
                    <button className="h-8 px-4 rounded-xl font-bold text-[10px]  tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-all flex items-center gap-2 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Batch Authorization
                    </button>
                    <button className="h-8 px-4 rounded-xl font-bold text-[10px]  tracking-widest bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 transition-all flex items-center gap-2 shadow-sm">
                        <XCircle className="w-3.5 h-3.5" /> Batch Rejection
                    </button>
                </div>
            }
        />
    );
}
