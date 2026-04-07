import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import {
    Package, Clock, CheckCircle2, Truck, XCircle, RotateCcw,
    Search, ShoppingBag, Mail, Hash, ArrowRight, MapPin, CreditCard,
    AlertTriangle, Undo2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ORDER_STAGES = ["pending", "confirmed", "packed", "shipped", "out_for_delivery", "delivered"];
const STAGE_LABELS: Record<string, string> = {
    pending: "Order Placed", confirmed: "Confirmed", packed: "Packed",
    shipped: "Shipped", out_for_delivery: "Out for Delivery", delivered: "Delivered",
    cancelled: "Cancelled", returned: "Returned",
};
const STAGE_ICONS: Record<string, any> = {
    pending: Clock, confirmed: CheckCircle2, packed: Package,
    shipped: Truck, out_for_delivery: Truck, delivered: CheckCircle2,
    cancelled: XCircle, returned: RotateCcw,
};

export default function OrderTracking() {
    const { toast } = useToast();
    const [orderNumber, setOrderNumber] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [order, setOrder] = useState<any>(null);
    const [items, setItems] = useState<any[]>([]);
    const [timeline, setTimeline] = useState<any[]>([]);
    const [notFound, setNotFound] = useState(false);

    const trackOrder = async () => {
        if (!orderNumber.trim() || !email.trim()) {
            toast({ variant: "destructive", title: "Please enter both order number and email." });
            return;
        }

        setLoading(true);
        setNotFound(false);
        setOrder(null);

        try {
            const { data: o } = await supabase
                .from("ecom_orders")
                .select("*")
                .eq("order_number", orderNumber.trim().toUpperCase())
                .eq("customer_email", email.trim().toLowerCase())
                .maybeSingle();

            if (!o) {
                setNotFound(true);
                return;
            }

            const [{ data: i }, { data: t }] = await Promise.all([
                supabase.from("ecom_order_items").select("*").eq("order_id", o.id),
                supabase.from("ecom_order_timeline").select("*").eq("order_id", o.id).order("created_at", { ascending: true }),
            ]);

            setOrder(o);
            setItems(i || []);
            setTimeline(t || []);
        } catch (err) {
            toast({ variant: "destructive", title: "Error", description: "Something went wrong. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
    const isCancelled = order?.status === "cancelled" || order?.status === "returned";
    const stageIdx = order ? ORDER_STAGES.indexOf(order.status) : -1;
    const addr = order?.shipping_address || {};

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            <div className="max-w-3xl mx-auto px-4 py-12 space-y-10">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-blue-600/20">
                        <Package className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Track Your Order</h1>
                    <p className="text-sm text-slate-500 max-w-md mx-auto">Enter your order number and email address to check the current status of your order.</p>
                </div>

                {/* Search Form */}
                <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold tracking-widest text-slate-500 flex items-center gap-2">
                            <Hash className="w-3.5 h-3.5" /> Order Number
                        </label>
                        <input value={orderNumber} onChange={e => setOrderNumber(e.target.value.toUpperCase())}
                            placeholder="e.g. ORD-1001"
                            className="w-full h-12 px-5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/8 outline-none transition-all"
                            onKeyDown={e => e.key === "Enter" && trackOrder()} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold tracking-widest text-slate-500 flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5" /> Email Address
                        </label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                            placeholder="The email used while ordering"
                            className="w-full h-12 px-5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/8 outline-none transition-all"
                            onKeyDown={e => e.key === "Enter" && trackOrder()} />
                    </div>
                    <Button className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm tracking-widest shadow-lg shadow-blue-600/20 gap-3 transition-all active:scale-[0.98]"
                        onClick={trackOrder} disabled={loading}>
                        {loading ? <Clock className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        {loading ? "Searching..." : "Track Order"}
                    </Button>
                </div>

                {/* Not Found */}
                {notFound && (
                    <div className="bg-white rounded-3xl border border-rose-200 p-10 text-center space-y-4">
                        <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto">
                            <XCircle className="w-7 h-7 text-rose-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Order Not Found</h3>
                        <p className="text-sm text-slate-500 max-w-sm mx-auto">We couldn't find an order matching that number and email. Please double-check and try again.</p>
                    </div>
                )}

                {/* Order Result */}
                {order && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                        {/* Order Header */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <div>
                                    <p className="text-xs font-bold tracking-widest text-slate-400 mb-1">Order</p>
                                    <h2 className="text-2xl font-bold tracking-tighter text-slate-900">{order.order_number}</h2>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "px-4 py-2 rounded-full text-xs font-bold tracking-widest border",
                                        isCancelled ? "bg-rose-50 text-rose-600 border-rose-100" :
                                            order.status === "delivered" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                "bg-blue-50 text-blue-600 border-blue-100"
                                    )}>
                                        {STAGE_LABELS[order.status] || order.status}
                                    </div>
                                    <div className={cn(
                                        "px-4 py-2 rounded-full text-xs font-bold tracking-widest border",
                                        order.payment_status === "paid" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                            order.payment_status === "refunded" ? "bg-violet-50 text-violet-600 border-violet-100" :
                                                "bg-amber-50 text-amber-600 border-amber-100"
                                    )}>
                                        {order.payment_status}
                                    </div>
                                </div>
                            </div>
                            <div className="text-xs text-slate-400 font-bold tracking-widest">
                                Placed on {new Date(order.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                            </div>
                        </div>

                        {/* Cancellation/Return Banner */}
                        {order.status === "cancelled" && order.cancellation_reason && (
                            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-sm font-bold text-rose-700">Order Cancelled</p>
                                    <p className="text-sm text-rose-600 mt-1">{order.cancellation_reason}</p>
                                </div>
                            </div>
                        )}
                        {order.return_status && (
                            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 flex items-start gap-3">
                                <Undo2 className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-sm font-bold text-orange-700">Return — {order.return_status}</p>
                                    <p className="text-sm text-orange-600 mt-1">{order.return_reason}</p>
                                </div>
                            </div>
                        )}

                        {/* Progress Bar */}
                        {!isCancelled && (
                            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm overflow-x-auto">
                                <div className="flex items-start justify-between min-w-[500px]">
                                    {ORDER_STAGES.map((stage, i) => {
                                        const Icon = STAGE_ICONS[stage];
                                        const done = i <= stageIdx;
                                        const current = i === stageIdx;
                                        return (
                                            <div key={stage} className="flex flex-col items-center gap-3 flex-1 relative">
                                                {i < ORDER_STAGES.length - 1 && (
                                                    <div className="absolute left-[50%] top-5 w-full h-1 bg-slate-100 rounded-full">
                                                        <div className={cn("h-full rounded-full transition-all duration-700", i < stageIdx ? "w-full bg-blue-600" : "w-0")} />
                                                    </div>
                                                )}
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center border-2 z-10 transition-all",
                                                    done ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-white border-slate-200 text-slate-300",
                                                    current && "ring-4 ring-blue-500/10 scale-110"
                                                )}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <span className={cn("text-[10px] font-bold tracking-widest text-center", done ? "text-slate-800" : "text-slate-300")}>
                                                    {STAGE_LABELS[stage]}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Items */}
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-8 py-5 border-b border-slate-100 flex items-center gap-3">
                                <ShoppingBag className="w-5 h-5 text-blue-600" />
                                <h3 className="text-sm font-bold text-slate-900 tracking-widest">Order Items</h3>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {items.map(item => (
                                    <div key={item.id} className="px-8 py-5 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-lg font-bold text-slate-200">
                                                {item.product_name?.[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{item.product_name}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    {item.variant_label && <span className="text-[10px] px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-bold">{item.variant_label}</span>}
                                                    <span className="text-[11px] text-slate-400">x{item.quantity}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-sm font-bold text-slate-900">{fmt(item.amount)}</span>
                                    </div>
                                ))}
                            </div>
                            {/* Total */}
                            <div className="px-8 py-5 bg-slate-50 border-t border-slate-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-slate-500">Grand Total</span>
                                    <span className="text-xl font-bold text-slate-900 tracking-tighter">{fmt(order.grand_total)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Shipping & Payment Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {addr.line1 && (
                                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                        <MapPin className="w-4 h-4 text-blue-600" />
                                        <span className="text-xs font-bold tracking-widest text-slate-500">Delivery Address</span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-900 mb-1">{addr.line1}</p>
                                    {addr.city && <p className="text-xs text-slate-500">{addr.city}, {addr.state} - {addr.pincode}</p>}
                                </div>
                            )}
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <CreditCard className="w-4 h-4 text-blue-600" />
                                    <span className="text-xs font-bold tracking-widest text-slate-500">Payment</span>
                                </div>
                                <p className="text-sm font-bold text-slate-900 mb-1 uppercase">{order.payment_method || "COD"}</p>
                                <p className="text-xs text-slate-500">Status: <span className="font-bold">{order.payment_status}</span></p>
                                {order.tracking_number && (
                                    <div className="mt-3 pt-3 border-t border-slate-100">
                                        <p className="text-xs text-slate-500">Tracking: <span className="font-bold font-mono text-blue-600">{order.tracking_number}</span></p>
                                        {order.courier_name && <p className="text-xs text-slate-400 mt-1">via {order.courier_name}</p>}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Timeline */}
                        {timeline.length > 0 && (
                            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <Clock className="w-5 h-5 text-blue-600" />
                                    <h3 className="text-sm font-bold text-slate-900 tracking-widest">Order Timeline</h3>
                                </div>
                                <div className="relative pl-8 space-y-6">
                                    <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-100 rounded-full" />
                                    {timeline.map((t, i) => {
                                        const Icon = STAGE_ICONS[t.status] || Clock;
                                        const isLast = i === timeline.length - 1;
                                        return (
                                            <div key={t.id} className="relative">
                                                <div className={cn(
                                                    "absolute -left-[33px] w-7 h-7 rounded-lg flex items-center justify-center border-2",
                                                    isLast ? "bg-blue-600 border-white text-white shadow-md" : "bg-white border-slate-100 text-slate-300"
                                                )}>
                                                    <Icon className="w-3.5 h-3.5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{STAGE_LABELS[t.status] || t.status}</p>
                                                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                                                        {new Date(t.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                                                    </p>
                                                    {t.note && <p className="text-xs text-slate-500 mt-1 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">{t.note}</p>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Track Another */}
                        <div className="text-center">
                            <button onClick={() => { setOrder(null); setOrderNumber(""); setEmail(""); }}
                                className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-2 mx-auto">
                                <ArrowRight className="w-4 h-4 rotate-180" /> Track Another Order
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
