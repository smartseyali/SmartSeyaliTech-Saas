import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";
import { useParams, Link } from "react-router-dom";
import {
    ArrowLeft, Package, Truck, CheckCircle2, Clock, XCircle,
    RotateCcw, MapPin, Phone, Mail, CreditCard, Printer, Copy, ShoppingBag, Tag, Leaf
} from "lucide-react";
import { Button } from "@/components/ui/button";

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

const NEXT_STATUS: Record<string, string> = {
    pending: "confirmed", confirmed: "packed", packed: "shipped",
    shipped: "out_for_delivery", out_for_delivery: "delivered",
};

export default function EcomOrderDetail() {
    const { id } = useParams();
    const { activeCompany } = useTenant();
    const { toast } = useToast();
    const [order, setOrder] = useState<any>(null);
    const [items, setItems] = useState<any[]>([]);
    const [timeline, setTimeline] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [trackingInput, setTrackingInput] = useState("");
    const [courierInput, setCourierInput] = useState("");

    useEffect(() => { if (id && activeCompany) load(); }, [id, activeCompany?.id]);

    const load = async () => {
        if (!id || !activeCompany) return;
        setLoading(true);
        try {
            const [{ data: o }, { data: i }, { data: t }] = await Promise.all([
                supabase.from("ecom_orders").select("*").eq("id", id).eq("company_id", activeCompany.id).maybeSingle(),
                supabase.from("ecom_order_items").select("*").eq("order_id", id),
                supabase.from("ecom_order_timeline").select("*").eq("order_id", id).order("created_at", { ascending: true }),
            ]);

            setOrder(o);
            setItems(i || []);
            setTimeline(t || []);
            if (o) {
                setTrackingInput(o.tracking_number || "");
                setCourierInput(o.courier_name || "");
            }
        } catch (err) {
            console.error("Order Load Error:", err);
            toast({ variant: "destructive", title: "Load Failed", description: "Could not retrieve order details." });
        } finally {
            setLoading(false);
        }
    };

    const advanceStatus = async () => {
        if (!order) return;
        const next = NEXT_STATUS[order.status];
        if (!next) return;
        setUpdating(true);
        await supabase.from("ecom_orders").update({ status: next, updated_at: new Date().toISOString() }).eq("id", order.id);
        await supabase.from("ecom_order_timeline").insert([{ order_id: order.id, status: next, note: `Status advanced to ${next}` }]);
        toast({ title: `Status → ${STAGE_LABELS[next]}` });
        load();
        setUpdating(false);
    };

    const saveTracking = async () => {
        await supabase.from("ecom_orders").update({ tracking_number: trackingInput, courier_name: courierInput }).eq("id", order.id);
        toast({ title: "Tracking info saved" });
        load();
    };

    const markPaymentPaid = async () => {
        await supabase.from("ecom_orders").update({ payment_status: "paid" }).eq("id", order.id);
        toast({ title: "Payment marked as Paid" });
        load();
    };

    const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

    if (loading) return <div className="p-20 text-center text-muted-foreground animate-pulse font-sans">Decoding order sequence...</div>;
    if (!order) return (
        <div className="p-20 text-center space-y-4 font-sans">
            <h1 className="text-2xl font-black text-slate-300 uppercase tracking-tighter">Order Not Found</h1>
            <p className="text-sm text-slate-400">The requested record does not exist or belongs to another workspace.</p>
            <Button variant="outline" className="rounded-xl" onClick={() => window.history.back()}>Go Back</Button>
        </div>
    );

    const stageIdx = ORDER_STAGES.indexOf(order.status);
    const isCancelled = order.status === "cancelled" || order.status === "returned";
    const nextStatus = NEXT_STATUS[order.status];
    const addr = order.shipping_address || {};

    return (
        <div className="w-full space-y-12 pb-20 animate-in slide-in-from-bottom-4 duration-500 font-sans">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 bg-white p-8 md:p-10 rounded-[32px] border border-border shadow-sm">
                <div className="flex items-start gap-6">
                    <Link to="/ecommerce/orders"
                        className="bg-[#f8fafc] h-14 w-14 rounded-2xl flex items-center justify-center border border-border shadow-sm hover:bg-white hover:border-[#14532d]/40 transition-all group">
                        <ArrowLeft className="w-6 h-6 text-slate-400 group-hover:text-[#14532d] transition-colors" />
                    </Link>
                    <div className="space-y-2">
                        <div className="flex items-center gap-4 flex-wrap">
                            <h1 className="text-3xl font-black text-[#14532d] tracking-tight">{order.order_number}</h1>
                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm border ${isCancelled ? "bg-red-50 text-red-600 border-red-100" :
                                order.status === "delivered" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                    "bg-[#14532d]/5 text-[#14532d] border-[#14532d]/10"
                                }`}>
                                {STAGE_LABELS[order.status] || order.status}
                            </div>
                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm border ${order.payment_status === "paid" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                "bg-amber-50 text-amber-600 border-amber-100"
                                }`}>
                                {order.payment_status}
                            </div>
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" /> Placed on {new Date(order.created_at).toLocaleDateString("en-IN", { dateStyle: "long" })}
                        </p>
                    </div>
                </div>

                <div className="flex gap-4 h-14">
                    <Button variant="outline" className="h-full px-6 rounded-2xl font-bold bg-white text-[#14532d] border-slate-200 hover:border-[#14532d]/40 flex items-center gap-2" onClick={() => window.print()}>
                        <Printer className="w-4 h-4" /> Print Invoice
                    </Button>
                    {nextStatus && !isCancelled && (
                        <Button className="h-full px-8 rounded-2xl bg-[#14532d] hover:bg-[#14532d]/90 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-[#14532d]/20 transition-all" onClick={advanceStatus} disabled={updating}>
                            {updating ? "Processing..." : `Mark as ${STAGE_LABELS[nextStatus]}`}
                        </Button>
                    )}
                </div>
            </div>

            {/* Progress Tracker */}
            {!isCancelled && (
                <div className="relative overflow-hidden bg-white rounded-[40px] border border-border p-12 shadow-sm">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none text-[#14532d]">
                        <Package className="w-32 h-32" />
                    </div>
                    <div className="flex items-start justify-between relative w-full">
                        {ORDER_STAGES.map((stage, i) => {
                            const Icon = STAGE_ICONS[stage];
                            const done = i <= stageIdx;
                            const current = i === stageIdx;
                            return (
                                <div key={stage} className="flex flex-col items-center gap-4 z-10 flex-1 relative">
                                    {/* Connector Line */}
                                    {i < ORDER_STAGES.length - 1 && (
                                        <div className="absolute left-[50%] top-6 w-full h-[2px] bg-[#f8fafc]">
                                            <div className={`h-full transition-all duration-1000 ${i < stageIdx ? "w-full bg-[#14532d]" : "w-0"}`} />
                                        </div>
                                    )}

                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 shadow-sm ${done ? "bg-[#14532d] border-[#14532d] text-white scale-110 shadow-lg shadow-[#14532d]/20" :
                                        "bg-white border-slate-100 text-slate-200"
                                        } ${current ? "ring-8 ring-[#14532d]/5" : ""}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>

                                    <div className="flex flex-col items-center gap-1">
                                        <span className={`text-[10px] font-bold uppercase tracking-widest text-center max-w-[80px] leading-tight ${done ? "text-[#14532d]" : "text-slate-300"}`}>
                                            {STAGE_LABELS[stage]}
                                        </span>
                                        {current && (
                                            <span className="text-[10px] font-black text-[#f97316] uppercase mt-1">Active</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 space-y-8">
                    {/* Order Items */}
                    <div className="bg-white rounded-[32px] border border-border shadow-sm overflow-hidden">
                        <div className="px-8 py-6 border-b border-border bg-[#f8fafc] flex items-center justify-between">
                            <h2 className="text-xl font-black text-[#14532d] flex items-center gap-3">
                                <ShoppingBag className="w-5 h-5 text-[#f97316]" />
                                Order Items <span className="text-xs font-bold text-slate-300 border-l border-slate-200 pl-4">{items.length} Product(s)</span>
                            </h2>
                        </div>

                        <div className="p-0 overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-[#f8fafc] text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-border">
                                    <tr>
                                        <th className="px-8 py-5 text-left">Product Details</th>
                                        <th className="px-4 py-5 text-center">Qty</th>
                                        <th className="px-4 py-5 text-right">Unit Price</th>
                                        <th className="px-8 py-5 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {items.map(item => (
                                        <tr key={item.id} className="hover:bg-[#f8fafc]/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-2xl bg-[#f8fafc] border border-slate-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform overflow-hidden font-black text-[#14532d]/10 text-xl">
                                                        {item.product_name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-[#14532d] text-base leading-none mb-2">{item.product_name}</p>
                                                        <div className="flex items-center gap-2">
                                                            {item.variant_label && <span className="px-2 py-0.5 bg-[#f97316]/10 rounded-md text-[9px] font-bold text-[#f97316] uppercase tracking-wider">{item.variant_label}</span>}
                                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter opacity-60">SKU: {item.sku}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-6 text-center">
                                                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 font-black text-[#14532d] border border-slate-100">{item.quantity}</span>
                                            </td>
                                            <td className="px-4 py-6 text-right font-bold text-slate-400 tabular-nums">{fmt(item.unit_price)}</td>
                                            <td className="px-8 py-6 text-right">
                                                <span className="text-base font-black text-[#14532d] tabular-nums">{fmt(item.amount)}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals Section */}
                        <div className="p-8 space-y-4 bg-[#f8fafc] border-t border-border">
                            <div className="flex justify-between items-center text-sm font-bold text-slate-400">
                                <span className="uppercase tracking-widest text-[10px]">Net Total</span>
                                <span className="tabular-nums">{fmt(order.subtotal || 0)}</span>
                            </div>
                            {Number(order.coupon_discount) > 0 && (
                                <div className="flex justify-between items-center text-sm font-bold text-emerald-600">
                                    <div className="flex items-center gap-2 uppercase tracking-widest text-[10px]">
                                        <Tag className="w-4 h-4" /> Discount ({order.coupon_code})
                                    </div>
                                    <span className="tabular-nums">−{fmt(order.coupon_discount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-sm font-bold text-slate-400">
                                <span className="uppercase tracking-widest text-[10px]">Taxes</span>
                                <span className="tabular-nums">{fmt(order.tax_amount || 0)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold text-slate-400 border-b border-slate-200 pb-6">
                                <span className="uppercase tracking-widest text-[10px]">Shipping</span>
                                <span className="tabular-nums">{Number(order.shipping_amount) === 0 ? "FREE" : fmt(order.shipping_amount)}</span>
                            </div>
                            <div className="flex justify-between items-end pt-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f97316]">Grand Total</span>
                                    <span className="text-[10px] text-slate-400 font-bold italic opacity-60">Settlement Amount</span>
                                </div>
                                <span className="text-4xl font-black text-[#14532d] tabular-nums tracking-tighter">{fmt(order.grand_total || 0)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Fulfillment */}
                        <div className="bg-white rounded-[32px] border border-border p-8 shadow-sm">
                            <h2 className="text-lg font-black text-[#14532d] mb-6 flex items-center gap-3">
                                <Truck className="w-5 h-5 text-[#f97316]" />
                                Shipping Info
                            </h2>
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-300 ml-1">Courier Partner</label>
                                    <input value={courierInput} onChange={e => setCourierInput(e.target.value)}
                                        placeholder="e.g. DHL, FedEx"
                                        className="w-full h-12 px-5 rounded-2xl border border-border bg-[#f8fafc] font-bold text-sm focus:border-[#14532d] transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-300 ml-1">Tracking Number</label>
                                    <div className="relative group">
                                        <input value={trackingInput} onChange={e => setTrackingInput(e.target.value)}
                                            placeholder="AWB #"
                                            className="w-full h-12 px-5 rounded-2xl border border-border bg-[#f8fafc] font-mono font-bold text-sm focus:border-[#14532d] transition-all" />
                                        <Button variant="ghost" size="icon" className="absolute right-2 top-2 h-8 w-8 rounded-lg text-slate-300 hover:text-[#14532d]"
                                            onClick={() => {
                                                navigator.clipboard.writeText(trackingInput);
                                                toast({ title: "COPIED" });
                                            }}>
                                            <Copy className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                                <Button className="w-full h-12 rounded-2xl bg-[#14532d] text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-[#14532d]/10 mt-2" onClick={saveTracking}>
                                    Update Fulfillment
                                </Button>
                            </div>
                        </div>

                        {/* Event Trace */}
                        <div className="bg-white rounded-[32px] border border-border p-8 shadow-sm">
                            <h2 className="text-lg font-black text-[#14532d] mb-6 flex items-center gap-3">
                                <Clock className="w-5 h-5 text-[#f97316]" />
                                History Trace
                            </h2>
                            {timeline.length === 0 ? (
                                <div className="text-center py-6 text-slate-200 font-bold uppercase text-[10px] tracking-widest italic">No events logged</div>
                            ) : (
                                <div className="relative pl-7 space-y-8">
                                    <div className="absolute left-[13px] top-2 bottom-2 w-0.5 bg-slate-50" />
                                    {timeline.map((t, i) => {
                                        const Icon = STAGE_ICONS[t.status] || Clock;
                                        const isLast = i === timeline.length - 1;
                                        return (
                                            <div key={t.id} className="relative group/time">
                                                <div className={`absolute -left-[30px] w-7 h-7 rounded-lg flex items-center justify-center border-2 transition-all ${isLast ? "bg-[#14532d] border-[#14532d] text-white shadow-lg shadow-[#14532d]/20 scale-110" : "bg-white border-slate-100 text-slate-200"
                                                    }`}>
                                                    <Icon className="w-3.5 h-3.5" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs font-bold text-[#14532d] uppercase tracking-tight">{STAGE_LABELS[t.status] || t.status}</p>
                                                    <div className="flex items-center justify-between gap-4">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                            {new Date(t.created_at).toLocaleString("en-IN", { timeStyle: 'short', dateStyle: 'medium' })}
                                                        </p>
                                                    </div>
                                                    {t.note && <p className="text-[11px] font-medium text-slate-400 italic pt-1 border-l-2 border-slate-50 pl-3 mt-1 leading-tight">{t.note}</p>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Vertical Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Customer */}
                    <div className="bg-[#14532d] rounded-[40px] p-8 text-white shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[80px] -z-0" />
                        <h2 className="text-xl font-black uppercase mb-8 relative z-10">Customer Profile</h2>
                        <div className="flex items-center gap-6 mb-10 relative z-10">
                            <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center text-white font-black text-2xl shadow-inner border border-white/5">
                                {order.customer_name?.charAt(0)}
                            </div>
                            <div>
                                <p className="font-black text-xl tracking-tight leading-none mb-1">{order.customer_name}</p>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f97316]">Verified Customer</p>
                            </div>
                        </div>

                        <div className="space-y-6 relative z-10">
                            <div className="flex items-center gap-4 group/item">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover/item:text-white transition-colors">
                                    <Phone className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-bold text-white/80">{order.customer_phone || "Not provided"}</span>
                            </div>
                            <div className="flex items-center gap-4 group/item">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover/item:text-white transition-colors">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-bold text-white/80 truncate pr-4">{order.customer_email || "Not provided"}</span>
                            </div>
                        </div>

                        {addr.line1 && (
                            <div className="mt-10 pt-10 border-t border-white/5 relative z-10">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-5">Delivery Destination</h3>
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 shrink-0">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <div className="text-sm font-bold leading-relaxed text-white/70">
                                        <p className="text-white">{addr.line1}</p>
                                        {addr.line2 && <p>{addr.line2}</p>}
                                        <p className="text-[#f97316] mt-1">{addr.city}, {addr.state} • {addr.pincode}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Payment */}
                    <div className="bg-white rounded-[40px] border border-border p-8 shadow-sm">
                        <h2 className="text-xl font-black text-[#14532d] mb-8">Payment Details</h2>
                        <div className="space-y-6">
                            <div className="p-6 rounded-3xl bg-[#f8fafc] border border-slate-50">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Method</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-white rounded-full border border-slate-100 text-[#14532d]">{order.payment_method || "PREPAID"}</span>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Status</span>
                                        <span className={`text-xs font-black uppercase tracking-widest ${order.payment_status === 'paid' ? 'text-emerald-500' : 'text-amber-500'}`}>{order.payment_status}</span>
                                    </div>
                                    <span className="text-3xl font-black text-[#14532d] tabular-nums tracking-tighter">{fmt(order.grand_total || 0)}</span>
                                </div>
                            </div>

                            {order.payment_gateway_ref && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-300 ml-1">Ref ID</label>
                                    <div className="flex items-center gap-3 p-4 bg-[#f8fafc] rounded-2xl border border-slate-100 group">
                                        <span className="font-mono text-[10px] font-bold truncate flex-1 text-[#14532d]/40">{order.payment_gateway_ref}</span>
                                        <button onClick={() => {
                                            navigator.clipboard.writeText(order.payment_gateway_ref);
                                            toast({ title: "COPIED" });
                                        }} className="text-slate-200 hover:text-[#14532d] transition-colors">
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {order.payment_status === "pending" && (
                                <Button className="w-full h-14 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-500/20 flex items-center gap-3 border-none" onClick={markPaymentPaid}>
                                    <CreditCard className="w-5 h-5" /> Confirm Payment Manually
                                </Button>
                            )}

                            {order.payment_status === "paid" && !["cancelled", "returned", "delivered"].includes(order.status) && (
                                <Link to={`/ecommerce/refunds/new?order=${order.id}`} className="block">
                                    <Button variant="outline" className="w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest text-red-500 border-red-50 hover:bg-red-50 gap-3 border-2">
                                        <RotateCcw className="w-5 h-5" /> Process Refund
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
