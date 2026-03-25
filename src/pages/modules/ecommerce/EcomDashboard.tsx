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

    if (!activeCompany) return null;

    return (
        <div className="p-8 space-y-10 animate-in fade-in duration-500 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 uppercase tracking-wider">Store Analytics</h1>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-xs font-bold tracking-widest text-slate-500 uppercase leading-none">Global Revenue Hub • {activeCompany?.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={load} className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-600 transition-all">
                        <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                    </button>
                    <Link to="/apps/ecommerce/orders/new">
                        <Button className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-slate-900 text-white font-bold text-xs tracking-widest uppercase transition-all gap-2 border-0">
                            <Plus className="w-4 h-4" /> New Order
                        </Button>
                    </Link>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: "Total Revenue", value: fmt(stats?.totalRevenue || 0), sub: `${fmt(stats?.todayRevenue || 0)} last 24h`, icon: TrendingUp, color: "bg-blue-600" },
                    { label: "Total Orders", value: stats?.totalOrders || 0, sub: `${stats?.todayOrders || 0} today`, icon: ShoppingBag, color: "bg-slate-900" },
                    { label: "Avg. Ticket", value: fmt(stats?.avgOrderValue || 0), sub: "Basket efficiency", icon: BarChart3, color: "bg-blue-600" },
                    { label: "Total Customers", value: stats?.totalCustomers || 0, sub: "Loyal base", icon: Users, color: "bg-slate-900" },
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
                    <div className="px-10 py-8 border-b border-slate-50 bg-white flex items-center justify-between">
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 uppercase tracking-wider leading-none">Fulfillment Stream</h2>
                        <Link to="/apps/ecommerce/orders">
                            <Button variant="ghost" className="h-9 px-4 rounded-lg text-xs font-bold tracking-widest text-blue-600 uppercase hover:bg-blue-50 transition-all">Entire Ledger</Button>
                        </Link>
                    </div>

                    <div className="p-10 space-y-10">
                        <div className="grid grid-cols-4 gap-4">
                            {[
                                { label: "Pending", value: stats?.pendingOrders, color: "bg-amber-50 text-amber-600", border: "border-amber-100", icon: Clock },
                                { label: "Shipped", value: stats?.shippedOrders, color: "bg-blue-50 text-blue-600", border: "border-blue-100", icon: Truck },
                                { label: "Delivered", value: stats?.deliveredOrders, color: "bg-emerald-50 text-emerald-600", border: "border-emerald-100", icon: CheckCircle2 },
                                { label: "Cancelled", value: stats?.cancelledOrders, color: "bg-rose-50 text-rose-600", border: "border-rose-100", icon: XCircle },
                            ].map(s => (
                                <div key={s.label} className={cn("flex flex-col gap-2 p-6 rounded-3xl border bg-white shadow-sm flex-1", s.border)}>
                                    <div className="flex items-center justify-between">
                                        <div className={cn("p-2.5 rounded-xl border fill-current", s.color)}>
                                            <s.icon className="w-4 h-4" />
                                        </div>
                                        <span className="text-2xl font-bold tracking-tight text-slate-900">{s.value || 0}</span>
                                    </div>
                                    <p className="text-xs font-bold tracking-widest text-slate-500 uppercase mt-2">{s.label}</p>
                                </div>
                            ))}
                        </div>

                        <div className="rounded-[2rem] border border-slate-50 overflow-hidden bg-white">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 text-xs font-bold tracking-widest text-slate-500 uppercase border-b border-slate-100">
                                        <th className="px-8 py-5 text-left">Document ID</th>
                                        <th className="px-8 py-5 text-left">Entity</th>
                                        <th className="px-8 py-5 text-right">Valuation</th>
                                        <th className="px-8 py-5 text-center">Status</th>
                                        <th className="px-8 py-5 text-left">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {recentOrders.map(o => {
                                        const s = STATUS_CONFIG[o.status] || STATUS_CONFIG.pending;
                                        return (
                                            <tr key={o.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => navigate(`/apps/ecommerce/orders/${o.id}`)}>
                                                <td className="px-8 py-5">
                                                    <span className="font-bold text-blue-600 tracking-widest text-xs font-mono">{o.order_number}</span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <p className="font-bold text-slate-700 truncate max-w-[150px] uppercase text-[13px] tracking-tight">{o.customer_name}</p>
                                                </td>
                                                <td className="px-8 py-5 text-right text-slate-900 font-bold font-mono text-[13px]">
                                                    {fmt(Number(o.grand_total))}
                                                </td>
                                                <td className="px-8 py-5 text-center">
                                                    <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[13px] font-bold tracking-widest uppercase border", s.color)}>
                                                        {s.label}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-left">
                                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{new Date(o.created_at).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' })}</p>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Zap className="w-32 h-32 text-blue-500 -rotate-12 translate-x-12" />
                        </div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-8 border-b border-white/5 pb-6">Shortcuts</h2>
                        <div className="grid grid-cols-2 gap-4 relative z-10">
                            {[
                                { label: "Catalog Hub", icon: Package, link: "/apps/ecommerce/masters/products", color: "bg-blue-600" },
                                { label: "Asset Vault", icon: ImageIcon, link: "/apps/ecommerce/gallery", color: "bg-white/10" },
                                { label: "Growth Engine", icon: TrendingUp, link: "/apps/ecommerce/offers", color: "bg-blue-600" },
                                { label: "Fiscal Logs", icon: CreditCard, link: "/apps/ecommerce/payment-gateways", color: "bg-white/10" },
                            ].map(q => (
                                <Link key={q.label} to={q.link}
                                    className="flex flex-col items-center justify-center gap-4 p-6 rounded-3xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 group/item">
                                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl transition-transform group-hover/item:-translate-y-1 text-white", q.color)}>
                                        <q.icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-bold tracking-widest text-slate-500 group-hover/item:text-white transition-colors text-center uppercase">{q.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-[3rem] border border-slate-100 p-10 shadow-sm flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-6">
                            <RotateCcw className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2 uppercase tracking-tight">Refund Queue</h2>
                        <p className="text-xs font-bold text-slate-500 tracking-widest uppercase mb-8">Pending Customer Reclamations</p>
                        <span className="text-5xl font-bold text-slate-900 tracking-tighter mb-8">{stats?.pendingRefunds || 0}</span>
                        <Link to="/apps/ecommerce/refunds" className="w-full">
                            <Button className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold text-xs tracking-widest uppercase">Process Matrix</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
