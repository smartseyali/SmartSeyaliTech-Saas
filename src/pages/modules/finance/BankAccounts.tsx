import { useState } from "react";
import { useCrud } from "@/hooks/useCrud";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";
import { toast } from "sonner";
import { Landmark, TrendingUp, TrendingDown } from "lucide-react";

export default function BankAccounts() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingItem, setEditingItem] = useState<any>(null);

    const { data: items, loading, fetchItems, createItem, updateItem } = useCrud("finance_bank_accounts");

    const fields = [
        { key: "account_name", label: "Account Name", required: true },
        { key: "bank_name", label: "Bank Name", required: true },
        { key: "account_number", label: "Account Number", required: true },
        { key: "ifsc_code", label: "IFSC / Swift Code" },
        { key: "branch", label: "Branch Name" },
        {
            key: "account_type", label: "Account Type", type: "select" as const, options: [
                { label: "Current Account", value: "current" },
                { label: "Savings Account", value: "savings" },
                { label: "Overdraft Account", value: "overdraft" },
                { label: "Cash Credit", value: "cc" },
            ], required: true
        },
        { key: "opening_balance", label: "Opening Balance (₹)", type: "number" as const },
        { key: "current_balance", label: "Current Balance (₹)", type: "number" as const },
        {
            key: "currency", label: "Currency", type: "select" as const, options: [
                { label: "INR — Indian Rupee", value: "INR" },
                { label: "USD — US Dollar", value: "USD" },
                { label: "EUR — Euro", value: "EUR" },
            ]
        },
        {
            key: "status", label: "Status", type: "select" as const, options: [
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
                { label: "Frozen", value: "frozen" },
            ]
        },
    ];

    const handleSave = async (data: any) => {
        if (editingItem) {
            await updateItem(editingItem.id, data);
            toast.success("Bank account updated");
        } else {
            await createItem({ ...data, status: "active" });
            toast.success("Bank account added");
        }
        setView("list");
        setEditingItem(null);
    };

    const columns = [
        {
            key: "account_name", label: "Account",
            render: (i: any) => (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                        <Landmark className="w-4 h-4 text-blue-700" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-xs leading-none">{i.account_name || "—"}</span>
                        <span className="text-xs text-slate-400 font-medium mt-0.5">{i.bank_name} · {i.branch}</span>
                    </div>
                </div>
            )
        },
        { key: "account_number", label: "Account No", render: (i: any) => <span className="font-mono text-xs text-slate-600 font-bold">{i.account_number || "—"}</span> },
        { key: "account_type", label: "Type", render: (i: any) => <span className="capitalize text-xs font-bold text-slate-700">{i.account_type || "—"}</span> },
        { key: "ifsc_code", label: "IFSC", render: (i: any) => <span className="font-mono text-xs text-slate-500">{i.ifsc_code || "—"}</span> },
        {
            key: "current_balance", label: "Balance",
            render: (i: any) => (
                <div className="flex items-center gap-1.5">
                    {(i.current_balance || 0) >= 0 ? <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> : <TrendingDown className="w-3.5 h-3.5 text-red-500" />}
                    <span className={`font-extrabold font-mono text-xs ${(i.current_balance || 0) >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                        ₹{Number(i.current_balance || 0).toLocaleString()}
                    </span>
                </div>
            )
        },
        { key: "status", label: "Status", render: (i: any) => <StatusBadge status={i.status || "active"} /> },
    ];

    const filteredItems = (items || []).filter((i: any) =>
        (i.account_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (i.bank_name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (view === "form") {
        return (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <ERPEntryForm
                    title={editingItem ? "Edit Bank Account" : "Add Bank Account"}
                    subtitle="Link and manage financial accounts"
                    headerFields={fields}
                    onAbort={() => { setView("list"); setEditingItem(null); }}
                    onSave={handleSave}
                    initialData={editingItem}
                />
            </div>
        );
    }

    return (
        <ERPListView
            title="Bank Accounts"
            data={filteredItems}
            columns={columns}
            onNew={() => { setEditingItem(null); setView("form"); }}
            onRefresh={fetchItems}
            onRowClick={(i) => { setEditingItem(i); setView("form"); }}
            isLoading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
        />
    );
}
