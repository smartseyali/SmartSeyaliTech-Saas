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
        <div className="min-h-screen bg-slate-50/20 font-sans p-4 lg:p-6 space-y-6 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 border-l-4 border-pink-600 pl-4 uppercase">Purchase Intelligence</h1>
                    <div className="flex items-center gap-2 pl-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                        <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase leading-none">Procurement & Sourcing Hub • {activeCompany?.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 text-slate-400 hover:text-pink-600 border border-slate-200 hover:border-pink-200 bg-white">
                        <RefreshCw className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" className="h-8 px-4 bg-slate-900 hover:bg-black text-white text-[10px] font-black shadow-lg shadow-slate-900/10 uppercase tracking-widest rounded-lg">
                        <Plus className="w-3.5 h-3.5 mr-2" /> Create PO
                    </Button>
                </div>
            </div>

            {/* KPI Cards - Unified Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Outflow", value: fmt(stats.monthlySpend), sub: "Monthly Spend", icon: TrendingUp, color: "text-pink-600", bg: "bg-pink-50" },
                    { label: "Pending POs", value: stats.pendingPOs, sub: "Review Required", icon: FileText, color: "text-slate-600", bg: "bg-slate-100" },
                    { label: "GRN Backlog", value: stats.pendingGRNs, sub: "Inward Queue", icon: Box, color: "text-amber-600", bg: "bg-amber-50" },
                    { label: "Active Suppliers", value: stats.activeVendors, sub: "Primary Network", icon: Building2, color: "text-blue-600", bg: "bg-blue-50" },
                ].map(k => (
                    <div key={k.label} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between mb-3">
                            <div className={cn("p-2 rounded-lg", k.bg, k.color)}>
                                <k.icon className="w-4 h-4" />
                            </div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{k.label}</span>
                        </div>
                        <div>
                            <p className="text-xl font-black text-slate-900 tracking-tight">{k.value}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{k.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Lifecycle Table */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-3.5 bg-slate-400 rounded-full" />
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Order Lifecycle</h2>
                        </div>
                        <Button variant="ghost" size="sm" className="text-pink-600 text-[10px] font-black uppercase tracking-widest hover:bg-pink-50">Procurement Registry</Button>
                    </div>
                    <div className="p-4 space-y-3">
                        {recentPOs.map(po => (
                            <div key={po.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-pink-200 hover:bg-slate-50/50 transition-all group cursor-pointer shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-[10px] uppercase shadow-md">
                                        {po.id.slice(-4)}
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black text-slate-900 uppercase leading-none mb-1 group-hover:text-pink-600">{po.vendor}</p>
                                        <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                            <span className={cn(
                                                "px-1.5 py-0.5 rounded border leading-none bg-white",
                                                po.status === 'Approved' ? "text-emerald-600 border-emerald-100 bg-emerald-50/20" :
                                                po.status === 'Received' ? "text-blue-600 border-blue-100 bg-blue-50/20" :
                                                "text-amber-600 border-amber-100 bg-amber-50/20"
                                            )}>{po.status}</span>
                                            <span>•</span>
                                            <span>{po.time}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[13px] font-black text-slate-900 leading-none mb-1">{po.amount}</p>
                                    <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest leading-none">Verified</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Supply Card */}
                    <div className="bg-slate-900 rounded-xl p-5 text-white shadow-xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-[9px] font-black tracking-widest text-pink-400 mb-5 uppercase leading-none">Supplier Vitality</h3>
                            <div className="space-y-5">
                               {vendorStats.map(vendor => (
                                    <div key={vendor.name} className="space-y-2">
                                        <div className="flex justify-between items-center px-1">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{vendor.name}</span>
                                            <span className="text-[10px] font-black text-white">{vendor.amount}</span>
                                        </div>
                                        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-pink-500 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(236,72,153,0.5)]" style={{ width: `${vendor.progress}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Compact Command Actions */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <h3 className="text-[9px] font-black tracking-widest text-slate-400 mb-4 border-b border-slate-50 pb-2 uppercase leading-none">Procurement Hub</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { label: "New Vendor", icon: Building2, color: "text-blue-500" },
                                { label: "Inward GRN", icon: Truck, color: "text-pink-500" },
                                { label: "Compliance", icon: CheckCircle2, color: "text-emerald-500" },
                                { label: "Reports", icon: FileText, color: "text-slate-500" },
                            ].map(btn => (
                                <button key={btn.label} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex flex-col items-center gap-2 hover:bg-white hover:border-pink-200 transition-all group shadow-sm">
                                    <btn.icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", btn.color)} />
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none text-center">{btn.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
