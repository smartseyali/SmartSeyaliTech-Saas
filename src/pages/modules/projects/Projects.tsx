import { useState } from "react";
import { 
    Briefcase, Calendar, CheckSquare, 
    Clock, Plus, Search, Filter, 
    RefreshCw, Layers, Users, BarChart3,
    Construction, Milestone
} from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

export default function Projects() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingProject, setEditingProject] = useState<any>(null);
    
    // Fetch projects from ultimate schema
    const { data: projects, loading, fetchItems, createItem, updateItem } = useCrud("projects");

    const projectFields = [
        { key: "name", label: "Project", required: true, ph: "Enterprise Implementation..." },
        { key: "code", label: "Structural Code", ph: "PRJ-2026-X" },
        { key: "start_date", label: "Mobilization Date", type: "date" as const },
        { key: "end_date", label: "Delivery Deadline", type: "date" as const },
        { 
            key: "status", label: "Status", type: "select" as const,
            options: [
                { label: "Active Pipeline", value: "active" },
                { label: "On Hold", value: "hold" },
                { label: "Completed", value: "completed" },
                { label: "Cancelled", value: "cancelled" }
            ]
        },
        { key: "description", label: "Project Narrative & Objectives", ph: "Outline the scope of work..." }
    ];

    const handleSave = async (header: any) => {
        if (editingProject) {
            await updateItem(editingProject.id, header);
        } else {
            await createItem(header);
        }
        setView("list");
        setEditingProject(null);
    };

    const projectColumns = [
        { 
            key: "name", 
            label: "Project",
            render: (p: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 border border-violet-100 group-hover:bg-violet-900 group-hover:text-white transition-all duration-500 shadow-sm">
                        <Construction className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 uppercase italic tracking-tight">{p.name}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">{p.code || "PRJ-IDENTITY-UNSET"}</span>
                    </div>
                </div>
            )
        },
        { 
            key: "timeline", 
            label: "Delivery Schedule",
            render: (p: any) => (
                <div className="flex flex-col">
                    <span className="text-[11px] font-black text-slate-700 uppercase tracking-tighter flex items-center gap-2">
                        <Calendar size={12} className="text-slate-300"/> {p.start_date || 'TBD'} → {p.end_date || 'TBD'}
                    </span>
                    <div className="w-24 h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-violet-500 w-[65%]" />
                    </div>
                </div>
            )
        },
        { 
            key: "milestones", 
            label: "Critical Nodes",
            render: () => (
                <div className="flex items-center gap-2">
                    <Milestone size={14} className="text-amber-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">4 / 12 Nodes</span>
                </div>
            )
        },
        { 
            key: "status", 
            label: "Process",
            render: (p: any) => <StatusBadge status={p.status || "active"} />
        }
    ];

    const filteredProjects = (projects || []).filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (view === "form") {
        return (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <ERPEntryForm
                    title={editingProject ? "Refine Project Matrix" : "Initialize Project Entity"}
                    subtitle="Enterprise Resource Allocation"
                    headerFields={projectFields}
                    onAbort={() => { setView("list"); setEditingProject(null); }}
                    onSave={handleSave}
                    initialData={editingProject}
                    showItems={false}
                />
            </div>
        );
    }

    return (
        <ERPListView
            title="Project Portfolio"
            data={filteredProjects}
            columns={projectColumns}
            onNew={() => { setEditingProject(null); setView("form"); }}
            onRefresh={fetchItems}
            onRowClick={(p) => { setEditingProject(p); setView("form"); }}
            isLoading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            primaryKey="id"
            headerActions={
                <div className="flex items-center gap-2">
                    <button className="h-8 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest bg-violet-50 text-violet-600 border border-violet-100 hover:bg-violet-100 transition-all flex items-center gap-2 shadow-sm">
                        <BarChart3 className="w-3.5 h-3.5" /> Gantt Timeline
                    </button>
                </div>
            }
        />
    );
}
