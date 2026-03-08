import { useState } from "react";
import {
    Sheet, Search, Filter, Plus,
    MoreHorizontal, Wallet, Landmark,
    ArrowDownLeft, ArrowUpRight, BarChart3,
    FileSpreadsheet, Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ChartOfAccounts() {
    const accounts = [
        { code: "1001", name: "HDFC Operating Account", type: "Asset", sub: "Bank", balance: 1250000, status: "Active" },
        { code: "1002", name: "Petty Cash", type: "Asset", sub: "Cash", balance: 5000, status: "Active" },
        { code: "2001", name: "Accounts Payable", type: "Liability", sub: "Current Liability", balance: -45000, status: "Active" },
        { code: "3001", name: "Owner Capital", type: "Equity", sub: "Capital Account", balance: 5000000, status: "Active" },
        { code: "4001", name: "Product Sales", type: "Income", sub: "Direct Income", balance: 856000, status: "Active" },
        { code: "5001", name: "Office Rent", type: "Expense", sub: "Indirect Expense", balance: 120000, status: "Active" },
    ];

    const fmt = (n: number) => `₹${Math.abs(n).toLocaleString("en-IN")}`;

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Financial Infrastructure</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 uppercase italic">Chart of Accounts</h1>
                    <p className="text-sm font-medium text-slate-500">Master database of all ledgers and financial buckets.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="h-12 px-6 rounded-2xl border-slate-200">
                        <Settings className="w-5 h-5 mr-2" /> Settings
                    </Button>
                    <Button className="h-12 px-8 rounded-2xl bg-emerald-600 hover:bg-black text-white font-bold shadow-xl shadow-emerald-600/20 transition-all gap-3 border-0">
                        <Plus className="w-5 h-5" /> New Account
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden font-sans">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-50 bg-slate-50/50">
                            <th className="py-6 pl-10 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Code</th>
                            <th className="py-6 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Account Identity</th>
                            <th className="py-6 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Classification</th>
                            <th className="py-6 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Current Valuation</th>
                            <th className="py-6 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 pr-10 text-right">State</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {accounts.map((acc) => (
                            <tr key={acc.code} className="group hover:bg-slate-50/50 transition-all">
                                <td className="py-8 pl-10">
                                    <span className="text-[11px] font-black text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">{acc.code}</span>
                                </td>
                                <td className="py-8">
                                    <p className="text-sm font-black text-slate-900 leading-none mb-1 uppercase tracking-tight italic">{acc.name}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{acc.sub}</p>
                                </td>
                                <td className="py-8">
                                    <span className={cn(
                                        "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                        acc.type === 'Asset' ? "bg-blue-50 text-blue-600 border-blue-100" :
                                            acc.type === 'Liability' ? "bg-rose-50 text-rose-600 border-rose-100" :
                                                acc.type === 'Income' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                    "bg-amber-50 text-amber-600 border-amber-100"
                                    )}>
                                        {acc.type}
                                    </span>
                                </td>
                                <td className="py-8">
                                    <p className={cn(
                                        "text-sm font-black italic",
                                        acc.balance >= 0 ? "text-slate-900" : "text-rose-600"
                                    )}>
                                        {acc.balance < 0 ? "-" : ""}{fmt(acc.balance)}
                                    </p>
                                </td>
                                <td className="py-8 pr-10 text-right">
                                    <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-300 group-hover:text-emerald-600 group-hover:bg-emerald-50 transition-all rounded-xl">
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
