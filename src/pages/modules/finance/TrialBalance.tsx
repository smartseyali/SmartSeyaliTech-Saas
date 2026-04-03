import { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, Download, RefreshCw, Layers } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";

export default function TrialBalance() {
    const { activeCompany } = useTenant();
    const [loading, setLoading] = useState(true);
    const [balanceData, setBalanceData] = useState<any[]>([]);
    const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7));

    useEffect(() => {
        if (activeCompany) fetchTrialBalance();
    }, [activeCompany, period]);

    const fetchTrialBalance = async () => {
        setLoading(true);
        // Step 1: Fetch accounts
        const { data: accounts } = await supabase
            .from("chart_of_accounts")
            .select("id, account_name, account_code")
            .eq("company_id", activeCompany?.id)
            .order("account_code");

        // Step 2: Fetch aggregates from journal items
        const { data: lines } = await supabase
            .from("finance_journal_lines")
            .select(`
                account_id, debit, credit,
                journal_entries!inner (date, company_id)
            `)
            .eq("journal_entries.company_id", activeCompany?.id);

        if (accounts) {
            const mapped = accounts.map(acc => {
                const accLines = (lines || []).filter(l => l.account_id === acc.id);
                const debit = accLines.reduce((s, l) => s + Number(l.debit || 0), 0);
                const credit = accLines.reduce((s, l) => s + Number(l.credit || 0), 0);
                return {
                    code: acc.account_code,
                    account: acc.account_name,
                    debit,
                    credit
                };
            }).filter(acc => acc.debit > 0 || acc.credit > 0);
            setBalanceData(mapped);
        }
        setLoading(false);
    };

    const totalDebit = balanceData.reduce((s, r) => s + r.debit, 0);
    const totalCredit = balanceData.reduce((s, r) => s + r.credit, 0);
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <header className="flex items-center justify-between flex-wrap gap-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Trial Balance Verification</h1>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Period-End Integrity Audit</p>
                </div>
                <div className="flex items-center gap-4">
                    <input 
                        type="month" 
                        value={period} 
                        onChange={(e) => setPeriod(e.target.value)}
                        className="h-12 border border-slate-200 rounded-2xl px-4 text-xs font-bold text-slate-700 bg-white focus:ring-4 focus:ring-blue-500/5 transition-all outline-none" 
                    />
                    <button 
                        onClick={fetchTrialBalance}
                        className="w-12 h-12 flex items-center justify-center bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-all"
                    >
                        <RefreshCw className={loading ? "animate-spin w-4 h-4" : "w-4 h-4"} />
                    </button>
                    <button className="flex items-center gap-2 px-6 h-12 text-[11px] font-bold bg-slate-900 text-white rounded-2xl hover:bg-black transition-all uppercase tracking-widest shadow-lg shadow-slate-200">
                        <Download className="w-4 h-4" /> Export report
                    </button>
                </div>
            </header>

            {/* Balance Indicator */}
            <div className={`flex items-center justify-between gap-6 px-10 py-6 rounded-[2rem] border-2 transition-all duration-700 ${isBalanced ? "bg-emerald-50/50 border-emerald-100" : "bg-rose-50 border-rose-100"}`}>
                <div className="flex items-center gap-4">
                    <div className={isBalanced ? "text-emerald-500" : "text-rose-500"}>
                        {isBalanced ? <CheckCircle className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
                    </div>
                    <div>
                        <h3 className={`text-lg font-black uppercase tracking-tight ${isBalanced ? "text-emerald-900" : "text-rose-900"}`}>
                            {isBalanced ? "Ledger is Balanced" : "Out of Balance Detected"}
                        </h3>
                        <p className={`text-xs font-bold uppercase tracking-widest opacity-60 ${isBalanced ? "text-emerald-700" : "text-rose-700"}`}>
                            {isBalanced ? "All general ledger accounts are perfectly reconciled" : `Discrepancy of ₹${Math.abs(totalDebit - totalCredit).toLocaleString()}`}
                        </p>
                    </div>
                </div>
                <div className="flex gap-10">
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Debits</p>
                        <p className="text-xl font-black text-slate-900 font-mono">₹{totalDebit.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Credits</p>
                        <p className="text-xl font-black text-slate-900 font-mono">₹{totalCredit.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* High-Density Data Grid */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100 overflow-hidden">
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="bg-slate-900 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-left">
                            <th className="px-10 py-5">GL Account Code</th>
                            <th className="px-10 py-5">Account Name / Category</th>
                            <th className="px-10 py-5 text-right">Debit Balance</th>
                            <th className="px-10 py-5 text-right">Credit Balance</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                             Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="animate-pulse h-16"><td colSpan={4} className="bg-slate-50/50" /></tr>
                            ))
                        ) : balanceData.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-10 py-32 text-center text-slate-300 font-bold uppercase tracking-widest text-xs">
                                    <Layers className="w-10 h-10 mx-auto mb-4 opacity-10" />
                                    No transaction data available for this period
                                </td>
                            </tr>
                        ) : (
                            balanceData.map((row) => (
                                <tr key={row.code} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-10 py-5 font-mono text-xs font-black text-blue-600">{row.code}</td>
                                    <td className="px-10 py-5">
                                        <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{row.account}</span>
                                    </td>
                                    <td className="px-10 py-5 text-right font-mono text-xs font-black text-rose-600">
                                        {row.debit > 0 ? `₹${row.debit.toLocaleString()}` : <span className="text-slate-200">—</span>}
                                    </td>
                                    <td className="px-10 py-5 text-right font-mono text-xs font-black text-emerald-600">
                                        {row.credit > 0 ? `₹${row.credit.toLocaleString()}` : <span className="text-slate-200">—</span>}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                    <tfoot className="bg-slate-900 text-white">
                        <tr>
                            <td colSpan={2} className="px-10 py-6 text-xs font-black uppercase tracking-[0.3em]">Consolidated Totals</td>
                            <td className="px-10 py-6 text-right font-mono font-black text-rose-300">
                                ₹{totalDebit.toLocaleString()}
                            </td>
                            <td className="px-10 py-6 text-right font-mono font-black text-emerald-300">
                                ₹{totalCredit.toLocaleString()}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}
