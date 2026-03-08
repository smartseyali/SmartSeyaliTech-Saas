import { useState } from "react";
import { useTenant } from "@/contexts/TenantContext";
import {
    LayoutDashboard, PieChart, Landmark, Receipt,
    Briefcase, ArrowUpRight, Plus, Search,
    Filter, Clock, CheckCircle2, ChevronRight,
    BarChart3, Scale, Calculator, Wallet,
    TrendingUp, TrendingDown, FileBadge
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function BooksDashboard() {
    const { activeCompany } = useTenant();

    const stats = {
        totalRevenue: 2840000,
        totalExpenses: 1420000,
        netProfit: 1420000,
        pendingInvoices: 42
    };

    const recentTransactions = [
        { id: "TXN-001", type: "Income", category: "Sale", amount: 45000, status: "Cleared", date: "1h ago" },
        { id: "TXN-012", type: "Expense", category: "Hosting", amount: 3200, status: "Pending", date: "3h ago" },
        { id: "TXN-023", type: "Income", category: "Consulting", amount: 15000, status: "Cleared", date: "5h ago" },
        { id: "TXN-044", type: "Expense", category: "Office Rent", amount: 25000, status: "Cleared", date: "1d ago" },
    ];

    const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <Scale className="w-5 h-5 text-emerald-600" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Financial Intelligence</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Books Accounting</h1>
                    <p className="text-slate-500 text-sm font-medium">Chart of Accounts & Ledgers</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-10 px-4 rounded-xl border-slate-200">
                        <Landmark className="w-4 h-4 mr-2" /> Bank Sync
                    </Button>
                    <Button className="h-10 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-500/20 transition-all border-0">
                        <Plus className="w-4 h-4 mr-2" /> New Entry
                    </Button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total Revenue", value: fmt(stats.totalRevenue), sub: "Gross income", icon: Landmark, color: "bg-emerald-600" },
                    { label: "Operating Expense", value: fmt(stats.totalExpenses), sub: "Fixed & Variable", icon: Calculator, color: "bg-slate-900" },
                    { label: "Net Profit", value: fmt(stats.netProfit), sub: "P&L Surplus", icon: PieChart, color: "bg-emerald-600" },
                    { label: "Unpaid Invoices", value: stats.pendingInvoices, sub: "Receivables", icon: Receipt, color: "bg-slate-900" },
                ].map(k => (
                    <div key={k.label} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-emerald-100 transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={cn("p-2.5 rounded-xl text-white transition-transform group-hover:scale-105", k.color)}>
                                <k.icon className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{k.label}</span>
                        </div>
                        <p className="text-2xl font-black text-slate-900 mb-1 leading-none">{k.value}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{k.sub}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Ledger stream */}
                <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white relative">
                        <div className="absolute top-0 left-0 w-16 h-1 bg-emerald-600 rounded-full ml-8" />
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Ledger Activity</h2>
                        <Button variant="ghost" className="h-9 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-50">Journal History <ChevronRight className="w-3 h-3 ml-2" /></Button>
                    </div>

                    <div className="p-0">
                        <table className="w-full">
                            <thead>
                                <tr className="text-[9px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-50 bg-slate-50/20">
                                    <th className="px-8 py-4 text-left">Internal ID</th>
                                    <th className="px-8 py-4 text-left">Source / Vendor</th>
                                    <th className="px-8 py-4 text-left">Category</th>
                                    <th className="px-8 py-4 text-left">Amount</th>
                                    <th className="px-8 py-4 text-right">Verification</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {recentTransactions.map(txn => (
                                    <tr key={txn.id} className="group hover:bg-slate-50/50 transition-all">
                                        <td className="px-8 py-5 text-[11px] font-bold text-slate-900">{txn.id}</td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-8 h-8 rounded-lg flex items-center justify-center text-[10px]",
                                                    txn.type === 'Income' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                                )}>
                                                    {txn.type === 'Income' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                                                </div>
                                                <span className="text-[11px] font-bold text-slate-700">{txn.category}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-tight">{txn.type}</td>
                                        <td className={cn(
                                            "px-8 py-5 text-sm font-black",
                                            txn.type === 'Income' ? "text-emerald-600" : "text-rose-600"
                                        )}>
                                            {txn.type === 'Income' ? '+' : '-'}{fmt(txn.amount)}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border",
                                                txn.status === 'Cleared' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                                            )}>
                                                {txn.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Account Balances */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Wallet className="w-32 h-32 rotate-12" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-8 border-b border-white/5 pb-4 leading-none font-outfit">Liquidity Status</h3>

                            <div className="space-y-6">
                                <div className="p-5 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm group-hover:border-emerald-500/30 transition-all">
                                    <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1.5 leading-none">Main Operations Account</p>
                                    <div className="flex items-end justify-between">
                                        <p className="text-2xl font-black italic">₹12,40,500</p>
                                        <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded uppercase leading-none">HDFC-9021</span>
                                    </div>
                                </div>
                                <div className="p-5 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm group-hover:border-emerald-500/30 transition-all">
                                    <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1.5 leading-none">Petty Cash / Wallet</p>
                                    <div className="flex items-end justify-between">
                                        <p className="text-2xl font-black italic">₹45,200</p>
                                        <span className="text-[9px] font-bold text-slate-400 bg-white/10 px-2 py-0.5 rounded uppercase leading-none">Internal</span>
                                    </div>
                                </div>
                            </div>

                            <Button className="w-full mt-8 h-12 bg-white/10 hover:bg-white/20 border-white/10 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-xl transition-all shadow-xl font-outfit">
                                View Balance Sheet
                            </Button>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-6 border-b border-slate-50 pb-4 leading-none">Quick Links</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'COA', icon: Scale },
                                { label: 'Tax Report', icon: FileBadge },
                                { label: 'Reconcile', icon: RefreshCw },
                                { label: 'Audit Log', icon: Clock },
                            ].map(item => (
                                <button key={item.label} className="p-4 rounded-xl border border-slate-50 flex flex-col items-center gap-3 hover:border-emerald-500 transition-all bg-white hover:shadow-md group">
                                    <item.icon className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-colors" />
                                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-tighter leading-none">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const RefreshCw = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></svg>
);
