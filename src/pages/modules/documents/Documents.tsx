import { useState } from "react";
import { 
    FileText, Folder, HardDrive, 
    Share2, History, Search, 
    Plus, Filter, RefreshCw, 
    FileUp, MoreVertical, LayoutGrid,
    ShieldCheck, Eye, Download, Trash2,
    FileCode, FileImage, FileBox
} from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

export default function Documents() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingDoc, setEditingDoc] = useState<any>(null);
    
    // Fetch documents from enterprise registry
    const { data: documents, loading, fetchItems, createItem, updateItem } = useCrud("documents");

    const documentFields = [
        { key: "name", label: "Registry File Identity", required: true, ph: "Technical_Blueprint_V1.pdf" },
        { 
            key: "type", label: "Content Classification", type: "select" as const,
            options: [
                { label: "Standard PDF Archive", value: "pdf" },
                { label: "Spreadsheet Ledger", value: "excel" },
                { label: "Corporate Image Node", value: "image" },
                { label: "Internal Narrative", value: "text" }
            ]
        },
        { 
            key: "folder_id", label: "Structural Hub / Folder", type: "select" as const,
            options: [
                { label: "Financial Ledgers", value: "1" },
                { label: "Legal Blueprints", value: "2" },
                { label: "Operational Assets", value: "3" }
            ]
        },
        { key: "description", label: "Document Narrative", ph: "Detailed description of content..." }
    ];

    const handleSave = async (header: any) => {
        if (editingDoc) {
            await updateItem(editingDoc.id, header);
        } else {
            await createItem(header);
        }
        setView("list");
        setEditingDoc(null);
    };

    const getIcon = (type: string) => {
        switch(type?.toLowerCase()) {
            case 'pdf': return <FileText className="w-5 h-5 text-rose-500" />;
            case 'excel': return <FileCode className="w-5 h-5 text-emerald-500" />;
            case 'image': return <FileImage className="w-5 h-5 text-blue-500" />;
            default: return <FileBox className="w-5 h-5 text-slate-400" />;
        }
    };

    const docColumns = [
        { 
            key: "name", 
            label: "File Entity Identity",
            render: (doc: any) => (
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                        {getIcon(doc.type)}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 uppercase italic tracking-tight">{doc.name}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none border-r pr-2 border-slate-200">
                                {doc.version || "V1.0"}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">
                                {doc.size_kb || "1.2"} MB
                            </span>
                        </div>
                    </div>
                </div>
            )
        },
        { 
            key: "location", 
            label: "Structural Hub",
            render: (doc: any) => (
                <div className="flex items-center gap-2">
                    <Folder className="w-3.5 h-3.5 text-amber-500 fill-amber-500/10" />
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest leading-none">
                        {doc.folder_name || "Enterprise Root"}
                    </span>
                </div>
            )
        },
        { 
            key: "governance", 
            label: "Authorization state",
            render: (doc: any) => (
                <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <ShieldCheck size={12} className="text-emerald-500"/> {doc.owner_name || 'System Admin'}
                    </span>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-0.5 font-mono">
                         {doc.updated_at ? new Date(doc.updated_at).toLocaleDateString() : '2026-03-12'}
                    </span>
                </div>
            )
        },
        { 
            key: "status", 
            label: "Registry State",
            render: (doc: any) => <StatusBadge status={doc.status || "final"} />
        },
        {
            key: "actions",
            label: "Node control",
            render: () => (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-all"><Eye size={14}/></button>
                    <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-emerald-600 transition-all"><Download size={14}/></button>
                    <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-rose-600 transition-all"><Trash2 size={14}/></button>
                </div>
            )
        }
    ];

    const filteredDocs = (documents || []).filter(doc =>
        doc.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (view === "form") {
        return (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <ERPEntryForm
                    title={editingDoc ? "Refine Content identity" : "Initialize Document Entry"}
                    subtitle="Enterprise Resource Governance Protocol"
                    headerFields={documentFields}
                    onAbort={() => { setView("list"); setEditingDoc(null); }}
                    onSave={handleSave}
                    initialData={editingDoc}
                    showItems={false}
                />
            </div>
        );
    }

    return (
        <ERPListView
            title="Enterprise Document Hub"
            data={filteredDocs}
            columns={docColumns}
            onNew={() => { setEditingDoc(null); setView("form"); }}
            onRefresh={fetchItems}
            onRowClick={(doc) => { setEditingDoc(doc); setView("form"); }}
            isLoading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            primaryKey="id"
            headerActions={
                <div className="flex items-center gap-2">
                    <button className="h-8 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest bg-slate-900 text-white hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-900/10">
                        <FileUp className="w-3.5 h-3.5" /> Bulk Protocol Upload
                    </button>
                </div>
            }
        />
    );
}
