import { useState, useEffect } from "react";
import { useCrud } from "@/hooks/useCrud";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";

export default function JournalEntries() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingItem, setEditingItem] = useState<any>(null);
    const [editingLines, setEditingLines] = useState<any[] | undefined>(undefined);
    const { activeCompany } = useTenant();

    const { data: items, loading, fetchItems, createItem, updateItem } = useCrud("finance_journal_entries");

    const headerFields = [
        { key: "reference", label: "Journal Reference", required: true, ph: "JV/2024/001" },
        { key: "date", label: "Entry Date", type: "date" as const, required: true },
        {
            key: "entry_type", label: "Journal Type", type: "select" as const, options: [
                { label: "Journal Entry", value: "journal" },
                { label: "Opening Balance", value: "opening" },
                { label: "Adjustment", value: "adjustment" },
                { label: "Closing Entry", value: "closing" },
            ], required: true
        },
        { key: "description", label: "Narration / Description", type: "text" as const },
        {
            key: "status", label: "Status", type: "select" as const, options: [
                { label: "Draft", value: "draft" },
                { label: "Posted", value: "posted" },
                { label: "Cancelled", value: "cancelled" },
            ]
        },
    ];

    const lineFields = [
        { key: "account_id", label: "Account / Ledger", type: "select" as const, lookupTable: 'chart_of_accounts', lookupLabel: 'account_name', lookupValue: 'id', required: true },
        { key: "description", label: "Line Description", type: "text" as const },
        { key: "debit", label: "Debit (Dr)", type: "number" as const },
        { key: "credit", label: "Credit (Cr)", type: "number" as const },
    ];

    const loadLines = async (journalId: string) => {
        const { data } = await supabase
            .from("finance_journal_lines")
            .select("*")
            .eq("journal_entry_id", journalId);
        return data || [];
    };

    const handleSave = async (header: any, lines: any[]) => {
        try {
            const totalDebit = lines.reduce((s, l) => s + Number(l.debit || 0), 0);
            const totalCredit = lines.reduce((s, l) => s + Number(l.credit || 0), 0);

            if (totalDebit !== totalCredit) {
                toast.error(`Journal is out of balance! Dr: ${totalDebit}, Cr: ${totalCredit}`);
                return;
            }

            const payload = {
                ...header,
                company_id: activeCompany?.id,
                total_debit: totalDebit,
                total_credit: totalCredit,
                status: header.status || "draft"
            };

            const { data: savedHeader, error: hError } = await supabase
                .from("finance_journal_entries")
                .upsert([payload])
                .select()
                .single();

            if (hError) throw hError;

            // Delete old lines if editing
            if (header.id) {
                await supabase.from("finance_journal_lines").delete().eq("journal_entry_id", header.id);
            }

            const journalLines = lines
                .filter(l => l.account_id)
                .map(l => ({
                    journal_entry_id: savedHeader.id,
                    account_id: l.account_id,
                    description: l.description,
                    debit: Number(l.debit || 0),
                    credit: Number(l.credit || 0),
                    amount: Number(l.debit || 0) || -Number(l.credit || 0)
                }));

            if (journalLines.length > 0) {
                const { error: iError } = await supabase.from("finance_journal_lines").insert(journalLines);
                if (iError) throw iError;
            }

            toast.success("Journal Entry saved");
            setView("list");
            setEditingItem(null);
            fetchItems();
        } catch (err: any) {
            toast.error(`Save failed: ${err.message}`);
        }
    };

    const columns = [
        {
            key: "reference", label: "Reference",
            render: (i: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-blue-700 font-mono text-xs">{i.reference || "—"}</span>
                    <span className="text-xs text-slate-400 font-medium mt-0.5">{i.date}</span>
                </div>
            )
        },
        {
            key: "description", label: "Description",
            render: (i: any) => <span className="text-slate-700 text-xs truncate max-w-[200px]">{i.description || "—"}</span>
        },
        { key: "entry_type", label: "Type", render: (i: any) => <span className="capitalize text-xs font-bold text-slate-600">{i.entry_type || "—"}</span> },
        {
            key: "total_debit", label: "Amount",
            render: (i: any) => (
                <div className="flex flex-col items-end">
                    <span className="font-extrabold text-slate-900 font-mono text-xs">₹{Number(i.total_debit || 0).toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Balanced</span>
                </div>
            )
        },
        {
            key: "status", label: "Status",
            render: (i: any) => <StatusBadge status={i.status || "draft"} />
        },
    ];

    if (view === "form") {
        return (
            <div className="p-4 bg-slate-50 min-h-screen">
                <ERPEntryForm
                    title={editingItem ? "Update Journal" : "New Journal Entry"}
                    subtitle="Double-Entry General Ledger"
                    headerFields={headerFields}
                    itemFields={lineFields}
                    itemTitle="Ledger Distributions"
                    onSave={handleSave}
                    onAbort={() => { setView("list"); setEditingItem(null); setEditingLines(undefined); }}
                    initialData={editingItem}
                    initialItems={editingLines}
                    showItems={true}
                />
            </div>
        );
    }

    return (
        <ERPListView
            title="Accounting Journals"
            data={(items || []).filter((i: any) =>
                (i.reference || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (i.description || "").toLowerCase().includes(searchTerm.toLowerCase())
            )}
            columns={columns}
            onNew={() => { setEditingItem(null); setEditingLines([{}]); setView("form"); }}
            onRefresh={fetchItems}
            onRowClick={async (i) => {
                setEditingItem(i);
                const lines = await loadLines(i.id);
                setEditingLines(lines.length > 0 ? lines : [{}]);
                setView("form");
            }}
            isLoading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            primaryKey="id"
        />
    );
}
