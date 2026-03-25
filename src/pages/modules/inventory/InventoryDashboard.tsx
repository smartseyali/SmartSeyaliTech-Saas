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

    if (!activeCompany) return null;

    return (
        <div className="p-8 space-y-10 animate-in fade-in duration-500 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 uppercase tracking-wider">Inventory Hub</h1>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                        <p className="text-xs font-bold tracking-widest text-slate-500 uppercase leading-none">Logistics & Supply Chain • {activeCompany?.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-orange-600 transition-all shadow-sm">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <Button className="h-10 px-6 rounded-xl bg-orange-600 hover:bg-slate-900 text-white font-bold text-xs tracking-widest uppercase transition-all shadow-xl shadow-orange-600/20 gap-2 border-0">
                        <Plus className="w-4 h-4" /> Inward Stock
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: "Inventory Value", value: fmt(stats.totalValue), sub: "Asset valuation", icon: BarChart3, color: "bg-orange-600" },
                    { label: "Active SKUs", value: stats.totalSkus.toLocaleString(), sub: "Catalog variants", icon: Box, color: "bg-slate-900" },
                    { label: "Stock Alerts", value: stats.lowStock, sub: "Immediate action", icon: AlertTriangle, color: "bg-rose-600" },
                    { label: "Out of Stock", value: stats.outOfStock, sub: "Depleted product", icon: Package, color: "bg-slate-900" },
                ].map(k => (
                    <div key={k.label} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-xl transition-all h-64">
                        <div className="flex items-center justify-between mb-8">
                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white", k.color)}>
                                <k.icon className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold tracking-[0.1em] text-slate-500 uppercase leading-none">{k.label}</span>
                        </div>
                        <div>
                            <p className="text-4xl font-bold tracking-tight text-slate-900 mb-2">{k.value}</p>
                            <p className="text-xs font-bold text-slate-500 tracking-widest uppercase leading-none">{k.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between">
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 uppercase tracking-wider leading-none">Vulnerability Log</h2>
                        <Button variant="ghost" className="h-9 px-4 rounded-lg text-xs font-bold tracking-widest text-orange-600 uppercase hover:bg-orange-50 transition-all">Procure List</Button>
                    </div>

                    <div className="p-10 space-y-6">
                        {alerts.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-7 rounded-[2.5rem] border border-slate-50 hover:border-orange-100 hover:bg-slate-50/50 transition-all group">
                                <div className="flex items-center gap-6">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-300",
                                        item.status === 'Out of Stock' ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-orange-50 text-orange-600 border-orange-100"
                                    )}>
                                        <Package className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors uppercase text-[12px] tracking-tight leading-none">{item.product}</p>
                                        <p className="text-xs font-bold text-slate-500 tracking-widest uppercase mt-2">{item.sku}</p>
                                    </div>
                                </div>
                                <div className="text-right flex items-center gap-10">
                                    <div className="space-y-1">
                                        <p className="text-[13px] font-bold text-slate-500 uppercase tracking-widest text-right leading-none mb-1">Stock</p>
                                        <p className={cn("text-2xl font-bold tracking-tighter leading-none", item.stock <= 2 ? "text-rose-600" : "text-orange-600")}>{item.stock}</p>
                                    </div>
                                    <button className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Warehouse className="w-32 h-32 text-orange-500 -rotate-12 translate-x-12" />
                        </div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-8 border-b border-white/5 pb-6">Node Status</h2>
                        <div className="space-y-6 relative z-10 p-2">
                            {[
                                { name: "Main Warehouse", load: 78, location: "Bangalore" },
                                { name: "Dark Store", load: 92, location: "Mumbai" },
                                { name: "Regional Hub", load: 45, location: "Noida" },
                            ].map(node => (
                                <div key={node.name} className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">{node.name}</p>
                                            <span className="text-xs font-bold text-white/40 uppercase tracking-widest leading-none">{node.location}</span>
                                        </div>
                                        <span className="text-xl font-bold text-orange-500 tracking-tighter leading-none">{node.load}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-orange-500 rounded-full transition-all duration-1000" style={{ width: `${node.load}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-[3rem] border border-slate-100 p-10 shadow-sm flex flex-col items-center">
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-8 border-b border-slate-50 pb-4 tracking-wider uppercase w-full text-center">Logistics</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: "Inter-Stock", icon: ArrowRightLeft, color: "text-orange-600 bg-orange-50" },
                                { label: "Audit Scan", icon: Box, color: "text-blue-600 bg-blue-50" },
                                { label: "Batch Track", icon: Clock, color: "text-emerald-600 bg-emerald-50" },
                                { label: "Reports", icon: BarChart3, color: "text-violet-600 bg-violet-50" },
                            ].map(btn => (
                                <button key={btn.label} className="flex flex-col items-center justify-center p-6 rounded-3xl border border-slate-50 hover:bg-slate-50 transition-all gap-4 bg-white group/log shadow-sm">
                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border transition-all group-hover/log:scale-105", btn.color)}>
                                        <btn.icon className="w-4 h-4" />
                                    </div>
                                    <span className="text-[13px] font-bold tracking-widest text-slate-500 uppercase group-hover/log:text-orange-600 transition-colors text-center">{btn.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
