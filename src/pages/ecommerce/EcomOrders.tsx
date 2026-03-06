import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useDictionary } from "@/hooks/useDictionary";
import { Link, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
    Search, Filter, Plus, Eye, Truck, CheckCircle2,
    XCircle, Clock, Package, RotateCcw, RefreshCw, Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STATUSES = [
    { key: "all", label: "All", color: "bg-secondary text-foreground" },
    { key: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
    { key: "confirmed", label: "Confirmed", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    { key: "packed", label: "Packed", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" },
    { key: "shipped", label: "Shipped", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
    { key: "out_for_delivery", label: "Out for Delivery", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
    { key: "delivered", label: "Delivered", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    { key: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
    { key: "returned", label: "Returned", color: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400" },
];

const NEXT_STATUS: Record<string, string> = {
    pending: "confirmed", confirmed: "packed", packed: "shipped",
    shipped: "out_for_delivery", out_for_delivery: "delivered",
};

export default function EcomOrders() {
    const { activeCompany } = useTenant();
    const { t } = useDictionary();
    const { toast } = useToast();
    const [searchParams, setSearchParams] = useSearchParams();
    const [orders, setOrders] = useState<any[]>([]);
    const [filtered, setFiltered] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [activeStatus, setActiveStatus] = useState(searchParams.get("status") || "all");
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    useEffect(() => { if (activeCompany) load(); }, [activeCompany]);
    useEffect(() => { applyFilter(); }, [orders, search, activeStatus]);

    const load = async () => {
        if (!activeCompany) return;
        setLoading(true);
        const { data } = await supabase.from("ecom_orders").select("*")
            .eq("company_id", activeCompany.id).order("created_at", { ascending: false });
        setOrders(data || []);
        setLoading(false);
    };

    const applyFilter = () => {
        let f = orders;
        if (activeStatus !== "all") f = f.filter(o => o.status === activeStatus);
        if (search) f = f.filter(o =>
            o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
            o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
            o.customer_phone?.includes(search)
        );
        setFiltered(f);
    };

    const advanceStatus = async (order: any) => {
        const next = NEXT_STATUS[order.status];
        if (!next) return;
        setUpdatingId(order.id);
        try {
            await supabase.from("ecom_orders").update({ status: next, updated_at: new Date().toISOString() }).eq("id", order.id);
            await supabase.from("ecom_order_timeline").insert([{
                order_id: order.id, status: next, note: `Status updated to ${next}`, created_by: "admin"
            }]);
            toast({ title: `${t("Order")} ${order.order_number} → ${next}` });
            load();
        } finally { setUpdatingId(null); }
    };

    const cancelOrder = async (order: any) => {
        if (!confirm(`Cancel ${t("Order").toLowerCase()} ${order.order_number}?`)) return;
        await supabase.from("ecom_orders").update({ status: "cancelled" }).eq("id", order.id);
        await supabase.from("ecom_order_timeline").insert([{ order_id: order.id, status: "cancelled", note: `${t("Order")} cancelled by admin` }]);
        toast({ title: `${t("Order")} Cancelled` });
        load();
    };

    const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
    const statusConf = (s: string) => STATUSES.find(x => x.key === s) || STATUSES[0];

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100 relative">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Package className="w-6 h-6 text-blue-600" />
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 italic">Trans-Logistic Engine</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-950 uppercase italic leading-none">{t("Orders")} Protocol</h1>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{filtered.length} Manifests Detected in Stream</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="h-14 px-8 rounded-2xl bg-white border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all gap-3 shadow-sm" onClick={load}>
                        <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} /> Synced System
                    </Button>
                    <Link to="/ecommerce/orders/new">
                        <Button className="h-14 px-10 rounded-2xl bg-blue-600 hover:bg-black text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-blue-600/20 transition-all gap-3 border-0">
                            <Plus className="w-5 h-5" /> New Transaction
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Premium Status Pipeline */}
            <div className="flex gap-4 flex-wrap bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm">
                {STATUSES.map(s => (
                    <button key={s.key} onClick={() => setActiveStatus(s.key)}
                        className={cn(
                            "px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center gap-3 border-2",
                            activeStatus === s.key
                                ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/10"
                                : "text-slate-400 bg-white hover:text-slate-900 border-slate-50 hover:border-slate-100"
                        )}>
                        {s.label}
                        <span className={cn(
                            "px-3 py-1 rounded-lg text-[9px] font-mono",
                            activeStatus === s.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"
                        )}>
                            {s.key === "all" ? orders.length : orders.filter(o => o.status === s.key).length}
                        </span>
                    </button>
                ))}
            </div>

            {/* Enhanced Query Bar */}
            <div className="relative group/search">
                <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within/search:text-blue-600 transition-colors" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder={`Query registry by ${t("Order").toLowerCase()} #, ${t("Customer").toLowerCase()} identity, or signal metrics...`}
                    className="w-full h-16 pl-20 pr-8 rounded-[24px] border border-slate-100 bg-white text-sm font-bold uppercase tracking-tight focus:outline-none focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 transition-all shadow-sm placeholder:opacity-40" />
            </div>

            {/* Orders Transaction Ledger */}
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden hover:shadow-2xl transition-all duration-500">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-6">
                        <div className="w-20 h-20 rounded-[24px] bg-blue-50 flex items-center justify-center border border-blue-100">
                            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-blue-600/60">Decoding Ledger Data...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-40 bg-slate-50/20">
                        <div className="w-28 h-28 rounded-[40px] bg-white mx-auto mb-8 flex items-center justify-center text-slate-100 shadow-sm border border-slate-100">
                            <Package className="w-14 h-14" />
                        </div>
                        <p className="text-xl font-black text-slate-900 uppercase tracking-tight">Zero Signals Captured</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2 italic">The protocol registry is currently silent.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 border-b border-slate-50">
                                    <th className="px-10 py-6 text-left">Internal Ref</th>
                                    <th className="px-10 py-6 text-left">Client Entity</th>
                                    <th className="px-10 py-6 text-left">Settlement</th>
                                    <th className="px-10 py-6 text-left">Asset Payload</th>
                                    <th className="px-10 py-6 text-left">Protocol Status</th>
                                    <th className="px-10 py-6 text-left">Timestamp</th>
                                    <th className="px-10 py-6 text-right">Operations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.map(o => {
                                    const sc = statusConf(o.status);
                                    const nextStatus = NEXT_STATUS[o.status];
                                    return (
                                        <tr key={o.id} className="hover:bg-slate-50/50 transition-all group cursor-pointer" onClick={() => window.location.href = `/ecommerce/orders/${o.id}`}>
                                            <td className="px-10 py-5">
                                                <span className="font-black text-blue-600 uppercase tracking-widest text-xs font-mono group-hover:underline">{o.order_number}</span>
                                            </td>
                                            <td className="px-10 py-5">
                                                <div className="space-y-1">
                                                    <p className="font-black text-slate-950 uppercase tracking-tight text-sm leading-none">{o.customer_name}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] italic">{o.customer_phone}</p>
                                                </div>
                                            </td>
                                            <td className="px-10 py-5">
                                                <div className="space-y-1">
                                                    <p className="font-black text-slate-950 text-base leading-none">{fmt(o.grand_total)}</p>
                                                    <div className={cn(
                                                        "inline-flex px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border",
                                                        o.payment_status === "paid" ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                            : o.payment_status === "refunded" ? "bg-blue-50 text-blue-600 border-blue-100"
                                                                : "bg-amber-50 text-amber-600 border-amber-100 shadow-inner"
                                                    )}>
                                                        {o.payment_status}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-5">
                                                <span className="text-[11px] font-bold text-slate-400 italic">Static Batch</span>
                                            </td>
                                            <td className="px-10 py-5">
                                                <div className={cn("inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border shadow-sm", sc.color.replace('dark:', ''))}>
                                                    <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                                    {sc.label}
                                                </div>
                                            </td>
                                            <td className="px-10 py-5">
                                                <div className="space-y-1">
                                                    <p className="text-[11px] font-black text-slate-950 uppercase tracking-tight">{new Date(o.created_at).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' })}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest opacity-60">Manifest Logged</p>
                                                </div>
                                            </td>
                                            <td className="px-10 py-5" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center gap-3 justify-end">
                                                    <Link to={`/ecommerce/orders/${o.id}`}
                                                        className="w-12 h-12 rounded-[16px] bg-white flex items-center justify-center text-slate-300 hover:text-blue-600 hover:shadow-xl hover:border-blue-100 border border-slate-100 transition-all active:scale-90">
                                                        <Eye className="w-5 h-5" />
                                                    </Link>
                                                    {nextStatus && (
                                                        <button onClick={() => advanceStatus(o)} disabled={updatingId === o.id}
                                                            className="h-12 px-5 rounded-[16px] bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-600/10 transition-all hover:bg-black active:scale-95 disabled:opacity-50">
                                                            {updatingId === o.id ? "SYNC..." : `→ ${nextStatus.replace(/_/g, ' ')}`}
                                                        </button>
                                                    )}
                                                    {!["cancelled", "delivered", "returned"].includes(o.status) && (
                                                        <button onClick={() => cancelOrder(o)}
                                                            className="w-12 h-12 rounded-[16px] bg-rose-50 flex items-center justify-center text-rose-300 hover:text-rose-600 hover:bg-white border border-transparent hover:border-rose-100 transition-all active:scale-90">
                                                            <XCircle className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

