import { useState } from "react";
import { useTenant } from "@/contexts/TenantContext";
import {
    Wallet, Users, FileText, Banknote,
    Calendar, TrendingUp, Plus, Search,
    Filter, ArrowUpRight, ChevronRight,
    Calculator, Receipt, Landmark, Clock,
    CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function PayrollDashboard() {
    const { activeCompany } = useTenant();

    const stats = {
        monthlyPayout: 4250000,
        employeeCount: 156,
        statutoryDue: 125000,
        payslipsGenerated: 148
    };

    const recentPayouts = [
        { id: "PAY-FEB-001", cycle: "February 2024", employees: 156, amount: 4250000, status: "Processed", date: "4d ago" },
        { id: "PAY-JAN-001", cycle: "January 2024", employees: 154, amount: 4180000, status: "Paid", date: "1mo ago" },
        { id: "ADV-0042", cycle: "Salary Advance", employees: 1, amount: 25000, status: "Approved", date: "2d ago" },
    ];

    const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <Wallet className="w-5 h-5 text-sky-600" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Compensation Management</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Payroll System</h1>
                    <p className="text-slate-500 text-sm font-medium">Compliance & Statutory Reporting</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-10 px-4 rounded-xl border-slate-200">
                        <Landmark className="w-4 h-4 mr-2" /> Statutories
                    </Button>
                    <Button className="h-10 px-6 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-lg shadow-sky-500/20 border-0 transition-all">
                        <Plus className="w-4 h-4 mr-2" /> Run Payroll
                    </Button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Net Payout", value: fmt(stats.monthlyPayout), sub: "February Cycle", icon: Banknote, color: "bg-sky-600" },
                    { label: "Active Employees", value: stats.employeeCount, sub: "Synced from HRMS", icon: Users, color: "bg-slate-900" },
                    { label: "Statutory (PF/ESI)", value: fmt(stats.statutoryDue), sub: "Due in 6 days", icon: Landmark, color: "bg-amber-600" },
                    { label: "Payslips Ready", value: stats.payslipsGenerated, sub: "95% generated", icon: Receipt, color: "bg-slate-900" },
                ].map(k => (
                    <div key={k.label} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-sky-100 transition-all group">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Payout Table */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-fit">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Payroll History</h2>
                        <Button variant="ghost" className="text-sky-600 text-[10px] font-black uppercase tracking-widest h-8">All Cycles <ChevronRight className="w-3 h-3 ml-1" /></Button>
                    </div>
                    <table className="w-full">
                        <thead className="bg-slate-50/50">
                            <tr className="text-[8px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-50">
                                <th className="px-6 py-4 text-left">Internal ID</th>
                                <th className="px-6 py-4 text-left">Cycle / Batch</th>
                                <th className="px-6 py-4 text-left">Headcount</th>
                                <th className="px-6 py-4 text-left">Net Amount</th>
                                <th className="px-6 py-4 text-right">Execution</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {recentPayouts.map(pay => (
                                <tr key={pay.id} className="group hover:bg-slate-50/20 transition-all">
                                    <td className="px-6 py-5 text-[11px] font-bold text-slate-900">{pay.id}</td>
                                    <td className="px-6 py-5 text-[11px] font-medium text-slate-500 italic">{pay.cycle}</td>
                                    <td className="px-6 py-5 text-[11px] font-black text-slate-900">{pay.employees} Users</td>
                                    <td className="px-6 py-5 text-[11px] font-black text-sky-600">{fmt(pay.amount)}</td>
                                    <td className="px-6 py-5 text-right">
                                        <span className={cn(
                                            "px-2.5 py-1 rounded text-[8px] font-black uppercase tracking-widest border",
                                            pay.status === 'Paid' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                pay.status === 'Processed' ? "bg-blue-50 text-blue-600 border-blue-100" :
                                                    pay.status === 'Approved' ? "bg-sky-50 text-sky-600 border-sky-100" :
                                                        "bg-slate-50 text-slate-400 border-slate-100"
                                        )}>
                                            {pay.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Statutory & Configuration */}
                <div className="space-y-6">
                    <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Calculator className="w-32 h-32 rotate-12" />
                        </div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-400 mb-6 border-b border-white/5 pb-4 leading-none font-outfit">Payroll Engine</h3>
                        <div className="space-y-6 relative z-10">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5 group-hover:border-sky-500/30 transition-all">
                                <p className="text-[11px] font-bold text-white mb-2 italic">Auto-Sync Enabled</p>
                                <p className="text-[9px] text-white/40 leading-relaxed font-medium">Payroll is synced with HRMS attendance logs. TDS calculations are based on the latest FY budget rules.</p>
                            </div>
                            <Button className="w-full h-11 bg-white/5 hover:bg-white/10 border-white/10 text-white font-black uppercase tracking-widest text-[9px] rounded-xl transition-all font-outfit">
                                Tax Configurations
                            </Button>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-6 border-b border-slate-50 pb-4 leading-none font-outfit">Quick Access</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Advances', icon: CreditCard },
                                { label: 'Payslips', icon: FileText },
                                { label: 'Bonuses', icon: TrendingUp },
                                { label: 'Compliance', icon: Landmark },
                            ].map(item => (
                                <button key={item.label} className="p-4 rounded-xl border border-slate-50 flex flex-col items-center gap-3 hover:bg-sky-50 hover:border-sky-200 transition-all bg-white hover:shadow-md group">
                                    <item.icon className="w-4 h-4 text-slate-300 group-hover:text-sky-600 transition-colors" />
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
