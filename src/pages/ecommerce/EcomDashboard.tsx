import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useDictionary } from "@/hooks/useDictionary";
import { Link } from "react-router-dom";
import {
    ShoppingBag, TrendingUp, Package, RefreshCw, AlertCircle,
    ArrowUpRight, Clock, CheckCircle2, XCircle, Truck, RotateCcw,
    CreditCard, Tag, Star, Users, BarChart3, MapPin, Image as ImageIcon, Plus,
    ExternalLink
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
    pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Clock },
    confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: CheckCircle2 },
    packed: { label: "Packed", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400", icon: Package },
    shipped: { label: "Shipped", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", icon: Truck },
    out_for_delivery: { label: "Out for Delivery", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", icon: Truck },
    delivered: { label: "Delivered", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle2 },
    cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: XCircle },
    returned: { label: "Returned", color: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400", icon: RotateCcw },
};

export default function EcomDashboard() {
    const { activeCompany } = useTenant();
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
                supabase.from("product_reviews").select("id").eq("company_id", activeCompany.id).eq("status", "pending"),
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

    if (!activeCompany) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] space-y-6 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 rounded-[2.5rem] bg-amber-100 flex items-center justify-center text-amber-600 shadow-2xl shadow-amber-200/50">
                    <AlertCircle className="w-12 h-12" />
                </div>
                <div className="space-y-4 max-w-md">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">No Active Workspace</h2>
                    <p className="text-slate-500 font-medium text-sm">We couldn't find an active company linked to your account. Please create or select a workspace to manage your store.</p>
                </div>
                <div className="flex gap-4">
                    <Button onClick={() => window.location.href = "/settings"} className="px-8 font-bold">Setup Workspace</Button>
                </div>
            </div>
        );
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <RefreshCw className="w-6 h-6 text-blue-600 animate-spin opacity-40" />
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Synchronizing Data...</p>
        </div>
    );

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100 relative">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <TrendingUp className="w-6 h-6 text-blue-600" />
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Executive Overview</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 uppercase">Commerce Intelligence</h1>
                    <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                        Operational Status: <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-bold border border-emerald-100"><span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> LIVE</span> • <span className="text-blue-600 font-bold">{activeCompany?.name}</span>
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={load} className="h-12 w-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm">
                        <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
                    </button>
                    <Link to="/ecommerce/orders/new">
                        <Button className="h-12 px-8 rounded-2xl bg-blue-600 hover:bg-black text-white font-bold shadow-xl shadow-blue-600/20 transition-all gap-3 border-0">
                            <Plus className="w-5 h-5" /> New Transaction
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Premium KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: "Gross Revenue", value: fmt(stats?.totalRevenue || 0), sub: `${fmt(stats?.todayRevenue || 0)} across 24h`, icon: TrendingUp, color: "bg-blue-600" },
                    { label: "Total Orders", value: stats?.totalOrders || 0, sub: `${stats?.todayOrders || 0} received today`, icon: ShoppingBag, color: "bg-slate-900" },
                    { label: "Avg. Ticket Size", value: fmt(stats?.avgOrderValue || 0), sub: "lifetime average", icon: BarChart3, color: "bg-blue-600" },
                    { label: "Customer Base", value: stats?.totalCustomers || 0, sub: "registered accounts", icon: Users, color: "bg-slate-900" },
                ].map(k => (
                    <div key={k.label} className="group bg-white p-10 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-2xl hover:border-blue-200 transition-all duration-500 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                            <k.icon className="w-24 h-24 -rotate-12 translate-x-8 translate-y-4" />
                        </div>
                        <div className="flex items-center justify-between mb-10 relative z-10">
                            <div className={cn("p-4 rounded-2xl shadow-lg shadow-blue-600/5 text-white transition-transform group-hover:scale-110", k.color)}>
                                <k.icon className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">{k.label}</span>
                        </div>
                        <div className="relative z-10">
                            <p className="text-4xl font-bold tracking-tight text-slate-900 mb-2 truncate">{k.value}</p>
                            <div className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{k.sub}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Performance Pipeline */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-500">
                    <div className="px-10 py-8 border-b border-slate-50 bg-white flex items-center justify-between relative">
                        <div className="absolute top-0 left-0 w-24 h-1 bg-blue-600 rounded-full ml-10" />
                        <div className="flex items-center gap-5">
                            <div className="p-4 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight text-slate-900 leading-none">Fulfillment Protocol</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Real-time logistic stream</p>
                            </div>
                        </div>
                        <Link to="/ecommerce/orders">
                            <Button variant="ghost" className="h-11 px-6 rounded-xl text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all">Audit All Orders <ExternalLink className="w-4 h-4 ml-2" /></Button>
                        </Link>
                    </div>

                    <div className="p-10 space-y-12 flex-1">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[
                                { label: "Incoming", value: stats?.pendingOrders, color: "bg-blue-50 text-blue-600", border: "border-blue-100", icon: Clock },
                                { label: "In Transit", value: stats?.shippedOrders, color: "bg-amber-50 text-amber-600", border: "border-amber-100", icon: Truck },
                                { label: "Fulfilled", value: stats?.deliveredOrders, color: "bg-emerald-50 text-emerald-600", border: "border-emerald-100", icon: CheckCircle2 },
                                { label: "Failed", value: stats?.cancelledOrders, color: "bg-rose-50 text-rose-600", border: "border-rose-100", icon: XCircle },
                            ].map(s => (
                                <div key={s.label} className={cn("flex flex-col gap-2 p-6 rounded-3xl border bg-white shadow-sm transition-all hover:shadow-xl group relative overflow-hidden", s.border)}>
                                    <div className="flex items-center justify-between relative z-10">
                                        <div className={cn("p-2.5 rounded-xl border shadow-inner", s.color)}>
                                            <s.icon className="w-4 h-4" />
                                        </div>
                                        <span className="text-3xl font-bold tracking-tight text-slate-900 group-hover:scale-110 transition-transform">{s.value || 0}</span>
                                    </div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 relative z-10 mt-2">{s.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Recent Orders Table */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-300 ml-1">Live Transaction Ledger</h3>
                            <div className="rounded-[32px] border border-slate-50 overflow-hidden bg-white shadow-inner">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100">
                                            <th className="px-8 py-5 text-left">Internal Ref</th>
                                            <th className="px-8 py-5 text-left">Client Entity</th>
                                            <th className="px-8 py-5 text-right">Settlement</th>
                                            <th className="px-8 py-5 text-center">Protocol Status</th>
                                            <th className="px-8 py-5 text-left">Timestamp</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {recentOrders.map(o => {
                                            const s = STATUS_CONFIG[o.status] || STATUS_CONFIG.pending;
                                            return (
                                                <tr key={o.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => window.location.href = `/ecommerce/orders/${o.id}`}>
                                                    <td className="px-8 py-4">
                                                        <span className="font-bold text-blue-600 group-hover:underline uppercase tracking-widest text-xs font-mono">{o.order_number}</span>
                                                    </td>
                                                    <td className="px-8 py-4">
                                                        <p className="font-bold text-slate-700 truncate max-w-[150px]">{o.customer_name}</p>
                                                    </td>
                                                    <td className="px-8 py-4 text-right text-slate-900 font-bold font-mono">
                                                        {fmt(Number(o.grand_total))}
                                                    </td>
                                                    <td className="px-8 py-4 text-center">
                                                        <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-bold uppercase border shadow-sm", s.color.replace('dark:', ''))}>
                                                            <s.icon className="w-3 h-3" /> {s.label}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-4">
                                                        <p className="text-[10px] font-bold text-slate-400 italic">{new Date(o.created_at).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' })}</p>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    {/* Operational Alerts */}
                    <div className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm hover:shadow-2xl transition-all duration-500">
                        <div className="flex items-center justify-between mb-10 border-b border-slate-50 pb-6 relative">
                            <div className="absolute top-0 left-0 w-12 h-1 bg-rose-500 rounded-full" />
                            <h2 className="text-xl font-bold tracking-tight text-slate-900">Task Backlog</h2>
                            <span className="text-[10px] font-bold bg-rose-50 text-rose-600 px-3 py-1 rounded-full border border-rose-100">CRITICAL</span>
                        </div>
                        <div className="space-y-5">
                            {[
                                { label: "Disbursement Requests", value: stats?.pendingRefunds || 0, icon: RotateCcw, color: "text-rose-600 bg-rose-50", border: "border-rose-100", link: "/ecommerce/refunds", urgent: (stats?.pendingRefunds || 0) > 0 },
                                { label: "Product Testimonials", value: stats?.pendingReviews || 0, icon: Star, color: "text-amber-600 bg-amber-50", border: "border-amber-100", link: "/ecommerce/reviews", urgent: (stats?.pendingReviews || 0) > 0 },
                                { label: "Abandoned Sessions", value: "8 Active", icon: Users, color: "text-blue-600 bg-blue-50", border: "border-blue-100", link: "/ecommerce/abandoned-carts", urgent: true },
                            ].map(a => (
                                <Link key={a.label} to={a.link}
                                    className={cn(
                                        "relative group flex items-center justify-between p-6 rounded-3xl border transition-all duration-300 hover:shadow-xl bg-white",
                                        a.urgent ? `${a.border} border-l-4` : "border-slate-50 opacity-50 grayscale"
                                    )}>
                                    <div className="flex items-center gap-5">
                                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-inner border", a.color)}>
                                            <a.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">{a.label}</p>
                                            <p className="text-2xl font-bold tracking-tight text-slate-900">{a.value}</p>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-slate-100">
                                        <ArrowUpRight className="w-5 h-5 text-blue-600" />
                                    </div>
                                    {a.urgent && (
                                        <div className="absolute top-3 right-3 flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                                        </div>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Fast Navigation */}
                    <div className="bg-slate-900 rounded-[40px] p-10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-all" />
                        <h2 className="text-xl font-bold tracking-tight text-white mb-10 border-b border-white/5 pb-6">Shortcuts</h2>
                        <div className="grid grid-cols-2 gap-5 relative z-10">
                            {[
                                { label: "Zones", icon: MapPin, link: "/ecommerce/shipping-zones", color: "bg-blue-600 shadow-blue-600/30" },
                                { label: "Assets", icon: ImageIcon, link: "/ecommerce/gallery", color: "bg-white/10 shadow-white/5 border border-white/10" },
                                { label: "Growth", icon: TrendingUp, link: "/ecommerce/offers", color: "bg-blue-600 shadow-blue-600/30" },
                                { label: "Finance", icon: CreditCard, link: "/ecommerce/payment-gateways", color: "bg-white/10 shadow-white/5 border border-white/10" },
                                { label: "Fleet", icon: Truck, link: "/ecommerce/deliveries", color: "bg-blue-600 shadow-blue-600/30" },
                                { label: "Vitals", icon: BarChart3, link: "/ecommerce/reports", color: "bg-white/10 shadow-white/5 border border-white/10" },
                            ].map(q => (
                                <Link key={q.label} to={q.link}
                                    className="flex flex-col items-center justify-center gap-4 p-6 rounded-[28px] bg-white/5 hover:bg-white transition-all duration-500 group shadow-sm border border-white/5 hover:border-white">
                                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:-translate-y-2 transition-transform text-white group-hover:text-white", q.color, q.label === "Assets" || q.label === "Finance" || q.label === "Vitals" ? "group-hover:bg-black" : "")}>
                                        <q.icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500 group-hover:text-black transition-colors text-center">{q.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

