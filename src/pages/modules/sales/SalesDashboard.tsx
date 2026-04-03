import { useState, useEffect } from "react";
import { useTenant } from "@/contexts/TenantContext";
import {
    LayoutDashboard, Users, FileText, ShoppingBag,
    TrendingUp, ArrowUpRight, Plus, Search,
    Filter, Clock, CheckCircle2, ChevronRight,
    BarChart3, Target, Calendar, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import db from "@/lib/db";

export default function SalesDashboard() {
    const { activeCompany } = useTenant();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        monthlyRevenue: 0,
        pendingOrders: 0,
        confirmedOrders: 0,
        avgDealSize: 0
    });
    const [recentOrders, setRecentOrders] = useState<any[]>([]);

    const fetchData = async () => {
        if (!activeCompany) return;
        setLoading(true);
        try {
            // Fetch All Orders for this company
            const { data: orders, error } = await db.from('ecom_orders')
                .select('*')
                .eq('company_id', activeCompany.id)
                .order('created_at', { ascending: false });

            if (!error && orders) {
                const totalRevenue = orders.reduce((acc: number, curr: any) => acc + (Number(curr.total_amount) || 0), 0);
                const confirmed = orders.filter((o: any) => o.status === 'Confirmed' || o.status === 'Paid').length;
                const pending = orders.filter((o: any) => o.status === 'Pending' || o.status === 'Processing').length;
                const avg = orders.length > 0 ? totalRevenue / orders.length : 0;

                setStats({
                    monthlyRevenue: totalRevenue,
                    pendingOrders: pending,
                    confirmedOrders: confirmed,
                    avgDealSize: avg
                });
                setRecentOrders(orders.slice(0, 5));
            }
        } catch (err) {
            console.error("Sales data fetch failed:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeCompany]);

    const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

    return (
        <div className="min-h-screen bg-slate-50/20 font-sans p-4 lg:p-6 space-y-6 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 border-l-4 border-blue-600 pl-4 uppercase">Sales Analytics</h1>
                    <div className="flex items-center gap-2 pl-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase leading-none">Global Sales Pipeline • {activeCompany?.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={fetchData} className="h-8 w-8 text-slate-400 hover:text-blue-600 border border-slate-200 hover:border-blue-200 bg-white">
                        <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 px-3 text-[10px] font-black text-slate-500 border border-slate-200 bg-white uppercase tracking-widest">
                        <BarChart3 className="w-3.5 h-3.5 mr-2" /> Reports
                    </Button>
                    <Button size="sm" className="h-8 px-4 bg-slate-900 hover:bg-black text-white text-[10px] font-black shadow-lg shadow-slate-900/10 uppercase tracking-widest rounded-lg">
                        <Plus className="w-3.5 h-3.5 mr-2" /> New Transaction
                    </Button>
                </div>
            </div>

            {/* KPI Grid - High Density */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Gross Revenue", value: fmt(stats.monthlyRevenue), sub: "All time sales", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Pending Orders", value: stats.pendingOrders, sub: "Needs Approval", icon: FileText, color: "text-amber-600", bg: "bg-amber-50" },
                    { label: "Avg Ticket", value: fmt(stats.avgDealSize), sub: "Per Sale Avg", icon: Target, color: "text-indigo-600", bg: "bg-indigo-50" },
                    { label: "Success Rate", value: stats.confirmedOrders, sub: "Direct Conversions", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
                ].map(k => (
                    <div key={k.label} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between mb-3">
                            <div className={cn("p-2 rounded-lg", k.bg, k.color)}>
                                <k.icon className="w-4 h-4" />
                            </div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{k.label}</span>
                        </div>
                        <div>
                            <p className="text-xl font-black text-slate-900 tracking-tight">{loading ? "..." : k.value}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{k.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity Table */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-3.5 bg-slate-400 rounded-full" />
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Sales Pipeline</h2>
                        </div>
                        <Button variant="ghost" size="sm" className="text-blue-600 text-[10px] font-black uppercase tracking-widest hover:bg-blue-50">View Registry</Button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-[9px] font-black tracking-widest text-slate-400 uppercase border-b border-slate-100 bg-slate-50/10 h-10">
                                    <th className="px-5 text-left">Internal ID</th>
                                    <th className="px-5 text-left">Stakeholder</th>
                                    <th className="px-5 text-left">Valuation</th>
                                    <th className="px-5 text-left">Workflow</th>
                                    <th className="px-5 text-right">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr><td colSpan={5} className="p-10 text-center text-slate-300 font-black uppercase tracking-widest text-[10px]">Syncing Data...</td></tr>
                                ) : recentOrders.length === 0 ? (
                                    <tr><td colSpan={5} className="p-10 text-center text-slate-300 font-black uppercase tracking-widest text-[10px]">No Active Prospects</td></tr>
                                ) : (
                                    recentOrders.map(order => (
                                        <tr key={order.id} className="group hover:bg-blue-50/30 transition-all h-12 cursor-pointer">
                                            <td className="px-5 text-[11px] font-black text-slate-900">ORD-{order.order_number?.slice(-4) || order.id.slice(0, 4)}</td>
                                            <td className="px-5 text-[11px] font-bold text-slate-600">{order.customer_name || "Guest Entity"}</td>
                                            <td className="px-5 text-[11px] font-black text-slate-900">{fmt(order.total_amount || 0)}</td>
                                            <td className="px-5">
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest uppercase border",
                                                    order.status === 'Confirmed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                    order.status === 'Paid' ? "bg-blue-50 text-blue-600 border-blue-100" :
                                                    order.status === 'Processing' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                    "bg-slate-50 text-slate-400 border-slate-100"
                                                )}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-5 text-right text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sidebar Analytics */}
                <div className="space-y-4">
                    {/* Dark Card - Realization Rate */}
                    <div className="bg-slate-900 rounded-xl p-5 text-white relative overflow-hidden group shadow-xl">
                        <div className="relative z-10">
                            <h3 className="text-[9px] font-black tracking-[0.2em] text-blue-400 mb-5 uppercase leading-none">Revenue Target</h3>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-[10px] font-bold text-slate-400 leading-none">Realization Rate</span>
                                <span className="text-2xl font-black leading-none tracking-tighter">72%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-3">
                                <div className="h-full bg-blue-500 w-[72%] shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-1000" />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Target Met: ₹1.8L</span>
                                <span className="text-[9px] font-black text-emerald-400 uppercase">↑ 12%</span>
                            </div>
                        </div>
                        {/* Abstract background element */}
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-600/10 rounded-full blur-2xl group-hover:bg-blue-600/20 transition-all" />
                    </div>

                    {/* Quick Access Grid */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <h3 className="text-[9px] font-black tracking-widest text-slate-400 mb-4 border-b border-slate-50 pb-2 uppercase leading-none">Critical Actions</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { label: 'New Lead', icon: Users, color: 'text-blue-500' },
                                { label: 'Audit Log', icon: FileText, color: 'text-slate-500' },
                                { label: 'Pipeline', icon: TrendingUp, color: 'text-indigo-500' },
                                { label: 'Schedules', icon: Calendar, color: 'text-amber-500' },
                            ].map(item => (
                                <button key={item.label} className="p-3 rounded-lg border border-slate-100 flex flex-col items-center gap-2 hover:bg-slate-50 hover:border-blue-200 transition-all group bg-slate-50/50">
                                    <item.icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", item.color)} />
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none text-center">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
