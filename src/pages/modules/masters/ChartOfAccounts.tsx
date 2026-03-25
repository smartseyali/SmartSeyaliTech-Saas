import { useState } from "react";
import { 
    CreditCard, BookOpen, Landmark, 
    ArrowUpRight, ArrowDownLeft, Search, 
    Filter, Plus, RefreshCw, Layers, 
    ShieldCheck, BarChart3, PieChart
} from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

export default function ChartOfAccounts() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingAccount, setEditingAccount] = useState<any>(null);
    
    // Fetch accounts from accounts_chart table
    const { data: accounts, loading, fetchItems, createItem, updateItem } = useCrud("accounts_chart");

    const accountFields = [
        { key: "code", label: "Account Code", required: true, ph: "1000-001" },
        { key: "name", label: "Account Name", required: true, ph: "e.g. Cash, Sales..." },
        { 
            key: "type", label: "Account Type", type: "select" as const,
            options: [
                { label: "Asset", value: "asset" },
                { label: "Liability", value: "liability" },
                { label: "Equity", value: "equity" },
                { label: "Income", value: "income" },
                { label: "Expense", value: "expense" }
            ]
        },
        { key: "parent_id", label: "Parent Account", type: "select" as const, options: [{ value: 'none', label: 'None' }] },
        { 
            key: "is_group", label: "Ledger Type", type: "select" as const,
            options: [
                { label: "Group", value: "true" },
                { label: "Ledger (Transactable)", value: "false" }
            ]
        },
        { key: "description", label: "Description", ph: "Enter account description..." }
    ];

    const handleSave = async (header: any) => {
        const payload = { ...header, is_group: header.is_group === "true" };
        if (editingAccount) {
            await updateItem(editingAccount.id, payload);
        } else {
            await createItem(payload);
        }
        setView("list");
        setEditingAccount(null);
    };

    const fmt = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

    const accountColumns = [
        { 
            key: "code", 
            label: "Account",
            render: (acc: any) => (
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-500 shadow-sm ${
                        acc.is_group ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-500 border-slate-100 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900'
                    }`}>
                        {acc.is_group ? <BookOpen className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-500 tracking-widest leading-none mb-1">
                            {acc.code || "LEDGER-XXX"}
                        </span>
                        <span className="font-bold text-gray-900 tracking-tight">{acc.name}</span>
                    </div>
                </div>
            )
        },
        { 
            key: "type", 
            label: "Type",
            render: (acc: any) => (
                <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                        acc.type === 'asset' ? 'bg-emerald-500' :
                        acc.type === 'liability' ? 'bg-amber-500' :
                        acc.type === 'equity' ? 'bg-indigo-500' :
                        acc.type === 'income' ? 'bg-blue-500' : 'bg-rose-500'
                    }`} />
                    <span className="text-[13px] font-bold text-slate-600 tracking-widest capitalize">{acc.type || "UNSET"}</span>
                </div>
            )
        },
        { 
            key: "balance", 
            label: "Balance",
            render: (acc: any) => (
                <span className={`font-bold tracking-tighter ${
                    (acc.balance || 0) < 0 ? "text-rose-600" : "text-emerald-600"
                }`}>
                    {fmt(acc.balance || 0)}
                </span>
            )
        },
        { 
            key: "status", 
            label: "Status",
            render: (acc: any) => <StatusBadge status={acc.is_group ? "Group" : "Active Ledger"} />
        }
    ];

    const filteredAccounts = (accounts || []).filter(acc =>
        acc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (view === "form") {
        return (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <ERPEntryForm
                    title={editingAccount ? "Edit Account" : "New Account"}
                    subtitle="Manage your financial accounts and ledger structure"
                    headerFields={accountFields}
                    onAbort={() => { setView("list"); setEditingAccount(null); }}
                    onSave={handleSave}
                    initialData={editingAccount}
                    showItems={false}
                />
            </div>
        );
    }

    return (
        <ERPListView
            title="Chart of Accounts"
            data={filteredAccounts}
            columns={accountColumns}
            onNew={() => { setEditingAccount(null); setView("form"); }}
            onRefresh={fetchItems}
            onRowClick={(acc) => { setEditingAccount(acc); setView("form"); }}
            isLoading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            primaryKey="id"
            headerActions={
                <div className="flex items-center gap-2">
                    <button className="h-8 px-4 rounded-xl font-bold text-xs tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-all flex items-center gap-2 shadow-sm">
                        <PieChart className="w-3.5 h-3.5" /> Balance Sheet
                    </button>
                    <button className="h-8 px-4 rounded-xl font-bold text-xs tracking-widest bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 transition-all flex items-center gap-2 shadow-sm">
                        <BarChart3 className="w-3.5 h-3.5" /> Profit & Loss
                    </button>
                </div>
            }
        />
    );
}
