import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { CheckCircle2, Package, Truck, ShieldCheck, Download, MessageCircle, ArrowRight, Home, Box, Zap, Sparkles, Layout } from "lucide-react";
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
        <div className="bg-[#f8fafc] min-h-screen flex flex-col items-center justify-center gap-8 font-sans">
            <Box className="w-16 h-16 text-blue-600 animate-pulse" />
            <p className="text-[13px] font-bold  tracking-widest text-slate-500 ">Interrogating Logistics Matrix...</p>
        </div>
    );

    return (
        <div className="bg-[#fafaf9] min-h-screen pt-28 pb-40 font-sans">
            {/* Payment / Order Success Upsell Banner — set position='payment_top' in admin */}
            <div className="max-w-4xl mx-auto px-6 mb-10">
                <PageBanner position="payment_top" height="h-36 md:h-48" />
            </div>
            <div className="max-w-4xl mx-auto px-6">
                {/* Deployment Confirmation Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="bg-white rounded-[4rem] p-16 md:p-24 text-center space-y-10 shadow-2xl shadow-slate-200/50 border border-slate-50 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-48 h-48 bg-slate-50 rounded-bl-[120px]" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-50/50 rounded-tr-[100px]" />

                    <div className="relative inline-flex">
                        <div className="w-40 h-40 bg-slate-50 rounded-[3rem] flex items-center justify-center mx-auto shadow-inner border border-slate-100">
                            <CheckCircle2 className="w-20 h-20 text-blue-600" />
                        </div>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: [0, 1.2, 1] }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className="absolute -top-2 -right-2 w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center shadow-2xl border-4 border-white"
                        >
                            <Zap className="text-blue-500 w-8 h-8" />
                        </motion.div>
                    </div>

                    <div className="space-y-6 relative z-10">
                        <div className="flex items-center justify-center gap-3">
                            <ShieldCheck className="w-5 h-5 text-blue-600" />
                            <span className="text-[13px] font-bold  tracking-widest text-slate-500 ">Authorization Verified</span>
                        </div>
                        <h1 className="text-5xl md:text-8xl font-bold text-slate-900 tracking-tighter   leading-[0.8]">Deployment <br /><span className="text-blue-600">Authorized</span></h1>
                        <p className="text-slate-500 font-medium text-lg  mt-6 max-w-xl mx-auto leading-relaxed">
                            "Protocol initialized successfully. Asset synchronization in progress. Node logistics currently being staged for transit."
                        </p>

                        {order && (
                            <div className="inline-flex items-center gap-4 bg-slate-900 px-10 py-5 rounded-2xl text-[13px] font-bold  tracking-widest text-white shadow-2xl mt-8 ">
                                Node ID: <span className="text-blue-400 select-all ml-2">#{(order.order_number || id?.slice(0, 8).toUpperCase())}</span>
                            </div>
                        )}
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-16">
                    {/* Fulfillment Timeline */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-[4rem] p-12 border border-slate-50 shadow-2xl shadow-slate-200/30 space-y-12"
                    >
                        <h3 className="text-[13px] font-bold  tracking-widest text-slate-900 border-b border-slate-100 pb-8  flex items-center gap-4">
                            <Layout className="w-5 h-5 text-blue-600" /> Logistics Protocol
                        </h3>
                        <div className="space-y-0">
                            {[
                                { icon: ShieldCheck, title: "Authorization", sub: "Signature verified & confirmed" },
                                { icon: Box, title: "Staging Array", sub: "Calibrating items for transit" },
                                { icon: Truck, title: "In-Transit", sub: "Handover to Tier-1 Logistics" },
                                { icon: Zap, title: "Final Sector Sync", sub: "Deployment within destination grid" },
                                { icon: Home, title: "Deployment Finalized", sub: "Node localized successfully" },
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
                                    <div key={idx} className="flex gap-8 items-start group">
                                        <div className="flex flex-col items-center">
                                            <div className={cn(
                                                "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 border-2",
                                                isDone
                                                    ? "bg-slate-900 border-slate-900 text-white shadow-2xl"
                                                    : "bg-white border-slate-50 text-slate-100"
                                            )}>
                                                <step.icon className={cn("w-6 h-6", isDone ? "text-blue-500" : "")} />
                                            </div>
                                            {idx < 4 && <div className={cn("w-1 h-12 my-1 rounded-full", isDone ? "bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]" : "bg-slate-50")} />}
                                        </div>
                                        <div className="pt-3">
                                            <p className={cn("text-[13px] font-bold  tracking-widest  transition-colors", isDone ? "text-slate-900" : "text-slate-200")}>{step.title}</p>
                                            <p className="text-xs font-bold text-slate-500 mt-2  tracking-widest  opacity-60">{step.sub}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Summary & Destination */}
                    <div className="space-y-12">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-slate-900 rounded-[4rem] p-12 text-white shadow-[0_40px_80px_-20px_rgba(15,23,42,0.4)] relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[80px]" />
                            <h3 className="text-xs font-bold  tracking-widest text-white/30 border-b border-white/5 pb-8 mb-10 flex items-center gap-4 ">
                                <Truck className="w-5 h-5 text-blue-500" /> Deployment Vector
                                {order?.tracking_number && (
                                    <span className="ml-auto px-4 py-1.5 bg-blue-600 text-white text-[13px] rounded-xl font-bold ">TRK_{order.tracking_number}</span>
                                )}
                            </h3>
                            <div className="space-y-10">
                                <div className="space-y-3">
                                    <p className="text-xs font-bold  tracking-widest text-white/20  leading-none">Logistics Partner</p>
                                    <p className="text-base font-bold  opacity-90 text-blue-400">{order?.courier_name || "ASSIGNING_PARTNER..."}</p>
                                </div>
                                <div className="space-y-3">
                                    <p className="text-xs font-bold  tracking-widest text-white/20  leading-none">Sector Coordinates</p>
                                    <p className="text-lg font-bold leading-tight  opacity-90  tracking-tighter">
                                        {typeof order?.shipping_address === 'string'
                                            ? order.shipping_address
                                            : `${order?.shipping_address?.line1 || "SECTOR_UNDEFINED"}, ${order?.shipping_address?.city || ""}`
                                        }
                                    </p>
                                </div>
                                <div className="flex justify-between items-end pt-10 border-t border-white/5">
                                    <div className="space-y-3">
                                        <p className="text-xs font-bold  tracking-widest text-blue-500 ">Exposure Cleared</p>
                                        <p className="text-5xl font-bold  tracking-tighter tabular-nums leading-none">₹{Number(order?.grand_total || order?.total_amount || 0).toLocaleString()}</p>
                                    </div>
                                    <span className="text-xs font-bold  tracking-widest px-6 py-2.5 bg-white/5 rounded-2xl border border-white/10 ">SETTLED</span>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                        >
                            <Button
                                onClick={() => navigate(storeLink(`/order-detail/${order?.id}`))}
                                className="h-20 rounded-3xl bg-blue-600 hover:bg-slate-900 text-white font-bold  tracking-widest text-[13px] shadow-2xl shadow-blue-600/20 transition-all border-none "
                            >
                                Asset Matrix <ArrowRight className="w-5 h-5 ml-4" />
                            </Button>
                            <Button
                                onClick={() => navigate(storeLink("/shop"))}
                                className="h-20 rounded-3xl bg-white border-2 border-slate-100 hover:border-blue-600 font-bold text-slate-900  tracking-widest text-[13px] transition-all  shadow-xl shadow-slate-200/30"
                            >
                                Re-Enter Hub
                            </Button>
                        </motion.div>
                    </div>
                </div>

                {/* Security Matrix Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="flex flex-wrap items-center justify-center gap-16 mt-20 pt-16 border-t border-slate-100"
                >
                    <div className="flex items-center gap-4 text-xs font-bold  tracking-widest text-slate-300 ">
                        <ShieldCheck className="w-5 h-5 text-blue-600" /> Secure Matrix
                    </div>
                    <div className="flex items-center gap-4 text-xs font-bold  tracking-widest text-slate-300 ">
                        <MessageCircle className="w-5 h-5 text-blue-600" /> Uplink 24/7
                    </div>
                    <div className="flex items-center gap-4 text-xs font-bold  tracking-widest text-slate-300 ">
                        <Download className="w-5 h-5 text-blue-600" /> Data Invoice
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
