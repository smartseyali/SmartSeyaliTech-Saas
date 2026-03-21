import { useState } from "react";
import { 
    Book, FileSpreadsheet, Plus, 
    Search, Filter, RefreshCw, 
    ChevronRight, Calendar, Info,
    CheckCircle2, AlertCircle, Clock,
    ArrowRightLeft, Landmark, Receipt
} from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

export default function Journals() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingJournal, setEditingJournal] = useState<any>(null);
    
    // Fetch journals from core registry
    const { data: journals, loading, fetchItems, createItem, updateItem } = useCrud("journals");

    const journalFields = [
        { key: "reference_no", label: "Journal Entry No.", required: true, ph: "JV-2026-001..." },
        { key: "date", label: "Posting Date", type: "date" as const, required: true },
        { 
            key: "type", label: "Journal Type", type: "select" as const,
            options: [
                { label: "General", value: "general" },
                { label: "Sales", value: "sales" },
                { label: "Purchase", value: "purchase" },
                { label: "Cash / Bank", value: "cash" }
            ]
        },
        { key: "note", label: "Notes / Description", ph: "Outline the purpose of this entry..." }
    ];

    const journalItemFields = [
        { key: "account_id", label: "Account", type: "select" as const, options: [] }, // Will need COA fetch in real usage
        { key: "debit", label: "Debit Amount", type: "number" as const },
        { key: "credit", label: "Credit Amount", type: "number" as const },
        { key: "memo", label: "Line Details", ph: "Line item specific details..." }
    ];

    const handleSave = async (header: any, items: any[]) => {
        const payload = { ...header, items };
        if (editingJournal) {
            await updateItem(editingJournal.id, payload);
        } else {
            await createItem(payload);
        }
        setView("list");
        setEditingJournal(null);
    };

    const journalColumns = [
        { 
            key: "ref", 
            label: "Transaction",
            render: (j: any) => (
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                        <Book className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 uppercase italic tracking-tight">{j.reference_no}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest border-r pr-2 border-slate-200">
                                {j.type?.toUpperCase()} ENTRY
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                <Calendar size={10}/> {j.date}
                            </span>
                        </div>
                    </div>
                </div>
            )
        },
        { 
            key: "description", 
            label: "Narrative",
            render: (j: any) => (
                <p className="text-[11px] font-medium text-slate-500 max-w-xs truncate uppercase tracking-tight">
                    {j.note || "System Generated Protocol Entry"}
                </p>
            )
        },
        { 
            key: "magnitude", 
            label: "Transaction Volume",
            render: (j: any) => (
                <div className="flex flex-col text-right">
                    <span className="text-[13px] font-black text-slate-900 tracking-tighter">
                        ₹{(j.total_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Balanced Ledger</span>
                </div>
            )
        },
        { 
            key: "status", 
            label: "Data",
            render: (j: any) => <StatusBadge status={j.status || "posted"} />
        }
    ];

    if (view === "form") {
        return (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <ERPEntryForm
                    title={editingJournal ? "Edit Journal Entry" : "New Journal Entry"}
                    subtitle="Record Accounting Transactions"
                    headerFields={journalFields}
                    itemFields={journalItemFields}
                    onAbort={() => { setView("list"); setEditingJournal(null); }}
                    onSave={handleSave}
                    initialData={editingJournal}
                    itemTitle="Journal Entry Lines"
                />
            </div>
        );
    }

    return (
        <ERPListView
            title="Journal"
            data={journals || []}
            columns={journalColumns}
            onNew={() => { setEditingJournal(null); setView("form"); }}
            onRefresh={fetchItems}
            onRowClick={(j) => { setEditingJournal(j); setView("form"); }}
            isLoading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            primaryKey="id"
            headerActions={
                <div className="flex items-center gap-2">
                    <button className="h-8 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2">
                        <FileSpreadsheet className="w-3.5 h-3.5" /> Import Entries
                    </button>
                    <button className="h-8 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 transition-all flex items-center gap-2">
                        <ArrowRightLeft className="w-3.5 h-3.5" /> Reconciliation
                    </button>
                </div>
            }
        />
    );
}
