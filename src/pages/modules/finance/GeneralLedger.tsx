import { useState, useEffect } from "react";
import { Search, RefreshCw, FileText, ArrowRightLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { format } from "date-fns";

export default function GeneralLedger() {
    const { activeCompany } = useTenant();
    const [loading, setLoading] = useState(true);
    const [ledgerData, setLedgerData] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedAccount, setSelectedAccount] = useState("all");
    const [accounts, setAccounts] = useState<any[]>([]);

    useEffect(() => {
        if (activeCompany) {
            fetchAccounts();
            fetchLedger();
        }
    }, [activeCompany, selectedAccount]);

    const fetchAccounts = async () => {
        const { data } = await supabase
            .from("chart_of_accounts")
            .select("id, account_name, account_code")
            .eq("company_id", activeCompany?.id)
            .order("account_code");
        if (data) setAccounts(data);
    };

    const fetchLedger = async () => {
        setLoading(true);
        let query = supabase
            .from("finance_journal_lines")
            .select(`
                id, debit, credit, description,
                journal_entries!inner (reference, date, company_id),
                chart_of_accounts (account_name, account_code)
            `)
            .eq("journal_entries.company_id", activeCompany?.id)
            .order("created_at", { ascending: true });

        if (selectedAccount !== "all") {
            query = query.eq("account_id", selectedAccount);
        }

        const { data, error } = await query;
        if (!error && data) {
            // Calculate running balance
            let balance = 0;
            const mapped = data.map(row => {
                const debit = Number(row.debit || 0);
                const credit = Number(row.credit || 0);
                balance += (debit - credit);
                return {
                    ...row,
                    date: row.journal_entries?.date,
                    ref: row.journal_entries?.reference,
                    account: row.chart_of_accounts?.account_name,
                    code: row.chart_of_accounts?.account_code,
                    running_balance: balance
                };
            });
            setLedgerData(mapped.reverse()); // Show latest first in table
        }
        setLoading(false);
    };

    const filtered = ledgerData.filter((row) => {
        const matchSearch = String(row.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(row.ref || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(row.account || "").toLowerCase().includes(searchTerm.toLowerCase());
        return matchSearch;
    });

    const totalDebit = filtered.reduce((s, r) => s + Number(r.debit || 0), 0);
    const totalCredit = filtered.reduce((s, r) => s + Number(r.credit || 0), 0);

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">General Ledger</h1>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Universal Transaction Audit Trail</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={fetchLedger}
                        className="flex items-center gap-2 px-6 h-12 text-[11px] font-bold bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-widest shadow-sm"
                    >
                        <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} /> Reload
                    </button>
                    <button className="flex items-center gap-2 px-6 h-12 text-[11px] font-bold bg-slate-900 text-white rounded-2xl hover:bg-black transition-all uppercase tracking-widest shadow-lg shadow-slate-200">
                        <FileText className="w-3.5 h-3.5" /> Export PDF
                    </button>
                </div>
            </header>

            {/* Smart Filters */}
            <div className="bg-white rounded-[2rem] border border-slate-200 p-6 flex flex-wrap gap-6 items-end shadow-sm">
                <div className="flex flex-col gap-2 min-w-[240px]">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Internal Ledger Account</label>
                    <select
                        value={selectedAccount}
                        onChange={(e) => setSelectedAccount(e.target.value)}
                        className="h-12 w-full border border-slate-100 rounded-xl px-4 text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                    >
                        <option value="all">Consolidated (All Accounts)</option>
                        {accounts.map((a) => <option key={a.id} value={a.id}>{a.account_code} — {a.account_name}</option>)}
                    </select>
                </div>

                <div className="flex-1 min-w-[300px] flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Universal Search</label>
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by reference, description or account name..."
                            className="h-12 w-full pl-12 pr-4 border border-slate-100 rounded-xl text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all outline-none" 
                        />
                    </div>
                </div>
            </div>

            {/* Ledger Grid */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100 overflow-hidden min-h-[400px]">
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="bg-slate-900 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-left">
                            <th className="px-8 py-5">Date / Ref</th>
                            <th className="px-8 py-5">Ledger Account</th>
                            <th className="px-8 py-5">Transaction Narration</th>
                            <th className="px-8 py-5 text-right">Debit (Dr)</th>
                            <th className="px-8 py-5 text-right">Credit (Cr)</th>
                            <th className="px-8 py-5 text-right">Balance</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan={6} className="px-8 py-6 h-16 bg-slate-50/50" />
                                </tr>
                            ))
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-8 py-32 text-center">
                                    <ArrowRightLeft className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                                    <p className="text-xs font-bold text-slate-300 uppercase tracking-[0.3em]">No Posting History Found</p>
                                </td>
                            </tr>
                        ) : (
                            filtered.map((row, i) => (
                                <tr key={row.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-black text-slate-900 leading-none">{row.date}</span>
                                            <span className="text-[10px] font-bold text-blue-600 font-mono mt-1.5 uppercase tracking-tighter">{row.ref}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-slate-800 leading-none">{row.account}</span>
                                            <span className="text-[10px] font-bold text-slate-400 mt-1.5 uppercase tracking-widest">{row.code}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-bold text-slate-500 leading-relaxed">{row.description || "—"}</span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        {row.debit > 0 ? (
                                            <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-lg text-xs font-black font-mono">
                                                ₹{row.debit.toLocaleString()}
                                            </span>
                                        ) : <span className="text-slate-200">—</span>}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        {row.credit > 0 ? (
                                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-black font-mono">
                                                ₹{row.credit.toLocaleString()}
                                            </span>
                                        ) : <span className="text-slate-200">—</span>}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <span className={cn(
                                            "text-xs font-black font-mono tracking-tight",
                                            row.running_balance >= 0 ? "text-emerald-700" : "text-rose-700"
                                        )}>
                                            ₹{Math.abs(row.running_balance).toLocaleString()} {row.running_balance >= 0 ? "Cr" : "Dr"}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                    {!loading && filtered.length > 0 && (
                        <tfoot className="bg-slate-50/80 backdrop-blur-sm border-t-2 border-slate-100">
                            <tr>
                                <td colSpan={3} className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Period Totals</td>
                                <td className="px-8 py-6 text-right font-black font-mono text-xs text-rose-600">₹{totalDebit.toLocaleString()}</td>
                                <td className="px-8 py-6 text-right font-black font-mono text-xs text-emerald-600">₹{totalCredit.toLocaleString()}</td>
                                <td className="px-8 py-6 text-right font-black font-mono text-xs text-slate-900 bg-white border-l border-slate-200 shadow-inner">
                                    ₹{Math.abs(totalDebit - totalCredit).toLocaleString()} {totalDebit >= totalCredit ? "Dr" : "Cr"}
                                </td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </div>
    );
}

const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");
