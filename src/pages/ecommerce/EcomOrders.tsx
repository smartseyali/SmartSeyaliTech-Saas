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
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{t("Orders")}</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} {t("Orders").toLowerCase()}</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" size="sm" className="rounded-xl gap-2" onClick={load}>
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-xl gap-2">
                        <Download className="w-4 h-4" /> Export
                    </Button>
                    <Link to="/ecommerce/orders/new">
                        <Button size="sm" className="rounded-xl gap-2">
                            <Plus className="w-4 h-4" /> New {t("Order")}
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
                {STATUSES.map(s => (
                    <button key={s.key} onClick={() => setActiveStatus(s.key)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${activeStatus === s.key
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:border-primary/40 bg-card"
                            }`}>
                        {s.label}
                        <span className="ml-1.5 opacity-70">
                            {s.key === "all" ? orders.length : orders.filter(o => o.status === s.key).length}
                        </span>
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder={`Search by ${t("Order").toLowerCase()} #, ${t("Customer").toLowerCase()} name, phone...`}
                    className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-secondary/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>

            {/* Orders Table */}
            <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="text-center py-16 text-muted-foreground">Loading {t("Orders").toLowerCase()}...</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                        <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p>No {t("Orders").toLowerCase()} found</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-secondary/40 text-xs uppercase text-muted-foreground">
                            <tr>
                                <th className="px-5 py-3 text-left font-semibold">{t("Order")}</th>
                                <th className="px-5 py-3 text-left font-semibold">{t("Customer")}</th>
                                <th className="px-5 py-3 text-left font-semibold">Items</th>
                                <th className="px-5 py-3 text-left font-semibold">Amount</th>
                                <th className="px-5 py-3 text-left font-semibold">Payment</th>
                                <th className="px-5 py-3 text-left font-semibold">Status</th>
                                <th className="px-5 py-3 text-left font-semibold">Date</th>
                                <th className="px-5 py-3 text-right font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(o => {
                                const sc = statusConf(o.status);
                                const nextStatus = NEXT_STATUS[o.status];
                                return (
                                    <tr key={o.id} className="border-t border-border/40 hover:bg-secondary/20 transition-colors">
                                        <td className="px-5 py-3.5">
                                            <Link to={`/ecommerce/orders/${o.id}`} className="text-primary font-semibold hover:underline text-sm">
                                                {o.order_number}
                                            </Link>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <p className="font-medium text-sm">{o.customer_name}</p>
                                            <p className="text-xs text-muted-foreground">{o.customer_phone}</p>
                                        </td>
                                        <td className="px-5 py-3.5 text-muted-foreground text-xs">—</td>
                                        <td className="px-5 py-3.5 font-bold">{fmt(o.grand_total)}</td>
                                        <td className="px-5 py-3.5">
                                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${o.payment_status === "paid" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                : o.payment_status === "refunded" ? "bg-blue-100 text-blue-700"
                                                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                                }`}>
                                                {o.payment_status} · {o.payment_method?.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${sc.color}`}>
                                                {sc.label}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-xs text-muted-foreground">
                                            {new Date(o.created_at).toLocaleDateString("en-IN")}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-1.5 justify-end">
                                                <Link to={`/ecommerce/orders/${o.id}`}
                                                    className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground transition-colors" title="View">
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                {nextStatus && (
                                                    <button onClick={() => advanceStatus(o)} disabled={updatingId === o.id}
                                                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                                                        → {nextStatus.replace(/_/g, " ")}
                                                    </button>
                                                )}
                                                {!["cancelled", "delivered", "returned"].includes(o.status) && (
                                                    <button onClick={() => cancelOrder(o)}
                                                        className="p-1.5 rounded-lg hover:bg-red-100 text-muted-foreground hover:text-red-600 transition-colors" title="Cancel">
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

