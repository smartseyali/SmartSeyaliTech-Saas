import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, TrendingDown, CreditCard, BarChart3, ArrowUpRight, ArrowDownLeft, AlertCircle, CheckCircle, RefreshCw, Plus } from "lucide-react";
import { useTenant } from "@/contexts/TenantContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import db from "@/lib/db";

const KPICard = ({ title, value, sub, icon: Icon, color, trend, loading }: any) => (
    <div className="bg-white rounded-xl border border-slate-100 p-5 flex flex-col gap-2 shadow-sm hover:border-blue-100 transition-all">
        <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</span>
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", color)}>
                <Icon className="w-4 h-4 text-white" />
            </div>
        </div>
        <div className="text-xl font-black text-slate-900 tracking-tight leading-none">
            {loading ? <span className="animate-pulse">...</span> : value}
        </div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-70">{sub}</div>
    </div>
);

export default function FinanceDashboard() {
    const { activeCompany } = useTenant();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        revenue: 0,
        expenses: 0,
        profit: 0,
        payable: 0,
        receivable: 0,
        bank: 0
    });
    const [recentTx, setRecentTx] = useState<any[]>([]);

    const fetchData = async () => {
        if (!activeCompany) return;
        setLoading(true);
        try {
            // Fetch Accounts Data
            const { data: accounts } = await db.from('accounts_chart')
                .select('type, balance, name')
                .eq('company_id', activeCompany.id);

            if (accounts) {
                const s = {
                    revenue: accounts.filter((a: any) => a.type === 'income').reduce((sum, a) => sum + (Number(a.balance) || 0), 0),
                    expenses: accounts.filter((a: any) => a.type === 'expense').reduce((sum, a) => sum + (Number(a.balance) || 0), 0),
                    payable: accounts.filter((a: any) => a.type === 'liability').reduce((sum, a) => sum + (Number(a.balance) || 0), 0),
                    receivable: accounts.filter((a: any) => a.type === 'asset' && a.name.toLowerCase().includes('receivable')).reduce((sum, a) => sum + (Number(a.balance) || 0), 0),
                    bank: accounts.filter((a: any) => (a.type === 'asset' && a.name.toLowerCase().includes('bank')) || a.name.toLowerCase().includes('cash')).reduce((sum, a) => sum + (Number(a.balance) || 0), 0),
                };
                setStats({ ...s, profit: s.revenue - s.expenses });
            }

            // Fetch Recent Journals
            const { data: journals } = await db.from('journal_entries')
                .select('*')
                .eq('company_id', activeCompany.id)
                .order('created_at', { ascending: false })
                .limit(5);

            setRecentTx(journals || []);
        } catch (err) {
            console.error("Finance data fetch failed:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeCompany]);

    const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

    return (
        <div className="min-h-screen bg-slate-50/20 font-sans p-4 lg:p-6 space-y-6 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 border-l-4 border-emerald-600 pl-4 uppercase">Finance Intelligence</h1>
                    <div className="flex items-center gap-2 pl-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase leading-none">Fiscal Control & Treasury Hub • {activeCompany?.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={fetchData} className="h-8 w-8 text-slate-400 hover:text-emerald-600 border border-slate-200 hover:border-emerald-200 bg-white">
                        <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
                    </Button>
                    <Button size="sm" className="h-8 px-4 bg-slate-900 hover:bg-black text-white text-[10px] font-black shadow-lg shadow-slate-900/10 uppercase tracking-widest rounded-lg">
                        <Plus className="w-3.5 h-3.5 mr-2" /> New Entry
                    </Button>
                </div>
            </div>

            {/* KPI Grid - High Density */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                {[
                    { title: "Net Revenue", value: fmt(stats.revenue), sub: "Annual Income", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { title: "Operating Exp", value: fmt(stats.expenses), sub: "Opex Outflow", icon: TrendingDown, color: "text-rose-600", bg: "bg-rose-50" },
                    { title: "Net Profit", value: fmt(stats.profit), sub: "Settled Gains", icon: DollarSign, color: "text-blue-600", bg: "bg-blue-50" },
                    { title: "Total Payable", value: fmt(stats.payable), sub: "Outstanding Hub", icon: CreditCard, color: "text-slate-600", bg: "bg-slate-100" },
                    { title: "Receivables", value: fmt(stats.receivable), sub: "External Dues", icon: ArrowUpRight, color: "text-indigo-600", bg: "bg-indigo-50" },
                    { title: "Cash Reserve", value: fmt(stats.bank), sub: "Liquid Liquidity", icon: BarChart3, color: "text-emerald-600", bg: "bg-emerald-50" },
                ].map(k => (
                    <div key={k.title} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between mb-3">
                            <div className={cn("p-2 rounded-lg", k.bg, k.color)}>
                                <k.icon className="w-4 h-4" />
                            </div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{k.title}</span>
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-900 tracking-tight leading-none">{loading ? "..." : k.value}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 leading-none opacity-50">{k.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Ledger Table */}
                <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-3.5 bg-slate-400 rounded-full" />
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Fiscal Ledger</h2>
                        </div>
                        <Button variant="ghost" size="sm" className="text-emerald-600 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50">Audit Pipeline</Button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-[9px] font-black tracking-widest text-slate-400 uppercase border-b border-slate-100 bg-slate-50/10 h-10">
                                    <th className="px-5 text-left">Internal Ref</th>
                                    <th className="px-5 text-left">Narration</th>
                                    <th className="px-5 text-right">Debit Balance</th>
                                    <th className="px-5 text-right">Credit Balance</th>
                                    <th className="px-5 text-center">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr><td colSpan={5} className="p-10 text-center text-slate-300 font-black uppercase tracking-widest text-[10px]">Syncing Audit...</td></tr>
                                ) : recentTx.length === 0 ? (
                                    <tr><td colSpan={5} className="p-10 text-center text-slate-300 font-black uppercase tracking-widest text-[10px]">No Active Ledger Entries</td></tr>
                                ) : (
                                    recentTx.map((tx) => (
                                        <tr key={tx.id} className="group hover:bg-emerald-50/30 transition-all h-12 cursor-pointer">
                                            <td className="px-5 text-[11px] font-black text-blue-600 font-mono">#{tx.reference?.slice(-6) || tx.id.slice(0, 6)}</td>
                                            <td className="px-5 text-[10px] font-bold text-slate-600 uppercase tracking-tight">{tx.notes || tx.description || "General Journal Entry"}</td>
                                            <td className="px-5 text-right text-[11px] font-black text-rose-600">{tx.total_debit > 0 ? fmt(tx.total_debit) : "-"}</td>
                                            <td className="px-5 text-right text-[11px] font-black text-emerald-600">{tx.total_credit > 0 ? fmt(tx.total_credit) : "-"}</td>
                                            <td className="px-5 text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                {new Date(tx.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Fiscal Sidebar */}
                <div className="space-y-4">
                    {/* Profit Card */}
                    <div className="bg-slate-900 rounded-xl p-5 text-white shadow-xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-[9px] font-black tracking-widest text-emerald-400 mb-5 uppercase leading-none">Profitability Heatmap</h3>
                            <div className="space-y-4">
                                {[
                                    { label: "Gross Margin", val: stats.revenue > 0 ? `${((stats.revenue - stats.expenses) / stats.revenue * 100).toFixed(1)}%` : "0%" },
                                    { label: "Current Ratio", val: stats.payable > 0 ? (stats.receivable / stats.payable).toFixed(2) : "1.00" },
                                    { label: "Cash Burn", val: "₹1.4K/day" },
                                ].map((row) => (
                                    <div key={row.label} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{row.label}</span>
                                        <span className="text-sm font-black text-white tracking-tight">{row.val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-600/10 rounded-full blur-3xl group-hover:bg-emerald-600/20 transition-all pointer-events-none" />
                    </div>

                    {/* Fiscal Actions */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <h3 className="text-[9px] font-black tracking-widest text-slate-400 mb-4 border-b border-slate-50 pb-2 uppercase leading-none">Treasury Hub</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { icon: AlertCircle, color: "text-amber-500", label: "Drafts Queue" },
                                { icon: ArrowDownLeft, color: "text-rose-500", label: "Bill Clearing" },
                                { icon: ArrowUpRight, color: "text-emerald-500", label: "Payment Run" },
                                { icon: CheckCircle, color: "text-blue-500", label: "Balance Sync" },
                            ].map((a) => (
                                <button key={a.label} className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-emerald-200 transition-all group shadow-sm">
                                    <a.icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", a.color)} />
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none text-center">{a.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
