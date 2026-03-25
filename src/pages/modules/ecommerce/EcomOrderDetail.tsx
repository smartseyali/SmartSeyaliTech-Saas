import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";
import { useParams, Link } from "react-router-dom";
import {
    ArrowLeft, Package, Truck, CheckCircle2, Clock, XCircle,
    RotateCcw, MapPin, Phone, Mail, CreditCard, Printer, Copy, ShoppingBag, Tag, Leaf, RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
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

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
            <RefreshCw className="w-10 h-10 text-blue-600 animate-spin opacity-40" />
            <p className="text-xs font-bold  tracking-widest text-slate-500">Loading order details...</p>
        </div>
    );
    if (!order) return (
        <div className="flex flex-col items-center justify-center p-20 gap-6 text-center">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-rose-300" />
            </div>
            <div className="space-y-2">
                <h1 className="text-2xl font-bold text-slate-900  tracking-tight">Order Not Found</h1>
                <p className="text-sm font-medium text-slate-500 max-w-md">The requested record does not exist or belongs to another workspace. Please check the URL or return to the order list.</p>
            </div>
            <Button variant="outline" className="h-11 px-8 rounded-lg font-bold border-slate-200 text-slate-600" onClick={() => window.history.back()}>Return to Dashboard</Button>
        </div>
    );

    const stageIdx = ORDER_STAGES.indexOf(order.status);
    const isCancelled = order.status === "cancelled" || order.status === "returned";
    const nextStatus = NEXT_STATUS[order.status];
    const addr = order.shipping_address || {};

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100 relative">
                <div className="flex items-center gap-8">
                    <Link to="/apps/ecommerce/orders"
                        className="h-16 w-16 rounded-[24px] flex items-center justify-center border border-slate-100 bg-white shadow-sm hover:bg-slate-50 transition-all text-slate-300 hover:text-blue-600 active:scale-90">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <ShoppingBag className="w-6 h-6 text-blue-600" />
                            <span className="text-xs font-bold  tracking-widest text-slate-500 ">Order Details</span>
                        </div>
                        <div className="flex items-center gap-6 flex-wrap">
                            <h1 className="text-4xl font-bold tracking-tighter text-slate-950   leading-none">{order.order_number}</h1>
                            <div className={cn(
                                "px-5 py-2 rounded-full text-xs font-bold  tracking-widest border shadow-sm",
                                isCancelled ? "bg-rose-50 text-rose-600 border-rose-100" :
                                    order.status === "delivered" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                        "bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-600/20"
                            )}>
                                {STAGE_LABELS[order.status] || order.status}
                            </div>
                            <div className={cn(
                                "px-5 py-2 rounded-full text-xs font-bold  tracking-widest border shadow-sm",
                                order.payment_status === "paid" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                    "bg-amber-50 text-amber-600 border-amber-100"
                            )}>
                                {order.payment_status}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Button variant="outline" className="h-14 px-8 rounded-2xl bg-white border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all gap-3 shadow-sm active:scale-95" onClick={() => window.print()}>
                        <Printer className="w-5 h-5" /> Print Invoice
                    </Button>
                    {nextStatus && !isCancelled && (
                        <Button className="h-14 px-10 rounded-2xl bg-blue-600 hover:bg-black text-white font-bold  tracking-widest text-xs shadow-2xl shadow-blue-600/20 transition-all active:scale-95" onClick={advanceStatus} disabled={updating}>
                            {updating ? "Updating..." : `Mark as ${STAGE_LABELS[nextStatus]}`}
                        </Button>
                    )}
                </div>
            </div>

            {/* Order Progress */}
            {!isCancelled && (
                <div className="bg-white rounded-[48px] border border-slate-100 p-12 shadow-sm overflow-hidden relative hover:shadow-2xl transition-all duration-500">
                    <div className="absolute -top-10 -right-10 p-8 opacity-[0.03] pointer-events-none text-blue-600">
                        <Package className="w-64 h-64 -rotate-12" />
                    </div>
                    <div className="flex items-start justify-between relative w-full">
                        {ORDER_STAGES.map((stage, i) => {
                            const Icon = STAGE_ICONS[stage];
                            const done = i <= stageIdx;
                            const current = i === stageIdx;
                            return (
                                <div key={stage} className="flex flex-col items-center gap-6 z-10 flex-1 relative group/state">
                                    {/* Advanced Connector Line */}
                                    {i < ORDER_STAGES.length - 1 && (
                                        <div className="absolute left-[50%] top-8 w-full h-[4px] bg-slate-50">
                                            <div className={cn(
                                                "h-full transition-all duration-1000",
                                                i < stageIdx ? "w-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]" : "w-0"
                                            )} />
                                        </div>
                                    )}

                                    <div className={cn(
                                        "w-16 h-16 rounded-[24px] flex items-center justify-center border-4 transition-all duration-700 shadow-sm",
                                        done ? "bg-blue-600 border-white text-white scale-110 shadow-2xl shadow-blue-600/30" : "bg-white border-slate-50 text-slate-200",
                                        current && "ring-[12px] ring-blue-500/5 bg-blue-600 animate-in zoom-in duration-500"
                                    )}>
                                        <Icon className={cn("w-7 h-7", current && "animate-pulse")} />
                                    </div>

                                    <div className="flex flex-col items-center gap-1">
                                        <span className={cn(
                                            "text-[13px] font-bold  tracking-widest text-center transition-colors px-4",
                                            done ? "text-slate-900" : "text-slate-200"
                                        )}>
                                            {STAGE_LABELS[stage]}
                                        </span>
                                        {current && (
                                            <div className="h-1 w-8 bg-blue-600 rounded-full animate-pulse" />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                <div className="lg:col-span-8 space-y-12">
                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden hover:shadow-2xl transition-all duration-500">
                        <div className="px-10 py-8 border-b border-slate-50 bg-white flex items-center justify-between relative">
                            <div className="absolute top-0 left-0 w-24 h-1.5 bg-blue-600 rounded-full ml-10" />
                            <h2 className="text-xl font-bold text-slate-950   flex items-center gap-4">
                                <ShoppingBag className="w-6 h-6 text-blue-600" />
                                Order Items
                            </h2>
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-5 py-2 rounded-2xl  tracking-widest border border-blue-100">{items.length} Items</span>
                        </div>

                        <div className="p-0">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50/50 text-[13px] font-bold  tracking-widest text-slate-500 border-b border-slate-50">
                                        <th className="px-10 py-6 text-left">Product Details</th>
                                        <th className="px-8 py-6 text-center">Qty</th>
                                        <th className="px-8 py-6 text-right">Unit Price</th>
                                        <th className="px-10 py-6 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {items.map(item => (
                                        <tr key={item.id} className="hover:bg-slate-50/50 transition-all group">
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-20 h-20 rounded-[28px] bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:shadow-2xl group-hover:scale-105 transition-all duration-500 overflow-hidden text-3xl font-bold text-slate-200  ">
                                                        {item.product_name[0]}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <p className="font-bold text-slate-950 text-lg tracking-tight leading-none group-hover:text-blue-600 transition-colors  ">{item.product_name}</p>
                                                        <div className="flex items-center gap-3">
                                                            {item.variant_label && <span className="px-3 py-1 bg-slate-900 rounded-lg text-[8px] font-bold text-white  tracking-widest">{item.variant_label}</span>}
                                                            <span className="text-xs text-slate-500 font-bold  tracking-widest font-mono">#{item.sku}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-8 text-center">
                                                <span className="inline-flex h-12 w-12 items-center justify-center rounded-[18px] bg-white border border-slate-100 font-bold text-slate-950 shadow-sm group-hover:border-blue-200 transition-all">{item.quantity}</span>
                                            </td>
                                            <td className="px-8 py-8 text-right">
                                                <p className="font-bold text-slate-300 text-xs tracking-widest">{fmt(item.unit_price)}</p>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <span className="text-xl font-bold text-slate-950 tracking-tighter">{fmt(item.amount)}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals Section */}
                        <div className="p-12 space-y-6 bg-slate-900 border-t border-slate-100 text-white relative overflow-hidden group">
                            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] group-hover:bg-blue-600/20 transition-all duration-1000" />
                            <div className="flex justify-between items-center text-xs font-bold  tracking-widest text-slate-500 relative z-10">
                                <span>Subtotal</span>
                                <span className="font-mono text-white/60">{fmt(order.subtotal || 0)}</span>
                            </div>
                            {Number(order.coupon_discount) > 0 && (
                                <div className="flex justify-between items-center text-xs font-bold text-emerald-400  tracking-widest relative z-10">
                                    <div className="flex items-center gap-3">
                                        <Tag className="w-5 h-5" /> Promo Discount [{order.coupon_code}]
                                    </div>
                                    <span className="bg-emerald-500/20 px-4 py-2 rounded-xl border border-emerald-500/30">−{fmt(order.coupon_discount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-xs font-bold  tracking-widest text-slate-500 relative z-10">
                                <span>GST (Flat)</span>
                                <span className="font-mono text-white/60">{fmt(order.tax_amount || 0)}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-bold  tracking-widest text-slate-500 border-b border-white/5 pb-10 relative z-10">
                                <span>Shipping Charges</span>
                                <span className="text-blue-400">{Number(order.shipping_amount) === 0 ? "FREE" : fmt(order.shipping_amount)}</span>
                            </div>
                            <div className="flex justify-between items-end pt-10 relative z-10">
                                <div className="space-y-3">
                                    <span className="text-[13px] font-bold  tracking-[0.5em] text-blue-500 animate-pulse">Grand Total</span>
                                    <p className="text-xs text-slate-500 font-bold  tracking-widest  opacity-50">Inclusive of all taxes</p>
                                </div>
                                <span className="text-7xl font-bold text-white tracking-tighter ">{fmt(order.grand_total || 0).replace('₹', '')}<span className="text-2xl ml-2 not- text-slate-600 font-light">INR</span></span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Shipping Info */}
                        <div className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-slate-950 mb-10   flex items-center gap-4">
                                    <Truck className="w-6 h-6 text-blue-600" />
                                    Shipping Info
                                </h2>
                                <div className="space-y-8">
                                    <div className="space-y-4 group/field">
                                        <label className="text-[13px] font-bold  tracking-widest text-slate-500 ml-1 group-focus-within/field:text-blue-600 transition-colors">Courier Partner</label>
                                        <input value={courierInput} onChange={e => setCourierInput(e.target.value)}
                                            placeholder="e.g. Delhivery, Bluedart"
                                            className="w-full h-14 px-6 rounded-2xl border border-slate-100 bg-slate-50/50 text-sm font-bold  tracking-tight focus:outline-none focus:ring-8 focus:ring-blue-500/5 focus:bg-white focus:border-blue-500 transition-all shadow-inner" />
                                    </div>
                                    <div className="space-y-4 group/field">
                                        <label className="text-[13px] font-bold  tracking-widest text-slate-500 ml-1 group-focus-within/field:text-blue-600 transition-colors">Tracking Number (AWB)</label>
                                        <div className="relative">
                                            <input value={trackingInput} onChange={e => setTrackingInput(e.target.value)}
                                                placeholder="Enter tracking number"
                                                className="w-full h-14 pl-6 pr-16 rounded-2xl border border-slate-100 bg-slate-50/50 font-mono text-sm font-bold focus:outline-none focus:ring-8 focus:ring-blue-500/5 focus:bg-white focus:border-blue-500 transition-all shadow-inner" />
                                            <button className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 hover:text-blue-600 transition-all shadow-sm active:scale-90"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(trackingInput);
                                                    toast({ title: "Copied to clipboard" });
                                                }}>
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Button className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-black text-white font-bold text-xs  tracking-widest shadow-2xl shadow-blue-600/20 transition-all mt-10 active:scale-95" onClick={saveTracking}>
                                Update Shipping Info
                            </Button>
                        </div>

                        {/* Order Timeline */}
                        <div className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm hover:shadow-2xl transition-all duration-500">
                            <h2 className="text-xl font-bold text-slate-950 mb-10   flex items-center gap-4">
                                <Clock className="w-6 h-6 text-blue-600" />
                                Order History
                            </h2>
                            {timeline.length === 0 ? (
                                <div className="text-center py-20 bg-slate-50/30 rounded-[32px] border border-dashed border-slate-200">
                                    <div className="w-20 h-20 rounded-full bg-white mx-auto mb-6 flex items-center justify-center text-slate-100 shadow-sm">
                                        <Clock className="w-10 h-10" />
                                    </div>
                                    <p className="text-xs font-bold  tracking-widest text-slate-300 ">No events found</p>
                                </div>
                            ) : (
                                <div className="relative pl-10 space-y-12">
                                    <div className="absolute left-[19px] top-4 bottom-4 w-1 bg-slate-50 rounded-full" />
                                    {timeline.map((t, i) => {
                                        const Icon = STAGE_ICONS[t.status] || Clock;
                                        const isLast = i === timeline.length - 1;
                                        return (
                                            <div key={t.id} className="relative group/ev">
                                                <div className={cn(
                                                    "absolute -left-[54px] w-12 h-12 rounded-[18px] flex items-center justify-center border-4 transition-all duration-500 group-hover/ev:scale-110 shadow-lg",
                                                    isLast ? "bg-blue-600 border-white text-white shadow-blue-600/30" : "bg-white border-slate-50 text-slate-200"
                                                )}>
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-sm font-bold text-slate-950   tracking-tight leading-none">{STAGE_LABELS[t.status] || t.status}</p>
                                                    <p className="text-[13px] font-bold text-slate-500  tracking-widest  font-mono">
                                                        {new Date(t.created_at).toLocaleString("en-IN", { timeStyle: 'short', dateStyle: 'medium' })}
                                                    </p>
                                                    {t.note && (
                                                        <div className="mt-4 p-5 rounded-[24px] bg-slate-50 group-hover/ev:bg-blue-50/50 transition-colors border border-slate-100 border-l-4 border-l-blue-600 shadow-sm">
                                                            <p className="text-[13px] font-bold text-slate-500 leading-relaxed  tracking-tight">{t.note}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Customer Sidebar */}
                <div className="lg:col-span-4 space-y-12">
                    {/* Customer Profile */}
                    <div className="bg-slate-950 rounded-[48px] p-12 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-[80px] -z-0 group-hover:bg-blue-600/20 transition-all duration-1000" />
                        <h2 className="text-xs font-bold  tracking-widest text-blue-500 mb-12 relative z-10 ">Customer Details</h2>

                        <div className="flex flex-col items-center text-center mb-12 relative z-10">
                            <div className="w-32 h-32 rounded-[40px] bg-white/5 flex items-center justify-center text-white font-bold text-5xl shadow-inner border border-white/10 mb-8 transform group-hover:-translate-y-2 transition-transform duration-700 ">
                                {order.customer_name?.charAt(0)}
                            </div>
                            <h3 className="font-bold text-3xl tracking-tighter leading-none mb-3  ">{order.customer_name}</h3>
                            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-600/20 text-blue-400 text-[13px] font-bold  tracking-widest border border-blue-500/30">Verified Customer</div>
                        </div>

                        <div className="space-y-6 relative z-10">
                            <div className="flex items-center gap-6 p-6 rounded-[28px] bg-white/5 hover:bg-white/10 transition-all border border-white/5 group/row">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover/row:bg-blue-600 group-hover/row:text-white transition-all">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <span className="text-base font-bold tracking-tight text-white/90 font-mono">{order.customer_phone || "Not provided"}</span>
                            </div>
                            <div className="flex items-center gap-6 p-6 rounded-[28px] bg-white/5 hover:bg-white/10 transition-all border border-white/5 group/row">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover/row:bg-blue-600 group-hover/row:text-white transition-all">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-bold tracking-tight text-white/90 truncate">{order.customer_email || "No Email"}</span>
                            </div>
                        </div>

                        {addr.line1 && (
                            <div className="mt-12 pt-12 border-t border-white/10 relative z-10">
                                <div className="flex items-center gap-4 mb-8">
                                    <MapPin className="w-5 h-5 text-blue-500" />
                                    <h3 className="text-xs font-bold  tracking-widest text-white/30 ">Delivery Address</h3>
                                </div>
                                <div className="p-8 rounded-[32px] bg-white/5 border border-white/5 text-sm font-bold leading-relaxed text-white/50 group-hover:bg-white/[0.07] transition-all">
                                    <p className="text-white font-bold text-lg mb-2  ">{addr.line1}</p>
                                    {addr.line2 && <p className="mb-3 opacity-60 font-medium">{addr.line2}</p>}
                                    <div className="h-px w-full bg-white/5 my-4" />
                                    <p className="text-blue-500 font-bold  tracking-widest text-xs font-mono">{addr.city}, {addr.state} - {addr.pincode}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white rounded-[48px] border border-slate-100 p-10 shadow-sm hover:shadow-2xl transition-all duration-500">
                        <h2 className="text-xl font-bold text-slate-950 mb-10   flex items-center gap-4">
                            <CreditCard className="w-6 h-6 text-blue-600" />
                            Payment Info
                        </h2>
                        <div className="space-y-10">
                            <div className="p-10 rounded-[40px] bg-slate-50 border border-slate-100 shadow-inner group/bill">
                                <div className="flex justify-between items-center mb-10">
                                    <div className="space-y-1">
                                        <span className="text-[13px] font-bold  tracking-widest text-slate-500 block">Payment Method</span>
                                        <span className="text-xs font-bold  tracking-widest px-5 py-2 bg-white rounded-xl border border-slate-200 text-slate-950 shadow-sm">{order.payment_method || "COD"}</span>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <span className="text-[13px] font-bold  tracking-widest text-slate-500 block">Status</span>
                                        <span className={cn(
                                            "text-xs font-bold  tracking-widest px-5 py-2 rounded-xl border-2",
                                            order.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-500/10 shadow-lg' : 'bg-amber-50 text-amber-600 border-amber-100 shadow-inner'
                                        )}>{order.payment_status}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center pt-10 border-t border-slate-200/60">
                                    <span className="text-[13px] font-bold text-slate-500  tracking-[0.5em] mb-4">Total Amount</span>
                                    <span className="text-6xl font-bold text-slate-950 tracking-tighter  group-hover/bill:scale-110 transition-transform duration-500">{fmt(order.grand_total || 0).replace('₹', '')}<span className="text-xs ml-2 not- text-slate-300 font-light">INR</span></span>
                                </div>
                            </div>

                            {order.payment_gateway_ref && (
                                <div className="space-y-4">
                                    <label className="text-[13px] font-bold  tracking-widest text-slate-500 ml-1">Payment Reference ID</label>
                                    <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-[28px] border border-slate-100 shadow-inner group/sig">
                                        <span className="font-mono text-xs font-bold truncate flex-1 text-slate-500 group-hover/sig:text-blue-600 transition-colors  ">{order.payment_gateway_ref}</span>
                                        <button onClick={() => {
                                            navigator.clipboard.writeText(order.payment_gateway_ref);
                                            toast({ title: "Ref ID copied" });
                                        }} className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 hover:text-blue-600 transition-all hover:shadow-md active:scale-90">
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                {order.payment_status === "pending" && (
                                    <Button className="w-full h-16 rounded-[24px] bg-amber-500 hover:bg-black text-white font-bold text-xs  tracking-widest shadow-2xl shadow-amber-500/20 flex items-center justify-center gap-4 border-none transition-all active:scale-95" onClick={markPaymentPaid}>
                                        <CreditCard className="w-6 h-6" /> Mark as Paid
                                    </Button>
                                )}

                                {order.payment_status === "paid" && !["cancelled", "returned", "delivered"].includes(order.status) && (
                                    <Link to={`/apps/ecommerce/refunds/new?order=${order.id}`} className="block">
                                        <Button variant="outline" className="w-full h-16 rounded-[24px] font-bold text-xs  tracking-widest text-rose-500 border-rose-50 hover:bg-rose-500 hover:text-white gap-4 border-2 transition-all active:scale-95 shadow-lg shadow-rose-500/5">
                                            <RotateCcw className="w-6 h-6" /> Process Refund
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
