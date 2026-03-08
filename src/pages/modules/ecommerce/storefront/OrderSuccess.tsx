import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { CheckCircle2, Package, Truck, ShieldCheck, Download, MessageCircle, ArrowRight, Home, Leaf, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { PageBanner } from "@/components/storefront/PageBanner";

export default function OrderSuccess() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { activeCompany } = useTenant();
    const { settings } = useStoreSettings();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const storeLink = (path: string) => {
        const slug = activeCompany?.subdomain || "";
        return `/${slug}${path === "/" ? "" : path}`;
    };

    const primaryColor = settings?.primary_color || "#14532d";

    useEffect(() => {
        if (id && activeCompany) {
            setLoading(true);
            supabase.from("ecom_orders")
                .select("*, ecom_order_items(*)")
                .eq("id", id)
                .single()
                .then(({ data }) => {
                    setOrder(data);
                    setLoading(false);
                });
        }
    }, [id, activeCompany?.id]);

    const getStepStatus = (stepIdx: number) => {
        if (!order) return stepIdx === 0;
        const statusMap: Record<string, number> = {
            'pending': 0,
            'confirmed': 0,
            'processing': 1,
            'packed': 1,
            'shipped': 2,
            'out_for_delivery': 2,
            'delivered': 3,
            'completed': 3
        };
        const currentIdx = statusMap[order.status] || 0;
        return stepIdx <= currentIdx;
    };

    if (loading) return (
        <div className="bg-[#fafaf9] min-h-screen flex flex-col items-center justify-center gap-6">
            <Leaf className="w-12 h-12 text-[#14532d]/20 animate-bounce" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#14532d]/40">Getting your order details...</p>
        </div>
    );

    return (
        <div className="bg-[#fafaf9] min-h-screen pt-28 pb-40 font-sans">
            {/* Payment / Order Success Upsell Banner — set position='payment_top' in admin */}
            <div className="max-w-4xl mx-auto px-6 mb-10">
                <PageBanner position="payment_top" height="h-36 md:h-48" />
            </div>
            <div className="max-w-4xl mx-auto px-6">
                {/* Harvest Confirmation Banner */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="bg-white rounded-[48px] p-12 md:p-20 text-center space-y-8 shadow-xl border border-slate-50 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#14532d]/5 rounded-bl-[100px]" />

                    <div className="relative inline-flex">
                        <div className="w-32 h-32 bg-[#14532d]/5 rounded-full flex items-center justify-center mx-auto shadow-inner">
                            <CheckCircle2 className="w-16 h-16 text-[#14532d]" />
                        </div>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: [0, 1.2, 1] }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className="absolute -top-1 -right-1 w-12 h-12 bg-[#f97316] rounded-full flex items-center justify-center shadow-lg border-4 border-white"
                        >
                            <Sparkles className="text-white w-5 h-5" />
                        </motion.div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-center gap-2">
                            <Leaf className="w-4 h-4 text-[#f97316]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#14532d]/40">Order Placed Successfully</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-[#14532d] tracking-tighter uppercase leading-none">Order <br /><span className="text-[#f97316]">Confirmed</span></h1>
                        <p className="text-slate-400 font-medium text-lg italic mt-4 max-w-lg mx-auto leading-relaxed">Thank you for your purchase! Your order is being processed for delivery.</p>

                        {order && (
                            <div className="inline-flex items-center gap-3 bg-[#f8fafc] px-8 py-3 rounded-2xl border border-slate-100 text-[10px] font-black uppercase tracking-widest text-[#14532d]/60 shadow-sm mt-4">
                                Order Number: <span className="text-[#14532d] select-all">#{order.order_number || id?.slice(0, 8).toUpperCase()}</span>
                            </div>
                        )}
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
                    {/* Fulfillment Timeline */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-[40px] p-10 border border-slate-50 shadow-sm space-y-10"
                    >
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#14532d] border-b border-slate-50 pb-6">Order Status</h3>
                        <div className="space-y-0">
                            {[
                                { icon: CheckCircle2, title: "Order Placed", sub: "Order verified & confirmed" },
                                { icon: Package, title: "Packing", sub: "Preparing items for shipping" },
                                { icon: Truck, title: "Shipped", sub: "Handed over to courier" },
                                { icon: Truck, title: "Out for Delivery", sub: "Coming to your address" },
                                { icon: Home, title: "Delivered", sub: "Package received" },
                            ].map((step, idx) => {
                                const statusIndices: Record<string, number> = {
                                    'pending': 0, 'confirmed': 0,
                                    'packed': 1,
                                    'shipped': 2,
                                    'out_for_delivery': 3,
                                    'delivered': 4, 'completed': 4
                                };
                                const currentStatusIdx = statusIndices[order?.status] || 0;
                                const isDone = idx <= currentStatusIdx;
                                return (
                                    <div key={idx} className="flex gap-6 items-start">
                                        <div className="flex flex-col items-center">
                                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all border-2", isDone ? "bg-[#14532d] border-[#14532d] text-white shadow-lg shadow-[#14532d]/20" : "bg-white border-slate-100 text-slate-200")}>
                                                <step.icon className="w-5 h-5" />
                                            </div>
                                            {idx < 4 && <div className={cn("w-0.5 h-10 mt-1", isDone ? "bg-[#14532d]" : "bg-slate-100")} />}
                                        </div>
                                        <div className="pt-2">
                                            <p className={cn("text-sm font-black uppercase tracking-tight", isDone ? "text-[#14532d]" : "text-slate-300")}>{step.title}</p>
                                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest italic">{step.sub}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Summary & Destination */}
                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-[#14532d] rounded-[40px] p-10 text-white shadow-xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-[60px]" />
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/40 border-b border-white/5 pb-6 mb-8 flex items-center gap-2">
                                <Truck className="w-4 h-4 text-[#f97316]" /> Shipping Details
                                {order?.tracking_number && (
                                    <span className="ml-auto px-3 py-1 bg-[#f97316] text-white text-[9px] rounded-full">AWB: {order.tracking_number}</span>
                                )}
                            </h3>
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30 leading-none">Courier Partner</p>
                                    <p className="text-sm font-bold opacity-80">{order?.courier_name || "Assigning Courier..."}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30 leading-none">Delivery Address</p>
                                    <p className="text-base font-bold leading-relaxed">{typeof order?.shipping_address === 'string' ? order.shipping_address : (order?.shipping_address?.line1 || "Address not provided")}</p>
                                </div>
                                <div className="flex justify-between items-end pt-6 border-t border-white/5">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#f97316]">Total Paid</p>
                                        <p className="text-3xl font-black italic tracking-tighter">₹{Number(order?.grand_total || order?.total_amount || 0).toLocaleString()}</p>
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest px-4 py-1.5 bg-white/10 rounded-full border border-white/10">Paid Early</span>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                        >
                            <Button
                                onClick={() => navigate(storeLink(`/order-detail/${order?.id}`))}
                                style={{ backgroundColor: primaryColor }}
                                className="h-14 rounded-2xl text-white font-black uppercase tracking-widest text-[10px] shadow-xl transition-all"
                            >
                                Track Order <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                            <Button
                                onClick={() => navigate(storeLink("/shop"))}
                                variant="outline"
                                className="h-14 rounded-2xl border-slate-200 font-black text-[#14532d] uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all"
                            >
                                Continue Shopping
                            </Button>
                        </motion.div>
                    </div>
                </div>

                {/* Security Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="flex flex-wrap items-center justify-center gap-10 mt-20 pt-10 border-t border-slate-100"
                >
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[#14532d]/30">
                        <ShieldCheck className="w-4 h-4 text-[#f97316]" /> Secure Payment
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[#14532d]/30">
                        <MessageCircle className="w-4 h-4 text-[#f97316]" /> 24/7 Support
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[#14532d]/30">
                        <Download className="w-4 h-4 text-[#f97316]" /> Order Invoice
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
