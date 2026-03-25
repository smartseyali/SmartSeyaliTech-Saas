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

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100 relative">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <ShoppingBag className="w-5 h-5 text-pink-600" />
                        <span className="text-[10px] font-bold  tracking-widest text-slate-500">Procurement & Sourcing Hub</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Purchase Intelligence</h1>
                    <div className="flex items-center gap-2">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-pink-50 text-pink-600 rounded-md text-[9px] font-bold border border-pink-100">
                            <span className="w-1 h-1 rounded-full bg-pink-500 animate-pulse" />
                            ACTIVE
                        </div>
                        <span className="text-slate-300 text-xs">•</span>
                        <span className="text-slate-500 font-medium text-xs">{activeCompany?.name}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-pink-600 transition-all shadow-sm">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <Button className="h-10 px-6 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold text-sm shadow-lg shadow-pink-500/20 transition-all gap-2 border-0">
                        <Plus className="w-4 h-4" /> Create Purchase Order
                    </Button>
                </div>
            </div>

            {/* Premium KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: "Monthly Outflow", value: fmt(stats.monthlySpend), sub: "Total monthly spend", icon: TrendingUp, color: "bg-pink-600" },
                    { label: "Pending POs", value: stats.pendingPOs, sub: "Awaiting approval", icon: FileText, color: "bg-slate-900" },
                    { label: "GRN Backlog", value: stats.pendingGRNs, sub: "Pending goods receipt", icon: Box, color: "bg-pink-600" },
                    { label: "Vendor Entities", value: stats.activeVendors, sub: "Registered suppliers", icon: Building2, color: "bg-slate-900" },
                ].map(k => (
                    <div key={k.label} className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-xl hover:border-pink-100 transition-all duration-300 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                            <k.icon className="w-20 h-20 -rotate-12 translate-x-4 translate-y-2" />
                        </div>
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div className={cn("p-3 rounded-xl shadow-md text-white transition-transform group-hover:scale-105", k.color)}>
                                <k.icon className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-bold  tracking-[0.1em] text-slate-400">{k.label}</span>
                        </div>
                        <div className="relative z-10">
                            <p className="text-3xl font-bold tracking-tight text-slate-900 mb-1.5 truncate">{k.value}</p>
                            <p className="text-[10px] font-semibold text-slate-400  tracking-wide leading-none">{k.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Active PO Stream */}
                <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300">
                    <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white relative">
                        <div className="absolute top-0 left-0 w-16 h-1 bg-pink-600 rounded-full ml-8" />
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-pink-50 text-pink-600 border border-pink-100">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold tracking-tight text-slate-900 leading-none">Order Lifecycle</h2>
                                <p className="text-[10px] font-bold text-slate-400  tracking-[0.1em] mt-1.5">Live procurement pipeline</p>
                            </div>
                        </div>
                        <Button variant="ghost" className="h-9 px-4 rounded-lg text-[10px] font-bold  tracking-widest text-pink-600 hover:bg-pink-50">All Orders <ArrowUpRight className="w-3 h-3 ml-2" /></Button>
                    </div>

                    <div className="p-8">
                        <div className="space-y-4">
                            {recentPOs.map(po => (
                                <div key={po.id} className="flex items-center justify-between p-5 rounded-xl border border-slate-50 hover:border-pink-100 hover:bg-slate-50/50 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-[9px] tracking-tight">
                                            {po.id}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 group-hover:text-pink-600 transition-colors">{po.vendor}</p>
                                            <div className="flex items-center gap-2 mt-0.5 text-[10px] font-medium text-slate-400">
                                                <span className={cn(
                                                    "px-1.5 py-0.5 rounded-md text-[9px] font-bold  tracking-wider border",
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
                                        <p className="text-lg font-bold text-slate-900 tracking-tight">{po.amount}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Vendor Concentration */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 rounded-2xl p-8 shadow-xl relative overflow-hidden group">
                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-pink-600/10 rounded-full blur-3xl group-hover:bg-pink-600/20 transition-all" />
                        <h2 className="text-lg font-bold text-white  tracking-wider mb-8 border-b border-white/5 pb-5">Supply Vitality</h2>
                        <div className="space-y-6 relative z-10">
                            {vendorStats.map(vendor => (
                                <div key={vendor.name} className="space-y-2.5">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400  tracking-wider leading-none mb-1">{vendor.name}</p>
                                            <span className="text-lg font-bold text-white">{vendor.amount}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] font-bold text-pink-400  tracking-tighter">{vendor.orders} Orders</span>
                                        </div>
                                    </div>
                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-pink-500 rounded-full shadow-[0_0_10px_rgba(236,72,153,0.3)] transition-all duration-1000" style={{ width: `${vendor.progress}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm hover:shadow-lg transition-all duration-300">
                        <h2 className="text-lg font-bold tracking-tight text-slate-900 mb-8 border-b border-slate-50 pb-4  tracking-wide">Procure Commands</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: "New Vendor", icon: Building2, color: "text-blue-600 bg-blue-50" },
                                { label: "Inward GRN", icon: Truck, color: "text-pink-600 bg-pink-50" },
                                { label: "3-Way Match", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
                                { label: "PO Assets", icon: FileText, color: "text-violet-600 bg-violet-50" },
                            ].map(btn => (
                                <button key={btn.label} className="p-5 rounded-xl border border-slate-50 hover:bg-slate-50/50 transition-all flex flex-col items-center gap-3 bg-white hover:shadow-md group">
                                    <div className={cn("p-2.5 rounded-lg transition-transform group-hover:scale-105", btn.color)}>
                                        <btn.icon className="w-4 h-4" />
                                    </div>
                                    <span className="text-[10px] font-bold  tracking-wider text-slate-400 group-hover:text-slate-900 transition-colors text-center">{btn.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
