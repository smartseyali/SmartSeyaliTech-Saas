import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useDictionary } from "@/hooks/useDictionary";
import { Link, useNavigate } from "react-router-dom";
import {
    ShoppingBag, TrendingUp, Package, RefreshCw, AlertCircle,
    ArrowUpRight, Clock, CheckCircle2, XCircle, Truck, RotateCcw,
    CreditCard, Tag, Star, Users, BarChart3, MapPin, Image as ImageIcon, Plus,
    ExternalLink, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Stats {
    totalOrders: number;
    todayOrders: number;
    totalRevenue: number;
    todayRevenue: number;
    pendingOrders: number;
    shippedOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    pendingRefunds: number;
    activeCoupons: number;
    avgOrderValue: number;
    pendingReviews: number;
    totalCustomers: number;
}

interface RecentOrder {
    id: number;
    order_number: string;
    customer_name: string;
    grand_total: number;
    status: string;
    payment_status: string;
    created_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700", icon: Clock },
    confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-700", icon: CheckCircle2 },
    packed: { label: "Packed", color: "bg-indigo-100 text-indigo-700", icon: Package },
    shipped: { label: "Shipped", color: "bg-purple-100 text-purple-700", icon: Truck },
    out_for_delivery: { label: "Out for Delivery", color: "bg-orange-100 text-orange-700", icon: Truck },
    delivered: { label: "Delivered", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
    cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700", icon: XCircle },
    returned: { label: "Returned", color: "bg-slate-100 text-slate-700", icon: RotateCcw },
};

export default function EcomDashboard() {
    const { activeCompany } = useTenant();
    const navigate = useNavigate();
    const { t } = useDictionary();
    const [stats, setStats] = useState<Stats | null>(null);
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { if (activeCompany) load(); }, [activeCompany]);

    const load = async () => {
        if (!activeCompany) return;
        setLoading(true);
        try {
            const today = new Date().toISOString().split("T")[0];
            const [{ data: orders }, { data: refunds }, { data: coupons }, { data: reviews }, { data: customers }] = await Promise.all([
                supabase.from("ecom_orders").select("*").eq("company_id", activeCompany.id),
                supabase.from("refunds").select("id, status").eq("company_id", activeCompany.id).eq("status", "pending"),
                supabase.from("coupons").select("id").eq("company_id", activeCompany.id).eq("is_active", true),
                supabase.from("ecom_product_reviews").select("id").eq("company_id", activeCompany.id).eq("status", "pending"),
                supabase.from("ecom_customers").select("id").eq("company_id", activeCompany.id),
            ]);

            const all = orders || [];
            const todayOrders = all.filter(o => o.created_at?.startsWith(today));
            const totalRev = all.filter(o => o.payment_status === "paid").reduce((s, o) => s + Number(o.grand_total), 0);
            const todayRev = todayOrders.filter(o => o.payment_status === "paid").reduce((s, o) => s + Number(o.grand_total), 0);

            setStats({
                totalOrders: all.length,
                todayOrders: todayOrders.length,
                totalRevenue: totalRev,
                todayRevenue: todayRev,
                pendingOrders: all.filter(o => o.status === "pending").length,
                shippedOrders: all.filter(o => o.status === "shipped" || o.status === "out_for_delivery").length,
                deliveredOrders: all.filter(o => o.status === "delivered").length,
                cancelledOrders: all.filter(o => o.status === "cancelled").length,
                pendingRefunds: (refunds || []).length,
                activeCoupons: (coupons || []).length,
                avgOrderValue: all.length ? totalRev / all.length : 0,
                pendingReviews: (reviews || []).length,
                totalCustomers: (customers || []).length,
            });

            setRecentOrders(all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 8));
        } finally { setLoading(false); }
    };

    const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

    if (!activeCompany) return null;

    return (
        <div className="min-h-screen bg-slate-50/20 font-sans p-4 lg:p-6 space-y-6 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 border-l-4 border-blue-600 pl-4 uppercase">Store Analytics</h1>
                    <div className="flex items-center gap-2 pl-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase leading-none">Global Revenue Hub • {activeCompany?.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={load} className="h-9 w-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm">
                        <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
                    </button>
                    <Link to="/apps/ecommerce/orders/new">
                        <Button className="h-9 px-5 rounded-lg bg-blue-600 hover:bg-slate-900 text-white font-bold text-[11px] tracking-widest uppercase transition-all gap-2 shadow-lg shadow-blue-500/20 border-0">
                            <Plus className="w-3.5 h-3.5" /> New Order
                        </Button>
                    </Link>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Revenue", value: fmt(stats?.totalRevenue || 0), sub: `+${fmt(stats?.todayRevenue || 0)} today`, icon: TrendingUp, color: "text-emerald-600 bg-emerald-50" },
                    { label: "Orders", value: stats?.totalOrders || 0, sub: `${stats?.todayOrders || 0} recent`, icon: ShoppingBag, color: "text-blue-600 bg-blue-50" },
                    { label: "Avg Ticket", value: fmt(stats?.avgOrderValue || 0), sub: "Efficiency", icon: BarChart3, color: "text-indigo-600 bg-indigo-50" },
                    { label: "Customers", value: stats?.totalCustomers || 0, sub: "Loyal Base", icon: Users, color: "text-rose-600 bg-rose-50" },
                ].map(k => (
                    <div key={k.label} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-200 transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", k.color)}>
                                <k.icon className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase leading-none">{k.label}</span>
                        </div>
                        <div>
                            <p className="text-2xl font-black tracking-tight text-slate-900 mb-1">{k.value}</p>
                            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase leading-none">{k.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-4 border-b border-slate-100 bg-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                            <h2 className="text-sm font-black tracking-widest text-slate-900 uppercase">Fulfillment Stream</h2>
                        </div>
                        <Link to="/apps/ecommerce/orders">
                            <Button variant="ghost" className="h-8 px-3 rounded-md text-[10px] font-bold tracking-widest text-blue-600 uppercase hover:bg-blue-50">View All</Button>
                        </Link>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                { label: "Pending", value: stats?.pendingOrders, color: "bg-amber-50 text-amber-600", icon: Clock },
                                { label: "Shipped", value: stats?.shippedOrders, color: "bg-blue-50 text-blue-600", icon: Truck },
                                { label: "Delivered", value: stats?.deliveredOrders, color: "bg-emerald-50 text-emerald-600", icon: CheckCircle2 },
                                { label: "Cancelled", value: stats?.cancelledOrders, color: "bg-rose-50 text-rose-600", icon: XCircle },
                            ].map(s => (
                                <div key={s.label} className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex items-center gap-4 group hover:bg-white hover:border-blue-200 transition-all">
                                    <div className={cn("p-2 rounded-lg", s.color)}>
                                        <s.icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-lg font-black tracking-tight text-slate-900 leading-none">{s.value || 0}</span>
                                        <p className="text-[9px] font-bold tracking-widest text-slate-400 uppercase mt-1">{s.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="rounded-xl border border-slate-100 overflow-hidden bg-white">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50/50 text-[10px] font-bold tracking-widest text-slate-400 uppercase border-b border-slate-100">
                                        <th className="px-6 py-3 text-left">Ref No</th>
                                        <th className="px-6 py-3 text-left">Customer</th>
                                        <th className="px-6 py-3 text-right">Amount</th>
                                        <th className="px-6 py-3 text-center">Status</th>
                                        <th className="px-6 py-3 text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {recentOrders.map(o => {
                                        const s = STATUS_CONFIG[o.status] || STATUS_CONFIG.pending;
                                        return (
                                            <tr key={o.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => navigate(`/apps/ecommerce/orders/${o.id}`)}>
                                                <td className="px-6 py-4">
                                                    <span className="font-bold text-blue-600 tracking-wider text-[11px] font-mono">{o.order_number}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-slate-700 truncate max-w-[120px] uppercase text-[11px] tracking-tight">{o.customer_name}</p>
                                                </td>
                                                <td className="px-6 py-4 text-right text-slate-900 font-bold font-mono text-[11px]">
                                                    {fmt(Number(o.grand_total))}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className={cn("inline-flex items-center gap-2 px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase border border-current", s.color)}>
                                                        {s.label}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(o.created_at).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' })}</p>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-slate-900 rounded-2xl p-6 shadow-xl relative overflow-hidden group border border-slate-800">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <Zap className="w-24 h-24 text-blue-500 -rotate-12 translate-x-8" />
                        </div>
                        <h2 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-6 border-b border-white/5 pb-4">Smart Shortcuts</h2>
                        <div className="grid grid-cols-2 gap-3 relative z-10">
                            {[
                                { label: "Catalog", icon: Package, link: "/apps/masters/items", color: "bg-blue-600" },
                                { label: "Gallery", icon: ImageIcon, link: "/apps/ecommerce/gallery", color: "bg-slate-800" },
                                { label: "Offers", icon: TrendingUp, link: "/apps/ecommerce/offers", color: "bg-blue-600" },
                                { label: "Payments", icon: CreditCard, link: "/apps/ecommerce/payment-gateways", color: "bg-slate-800" },
                            ].map(q => (
                                <Link key={q.label} to={q.link}
                                    className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 group/item">
                                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shadow-lg transition-transform group-hover/item:-translate-y-1 text-white", q.color)}>
                                        <q.icon className="w-4 h-4" />
                                    </div>
                                    <span className="text-[9px] font-bold tracking-[0.2em] text-slate-500 group-hover/item:text-white transition-colors text-center uppercase">{q.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col items-center text-center group hover:border-rose-200 transition-all">
                        <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <RotateCcw className="w-6 h-6" />
                        </div>
                        <h2 className="text-xs font-black text-slate-400 mb-1 uppercase tracking-widest leading-none">Refund Queue</h2>
                        <span className="text-4xl font-black text-slate-900 tracking-tighter mb-4">{stats?.pendingRefunds || 0}</span>
                        <Link to="/apps/ecommerce/refunds" className="w-full">
                            <Button className="w-full h-10 rounded-lg bg-slate-900 hover:bg-black text-white font-bold text-[10px] tracking-widest uppercase transition-all">Resolve Portal</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
