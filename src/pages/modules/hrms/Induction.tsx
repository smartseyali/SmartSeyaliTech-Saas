import { useState } from "react";
import { 
    Zap, ClipboardCheck, UserPlus, 
    Rocket, Search, Filter, 
    RefreshCw, CheckCircle2, 
    Clock, AlertCircle, ShieldCheck,
    Briefcase, Building2, UserCircle
} from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

export default function EmployeeInduction() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingInduction, setEditingInduction] = useState<any>(null);
    
    // Fetch inductions from hrms_employee_induction registry
    const { data: inductions, loading, fetchItems, createItem, updateItem } = useCrud("hrms_employee_induction");

    const inductionFields = [
        { 
            key: "employee_id", label: "Inductee", type: "select" as const, 
            required: true, options: [] // In real usage, fetch active employees
        },
        { 
            key: "protocol_id", label: "Execution", type: "select" as const,
            required: true, options: [
                { label: "Executive Leadership Induction", value: "1" },
                { label: "Engineering Sector Onboarding", value: "2" },
                { label: "Standard Operational", value: "3" }
            ]
        },
        { 
            key: "status", label: "Data", type: "select" as const,
            options: [
                { label: "Initialization", value: "pending" },
                { label: "In-Progress", value: "in_progress" },
                { label: "Finalized", value: "completed" }
            ]
        },
        { key: "completion_date", label: "Expected Finalization", type: "date" as const }
    ];

    const handleSave = async (header: any) => {
        if (editingInduction) {
            await updateItem(editingInduction.id, header);
        } else {
            await createItem(header);
        }
        setView("list");
        setEditingInduction(null);
    };

    const inductionColumns = [
        { 
            key: "inductee", 
            label: "Resource",
            render: (inc: any) => (
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg shadow-slate-900/20 group-hover:bg-indigo-600 transition-all duration-500">
                        <UserCircle className="w-7 h-7 opacity-80" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 uppercase italic tracking-tight">{inc.employee_name || 'System Resource Node'}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-indigo-600 font-black uppercase tracking-widest leading-none bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                                {inc.protocol_name || "CORE INDUCTION"}
                            </span>
                        </div>
                    </div>
                </div>
            )
        },
        { 
            key: "progress", 
            label: "Completion",
            render: (inc: any) => (
                <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-1.5 w-32">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Task Nodes</span>
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{inc.completed_tasks || 2} / {inc.total_tasks || 8}</span>
                    </div>
                    <div className="w-32 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[25%]" />
                    </div>
                </div>
            )
        },
        { 
            key: "timeline", 
            label: "Mobilization",
            render: (inc: any) => (
                <div className="flex items-center gap-2">
                    <Clock size={14} className="text-slate-300" />
                    <span className="text-[11px] font-black text-slate-700 uppercase tracking-tighter">
                         Deadline: {inc.completion_date || '2026-03-25'}
                    </span>
                </div>
            )
        },
        { 
            key: "status", 
            label: "Status",
            render: (inc: any) => <StatusBadge status={inc.status || "pending"} />
        }
    ];

    if (view === "form") {
        return (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <ERPEntryForm
                    title={editingInduction ? "Refine Resource Induction" : "Initialize Mobilization protocol"}
                    subtitle="Universal Human Capital Induction"
                    headerFields={inductionFields}
                    onAbort={() => { setView("list"); setEditingInduction(null); }}
                    onSave={handleSave}
                    initialData={editingInduction}
                    showItems={false}
                />
            </div>
        );
    }

    return (
        <ERPListView
            title="Induction"
            data={inductions || []}
            columns={inductionColumns}
            onNew={() => { setEditingInduction(null); setView("form"); }}
            onRefresh={fetchItems}
            onRowClick={(inc) => { setEditingInduction(inc); setView("form"); }}
            isLoading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            primaryKey="id"
            headerActions={
                <div className="flex items-center gap-2">
                    <button className="h-8 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-all shadow-sm flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5" /> Rapid Induction Sequence
                    </button>
                </div>
            }
        />
    );
}
