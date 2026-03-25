import { useState } from "react";
import { useTenant } from "@/contexts/TenantContext";
import {
    ShoppingBag, Truck, Receipt, CreditCard,
    CheckCircle2, Plus, RefreshCw, BarChart3,
    Briefcase, Award, Ship, Box,
    ArrowUpRight, MapPin, Building2, TrendingUp,
    Clock, Search, FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function PurchaseDashboard() {
    const { activeCompany } = useTenant();

    const stats = {
        monthlySpend: 2450000,
        pendingPOs: 14,
        pendingGRNs: 8,
        activeVendors: 42
    };

    const vendorStats = [
        { name: "Reliance Retail", orders: 24, amount: "₹8.4L", progress: 92 },
        { name: "Global Exports", orders: 12, amount: "₹4.2L", progress: 65 },
        { name: "Tech Solutions", orders: 8, amount: "₹2.1L", progress: 45 },
    ];

    const recentPOs = [
        { id: "PO-8041", vendor: "Reliance Retail", amount: "₹45,000", status: "Approved", time: "2h ago" },
        { id: "PO-8040", vendor: "Global Exports", amount: "₹1,20,000", status: "Pending", time: "5h ago" },
        { id: "PO-8039", vendor: "Tech Solutions", amount: "₹15,500", status: "Received", time: "1d ago" },
    ];

    const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

    if (!activeCompany) return null;

    return (
        <div className="p-8 space-y-10 animate-in fade-in duration-500 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 uppercase tracking-wider">Purchase Intelligence</h1>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                        <p className="text-xs font-bold tracking-widest text-slate-500 uppercase leading-none">Procurement & Sourcing Hub • {activeCompany?.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-pink-600 transition-all shadow-sm">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <Button className="h-10 px-6 rounded-xl bg-pink-600 hover:bg-slate-900 text-white font-bold text-xs tracking-widest uppercase transition-all shadow-xl shadow-pink-600/20 gap-2 border-0">
                        <Plus className="w-4 h-4" /> Create PO
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: "Monthly Outflow", value: fmt(stats.monthlySpend), sub: "Total monthly spend", icon: TrendingUp, color: "bg-pink-600" },
                    { label: "Pending POs", value: stats.pendingPOs, sub: "Awaiting approval", icon: FileText, color: "bg-slate-900" },
                    { label: "GRN Backlog", value: stats.pendingGRNs, sub: "Pending receipt", icon: Box, color: "bg-pink-600" },
                    { label: "Vendor Entities", value: stats.activeVendors, sub: "Registered suppliers", icon: Building2, color: "bg-slate-900" },
                ].map(k => (
                    <div key={k.label} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-xl transition-all h-64">
                        <div className="flex items-center justify-between mb-8">
                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white", k.color)}>
                                <k.icon className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold tracking-[0.1em] text-slate-500 uppercase leading-none">{k.label}</span>
                        </div>
                        <div>
                            <p className="text-4xl font-bold tracking-tight text-slate-900 mb-2 truncate leading-none">{k.value}</p>
                            <p className="text-xs font-bold text-slate-500 tracking-widest uppercase mt-4 leading-none">{k.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-white relative">
                         <h2 className="text-xl font-bold tracking-tight text-slate-900 uppercase tracking-wider leading-none">Order Lifecycle</h2>
                        <Button variant="ghost" className="h-9 px-4 rounded-lg text-xs font-bold tracking-widest text-pink-600 uppercase hover:bg-pink-50 transition-all">All Orders</Button>
                    </div>

                    <div className="p-10 space-y-6">
                        {recentPOs.map(po => (
                            <div key={po.id} className="flex items-center justify-between p-7 rounded-[2.5rem] border border-slate-50 hover:border-pink-100 hover:bg-slate-50/50 transition-all group">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-[13px] uppercase tracking-widest shadow-lg">
                                        {po.id}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 group-hover:text-pink-600 transition-colors uppercase text-[12px] tracking-tight leading-none">{po.vendor}</p>
                                        <div className="flex items-center gap-3 mt-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-md border",
                                                po.status === 'Approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                    po.status === 'Received' ? "bg-blue-50 text-blue-600 border-blue-100" :
                                                        "bg-amber-50 text-amber-600 border-amber-100"
                                            )}>{po.status}</span>
                                            <span className="text-slate-200">•</span>
                                            <span>{po.time}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-slate-900 tracking-tighter leading-none mb-1">{po.amount}</p>
                                    <p className="text-xs font-bold text-slate-300 uppercase tracking-widest leading-none">Audit Ready</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Ship className="w-32 h-32 text-pink-500 -rotate-12 translate-x-12" />
                        </div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-8 border-b border-white/5 pb-6">Supply Vitality</h2>
                        <div className="space-y-6 relative z-10 p-2">
                           {vendorStats.map(vendor => (
                                <div key={vendor.name} className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">{vendor.name}</p>
                                            <span className="text-xl font-bold text-white leading-none tracking-tighter">{vendor.amount}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-bold text-pink-400 uppercase tracking-widest leading-none">{vendor.orders} Orders</span>
                                        </div>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-pink-500 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(236,72,153,0.3)]" style={{ width: `${vendor.progress}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-[3rem] border border-slate-100 p-10 shadow-sm flex flex-col">
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-8 border-b border-slate-50 pb-4 tracking-wider uppercase w-full text-center underline decoration-pink-600 decoration-2 underline-offset-8 leading-none">Command</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: "New Vendor", icon: Building2, color: "text-blue-600 bg-blue-50" },
                                { label: "Inward GRN", icon: Truck, color: "text-pink-600 bg-pink-50" },
                                { label: "Quality Hub", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
                                { label: "PO Assets", icon: FileText, color: "text-violet-600 bg-violet-50" },
                            ].map(btn => (
                                <button key={btn.label} className="flex flex-col items-center justify-center p-6 rounded-3xl border border-slate-50 hover:bg-slate-50 transition-all gap-4 bg-white group/proc shadow-sm">
                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border transition-all group-hover/proc:scale-105", btn.color)}>
                                        <btn.icon className="w-4 h-4" />
                                    </div>
                                    <span className="text-[13px] font-bold tracking-widest text-slate-500 uppercase group-hover/proc:text-pink-600 transition-colors text-center">{btn.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
