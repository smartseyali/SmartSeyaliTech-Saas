import { useState, useEffect, lazy, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft, Package, Truck, CheckCircle2, Clock, XCircle,
    RotateCcw, Printer, ShoppingBag, RefreshCw,
    Ban, Undo2, AlertTriangle, CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import ERPEntryForm from "@/components/modules/ERPEntryForm";
import { logPaymentTransaction } from "@/lib/services/paymentService";

const PrintPreview = lazy(() => import("@/components/modules/PrintPreview"));

const STAGE_LABELS: Record<string, string> = {
    pending: "Order Placed", confirmed: "Confirmed", packed: "Packed",
    shipped: "Shipped", out_for_delivery: "Out for Delivery", delivered: "Delivered",
    cancelled: "Cancelled", returned: "Returned",
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
    const navigate = useNavigate();
    const [order, setOrder] = useState<any>(null);
    const [items, setItems] = useState<any[]>([]);
    const [timeline, setTimeline] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [showPrint, setShowPrint] = useState(false);

    // Modal states
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);
    const [cancelNote, setCancelNote] = useState("");
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [returnReason, setReturnReason] = useState(RETURN_REASONS[0]);
    const [returnNote, setReturnNote] = useState("");
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
            if (o) setRefundAmount(String(o.grand_total || 0));
        } catch (err) {
            toast({ variant: "destructive", title: "Load Failed" });
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
        setUpdating(false);
        load();
    };

    const handleSaveOrder = async (header: any) => {
        if (!order || !activeCompany) return;
        await supabase.from("ecom_orders").update({
            customer_name: header.customer_name,
            customer_email: header.customer_email,
            customer_phone: header.customer_phone,
            payment_method: header.payment_method,
            payment_status: header.payment_status,
            tracking_number: header.tracking_number,
            courier_name: header.courier_name,
            shipping_address: {
                line1: header.shipping_line1,
                city: header.shipping_city,
                state: header.shipping_state,
                pincode: header.shipping_pincode,
            },
            notes: header.notes,
            updated_at: new Date().toISOString(),
        }).eq("id", order.id);
        toast({ title: "Order updated" });
        load();
    };

    const markPaymentPaid = async () => {
        if (!order || !activeCompany) return;
        await supabase.from("ecom_orders").update({ payment_status: "paid" }).eq("id", order.id);
        await logPaymentTransaction(activeCompany.id, order.id, order.payment_method || "manual", Number(order.grand_total), "success", undefined, { marked_by: "admin" });
        if (order.status === "pending") {
            const { data: settings } = await supabase.from("ecom_settings").select("auto_confirm_paid_orders").eq("company_id", activeCompany.id).maybeSingle();
            if (settings?.auto_confirm_paid_orders !== false) {
                await supabase.from("ecom_orders").update({ status: "confirmed" }).eq("id", order.id);
                await supabase.from("ecom_order_timeline").insert([{ order_id: order.id, company_id: activeCompany.id, status: "confirmed", note: "Auto-confirmed after payment." }]);
            }
        }
        toast({ title: "Payment marked as Paid" });
        load();
    };

    const cancelOrder = async () => {
        if (!order || !activeCompany) return;
        setUpdating(true);
        const reason = cancelReason === "Other" ? cancelNote : cancelReason;
        await supabase.from("ecom_orders").update({ status: "cancelled", cancellation_reason: reason, cancelled_at: new Date().toISOString(), cancelled_by: "admin" }).eq("id", order.id);
        await supabase.from("ecom_order_timeline").insert([{ order_id: order.id, company_id: activeCompany.id, status: "cancelled", note: `Cancelled: ${reason}` }]);
        if (order.payment_status === "paid") {
            await supabase.from("refunds").insert([{ company_id: activeCompany.id, order_id: order.id, order_number: order.order_number, customer_name: order.customer_name, amount: order.grand_total, reason: `Cancellation: ${reason}`, status: "pending", refund_type: "full", refund_method: "original_payment", payment_method: order.payment_method }]);
        }
        toast({ title: order.payment_status === "paid" ? "Order cancelled & refund created" : "Order cancelled" });
        setShowCancelModal(false);
        setUpdating(false);
        load();
    };

    const initiateReturn = async () => {
        if (!order || !activeCompany) return;
        setUpdating(true);
        const reason = returnReason === "Other" ? returnNote : returnReason;
        await supabase.from("ecom_orders").update({ return_status: "requested", return_reason: reason, return_requested_at: new Date().toISOString() }).eq("id", order.id);
        await supabase.from("ecom_order_timeline").insert([{ order_id: order.id, company_id: activeCompany.id, status: "returned", note: `Return requested: ${reason}` }]);
        toast({ title: "Return initiated" });
        setShowReturnModal(false);
        setUpdating(false);
        load();
    };

    const advanceReturnStatus = async () => {
        if (!order || !activeCompany) return;
        const RETURN_FLOW: Record<string, string> = { requested: "approved", approved: "picked_up", picked_up: "received", received: "completed" };
        const next = RETURN_FLOW[order.return_status];
        if (!next) return;
        setUpdating(true);
        const updates: any = { return_status: next, updated_at: new Date().toISOString() };
        if (next === "completed") updates.status = "returned";
        await supabase.from("ecom_orders").update(updates).eq("id", order.id);
        await supabase.from("ecom_order_timeline").insert([{ order_id: order.id, company_id: activeCompany.id, status: next === "completed" ? "returned" : order.status, note: `Return: ${next}` }]);
        if (next === "completed" && order.payment_status === "paid") {
            await supabase.from("refunds").insert([{ company_id: activeCompany.id, order_id: order.id, order_number: order.order_number, customer_name: order.customer_name, amount: order.grand_total, reason: `Return: ${order.return_reason}`, status: "pending", refund_type: "full", refund_method: "original_payment", payment_method: order.payment_method }]);
            toast({ title: "Return completed & refund created" });
        } else {
            toast({ title: `Return → ${next}` });
        }
        setUpdating(false);
        load();
    };

    const createRefund = async () => {
        if (!order || !activeCompany) return;
        setUpdating(true);
        const amount = refundType === "full" ? Number(order.grand_total) : Number(refundAmount);
        await supabase.from("refunds").insert([{ company_id: activeCompany.id, order_id: order.id, order_number: order.order_number, customer_name: order.customer_name, amount, reason: refundNote || "Merchant initiated refund", status: "pending", refund_type: refundType, refund_method: refundMethod, payment_method: order.payment_method }]);
        await supabase.from("ecom_order_timeline").insert([{ order_id: order.id, company_id: activeCompany.id, status: order.status, note: `Refund of ₹${amount} initiated (${refundType})` }]);
        toast({ title: `Refund of ₹${amount} created` });
        setShowRefundModal(false);
        setUpdating(false);
        load();
    };

    const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
            <RefreshCw className="w-10 h-10 text-blue-600 animate-spin opacity-40" />
            <p className="text-xs font-bold tracking-widest text-slate-500">Loading order...</p>
        </div>
    );

    if (!order) return (
        <div className="flex flex-col items-center justify-center p-20 gap-6 text-center">
            <XCircle className="w-12 h-12 text-rose-300" />
            <h1 className="text-xl font-bold text-slate-900">Order Not Found</h1>
            <Button variant="outline" onClick={() => navigate("/apps/ecommerce/orders")}>Back to Orders</Button>
        </div>
    );

    const isCancelled = order.status === "cancelled" || order.status === "returned";
    const nextStatus = NEXT_STATUS[order.status];
    const canCancel = ["pending", "confirmed", "packed"].includes(order.status);
    const canReturn = order.status === "delivered" && !order.return_status;
    const hasActiveReturn = !!order.return_status && order.return_status !== "completed";
    const RETURN_LABELS: Record<string, string> = { requested: "Approved", approved: "Picked Up", picked_up: "Received", received: "Completed" };
    const addr = order.shipping_address || {};

    // Map order data to form fields
    const formData = {
        ...order,
        shipping_line1: addr.line1 || "",
        shipping_city: addr.city || "",
        shipping_state: addr.state || "",
        shipping_pincode: addr.pincode || "",
    };

    const orderFields = {
        basic: [
            { key: "order_number", label: "Order Number", type: "readonly" as const },
            { key: "status", label: "Order Status", type: "readonly" as const },
            { key: "customer_name", label: "Customer Name", type: "text" as const, required: true },
            { key: "customer_email", label: "Customer Email", type: "email" as const, required: true },
            { key: "customer_phone", label: "Phone", type: "phone" as const },
            { key: "payment_method", label: "Payment Method", type: "select" as const, options: [
                { value: "cod", label: "Cash on Delivery" },
                { value: "razorpay", label: "Razorpay" },
                { value: "upi", label: "UPI" },
                { value: "bank_transfer", label: "Bank Transfer" },
            ]},
            { key: "payment_status", label: "Payment Status", type: "select" as const, options: [
                { value: "pending", label: "Pending" },
                { value: "paid", label: "Paid" },
                { value: "refunded", label: "Refunded" },
            ]},
            { key: "created_at", label: "Order Date", type: "readonly" as const },
        ],
        config: [
            { key: "shipping_line1", label: "Shipping Address", type: "text" as const },
            { key: "shipping_city", label: "City", type: "text" as const },
            { key: "shipping_state", label: "State", type: "text" as const },
            { key: "shipping_pincode", label: "Pincode", type: "text" as const },
            { key: "tracking_number", label: "Tracking Number (AWB)", type: "text" as const, ph: "Enter tracking number" },
            { key: "courier_name", label: "Courier Partner", type: "text" as const, ph: "e.g. Delhivery, Bluedart" },
            { key: "coupon_code", label: "Coupon Code", type: "readonly" as const },
            { key: "notes", label: "Order Notes", type: "textarea" as const },
        ],
    };

    const itemViewFields = [
        { key: "product_name", label: "Product", type: "text" as const, readOnly: true },
        { key: "variant_label", label: "Variant", type: "text" as const, readOnly: true },
        { key: "sku", label: "SKU", type: "text" as const, readOnly: true },
        { key: "quantity", label: "Qty", type: "number" as const, readOnly: true },
        { key: "unit_price", label: "Unit Price", type: "number" as const, readOnly: true },
        { key: "amount", label: "Total", type: "number" as const, readOnly: true },
    ];

    // ─── Action Buttons (passed as customActions to ERPEntryForm) ────────

    const actionButtons = (
        <div className="flex items-center gap-2 flex-wrap">
            {order.payment_status === "pending" && (
                <Button className="h-9 px-4 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs tracking-widest gap-2" onClick={markPaymentPaid}>
                    <CreditCard className="w-3.5 h-3.5" /> Mark Paid
                </Button>
            )}
            {order.payment_status === "paid" && !isCancelled && (
                <Button variant="outline" className="h-9 px-4 rounded-lg text-violet-600 border-violet-200 hover:bg-violet-50 font-bold text-xs tracking-widest gap-2" onClick={() => setShowRefundModal(true)}>
                    <RotateCcw className="w-3.5 h-3.5" /> Refund
                </Button>
            )}
            {canCancel && (
                <Button variant="outline" className="h-9 px-4 rounded-lg text-rose-600 border-rose-200 hover:bg-rose-50 font-bold text-xs tracking-widest gap-2" onClick={() => setShowCancelModal(true)}>
                    <Ban className="w-3.5 h-3.5" /> Cancel
                </Button>
            )}
            {canReturn && (
                <Button variant="outline" className="h-9 px-4 rounded-lg text-orange-600 border-orange-200 hover:bg-orange-50 font-bold text-xs tracking-widest gap-2" onClick={() => setShowReturnModal(true)}>
                    <Undo2 className="w-3.5 h-3.5" /> Return
                </Button>
            )}
            {hasActiveReturn && (
                <Button className="h-9 px-4 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs tracking-widest gap-2" onClick={advanceReturnStatus} disabled={updating}>
                    Return → {RETURN_LABELS[order.return_status]}
                </Button>
            )}
            {nextStatus && !isCancelled && !hasActiveReturn && (
                <Button className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-widest gap-2" onClick={advanceStatus} disabled={updating}>
                    {updating ? "..." : `→ ${STAGE_LABELS[nextStatus]}`}
                </Button>
            )}
            <Button variant="outline" className="h-9 px-4 rounded-lg font-bold text-xs tracking-widest gap-2" onClick={() => setShowPrint(true)}>
                <Printer className="w-3.5 h-3.5" /> Print
            </Button>
        </div>
    );

    return (
        <>
            {/* Status Banners */}
            {order.status === "cancelled" && order.cancellation_reason && (
                <div className="mx-3 sm:mx-8 mt-4 bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-sm font-bold text-rose-700">Cancelled</p>
                        <p className="text-xs text-rose-600 mt-1">{order.cancellation_reason}</p>
                    </div>
                </div>
            )}
            {order.return_status && (
                <div className="mx-3 sm:mx-8 mt-4 bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
                    <Undo2 className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-sm font-bold text-orange-700">Return: {order.return_status}</p>
                        <p className="text-xs text-orange-600 mt-1">{order.return_reason}</p>
                    </div>
                </div>
            )}

            {/* Totals Summary Bar */}
            <div className="mx-3 sm:mx-8 mt-4 bg-slate-900 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white">
                <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs font-bold tracking-widest">
                    <span className="text-slate-400">Subtotal <span className="text-white ml-1 sm:ml-2">{fmt(order.subtotal || 0)}</span></span>
                    {Number(order.coupon_discount) > 0 && <span className="text-emerald-400">Discount <span className="text-emerald-300 ml-1">-{fmt(order.coupon_discount)}</span></span>}
                    <span className="text-slate-400">Tax <span className="text-white ml-1 sm:ml-2">{fmt(order.tax_amount || 0)}</span></span>
                    <span className="text-slate-400">Shipping <span className="text-blue-400 ml-1 sm:ml-2">{Number(order.shipping_amount) === 0 ? "FREE" : fmt(order.shipping_amount)}</span></span>
                </div>
                <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t border-white/10 sm:border-0">
                    <span className="text-xs font-bold tracking-widest text-blue-400">GRAND TOTAL</span>
                    <span className="text-xl sm:text-2xl font-bold tracking-tighter">{fmt(order.grand_total || 0)}</span>
                </div>
            </div>

            {/* Payment Transactions */}
            {transactions.length > 0 && (
                <div className="mx-8 mt-4 bg-white rounded-xl border border-slate-200 p-4">
                    <p className="text-xs font-bold tracking-widest text-slate-500 mb-3">Payment Transactions</p>
                    <div className="space-y-2">
                        {transactions.map(tx => (
                            <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg text-xs">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-700 uppercase tracking-widest">{tx.gateway}</span>
                                    <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold",
                                        tx.status === "success" ? "bg-emerald-100 text-emerald-700" :
                                        tx.status === "failed" ? "bg-rose-100 text-rose-700" :
                                        tx.status === "refunded" ? "bg-violet-100 text-violet-700" :
                                        "bg-amber-100 text-amber-700"
                                    )}>{tx.status}</span>
                                    {tx.transaction_id && <span className="text-slate-400 font-mono">{tx.transaction_id}</span>}
                                </div>
                                <span className="font-bold text-slate-900">{fmt(tx.amount)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Order Timeline */}
            {timeline.length > 0 && (
                <div className="mx-8 mt-4 bg-white rounded-xl border border-slate-200 p-4">
                    <p className="text-xs font-bold tracking-widest text-slate-500 mb-3">Order Timeline</p>
                    <div className="space-y-3">
                        {timeline.map((t, i) => (
                            <div key={t.id} className="flex items-start gap-3">
                                <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", i === timeline.length - 1 ? "bg-blue-600" : "bg-slate-200")} />
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-800">{STAGE_LABELS[t.status] || t.status}</span>
                                        <span className="text-[10px] text-slate-400 font-mono">{new Date(t.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
                                    </div>
                                    {t.note && <p className="text-[11px] text-slate-500 mt-0.5">{t.note}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ERPEntryForm — Main Order Form */}
            <ERPEntryForm
                title={`Order ${order.order_number}`}
                subtitle={`${STAGE_LABELS[order.status] || order.status} · ${order.payment_status} · ${order.customer_name}`}
                tabFields={orderFields}
                itemFields={itemViewFields}
                itemTitle="Order Items"
                onSave={handleSaveOrder}
                onAbort={() => navigate("/apps/ecommerce/orders")}
                initialData={formData}
                initialItems={items}
                showItems={items.length > 0}
                customActions={actionButtons}
            />

            {/* ═══ Cancel Modal ═══ */}
            {showCancelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowCancelModal(false)}>
                    <div className="bg-white rounded-2xl p-5 sm:p-8 w-full max-w-md mx-3 sm:mx-0 shadow-2xl space-y-5 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500"><Ban className="w-5 h-5" /></div>
                            <h3 className="text-lg font-bold text-slate-900">Cancel Order</h3>
                        </div>
                        <p className="text-sm text-slate-500">Cancel <strong>{order.order_number}</strong>.{order.payment_status === "paid" && " A refund will be auto-created."}</p>
                        <div className="space-y-2">
                            <label className="text-xs font-bold tracking-widest text-slate-500">Reason</label>
                            <select value={cancelReason} onChange={e => setCancelReason(e.target.value)} className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:border-blue-500 outline-none">
                                {CANCEL_REASONS.map(r => <option key={r}>{r}</option>)}
                            </select>
                        </div>
                        {cancelReason === "Other" && (
                            <textarea value={cancelNote} onChange={e => setCancelNote(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm resize-none h-20 focus:border-blue-500 outline-none" placeholder="Details..." />
                        )}
                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1 h-11 rounded-xl font-bold" onClick={() => setShowCancelModal(false)}>Keep Order</Button>
                            <Button className="flex-1 h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold" onClick={cancelOrder} disabled={updating}>{updating ? "..." : "Confirm Cancel"}</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ Return Modal ═══ */}
            {showReturnModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowReturnModal(false)}>
                    <div className="bg-white rounded-2xl p-5 sm:p-8 w-full max-w-md mx-3 sm:mx-0 shadow-2xl space-y-5 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500"><Undo2 className="w-5 h-5" /></div>
                            <h3 className="text-lg font-bold text-slate-900">Process Return</h3>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold tracking-widest text-slate-500">Reason</label>
                            <select value={returnReason} onChange={e => setReturnReason(e.target.value)} className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:border-blue-500 outline-none">
                                {RETURN_REASONS.map(r => <option key={r}>{r}</option>)}
                            </select>
                        </div>
                        {returnReason === "Other" && (
                            <textarea value={returnNote} onChange={e => setReturnNote(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm resize-none h-20 focus:border-blue-500 outline-none" placeholder="Details..." />
                        )}
                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1 h-11 rounded-xl font-bold" onClick={() => setShowReturnModal(false)}>Cancel</Button>
                            <Button className="flex-1 h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold" onClick={initiateReturn} disabled={updating}>{updating ? "..." : "Initiate Return"}</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ Refund Modal ═══ */}
            {showRefundModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowRefundModal(false)}>
                    <div className="bg-white rounded-2xl p-5 sm:p-8 w-full max-w-md mx-3 sm:mx-0 shadow-2xl space-y-5 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-500"><RotateCcw className="w-5 h-5" /></div>
                            <h3 className="text-lg font-bold text-slate-900">Initiate Refund</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                {(["full", "partial"] as const).map(t => (
                                    <button key={t} onClick={() => { setRefundType(t); if (t === "full") setRefundAmount(String(order.grand_total)); }}
                                        className={cn("flex-1 h-11 rounded-xl text-sm font-bold border transition-all",
                                            refundType === t ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200"
                                        )}>
                                        {t === "full" ? `Full (${fmt(order.grand_total)})` : "Partial"}
                                    </button>
                                ))}
                            </div>
                            {refundType === "partial" && (
                                <input type="number" value={refundAmount} onChange={e => setRefundAmount(e.target.value)}
                                    className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-bold focus:border-blue-500 outline-none" max={order.grand_total} min={1} />
                            )}
                            <select value={refundMethod} onChange={e => setRefundMethod(e.target.value)} className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:border-blue-500 outline-none">
                                <option value="original_payment">Original Payment Method</option>
                                <option value="bank_transfer">Bank Transfer</option>
                                <option value="store_credit">Store Credit</option>
                            </select>
                            <textarea value={refundNote} onChange={e => setRefundNote(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm resize-none h-20 focus:border-blue-500 outline-none" placeholder="Reason..." />
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1 h-11 rounded-xl font-bold" onClick={() => setShowRefundModal(false)}>Cancel</Button>
                            <Button className="flex-1 h-11 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold" onClick={createRefund} disabled={updating}>
                                {updating ? "..." : `Refund ${fmt(refundType === "full" ? order.grand_total : Number(refundAmount) || 0)}`}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            {showPrint && order && (
                <Suspense fallback={null}>
                    <PrintPreview
                        doctype="ecomOrder"
                        record={{
                            ...order,
                            shipping_address_line: typeof order.shipping_address === 'object'
                                ? [order.shipping_address?.address, order.shipping_address?.city, order.shipping_address?.state, order.shipping_address?.pincode].filter(Boolean).join(", ")
                                : (order.shipping_address || ""),
                            billing_address_line: typeof order.billing_address === 'object'
                                ? [order.billing_address?.address, order.billing_address?.city, order.billing_address?.state, order.billing_address?.pincode].filter(Boolean).join(", ")
                                : (order.billing_address || ""),
                            status_label: STAGE_LABELS[order.status] || order.status,
                        }}
                        items={items}
                        onClose={() => setShowPrint(false)}
                    />
                </Suspense>
            )}
        </>
    );
}
