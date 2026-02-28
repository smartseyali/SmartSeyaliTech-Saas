import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { Link } from "react-router-dom";
import {
    ShoppingBag, TrendingUp, Package, RefreshCw, AlertCircle,
    ArrowUpRight, Clock, CheckCircle2, XCircle, Truck, RotateCcw,
    CreditCard, Tag, Star, Users, BarChart3, MapPin, Image as ImageIcon, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
    const [stats, setStats] = useState<Stats | null>(null);
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { if (activeCompany) load(); }, [activeCompany]);

    const load = async () => {
        if (!activeCompany) return;
        setLoading(true);
        try {
            const today = new Date().toISOString().split("T")[0];

            const [{ data: orders }, { data: refunds }, { data: coupons }, { data: reviews }] = await Promise.all([
                supabase.from("ecom_orders").select("*").eq("company_id", activeCompany.id),
                supabase.from("refunds").select("id, status").eq("company_id", activeCompany.id).eq("status", "pending"),
                supabase.from("coupons").select("id").eq("company_id", activeCompany.id).eq("is_active", true),
                supabase.from("product_reviews").select("id").eq("company_id", activeCompany.id).eq("status", "pending"),
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
                <div className="space-y-2 max-w-md">
                    <h2 className="text-3xl font-black tracking-tight">No Active Workspace</h2>
                    <p className="text-muted-foreground font-medium">We couldn't find an active company linked to your account. Please create or select a workspace to manage your store.</p>
                </div>
                <div className="flex gap-4">
                    <Button onClick={() => window.location.href = "/settings"} className="rounded-xl font-black uppercase tracking-widest px-8">Setup Workspace</Button>
                </div>
            </div>
        );
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <RefreshCw className="w-8 h-8 text-primary animate-spin opacity-20" />
            <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40">Synchronizing Data...</p>
        </div>
    );

    return (
        <div className="space-y-10 w-full pb-16 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-foreground">Ecommerce <span className="text-primary italic">Intelligence</span></h1>
                    <p className="text-muted-foreground text-sm font-medium mt-1 uppercase tracking-widest opacity-70">
                        Operational Overview • <strong>{activeCompany?.name}</strong>
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={load}
                        className="h-12 px-6 rounded-2xl border-2 border-border bg-background font-bold text-sm hover:bg-secondary hover:scale-105 transition-all flex items-center gap-2 shadow-sm">
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh Data
                    </button>
                    <Link to="/ecommerce/orders/new"
                        className="h-12 px-8 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/25 flex items-center gap-3">
                        <Plus className="w-4 h-4" /> Create Order
                    </Link>
                </div>
            </div>

            {/* Premium KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Gross Revenue", value: fmt(stats?.totalRevenue || 0), sub: `${fmt(stats?.todayRevenue || 0)} contribution today`, icon: TrendingUp, color: "from-emerald-500 to-teal-600", shadow: "shadow-emerald-500/20" },
                    { label: "Volume of Sales", value: stats?.totalOrders || 0, sub: `${stats?.todayOrders || 0} relative growth today`, icon: ShoppingBag, color: "from-blue-500 to-indigo-600", shadow: "shadow-blue-500/20" },
                    { label: "Basket Average", value: fmt(stats?.avgOrderValue || 0), sub: "standard ticket size", icon: BarChart3, color: "from-purple-500 to-fuchsia-600", shadow: "shadow-purple-500/20" },
                    { label: "Marketing Hooks", value: stats?.activeCoupons || 0, sub: "active promotional codes", icon: Tag, color: "from-orange-500 to-amber-600", shadow: "shadow-orange-500/20" },
                ].map(k => (
                    <div key={k.label} className={`relative group p-1 rounded-[2rem] bg-gradient-to-br ${k.color} ${k.shadow} hover:scale-105 transition-all duration-500 cursor-default`}>
                        <div className="bg-card rounded-[1.8rem] p-6 h-full flex flex-col justify-between overflow-hidden">
                            <div className="absolute -right-4 -top-4 opacity-[0.05] group-hover:scale-125 transition-transform duration-700">
                                <k.icon className="w-24 h-24" />
                            </div>
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{k.label}</p>
                                <div className={`p-2 rounded-xl bg-gradient-to-br ${k.color} text-white shadow-lg`}>
                                    <k.icon className="w-4 h-4" />
                                </div>
                            </div>
                            <div>
                                <p className="text-3xl font-black tracking-tighter mb-1">{k.value}</p>
                                <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tight">{k.sub}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Performance Pipeline */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 bg-card rounded-[2.5rem] border border-border/40 p-1 shadow-xl shadow-primary/5">
                    <div className="p-8 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-black tracking-tight">Fulfillment Pipeline</h2>
                            </div>
                            <Link to="/ecommerce/orders" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline bg-primary/5 px-4 py-2 rounded-full transition-all">
                                View Full Console
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                            {[
                                { label: "Awaiting Action", value: stats?.pendingOrders, color: "border-amber-400 text-amber-600 bg-amber-500/5", icon: Clock },
                                { label: "Transit Phase", value: stats?.shippedOrders, color: "border-indigo-400 text-indigo-600 bg-indigo-500/5", icon: Truck },
                                { label: "Successful", value: stats?.deliveredOrders, color: "border-emerald-400 text-emerald-600 bg-emerald-500/5", icon: CheckCircle2 },
                                { label: "System Loss", value: stats?.cancelledOrders, color: "border-rose-400 text-rose-600 bg-rose-500/5", icon: XCircle },
                            ].map(s => (
                                <div key={s.label} className={`flex flex-col gap-1 p-5 rounded-3xl border-l-4 shadow-sm transition-all hover:shadow-md ${s.color}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <s.icon className="w-4 h-4 opacity-40" />
                                        <span className="text-2xl font-black tracking-tighter">{s.value || 0}</span>
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-wider opacity-60">{s.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Recent Orders Table */}
                        <div className="flex-1 overflow-hidden min-h-[400px]">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-4 ml-1">Live Activity Stream</h3>
                            <div className="rounded-3xl border border-border/40 overflow-hidden bg-secondary/5">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-secondary/20 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border/20">
                                            <th className="px-6 py-4 text-left">Internal Ref</th>
                                            <th className="px-6 py-4 text-left">Customer</th>
                                            <th className="px-6 py-4 text-right">Value</th>
                                            <th className="px-6 py-4 text-center">Fulfillment</th>
                                            <th className="px-6 py-4 text-left">Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/10">
                                        {recentOrders.map(o => {
                                            const s = STATUS_CONFIG[o.status] || STATUS_CONFIG.pending;
                                            return (
                                                <tr key={o.id} className="hover:bg-primary/5 transition-colors group cursor-pointer" onClick={() => window.location.href = `/ecommerce/orders/${o.id}`}>
                                                    <td className="px-6 py-4">
                                                        <span className="font-bold text-primary group-hover:underline uppercase tracking-tight">{o.order_number}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="font-bold text-foreground truncate max-w-[120px]">{o.customer_name}</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className="font-black font-mono text-xs">{fmt(Number(o.grand_total))}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border shadow-sm ${s.color}`}>
                                                            <s.icon className="w-3 h-3" /> {s.label}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-[10px] font-bold text-muted-foreground opacity-60 italic">{new Date(o.created_at).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' })}</p>
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
                    <div className="bg-card rounded-[2.5rem] border border-border/40 p-8 shadow-xl shadow-primary/5">
                        <h2 className="text-xl font-black tracking-tight mb-8">Priority Queue</h2>
                        <div className="space-y-4">
                            {[
                                { label: "Disbursement Requests", value: stats?.pendingRefunds || 0, icon: RotateCcw, color: "text-rose-500 bg-rose-100/50", border: "border-rose-100", link: "/ecommerce/refunds", urgent: (stats?.pendingRefunds || 0) > 0 },
                                { label: "Product Testimonials", value: stats?.pendingReviews || 0, icon: Star, color: "text-amber-500 bg-amber-100/50", border: "border-amber-100", link: "/ecommerce/reviews", urgent: (stats?.pendingReviews || 0) > 0 },
                                { label: "Abandoned Carts", value: "8 Active", icon: Users, color: "text-indigo-500 bg-indigo-100/50", border: "border-indigo-100", link: "/ecommerce/abandoned-carts", urgent: true },
                            ].map(a => (
                                <Link key={a.label} to={a.link}
                                    className={`relative group flex items-center justify-between p-5 rounded-3xl border-2 transition-all hover:scale-105 active:scale-95 ${a.urgent ? `${a.border} bg-white dark:bg-card shadow-lg` : "border-border/30 grayscale hover:grayscale-0"
                                        }`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${a.color}`}>
                                            <a.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{a.label}</p>
                                            <p className={`text-xl font-black tracking-tighter ${a.urgent ? "text-foreground" : "text-muted-foreground"}`}>{a.value}</p>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowUpRight className="w-4 h-4 text-primary" />
                                    </div>
                                    {a.urgent && (
                                        <div className="absolute -top-1 -right-1 flex h-4 w-4">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                                        </div>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Fast Navigation */}
                    <div className="bg-card rounded-[2.5rem] border border-border/40 p-8 shadow-xl shadow-primary/5">
                        <h2 className="text-xl font-black tracking-tight mb-8">Service Console</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: "Zones", icon: MapPin, link: "/ecommerce/shipping-zones", color: "bg-indigo-500" },
                                { label: "Gallery", icon: ImageIcon, link: "/ecommerce/gallery", color: "bg-teal-500" },
                                { label: "Offers", icon: TrendingUp, link: "/ecommerce/offers", color: "bg-pink-500" },
                                { label: "Vault", icon: CreditCard, link: "/ecommerce/payment-gateways", color: "bg-emerald-500" },
                                { label: "Logistics", icon: Truck, link: "/ecommerce/deliveries", color: "bg-purple-500" },
                                { label: "Returns", icon: RotateCcw, link: "/ecommerce/refunds", color: "bg-rose-500" },
                            ].map(q => (
                                <Link key={q.label} to={q.link}
                                    className="flex flex-col items-center justify-center gap-3 p-5 rounded-[2rem] border border-border/40 hover:bg-secondary/40 hover:border-primary/20 transition-all group overflow-hidden relative">
                                    <div className={`absolute inset-0 bg-gradient-to-br ${q.color} opacity-0 group-hover:opacity-[0.03] transition-opacity`} />
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform ${q.color} text-white`}>
                                        <q.icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors text-center">{q.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

