import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useStorefrontAuth } from "@/hooks/useStorefrontAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
    Package, Clock, CheckCircle2, Truck, XCircle, RotateCcw,
    ShoppingBag, RefreshCw, LogOut, ChevronRight, CreditCard, MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: "Pending", color: "bg-amber-50 text-amber-700 border-amber-100", icon: Clock },
    confirmed: { label: "Confirmed", color: "bg-blue-50 text-blue-700 border-blue-100", icon: CheckCircle2 },
    packed: { label: "Packed", color: "bg-indigo-50 text-indigo-700 border-indigo-100", icon: Package },
    shipped: { label: "Shipped", color: "bg-purple-50 text-purple-700 border-purple-100", icon: Truck },
    out_for_delivery: { label: "Out for Delivery", color: "bg-orange-50 text-orange-700 border-orange-100", icon: Truck },
    delivered: { label: "Delivered", color: "bg-emerald-50 text-emerald-700 border-emerald-100", icon: CheckCircle2 },
    cancelled: { label: "Cancelled", color: "bg-rose-50 text-rose-700 border-rose-100", icon: XCircle },
    returned: { label: "Returned", color: "bg-slate-50 text-slate-700 border-slate-100", icon: RotateCcw },
};

export default function MyOrders() {
    const { customer, isAuthenticated, loading: authLoading, signOut } = useStorefrontAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [orderItems, setOrderItems] = useState<any[]>([]);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate("/store/login?redirect=/store/my-orders", { replace: true });
        }
    }, [authLoading, isAuthenticated]);

    useEffect(() => {
        if (customer) loadOrders();
    }, [customer]);

    const loadOrders = async () => {
        if (!customer) return;
        setLoading(true);

        // Fetch orders by customer email + company
        const { data } = await supabase
            .from("ecom_orders")
            .select("*")
            .eq("company_id", customer.company_id)
            .eq("customer_email", customer.email)
            .order("created_at", { ascending: false });

        setOrders(data || []);
        setLoading(false);
    };

    const viewOrder = async (order: any) => {
        setSelectedOrder(order);
        const { data } = await supabase
            .from("ecom_order_items")
            .select("*")
            .eq("order_id", order.id);
        setOrderItems(data || []);
    };

    const handleLogout = async () => {
        await signOut();
        navigate("/store/login", { replace: true });
    };

    const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

    if (authLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin opacity-40" />
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <ShoppingBag className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-slate-900">My Orders</h1>
                            <p className="text-xs text-slate-500">{customer?.full_name} — {customer?.email}</p>
                        </div>
                    </div>
                    <Button variant="outline" className="h-9 px-4 rounded-lg text-xs font-bold gap-2" onClick={handleLogout}>
                        <LogOut className="w-3.5 h-3.5" /> Logout
                    </Button>
                </div>

                {/* Order Detail View */}
                {selectedOrder ? (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <button onClick={() => setSelectedOrder(null)} className="text-sm font-bold text-blue-600 hover:text-blue-700">
                            ← Back to Orders
                        </button>

                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-xs font-bold tracking-widest text-slate-400">Order</p>
                                    <h2 className="text-2xl font-bold tracking-tighter text-slate-900">{selectedOrder.order_number}</h2>
                                </div>
                                <div className="flex items-center gap-2">
                                    {(() => {
                                        const sc = STATUS_CONFIG[selectedOrder.status] || STATUS_CONFIG.pending;
                                        return (
                                            <span className={cn("px-3 py-1.5 rounded-full text-xs font-bold border", sc.color)}>
                                                {sc.label}
                                            </span>
                                        );
                                    })()}
                                    <span className={cn("px-3 py-1.5 rounded-full text-xs font-bold border",
                                        selectedOrder.payment_status === "paid" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                            selectedOrder.payment_status === "refunded" ? "bg-violet-50 text-violet-700 border-violet-100" :
                                                "bg-amber-50 text-amber-700 border-amber-100"
                                    )}>{selectedOrder.payment_status}</span>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400">
                                Placed on {new Date(selectedOrder.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                            </p>

                            {selectedOrder.tracking_number && (
                                <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-3">
                                    <Truck className="w-4 h-4 text-blue-600" />
                                    <div>
                                        <span className="text-xs text-blue-600 font-bold">Tracking: </span>
                                        <span className="text-xs font-mono font-bold text-blue-800">{selectedOrder.tracking_number}</span>
                                        {selectedOrder.courier_name && <span className="text-xs text-blue-500 ml-2">via {selectedOrder.courier_name}</span>}
                                    </div>
                                </div>
                            )}

                            {selectedOrder.cancellation_reason && (
                                <div className="mt-4 p-3 bg-rose-50 rounded-xl border border-rose-100">
                                    <p className="text-xs font-bold text-rose-700">Cancelled: {selectedOrder.cancellation_reason}</p>
                                </div>
                            )}

                            {selectedOrder.return_status && (
                                <div className="mt-4 p-3 bg-orange-50 rounded-xl border border-orange-100">
                                    <p className="text-xs font-bold text-orange-700">Return: {selectedOrder.return_status} — {selectedOrder.return_reason}</p>
                                </div>
                            )}
                        </div>

                        {/* Items */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100">
                                <h3 className="text-sm font-bold text-slate-900">Items ({orderItems.length})</h3>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {orderItems.map(item => (
                                    <div key={item.id} className="px-6 py-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-sm font-bold text-slate-300">
                                                {item.product_name?.[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{item.product_name}</p>
                                                <div className="flex gap-2 mt-0.5">
                                                    {item.variant_label && <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-500">{item.variant_label}</span>}
                                                    <span className="text-[10px] text-slate-400">x{item.quantity}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-sm font-bold text-slate-900">{fmt(item.amount)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                                <span className="text-sm font-bold text-slate-500">Total</span>
                                <span className="text-xl font-bold text-slate-900 tracking-tighter">{fmt(selectedOrder.grand_total)}</span>
                            </div>
                        </div>

                        {/* Delivery Address */}
                        {selectedOrder.shipping_address?.line1 && (
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                    <MapPin className="w-4 h-4 text-blue-600" />
                                    <span className="text-xs font-bold tracking-widest text-slate-500">Delivery Address</span>
                                </div>
                                <p className="text-sm font-bold text-slate-900">{selectedOrder.shipping_address.line1}</p>
                                {selectedOrder.shipping_address.city && (
                                    <p className="text-xs text-slate-500 mt-1">
                                        {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} - {selectedOrder.shipping_address.pincode}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    /* Order List */
                    <>
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin opacity-40" />
                                <p className="text-xs font-bold tracking-widest text-slate-500">Loading your orders...</p>
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-slate-200 text-center py-20 space-y-4 shadow-sm">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                                    <ShoppingBag className="w-8 h-8 text-slate-300" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">No orders yet</h3>
                                <p className="text-sm text-slate-500 max-w-sm mx-auto">When you place an order, it will appear here.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {orders.map(order => {
                                    const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                                    const StatusIcon = sc.icon;
                                    return (
                                        <button key={order.id}
                                            onClick={() => viewOrder(order)}
                                            className="w-full bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-left group">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", sc.color.split(" ")[0])}>
                                                        <StatusIcon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{order.order_number}</p>
                                                        <p className="text-xs text-slate-400 mt-0.5">
                                                            {new Date(order.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <p className="text-sm font-bold text-slate-900">{fmt(order.grand_total)}</p>
                                                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded border", sc.color)}>
                                                            {sc.label}
                                                        </span>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}

                {/* Track Order Link */}
                <div className="text-center pt-4">
                    <button onClick={() => navigate("/store/track")}
                        className="text-sm font-bold text-slate-400 hover:text-blue-600 inline-flex items-center gap-2">
                        <Package className="w-4 h-4" /> Track order by number
                    </button>
                </div>
            </div>
        </div>
    );
}
