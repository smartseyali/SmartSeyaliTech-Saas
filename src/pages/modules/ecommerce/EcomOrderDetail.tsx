import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";
import { useParams, Link } from "react-router-dom";
import {
    ArrowLeft, Package, Truck, CheckCircle2, Clock, XCircle,
    RotateCcw, MapPin, Phone, Mail, CreditCard, Printer, Copy, ShoppingBag, Tag, RefreshCw,
    Ban, Undo2, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { logPaymentTransaction } from "@/lib/services/paymentService";

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

const CANCEL_REASONS = [
    "Customer requested cancellation",
    "Out of stock",
    "Pricing error",
    "Duplicate order",
    "Fraudulent order",
    "Delivery not possible to this area",
    "Other",
];

const RETURN_REASONS = [
    "Product damaged during shipping",
    "Wrong product delivered",
    "Product not as described",
    "Quality not satisfactory",
    "Size/fit issue",
    "Changed mind",
    "Other",
];

export default function EcomOrderDetail() {
    const { id } = useParams();
    const { activeCompany } = useTenant();
    const { toast } = useToast();
    const [order, setOrder] = useState<any>(null);
    const [items, setItems] = useState<any[]>([]);
    const [timeline, setTimeline] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [trackingInput, setTrackingInput] = useState("");
    const [courierInput, setCourierInput] = useState("");

    // Cancel modal state
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);
    const [cancelNote, setCancelNote] = useState("");

    // Return modal state
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [returnReason, setReturnReason] = useState(RETURN_REASONS[0]);
    const [returnNote, setReturnNote] = useState("");

    // Refund modal state
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [refundAmount, setRefundAmount] = useState("");
    const [refundType, setRefundType] = useState<"full" | "partial">("full");
    const [refundMethod, setRefundMethod] = useState("original_payment");
    const [refundNote, setRefundNote] = useState("");

    useEffect(() => { if (id && activeCompany) load(); }, [id, activeCompany?.id]);

    const load = async () => {
        if (!id || !activeCompany) return;
        setLoading(true);
        try {
            const [{ data: o }, { data: i }, { data: t }, { data: tx }] = await Promise.all([
                supabase.from("ecom_orders").select("*").eq("id", id).eq("company_id", activeCompany.id).maybeSingle(),
                supabase.from("ecom_order_items").select("*").eq("order_id", id),
                supabase.from("ecom_order_timeline").select("*").eq("order_id", id).order("created_at", { ascending: true }),
                supabase.from("payment_transactions").select("*").eq("order_id", id).order("created_at", { ascending: false }),
            ]);

            setOrder(o);
            setItems(i || []);
            setTimeline(t || []);
            setTransactions(tx || []);
            if (o) {
                setTrackingInput(o.tracking_number || "");
                setCourierInput(o.courier_name || "");
                setRefundAmount(String(o.grand_total || 0));
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
        await supabase.from("ecom_order_timeline").insert([{ order_id: order.id, company_id: activeCompany?.id, status: next, note: `Status advanced to ${next}` }]);
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
        if (!order || !activeCompany) return;
        await supabase.from("ecom_orders").update({ payment_status: "paid" }).eq("id", order.id);
        await logPaymentTransaction(activeCompany.id, order.id, order.payment_method || "manual", Number(order.grand_total), "success", undefined, { marked_by: "admin" });

        // Auto-confirm if setting enabled
        if (order.status === "pending") {
            const { data: settings } = await supabase.from("ecom_settings").select("auto_confirm_paid_orders").eq("company_id", activeCompany.id).maybeSingle();
            if (settings?.auto_confirm_paid_orders !== false) {
                await supabase.from("ecom_orders").update({ status: "confirmed" }).eq("id", order.id);
                await supabase.from("ecom_order_timeline").insert([{
                    order_id: order.id, company_id: activeCompany.id,
                    status: "confirmed", note: "Auto-confirmed after manual payment verification.",
                }]);
            }
        }

        toast({ title: "Payment marked as Paid" });
        load();
    };

    // ─── Cancel Order ───────────────────────────────────────────────────────
    const cancelOrder = async () => {
        if (!order || !activeCompany) return;
        setUpdating(true);
        const reason = cancelReason === "Other" ? cancelNote : cancelReason;

        await supabase.from("ecom_orders").update({
            status: "cancelled",
            cancellation_reason: reason,
            cancelled_at: new Date().toISOString(),
            cancelled_by: "admin",
            updated_at: new Date().toISOString(),
        }).eq("id", order.id);

        await supabase.from("ecom_order_timeline").insert([{
            order_id: order.id, company_id: activeCompany.id,
            status: "cancelled", note: `Order cancelled: ${reason}`,
        }]);

        // Auto-create refund if payment was received
        if (order.payment_status === "paid") {
            await supabase.from("refunds").insert([{
                company_id: activeCompany.id,
                order_id: order.id,
                order_number: order.order_number,
                customer_name: order.customer_name,
                amount: order.grand_total,
                reason: `Cancellation: ${reason}`,
                status: "pending",
                refund_type: "full",
                refund_method: "original_payment",
                payment_method: order.payment_method,
            }]);
            toast({ title: "Order cancelled & refund request created" });
        } else {
            toast({ title: "Order cancelled" });
        }

        setShowCancelModal(false);
        setCancelNote("");
        setUpdating(false);
        load();
    };

    // ─── Process Return ─────────────────────────────────────────────────────
    const initiateReturn = async () => {
        if (!order || !activeCompany) return;
        setUpdating(true);
        const reason = returnReason === "Other" ? returnNote : returnReason;

        await supabase.from("ecom_orders").update({
            return_status: "requested",
            return_reason: reason,
            return_requested_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }).eq("id", order.id);

        await supabase.from("ecom_order_timeline").insert([{
            order_id: order.id, company_id: activeCompany.id,
            status: "returned", note: `Return requested: ${reason}`,
        }]);

        toast({ title: "Return request initiated" });
        setShowReturnModal(false);
        setReturnNote("");
        setUpdating(false);
        load();
    };

    const advanceReturnStatus = async () => {
        if (!order || !activeCompany) return;
        const RETURN_FLOW: Record<string, string> = {
            requested: "approved", approved: "picked_up", picked_up: "received", received: "completed",
        };
        const next = RETURN_FLOW[order.return_status];
        if (!next) return;

        setUpdating(true);
        const updates: any = { return_status: next, updated_at: new Date().toISOString() };
        if (next === "completed") updates.status = "returned";

        await supabase.from("ecom_orders").update(updates).eq("id", order.id);
        await supabase.from("ecom_order_timeline").insert([{
            order_id: order.id, company_id: activeCompany.id,
            status: next === "completed" ? "returned" : order.status,
            note: `Return status: ${next}`,
        }]);

        // Auto-create refund when return is completed
        if (next === "completed" && order.payment_status === "paid") {
            await supabase.from("refunds").insert([{
                company_id: activeCompany.id,
                order_id: order.id,
                order_number: order.order_number,
                customer_name: order.customer_name,
                amount: order.grand_total,
                reason: `Return: ${order.return_reason}`,
                status: "pending",
                refund_type: "full",
                refund_method: "original_payment",
                payment_method: order.payment_method,
            }]);
            toast({ title: `Return completed & refund created` });
        } else {
            toast({ title: `Return → ${next}` });
        }

        setUpdating(false);
        load();
    };

    // ─── Initiate Refund ────────────────────────────────────────────────────
    const createRefund = async () => {
        if (!order || !activeCompany) return;
        setUpdating(true);

        const amount = refundType === "full" ? Number(order.grand_total) : Number(refundAmount);

        await supabase.from("refunds").insert([{
            company_id: activeCompany.id,
            order_id: order.id,
            order_number: order.order_number,
            customer_name: order.customer_name,
            amount,
            reason: refundNote || "Merchant initiated refund",
            status: "pending",
            refund_type: refundType,
            refund_method: refundMethod,
            payment_method: order.payment_method,
        }]);

        await supabase.from("ecom_order_timeline").insert([{
            order_id: order.id, company_id: activeCompany.id,
            status: order.status, note: `Refund of ₹${amount} initiated (${refundType})`,
        }]);

        toast({ title: `Refund of ₹${amount} created` });
        setShowRefundModal(false);
        setRefundNote("");
        setUpdating(false);
        load();
    };

    const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
            <RefreshCw className="w-10 h-10 text-blue-600 animate-spin opacity-40" />
            <p className="text-xs font-bold tracking-widest text-slate-500">Loading order details...</p>
        </div>
    );
    if (!order) return (
        <div className="flex flex-col items-center justify-center p-20 gap-6 text-center">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-rose-300" />
            </div>
            <div className="space-y-2">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Order Not Found</h1>
                <p className="text-sm font-medium text-slate-500 max-w-md">The requested record does not exist or belongs to another workspace.</p>
            </div>
            <Button variant="outline" className="h-11 px-8 rounded-lg font-bold border-slate-200 text-slate-600" onClick={() => window.history.back()}>Return to Dashboard</Button>
        </div>
    );

    const stageIdx = ORDER_STAGES.indexOf(order.status);
    const isCancelled = order.status === "cancelled" || order.status === "returned";
    const nextStatus = NEXT_STATUS[order.status];
    const addr = order.shipping_address || {};
    const canCancel = ["pending", "confirmed", "packed"].includes(order.status);
    const canReturn = order.status === "delivered" && !order.return_status;
    const hasActiveReturn = !!order.return_status && order.return_status !== "completed";
    const RETURN_LABELS: Record<string, string> = { requested: "Approved", approved: "Picked Up", picked_up: "Received", received: "Completed" };

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
                            <span className="text-xs font-bold tracking-widest text-slate-500">Order Details</span>
                        </div>
                        <div className="flex items-center gap-6 flex-wrap">
                            <h1 className="text-4xl font-bold tracking-tighter text-slate-950 leading-none">{order.order_number}</h1>
                            <div className={cn(
                                "px-5 py-2 rounded-full text-xs font-bold tracking-widest border shadow-sm",
                                isCancelled ? "bg-rose-50 text-rose-600 border-rose-100" :
                                    order.status === "delivered" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                        "bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-600/20"
                            )}>
                                {STAGE_LABELS[order.status] || order.status}
                            </div>
                            <div className={cn(
                                "px-5 py-2 rounded-full text-xs font-bold tracking-widest border shadow-sm",
                                order.payment_status === "paid" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                    order.payment_status === "refunded" ? "bg-violet-50 text-violet-600 border-violet-100" :
                                        "bg-amber-50 text-amber-600 border-amber-100"
                            )}>
                                {order.payment_status}
                            </div>
                            {order.return_status && (
                                <div className="px-5 py-2 rounded-full text-xs font-bold tracking-widest border shadow-sm bg-orange-50 text-orange-600 border-orange-100">
                                    Return: {order.return_status}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <Button variant="outline" className="h-12 px-6 rounded-2xl bg-white border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all gap-2 shadow-sm active:scale-95" onClick={() => window.print()}>
                        <Printer className="w-4 h-4" /> Print
                    </Button>
                    {canCancel && (
                        <Button variant="outline" className="h-12 px-6 rounded-2xl border-rose-200 text-rose-600 font-bold hover:bg-rose-50 transition-all gap-2 shadow-sm active:scale-95" onClick={() => setShowCancelModal(true)}>
                            <Ban className="w-4 h-4" /> Cancel Order
                        </Button>
                    )}
                    {canReturn && (
                        <Button variant="outline" className="h-12 px-6 rounded-2xl border-orange-200 text-orange-600 font-bold hover:bg-orange-50 transition-all gap-2 shadow-sm active:scale-95" onClick={() => setShowReturnModal(true)}>
                            <Undo2 className="w-4 h-4" /> Process Return
                        </Button>
                    )}
                    {hasActiveReturn && (
                        <Button className="h-12 px-6 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold tracking-widest text-xs shadow-lg shadow-orange-500/20 transition-all active:scale-95" onClick={advanceReturnStatus} disabled={updating}>
                            Mark Return as {RETURN_LABELS[order.return_status] || "Next"}
                        </Button>
                    )}
                    {nextStatus && !isCancelled && !hasActiveReturn && (
                        <Button className="h-12 px-8 rounded-2xl bg-blue-600 hover:bg-black text-white font-bold tracking-widest text-xs shadow-2xl shadow-blue-600/20 transition-all active:scale-95" onClick={advanceStatus} disabled={updating}>
                            {updating ? "Updating..." : `Mark as ${STAGE_LABELS[nextStatus]}`}
                        </Button>
                    )}
                </div>
            </div>

            {/* Cancellation Banner */}
            {order.status === "cancelled" && order.cancellation_reason && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 flex items-start gap-4">
                    <AlertTriangle className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-sm font-bold text-rose-700">Order Cancelled</p>
                        <p className="text-sm text-rose-600 mt-1">{order.cancellation_reason}</p>
                        {order.cancelled_at && <p className="text-xs text-rose-400 mt-2">Cancelled on {new Date(order.cancelled_at).toLocaleString("en-IN")}</p>}
                    </div>
                </div>
            )}

            {/* Return Banner */}
            {order.return_status && (
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 flex items-start gap-4">
                    <Undo2 className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-sm font-bold text-orange-700">Return In Progress — {order.return_status}</p>
                        <p className="text-sm text-orange-600 mt-1">{order.return_reason}</p>
                        {order.return_requested_at && <p className="text-xs text-orange-400 mt-2">Requested on {new Date(order.return_requested_at).toLocaleString("en-IN")}</p>}
                    </div>
                </div>
            )}

            {/* Order Progress */}
            {!isCancelled && (
                <div className="bg-white rounded-[48px] border border-slate-100 p-12 shadow-sm overflow-hidden relative hover:shadow-2xl transition-all duration-500">
                    <div className="flex items-start justify-between relative w-full">
                        {ORDER_STAGES.map((stage, i) => {
                            const Icon = STAGE_ICONS[stage];
                            const done = i <= stageIdx;
                            const current = i === stageIdx;
                            return (
                                <div key={stage} className="flex flex-col items-center gap-6 z-10 flex-1 relative">
                                    {i < ORDER_STAGES.length - 1 && (
                                        <div className="absolute left-[50%] top-8 w-full h-[4px] bg-slate-50">
                                            <div className={cn("h-full transition-all duration-1000", i < stageIdx ? "w-full bg-blue-600" : "w-0")} />
                                        </div>
                                    )}
                                    <div className={cn(
                                        "w-16 h-16 rounded-[24px] flex items-center justify-center border-4 transition-all duration-700 shadow-sm",
                                        done ? "bg-blue-600 border-white text-white scale-110 shadow-2xl shadow-blue-600/30" : "bg-white border-slate-50 text-slate-200",
                                        current && "ring-[12px] ring-blue-500/5"
                                    )}>
                                        <Icon className={cn("w-7 h-7", current && "animate-pulse")} />
                                    </div>
                                    <span className={cn("text-[11px] font-bold tracking-widest text-center", done ? "text-slate-900" : "text-slate-200")}>
                                        {STAGE_LABELS[stage]}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                <div className="lg:col-span-8 space-y-12">
                    {/* Order Items Table */}
                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-10 py-8 border-b border-slate-50 bg-white flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-950 flex items-center gap-4">
                                <ShoppingBag className="w-6 h-6 text-blue-600" /> Order Items
                            </h2>
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-5 py-2 rounded-2xl tracking-widest border border-blue-100">{items.length} Items</span>
                        </div>
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50/50 text-[11px] font-bold tracking-widest text-slate-500 border-b border-slate-50">
                                    <th className="px-10 py-6 text-left">Product</th>
                                    <th className="px-8 py-6 text-center">Qty</th>
                                    <th className="px-8 py-6 text-right">Price</th>
                                    <th className="px-10 py-6 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {items.map(item => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-all group">
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl font-bold text-slate-200 shrink-0">
                                                    {item.product_name?.[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-950 tracking-tight group-hover:text-blue-600 transition-colors">{item.product_name}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {item.variant_label && <span className="px-2 py-0.5 bg-slate-900 rounded text-[8px] font-bold text-white tracking-widest">{item.variant_label}</span>}
                                                        {item.sku && <span className="text-[10px] text-slate-400 font-mono">#{item.sku}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-100 font-bold text-slate-950 shadow-sm">{item.quantity}</span>
                                        </td>
                                        <td className="px-8 py-6 text-right text-xs font-bold text-slate-400 tracking-widest">{fmt(item.unit_price)}</td>
                                        <td className="px-10 py-6 text-right text-lg font-bold text-slate-950 tracking-tighter">{fmt(item.amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Totals */}
                        <div className="p-10 space-y-5 bg-slate-900 border-t border-slate-100 text-white relative overflow-hidden">
                            <div className="flex justify-between items-center text-xs font-bold tracking-widest text-slate-500">
                                <span>Subtotal</span>
                                <span className="font-mono text-white/60">{fmt(order.subtotal || 0)}</span>
                            </div>
                            {Number(order.coupon_discount) > 0 && (
                                <div className="flex justify-between items-center text-xs font-bold text-emerald-400 tracking-widest">
                                    <div className="flex items-center gap-3"><Tag className="w-4 h-4" /> Discount [{order.coupon_code}]</div>
                                    <span className="bg-emerald-500/20 px-3 py-1 rounded-lg border border-emerald-500/30">-{fmt(order.coupon_discount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-xs font-bold tracking-widest text-slate-500">
                                <span>Tax</span>
                                <span className="font-mono text-white/60">{fmt(order.tax_amount || 0)}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-bold tracking-widest text-slate-500 border-b border-white/5 pb-8">
                                <span>Shipping</span>
                                <span className="text-blue-400">{Number(order.shipping_amount) === 0 ? "FREE" : fmt(order.shipping_amount)}</span>
                            </div>
                            <div className="flex justify-between items-end pt-6">
                                <span className="text-xs font-bold tracking-[0.3em] text-blue-500">Grand Total</span>
                                <span className="text-5xl font-bold text-white tracking-tighter">{fmt(order.grand_total || 0)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Shipping Info */}
                        <div className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm flex flex-col justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-slate-950 mb-8 flex items-center gap-3">
                                    <Truck className="w-5 h-5 text-blue-600" /> Shipping Info
                                </h2>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold tracking-widest text-slate-500">Courier Partner</label>
                                        <input value={courierInput} onChange={e => setCourierInput(e.target.value)}
                                            placeholder="e.g. Delhivery, Bluedart"
                                            className="w-full h-12 px-5 rounded-xl border border-slate-100 bg-slate-50/50 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-500 transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold tracking-widest text-slate-500">Tracking Number (AWB)</label>
                                        <div className="relative">
                                            <input value={trackingInput} onChange={e => setTrackingInput(e.target.value)}
                                                placeholder="Enter tracking number"
                                                className="w-full h-12 pl-5 pr-14 rounded-xl border border-slate-100 bg-slate-50/50 font-mono text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-500 transition-all" />
                                            <button className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-300 hover:text-blue-600 transition-all"
                                                onClick={() => { navigator.clipboard.writeText(trackingInput); toast({ title: "Copied" }); }}>
                                                <Copy className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Button className="w-full h-12 rounded-xl bg-blue-600 hover:bg-black text-white font-bold text-xs tracking-widest shadow-lg shadow-blue-600/20 transition-all mt-8 active:scale-95" onClick={saveTracking}>
                                Update Shipping
                            </Button>
                        </div>

                        {/* Order Timeline */}
                        <div className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-950 mb-8 flex items-center gap-3">
                                <Clock className="w-5 h-5 text-blue-600" /> Order History
                            </h2>
                            {timeline.length === 0 ? (
                                <div className="text-center py-16 bg-slate-50/30 rounded-2xl border border-dashed border-slate-200">
                                    <Clock className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                                    <p className="text-xs font-bold tracking-widest text-slate-300">No events</p>
                                </div>
                            ) : (
                                <div className="relative pl-8 space-y-8">
                                    <div className="absolute left-[15px] top-3 bottom-3 w-0.5 bg-slate-100 rounded-full" />
                                    {timeline.map((t, i) => {
                                        const Icon = STAGE_ICONS[t.status] || Clock;
                                        const isLast = i === timeline.length - 1;
                                        return (
                                            <div key={t.id} className="relative">
                                                <div className={cn(
                                                    "absolute -left-[41px] w-9 h-9 rounded-xl flex items-center justify-center border-2",
                                                    isLast ? "bg-blue-600 border-white text-white shadow-lg" : "bg-white border-slate-100 text-slate-300"
                                                )}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{STAGE_LABELS[t.status] || t.status}</p>
                                                    <p className="text-[11px] font-bold text-slate-400 tracking-widest font-mono mt-1">
                                                        {new Date(t.created_at).toLocaleString("en-IN", { timeStyle: "short", dateStyle: "medium" })}
                                                    </p>
                                                    {t.note && (
                                                        <div className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-100 border-l-2 border-l-blue-500">
                                                            <p className="text-xs text-slate-500">{t.note}</p>
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

                {/* Right Sidebar */}
                <div className="lg:col-span-4 space-y-10">
                    {/* Customer Profile */}
                    <div className="bg-slate-950 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden">
                        <h2 className="text-xs font-bold tracking-widest text-blue-500 mb-8">Customer</h2>
                        <div className="flex flex-col items-center text-center mb-8">
                            <div className="w-24 h-24 rounded-[32px] bg-white/5 flex items-center justify-center text-white font-bold text-4xl border border-white/10 mb-6">
                                {order.customer_name?.charAt(0)}
                            </div>
                            <h3 className="font-bold text-2xl tracking-tighter leading-none mb-2">{order.customer_name}</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                                <Phone className="w-4 h-4 text-white/30" />
                                <span className="text-sm font-bold text-white/80 font-mono">{order.customer_phone || "—"}</span>
                            </div>
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                                <Mail className="w-4 h-4 text-white/30" />
                                <span className="text-sm font-bold text-white/80 truncate">{order.customer_email || "—"}</span>
                            </div>
                        </div>
                        {addr.line1 && (
                            <div className="mt-8 pt-8 border-t border-white/10">
                                <div className="flex items-center gap-3 mb-4">
                                    <MapPin className="w-4 h-4 text-blue-500" />
                                    <span className="text-[10px] font-bold tracking-widest text-white/30">Delivery Address</span>
                                </div>
                                <div className="p-5 rounded-2xl bg-white/5 border border-white/5 text-sm text-white/50">
                                    <p className="text-white font-bold mb-1">{addr.line1}</p>
                                    {addr.city && <p className="text-xs text-blue-500 font-bold font-mono">{addr.city}, {addr.state} - {addr.pincode}</p>}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-950 mb-6 flex items-center gap-3">
                            <CreditCard className="w-5 h-5 text-blue-600" /> Payment
                        </h2>
                        <div className="space-y-6">
                            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <span className="text-[11px] font-bold tracking-widest text-slate-500 block mb-1">Method</span>
                                        <span className="text-xs font-bold px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-slate-900 uppercase tracking-widest">{order.payment_method || "COD"}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[11px] font-bold tracking-widest text-slate-500 block mb-1">Status</span>
                                        <span className={cn(
                                            "text-xs font-bold px-3 py-1.5 rounded-lg border",
                                            order.payment_status === "paid" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                order.payment_status === "refunded" ? "bg-violet-50 text-violet-600 border-violet-100" :
                                                    "bg-amber-50 text-amber-600 border-amber-100"
                                        )}>{order.payment_status}</span>
                                    </div>
                                </div>
                                <div className="text-center pt-4 border-t border-slate-200/60">
                                    <span className="text-[10px] font-bold tracking-[0.3em] text-slate-400">Total</span>
                                    <p className="text-4xl font-bold text-slate-950 tracking-tighter mt-1">{fmt(order.grand_total || 0)}</p>
                                </div>
                            </div>

                            {order.payment_gateway_ref && (
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold tracking-widest text-slate-500">Payment Ref</label>
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <span className="font-mono text-xs font-bold truncate flex-1 text-slate-500">{order.payment_gateway_ref}</span>
                                        <button onClick={() => { navigator.clipboard.writeText(order.payment_gateway_ref); toast({ title: "Copied" }); }}
                                            className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-300 hover:text-blue-600 transition-all">
                                            <Copy className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Payment Transactions */}
                            {transactions.length > 0 && (
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold tracking-widest text-slate-500">Transaction Log</label>
                                    <div className="space-y-2">
                                        {transactions.map(tx => (
                                            <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                                                <div>
                                                    <span className="font-bold text-slate-700 uppercase tracking-widest">{tx.gateway}</span>
                                                    <span className={cn(
                                                        "ml-2 px-2 py-0.5 rounded text-[10px] font-bold",
                                                        tx.status === "success" ? "bg-emerald-100 text-emerald-700" :
                                                            tx.status === "failed" ? "bg-rose-100 text-rose-700" :
                                                                tx.status === "refunded" ? "bg-violet-100 text-violet-700" :
                                                                    "bg-amber-100 text-amber-700"
                                                    )}>{tx.status}</span>
                                                </div>
                                                <span className="font-bold text-slate-900">{fmt(tx.amount)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3">
                                {order.payment_status === "pending" && (
                                    <Button className="w-full h-12 rounded-xl bg-amber-500 hover:bg-black text-white font-bold text-xs tracking-widest shadow-lg shadow-amber-500/20 gap-3 transition-all active:scale-95" onClick={markPaymentPaid}>
                                        <CreditCard className="w-4 h-4" /> Mark as Paid
                                    </Button>
                                )}
                                {order.payment_status === "paid" && !isCancelled && (
                                    <Button variant="outline" className="w-full h-12 rounded-xl font-bold text-xs tracking-widest text-rose-500 border-rose-100 hover:bg-rose-500 hover:text-white gap-3 transition-all active:scale-95" onClick={() => setShowRefundModal(true)}>
                                        <RotateCcw className="w-4 h-4" /> Initiate Refund
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ Cancel Modal ═══ */}
            {showCancelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowCancelModal(false)}>
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl space-y-6 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500"><Ban className="w-5 h-5" /></div>
                            <h3 className="text-lg font-bold text-slate-900">Cancel Order</h3>
                        </div>
                        <p className="text-sm text-slate-500">This will cancel order <span className="font-bold text-slate-700">{order.order_number}</span>.{order.payment_status === "paid" && " A refund request will be automatically created."}</p>
                        <div className="space-y-2">
                            <label className="text-xs font-bold tracking-widest text-slate-500">Reason</label>
                            <select value={cancelReason} onChange={e => setCancelReason(e.target.value)}
                                className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/8 outline-none">
                                {CANCEL_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        {cancelReason === "Other" && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold tracking-widest text-slate-500">Details</label>
                                <textarea value={cancelNote} onChange={e => setCancelNote(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm resize-none h-20 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/8 outline-none"
                                    placeholder="Please provide details..." />
                            </div>
                        )}
                        <div className="flex gap-3 pt-2">
                            <Button variant="outline" className="flex-1 h-11 rounded-xl font-bold" onClick={() => setShowCancelModal(false)}>Keep Order</Button>
                            <Button className="flex-1 h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-lg shadow-rose-600/20" onClick={cancelOrder} disabled={updating}>
                                {updating ? "Cancelling..." : "Confirm Cancel"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ Return Modal ═══ */}
            {showReturnModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowReturnModal(false)}>
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl space-y-6 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500"><Undo2 className="w-5 h-5" /></div>
                            <h3 className="text-lg font-bold text-slate-900">Process Return</h3>
                        </div>
                        <p className="text-sm text-slate-500">Initiate return for order <span className="font-bold text-slate-700">{order.order_number}</span>. A refund will be created once the return is completed.</p>
                        <div className="space-y-2">
                            <label className="text-xs font-bold tracking-widest text-slate-500">Return Reason</label>
                            <select value={returnReason} onChange={e => setReturnReason(e.target.value)}
                                className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/8 outline-none">
                                {RETURN_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        {returnReason === "Other" && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold tracking-widest text-slate-500">Details</label>
                                <textarea value={returnNote} onChange={e => setReturnNote(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm resize-none h-20 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/8 outline-none"
                                    placeholder="Please provide details..." />
                            </div>
                        )}
                        <div className="flex gap-3 pt-2">
                            <Button variant="outline" className="flex-1 h-11 rounded-xl font-bold" onClick={() => setShowReturnModal(false)}>Cancel</Button>
                            <Button className="flex-1 h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-lg shadow-orange-500/20" onClick={initiateReturn} disabled={updating}>
                                {updating ? "Processing..." : "Initiate Return"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ Refund Modal ═══ */}
            {showRefundModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowRefundModal(false)}>
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl space-y-6 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-500"><RotateCcw className="w-5 h-5" /></div>
                            <h3 className="text-lg font-bold text-slate-900">Initiate Refund</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold tracking-widest text-slate-500">Refund Type</label>
                                <div className="flex gap-3">
                                    {(["full", "partial"] as const).map(t => (
                                        <button key={t} onClick={() => { setRefundType(t); if (t === "full") setRefundAmount(String(order.grand_total)); }}
                                            className={cn("flex-1 h-11 rounded-xl text-sm font-bold border transition-all",
                                                refundType === t ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-200"
                                            )}>
                                            {t === "full" ? `Full (${fmt(order.grand_total)})` : "Partial"}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {refundType === "partial" && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold tracking-widest text-slate-500">Refund Amount</label>
                                    <input type="number" value={refundAmount} onChange={e => setRefundAmount(e.target.value)}
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-500/8 outline-none"
                                        max={order.grand_total} min={1} step="0.01" />
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="text-xs font-bold tracking-widest text-slate-500">Refund Method</label>
                                <select value={refundMethod} onChange={e => setRefundMethod(e.target.value)}
                                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/8 outline-none">
                                    <option value="original_payment">Original Payment Method</option>
                                    <option value="bank_transfer">Bank Transfer</option>
                                    <option value="store_credit">Store Credit</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold tracking-widest text-slate-500">Note (optional)</label>
                                <textarea value={refundNote} onChange={e => setRefundNote(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm resize-none h-20 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/8 outline-none"
                                    placeholder="Reason for refund..." />
                            </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <Button variant="outline" className="flex-1 h-11 rounded-xl font-bold" onClick={() => setShowRefundModal(false)}>Cancel</Button>
                            <Button className="flex-1 h-11 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold shadow-lg shadow-violet-600/20" onClick={createRefund} disabled={updating}>
                                {updating ? "Processing..." : `Refund ${fmt(refundType === "full" ? order.grand_total : Number(refundAmount) || 0)}`}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
