import { useState } from "react";
import { useTenant } from "@/contexts/TenantContext";
import {
    Boxes, Package, AlertTriangle, ArrowRightLeft,
    Warehouse, TrendingDown, Clock, Search,
    Filter, Plus, RefreshCw, BarChart3,
    ArrowUpRight, MapPin, Box
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function InventoryDashboard() {
    const { activeCompany } = useTenant();

    const stats = {
        totalSkus: 4820,
        lowStock: 12,
        outOfStock: 4,
        totalValue: 5840000
    };

    const alerts = [
        { id: "1", product: "Organic Arabica Coffee", sku: "BF-COF-001", stock: 2, limit: 10, status: 'Critical' },
        { id: "2", product: "Stainless Steel Tumbler", sku: "HW-TUM-042", stock: 5, limit: 20, status: 'Low' },
        { id: "3", product: "Eco-Friendly Yoga Mat", sku: "SP-MAT-105", stock: 0, limit: 15, status: 'Out of Stock' },
    ];

    const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100 relative">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <Boxes className="w-5 h-5 text-orange-600" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Logistics & Supply Chain</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Inventory Control</h1>
                    <div className="flex items-center gap-2">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-orange-50 text-orange-600 rounded-md text-[9px] font-bold border border-orange-100">
                            <span className="w-1 h-1 rounded-full bg-orange-500 animate-pulse" />
                            REPLENISHING
                        </div>
                        <span className="text-slate-300 text-xs">•</span>
                        <span className="text-slate-500 font-medium text-xs">{activeCompany?.name}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-orange-600 transition-all shadow-sm">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <Button className="h-10 px-6 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm shadow-lg shadow-orange-500/20 transition-all gap-2 border-0">
                        <Plus className="w-4 h-4" /> Inward Stock
                    </Button>
                </div>
            </div>

            {/* Premium KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: "Inventory Value", value: fmt(stats.totalValue), sub: "Asset valuation", icon: BarChart3, color: "bg-orange-600" },
                    { label: "Active SKUs", value: stats.totalSkus.toLocaleString(), sub: "Catalog variants", icon: Box, color: "bg-slate-900" },
                    { label: "Stock Alerts", value: stats.lowStock, sub: "Immediate action required", icon: AlertTriangle, color: "bg-rose-600" },
                    { label: "Out of Stock", value: stats.outOfStock, sub: "Depleted product lines", icon: Package, color: "bg-slate-900" },
                ].map(k => (
                    <div key={k.label} className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-xl hover:border-orange-100 transition-all duration-300 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                            <k.icon className="w-20 h-20 -rotate-12 translate-x-4 translate-y-2" />
                        </div>
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div className={cn("p-3 rounded-xl shadow-md text-white transition-transform group-hover:scale-105", k.color)}>
                                <k.icon className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">{k.label}</span>
                        </div>
                        <div className="relative z-10">
                            <p className="text-3xl font-bold tracking-tight text-slate-900 mb-1.5 truncate">{k.value}</p>
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide leading-none">{k.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Critical Stock Alerts */}
                <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300">
                    <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white relative">
                        <div className="absolute top-0 left-0 w-16 h-1 bg-orange-600 rounded-full ml-8" />
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-orange-50 text-orange-600 border border-orange-100">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold tracking-tight text-slate-900 leading-none">Vulnerability Report</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mt-1.5">Critical depletion alerts</p>
                            </div>
                        </div>
                        <Button variant="ghost" className="h-9 px-4 rounded-lg text-[10px] font-bold uppercase tracking-widest text-orange-600 hover:bg-orange-50">Procurement List <ArrowUpRight className="w-3 h-3 ml-2" /></Button>
                    </div>

                    <div className="p-8">
                        <div className="space-y-6">
                            {alerts.map(item => (
                                <div key={item.id} className="flex items-center justify-between p-6 rounded-3xl border border-slate-50 hover:border-orange-100 hover:bg-slate-50/50 transition-all group">
                                    <div className="flex items-center gap-5">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center border",
                                            item.status === 'Out of Stock' ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-orange-50 text-orange-600 border-orange-100"
                                        )}>
                                            <Package className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{item.product}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{item.sku}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex items-center gap-10">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Available</p>
                                            <p className={cn("text-xl font-bold tracking-tight", item.stock <= 2 ? "text-rose-600" : "text-orange-600")}>{item.stock}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Min Limit</p>
                                            <p className="text-xl font-bold text-slate-900 tracking-tight">{item.limit}</p>
                                        </div>
                                        <button className="h-10 w-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-lg shadow-orange-600/20 hover:scale-110 transition-transform">
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Warehouse Stats */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 rounded-2xl p-8 shadow-xl relative overflow-hidden group">
                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-orange-600/10 rounded-full blur-3xl group-hover:bg-orange-600/20 transition-all" />
                        <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-8 border-b border-white/5 pb-5">Node Distribution</h2>
                        <div className="space-y-6 relative z-10">
                            {[
                                { name: "Main Warehouse", load: 78, location: "Bangalore South" },
                                { name: "Urban Dark Store", load: 92, location: "Mumbai Central" },
                                { name: "Regional Hub", load: 45, location: "Noida Sec-62" },
                            ].map(node => (
                                <div key={node.name} className="space-y-2.5">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">{node.name}</p>
                                            <div className="flex items-center gap-1.5 opacity-60">
                                                <MapPin className="w-3 h-3 text-orange-400" />
                                                <span className="text-[9px] font-medium text-white/50 uppercase tracking-widest">{node.location}</span>
                                            </div>
                                        </div>
                                        <span className="text-lg font-black text-orange-500">{node.load}%</span>
                                    </div>
                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.3)] transition-all duration-1000" style={{ width: `${node.load}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm hover:shadow-lg transition-all duration-300">
                        <h2 className="text-lg font-bold tracking-tight text-slate-900 mb-8 border-b border-slate-50 pb-4 uppercase tracking-wide">Quick Logistics</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: "Inter-Stock", icon: ArrowRightLeft, color: "text-orange-600 bg-orange-50" },
                                { label: "Audit Scan", icon: Box, color: "text-blue-600 bg-blue-50" },
                                { label: "Batch Track", icon: Clock, color: "text-emerald-600 bg-emerald-50" },
                                { label: "Insights", icon: BarChart3, color: "text-violet-600 bg-violet-50" },
                            ].map(btn => (
                                <button key={btn.label} className="p-5 rounded-xl border border-slate-50 hover:bg-slate-50/50 transition-all flex flex-col items-center gap-3 bg-white hover:shadow-md group">
                                    <div className={cn("p-2.5 rounded-lg transition-transform group-hover:scale-105", btn.color)}>
                                        <btn.icon className="w-4 h-4" />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-900 transition-colors">{btn.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
