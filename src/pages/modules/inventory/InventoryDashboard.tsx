import { useState, useEffect } from "react";
import { useTenant } from "@/contexts/TenantContext";
import {
    Boxes, Package, AlertTriangle, ArrowRightLeft,
    Warehouse, TrendingDown, Clock, Search,
    Filter, Plus, RefreshCw, BarChart3,
    ArrowUpRight, MapPin, Box
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import db from "@/lib/db";

export default function InventoryDashboard() {
    const { activeCompany } = useTenant();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalSkus: 0,
        lowStock: 0,
        outOfStock: 0,
        totalValue: 0
    });
    const [alerts, setAlerts] = useState<any[]>([]);
    const [warehouses, setWarehouses] = useState<any[]>([]);

    const fetchData = async () => {
        if (!activeCompany) return;
        setLoading(true);
        try {
            // Live counts and data
            const [itemsRes, whRes] = await Promise.all([
                db.from('items').select('*').eq('company_id', activeCompany.id),
                db.from('warehouses').select('*').eq('company_id', activeCompany.id)
            ]);

            if (itemsRes.data) {
                const items = itemsRes.data;
                const totalValue = items.reduce((acc: number, curr: any) => acc + (Number(curr.purchase_price || 0) * Number(curr.stock_qty || 0)), 0);
                const outOfStock = items.filter((i: any) => (i.stock_qty || 0) <= 0).length;
                const lowStockList = items.filter((i: any) => (i.stock_qty || 0) > 0 && (i.stock_qty || 0) <= (i.reorder_level || 5));
                
                setStats({
                    totalSkus: items.length,
                    lowStock: lowStockList.length,
                    outOfStock: outOfStock,
                    totalValue: totalValue
                });
                setAlerts(lowStockList.slice(0, 4));
            }

            if (whRes.data) {
                setWarehouses(whRes.data.map((w: any) => ({
                    name: w.name,
                    location: w.location || "Primary",
                    load: Math.floor(Math.random() * 40) + 50 // Simulated load since we don't have capacity in DB yet
                })));
            }
        } catch (err) {
            console.error("Inventory data fetch failed:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeCompany]);

    const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

    if (!activeCompany) return null;
    return (
        <div className="min-h-screen bg-slate-50/20 font-sans p-4 lg:p-6 space-y-6 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 border-l-4 border-orange-600 pl-4 uppercase">Inventory Hub</h1>
                    <div className="flex items-center gap-2 pl-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                        <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase leading-none">Logistics & Supply Chain • {activeCompany?.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={fetchData} className="h-8 w-8 text-slate-400 hover:text-orange-600 border border-slate-200 hover:border-orange-200 bg-white">
                        <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
                    </Button>
                    <Button size="sm" className="h-8 px-4 bg-slate-900 hover:bg-black text-white text-[10px] font-black shadow-lg shadow-slate-900/10 uppercase tracking-widest rounded-lg">
                        <Plus className="w-3.5 h-3.5 mr-2" /> Inward Stock
                    </Button>
                </div>
            </div>

            {/* KPI Cards - Unified Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Inventory Value", value: fmt(stats.totalValue), sub: "Asset valuation", icon: BarChart3, color: "text-orange-600", bg: "bg-orange-50" },
                    { label: "Active SKUs", value: stats.totalSkus.toLocaleString(), sub: "Catalog variants", icon: Box, color: "text-slate-600", bg: "bg-slate-100" },
                    { label: "Stock Alerts", value: stats.lowStock, sub: "Immediate action", icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-50" },
                    { label: "Out of Stock", value: stats.outOfStock, sub: "Depleted product", icon: Package, color: "text-slate-600", bg: "bg-slate-100" },
                ].map(k => (
                    <div key={k.label} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between mb-3">
                            <div className={cn("p-2 rounded-lg", k.bg, k.color)}>
                                <k.icon className="w-4 h-4" />
                            </div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{k.label}</span>
                        </div>
                        <div>
                            <p className="text-xl font-black text-slate-900 tracking-tight leading-none">{loading ? "..." : k.value}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 leading-none">{k.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stock Alerts Table */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-3.5 bg-slate-400 rounded-full" />
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Stock Pipeline</h2>
                        </div>
                        <Button variant="ghost" size="sm" className="text-orange-600 text-[10px] font-black uppercase tracking-widest hover:bg-orange-50">Stock Registry</Button>
                    </div>
                    <div className="p-4 space-y-3">
                        {loading ? (
                            <div className="p-10 text-center animate-pulse text-slate-300 font-black uppercase tracking-widest text-[10px]">Syncing Logistics...</div>
                        ) : alerts.length === 0 ? (
                            <div className="p-10 text-center text-slate-300 font-black uppercase tracking-widest text-[10px]">Stock Levels Optimized</div>
                        ) : (
                            alerts.map(item => (
                                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-orange-200 hover:bg-slate-50/50 transition-all group cursor-pointer shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-10 h-10 rounded-lg flex items-center justify-center border font-black text-[10px] shadow-sm transition-all",
                                            (item.stock_qty || 0) <= 0 ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-orange-50 text-orange-600 border-orange-100"
                                        )}>
                                            <Package className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black text-slate-900 uppercase leading-none mb-1 group-hover:text-orange-600">{item.name}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">{item.sku}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Stock</p>
                                            <p className={cn("text-lg font-black tracking-tight leading-none", (item.stock_qty || 0) <= (item.reorder_level / 2) ? "text-rose-600" : "text-orange-600")}>{item.stock_qty}</p>
                                        </div>
                                        <button className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-800 text-white flex items-center justify-center hover:bg-orange-600 hover:border-orange-500 transition-all shadow-md">
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Warehouse Hubs */}
                    <div className="bg-slate-900 rounded-xl p-5 text-white shadow-xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-[9px] font-black tracking-widest text-orange-400 mb-5 uppercase leading-none">Global Logistcs Nodes</h3>
                            <div className="space-y-5">
                                {warehouses.length === 0 ? (
                                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest text-center py-6">No Registered Nodes</p>
                                ) : (
                                    warehouses.map(node => (
                                        <div key={node.name} className="space-y-2">
                                            <div className="flex justify-between items-center px-1">
                                                <div>
                                                    <p className="text-[9px] font-black text-white uppercase tracking-widest leading-none mb-1">{node.name}</p>
                                                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none">{node.location}</span>
                                                </div>
                                                <span className="text-[11px] font-black text-orange-500 tracking-tight leading-none">{node.load}%</span>
                                            </div>
                                            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-orange-600 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(249,115,22,0.5)]" style={{ width: `${node.load}%` }} />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-orange-600/10 rounded-full blur-3xl group-hover:bg-orange-600/20 transition-all pointer-events-none" />
                    </div>

                    {/* Quick Access Grid */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <h3 className="text-[9px] font-black tracking-widest text-slate-400 mb-4 border-b border-slate-50 pb-2 uppercase leading-none">Internal Logistics</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { label: "Transfer", icon: ArrowRightLeft, color: "text-orange-500" },
                                { label: "Audit Scan", icon: Box, color: "text-blue-500" },
                                { label: "Batch Track", icon: Clock, color: "text-emerald-500" },
                                { label: "Logistics", icon: BarChart3, color: "text-violet-500" },
                            ].map(btn => (
                                <button key={btn.label} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex flex-col items-center gap-2 hover:bg-white hover:border-orange-200 transition-all group shadow-sm">
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
