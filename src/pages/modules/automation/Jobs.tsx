import { useState } from "react";
import { 
    Zap, Play, Square, 
    RefreshCcw, Clock, Search, 
    Plus, Filter, RefreshCw, 
    Binary, Activity, Settings,
    Cpu, Globe, Cloud, Terminal,
    Database, AlertCircle, CheckCircle2
} from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

export default function Jobs() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingJob, setEditingJob] = useState<any>(null);
    
    // Fetch background jobs from enterprise registry
    const { data: jobs, loading, fetchItems, createItem, updateItem } = useCrud("jobs");

    const jobFields = [
        { key: "name", label: "Job", required: true, ph: "Sync_Odoo_Partners_Cron" },
        { 
            key: "type", label: "Execution Category", type: "select" as const,
            options: [
                { label: "Data Synchronous", value: "sync" },
                { label: "Report Generation Cycle", value: "report" },
                { label: "Internal Cleanup", value: "cleanup" },
                { label: "Email / SMS Broadcast", value: "broadcast" }
            ]
        },
        { key: "schedule", label: "Cron Frequency Pattern", ph: "0 0 * * * (Daily Midnight)" },
        { 
            key: "status", label: "Status", type: "select" as const,
            options: [
                { label: "Active Scheduler", value: "active" },
                { label: "Paused", value: "paused" },
                { label: "Failed Execution", value: "failed" }
            ]
        },
        { key: "description", label: "Job Narrative", ph: "Outline the objective of this automation..." }
    ];

    const handleSave = async (header: any) => {
        if (editingJob) {
            await updateItem(editingJob.id, header);
        } else {
            await createItem(header);
        }
        setView("list");
        setEditingJob(null);
    };

    const jobColumns = [
        { 
            key: "name", 
            label: "Automation / Execution",
            render: (job: any) => (
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-slate-900 transition-all duration-500 ${
                        job.status === 'active' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                        job.status === 'failed' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                        'bg-slate-50 text-slate-400 border border-slate-100'
                    }`}>
                        <Binary className="w-6 h-6 group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 uppercase italic tracking-tight">{job.name}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none border-r pr-2 border-slate-200">
                                {job.type?.toUpperCase() || "CORE JOB"}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none flex items-center gap-1">
                                <Clock size={10} /> {job.schedule || 'On-Demand'}
                            </span>
                        </div>
                    </div>
                </div>
            )
        },
        { 
            key: "metrics", 
            label: "Performance Metrics",
            render: (job: any) => (
                <div className="flex flex-col">
                    <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest leading-none flex items-center gap-2 mb-1.5">
                        <Zap size={12} className="text-amber-500 animate-pulse"/> {job.last_duration_ms || '452'}ms
                    </span>
                    <div className="flex items-center gap-2">
                        <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 w-[85%]" />
                        </div>
                        <span className="text-[9px] font-black text-slate-400 uppercase">98% Avg</span>
                    </div>
                </div>
            )
        },
        { 
            key: "governance", 
            label: "Last Execution",
            render: (job: any) => (
                <div className="flex flex-col gap-0.5">
                    <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                        job.last_status === 'error' ? 'text-rose-600' : 'text-emerald-600'
                    }`}>
                        {job.last_status === 'error' ? <AlertCircle size={12}/> : <CheckCircle2 size={12}/>} 
                        {job.last_run_at ? new Date(job.last_run_at).toLocaleTimeString() : 'TBD'}
                    </span>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-none mt-1">
                         Node Index 04x-BR
                    </span>
                </div>
            )
        },
        { 
            key: "status", 
            label: "Status",
            render: (job: any) => <StatusBadge status={job.status || "active"} />
        },
        {
            key: "actions",
            label: "Control",
            render: () => (
                <div className="flex items-center gap-2">
                    <button className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                        <Play size={12} />
                    </button>
                    <button className="h-7 w-7 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                        <Settings size={12} />
                    </button>
                </div>
            )
        }
    ];

    const filteredJobs = (jobs || []).filter(job =>
        job.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (view === "form") {
        return (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <ERPEntryForm
                    title={editingJob ? "Refine Automation Identity" : "Initialize Job Protocol"}
                    subtitle="Background Cycle Orchestration"
                    headerFields={jobFields}
                    onAbort={() => { setView("list"); setEditingJob(null); }}
                    onSave={handleSave}
                    initialData={editingJob}
                    showItems={false}
                />
            </div>
        );
    }

    return (
        <ERPListView
            title="Automation Cycle"
            data={filteredJobs}
            columns={jobColumns}
            onNew={() => { setEditingJob(null); setView("form"); }}
            onRefresh={fetchItems}
            onRowClick={(job) => { setEditingJob(job); setView("form"); }}
            isLoading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            primaryKey="id"
            headerActions={
                <div className="flex items-center gap-2">
                    <button className="h-8 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest bg-indigo-600 text-white hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20 underline-offset-4 decoration-2">
                        <Cpu className="w-3.5 h-3.5" /> Force Engine Cycle
                    </button>
                </div>
            }
        />
    );
}
