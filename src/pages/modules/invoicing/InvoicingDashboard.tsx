import { useState } from "react";
import { useTenant } from "@/contexts/TenantContext";
import {
    Receipt, FileText, Send, Clock,
    CheckCircle2, AlertCircle, Plus, Search,
    Filter, ArrowUpRight, ChevronRight,
    TrendingUp, Calculator, Share2, Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function InvoicingDashboard() {
    const { activeCompany } = useTenant();

    const stats = {
        sentThisMonth: 124,
        totalAmount: 856000,
        overdue: 12,
        paid: 89
    };

    const recentInvoices = [
        { id: "INV-2024-001", customer: "Digital Wave", amount: 15600, status: "Paid", date: "1h ago" },
        { id: "INV-2024-002", customer: "John Smith", amount: 4500, status: "Sent", date: "3h ago" },
        { id: "INV-2024-003", customer: "Green Earth Ltd", amount: 52000, status: "Overdue", date: "1d ago" },
        { id: "INV-2024-004", customer: "Innovate AI", amount: 28000, status: "Draft", date: "2d ago" },
    ];

    const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <Receipt className="w-5 h-5 text-amber-600" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Billing & Receivables</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Invoicing Console</h1>
                    <p className="text-slate-500 text-sm font-medium">Billed under {activeCompany?.name}</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-10 px-4 rounded-xl border-slate-200">
                        <Calculator className="w-4 h-4 mr-2" /> Tax Settings
                    </Button>
                    <Button className="h-10 px-6 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-lg shadow-amber-500/20 transition-all border-0">
                        <Plus className="w-4 h-4 mr-2" /> Create Invoice
                    </Button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Billed Monthly", value: fmt(stats.totalAmount), sub: "Total generated", icon: Send, color: "bg-amber-600" },
                    { label: "Paid Invoices", value: stats.paid, sub: "Successfully cleared", icon: CheckCircle2, color: "bg-slate-900" },
                    { label: "Overdue Count", value: stats.overdue, sub: "Requires follow-up", icon: AlertCircle, color: "bg-rose-600" },
                    { label: "Sent Items", value: stats.sentThisMonth, sub: "Pending payment", icon: Clock, color: "bg-slate-900" },
                ].map(k => (
                    <div key={k.label} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={cn("p-2.5 rounded-xl text-white transition-transform group-hover:scale-110", k.color)}>
                                <k.icon className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{k.label}</span>
                        </div>
                        <p className="text-2xl font-black text-slate-900 mb-1 leading-none">{k.value}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{k.sub}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Invoice Table */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-fit">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Current Receivables</h2>
                        <Button variant="ghost" className="text-amber-600 text-[10px] font-black uppercase tracking-widest h-8">All History <ChevronRight className="w-3 h-3 ml-1" /></Button>
                    </div>
                    <table className="w-full">
                        <thead className="bg-slate-50/50">
                            <tr className="text-[8px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-50">
                                <th className="px-6 py-4 text-left">Internal ID</th>
                                <th className="px-6 py-4 text-left">Relationship</th>
                                <th className="px-6 py-4 text-left">Valuation</th>
                                <th className="px-6 py-4 text-left">Lifecycle</th>
                                <th className="px-6 py-4 text-right">Age</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {recentInvoices.map(inv => (
                                <tr key={inv.id} className="group hover:bg-slate-50/20 transition-all">
                                    <td className="px-6 py-5 text-[11px] font-bold text-slate-900">{inv.id}</td>
                                    <td className="px-6 py-5 text-[11px] font-medium text-slate-500">{inv.customer}</td>
                                    <td className="px-6 py-5 text-[11px] font-black text-slate-900">{fmt(inv.amount)}</td>
                                    <td className="px-6 py-5">
                                        <span className={cn(
                                            "px-2.5 py-1 rounded text-[8px] font-black uppercase tracking-widest border",
                                            inv.status === 'Paid' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                inv.status === 'Overdue' ? "bg-rose-50 text-rose-600 border-rose-100" :
                                                    inv.status === 'Sent' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                        "bg-slate-50 text-slate-400 border-slate-100"
                                        )}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{inv.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Automation & Template Sidebar */}
                <div className="space-y-6">
                    <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Mail className="w-32 h-32 rotate-12" />
                        </div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 mb-6 border-b border-white/5 pb-4 leading-none font-outfit">Auto-Collections</h3>
                        <div className="space-y-6 relative z-10">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                <p className="text-[11px] font-bold text-white mb-2 italic">Reminder Rule #1</p>
                                <p className="text-[9px] text-white/40 leading-relaxed font-medium">Send automatic reminder email 3 days before due date to all Professional Plan clients.</p>
                            </div>
                            <Button className="w-full h-11 bg-white/5 hover:bg-white/10 border-white/10 text-white font-black uppercase tracking-widest text-[9px] rounded-xl transition-all font-outfit">
                                Manage Workflows
                            </Button>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-6 border-b border-slate-50 pb-4 leading-none font-outfit">Design Center</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Templates', icon: FileText },
                                { label: 'Taxes', icon: Calculator },
                                { label: 'Portals', icon: Share2 },
                                { label: 'Schedule', icon: Send },
                            ].map(item => (
                                <button key={item.label} className="p-4 rounded-xl border border-slate-50 flex flex-col items-center gap-3 hover:bg-amber-50 hover:border-amber-200 transition-all bg-white hover:shadow-md group">
                                    <item.icon className="w-4 h-4 text-slate-300 group-hover:text-amber-600 transition-colors" />
                                    <span className="text-[9px] font-bold uppercase text-slate-500 tracking-tighter leading-none">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
