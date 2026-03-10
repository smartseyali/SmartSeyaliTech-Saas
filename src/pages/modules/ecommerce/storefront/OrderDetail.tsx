import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import {
    Package, ChevronLeft, Calendar,
    MapPin, Truck, CheckCircle2,
    Clock, MessageSquare, Download,
    ShieldCheck, ArrowLeft, CreditCard,
    Zap, Box, Layout, ShoppingBag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_STEPS = [
    { id: "pending", label: "Confirmed", icon: Clock },
    { id: "processing", label: "Processing", icon: Package },
    { id: "shipped", label: "In Transit", icon: Truck },
    { id: "completed", label: "Delivered", icon: CheckCircle2 },
];

const STATUS_COLORS: Record<string, string> = {
    pending: "bg-slate-100 text-slate-500 border-slate-200",
    processing: "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20",
    shipped: "bg-blue-50 text-blue-700 border-blue-100",
    completed: "bg-slate-900 text-blue-400 border-slate-800",
    cancelled: "bg-rose-50 text-rose-700 border-rose-100",
};

export default function OrderDetail() {
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
        if (id && activeCompany) fetchOrderDetail();
    }, [id, activeCompany?.id]);

    const fetchOrderDetail = async () => {
        setLoading(true);
        const { data } = await supabase
            .from("ecom_orders")
            .select(`*, ecom_order_items(*)`)
            .eq("id", id)
            .single();
        setOrder(data);
        setLoading(false);
    };

    if (loading) return (
        <div className="bg-[#f8fafc] min-h-screen flex flex-col items-center justify-center gap-6 pt-24 font-sans text-slate-900">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Syncing Records...</p>
        </div>
    );

    if (!order) return (
        <div className="bg-[#f8fafc] min-h-screen flex flex-col items-center justify-center p-6 space-y-8 pt-24 font-sans">
            <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-2xl shadow-slate-200/20 border border-slate-100">
                <Package className="w-10 h-10 text-slate-200" />
            </div>
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">Order Not Found</h1>
                <p className="text-slate-400 font-medium italic">This record does not exist in our registry.</p>
            </div>
            <Button
                onClick={() => navigate(storeLink("/orders"))}
                className="rounded-2xl bg-slate-900 text-white px-10 h-14 font-black uppercase tracking-widest text-[11px] shadow-2xl transition-all italic border-none"
            >
                Back to Registry
            </Button>
        </div>
    );

    const currentStepIndex = STATUS_STEPS.findIndex(s => s.id === (order.status || 'pending').toLowerCase());
    const displayStepIndex = currentStepIndex === -1 ? 0 : currentStepIndex;
    const statusColor = STATUS_COLORS[(order.status || 'pending').toLowerCase()] || "bg-slate-50 text-slate-700 border-slate-200";

    return (
        <div className="bg-[#f8fafc] min-h-screen pb-40 font-sans pt-24 text-slate-900">
            <div className="max-w-7xl mx-auto px-6 py-20">
                {/* Header */}
                <div className="mb-20 space-y-12">
                    <button
                        onClick={() => navigate(storeLink("/orders"))}
                        className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 hover:text-blue-600 transition-all italic"
                    >
                        <ArrowLeft className="w-4 h-4" /> Operational History
                    </button>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 pb-16 border-b border-slate-100">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <Zap className="w-5 h-5 text-blue-600" />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Order Identified</span>
                            </div>
                            <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter uppercase leading-[0.8] italic">
                                Order <span className="text-blue-600">Details</span>
                            </h1>
                            <p className="text-slate-400 font-black text-[11px] tracking-[0.5em] uppercase italic opacity-50">
                                REFERENCE: #{order.order_number || order.id?.slice(0, 10).toUpperCase()}
                            </p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className={cn("px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] border shadow-2xl italic", statusColor)}>
                                {order.status}
                            </div>
                            <Button variant="outline" size="icon" className="h-20 w-20 rounded-2xl border-none bg-white shadow-2xl shadow-slate-200/20 hover:bg-slate-900 hover:text-white transition-all">
                                <Download className="w-6 h-6" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
                    {/* Main Content */}
                    <div className="xl:col-span-8 space-y-12">
                        {/* Timeline */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[3.5rem] p-16 border border-slate-50 shadow-2xl shadow-slate-200/20"
                        >
                            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-900 border-b border-slate-100 pb-8 mb-16 italic">Order Progress</h3>
                            <div className="flex items-start">
                                {STATUS_STEPS.map((step, idx) => (
                                    <div key={step.id} className="flex-1 flex flex-col items-center text-center gap-6 relative">
                                        {idx > 0 && (
                                            <div className={cn(
                                                "absolute top-8 right-1/2 w-full h-[2px]",
                                                idx <= displayStepIndex ? "bg-blue-600" : "bg-slate-100"
                                            )} />
                                        )}
                                        <div className={cn(
                                            "w-16 h-16 rounded-2xl flex items-center justify-center z-10 transition-all duration-700 shadow-sm",
                                            idx <= displayStepIndex ? "bg-slate-900 text-blue-400" : "bg-slate-50 text-slate-200"
                                        )}>
                                            <step.icon className={cn("w-6 h-6", idx === displayStepIndex && "animate-pulse")} />
                                        </div>
                                        <p className={cn("text-[10px] font-black uppercase tracking-[0.3em] italic", idx <= displayStepIndex ? "text-slate-900" : "text-slate-200")}>
                                            {step.label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Items */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-[3.5rem] p-16 border border-slate-50 shadow-2xl shadow-slate-200/20 space-y-12"
                        >
                            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-900 border-b border-slate-100 pb-8 italic">
                                Summary ({order.ecom_order_items?.length || 0})
                            </h3>
                            <div className="space-y-10">
                                {order.ecom_order_items?.map((item: any) => (
                                    <div key={item.id} className="flex gap-10 items-center group">
                                        <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden bg-slate-50 shrink-0 border border-slate-100 shadow-inner">
                                            <img
                                                src={item.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"}
                                                className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
                                                alt={item.name}
                                            />
                                        </div>
                                        <div className="flex-grow space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] italic leading-none">Verified Inventory</span>
                                            </div>
                                            <h4 className="font-black text-2xl text-slate-900 uppercase tracking-tighter italic group-hover:text-blue-600 transition-colors">{item.name}</h4>
                                            <div className="flex items-center gap-6 pt-1">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">{item.variant_name || "Standard Unit"}</span>
                                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] italic">{item.quantity} Unit(s) @ ₹{Number(item.price_at_time || item.price).toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <p className="font-black text-3xl text-slate-900 shrink-0 tracking-tighter italic tabular-nums">₹{Number(item.total_price || (item.quantity * (item.price_at_time || item.price))).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-12 border-t border-slate-100 space-y-6">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic font-black">
                                    <span>Subtotal</span>
                                    <span className="text-slate-900">₹{(Number(order.grand_total || order.total_amount) * 0.95).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic font-black">
                                    <span>Tax (5.0%)</span>
                                    <span className="text-slate-900">₹{(Number(order.grand_total || order.total_amount) * 0.05).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-end pt-12 border-t border-slate-100">
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-600 italic leading-none">Total Settlement</p>
                                        <p className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none italic tabular-nums">₹{Number(order.grand_total || order.total_amount).toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center gap-4 px-10 py-5 bg-slate-900 rounded-3xl border-none shadow-2xl">
                                        <ShieldCheck className="w-5 h-5 text-blue-400" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white italic">Protected</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Sidebar */}
                    <div className="xl:col-span-4 space-y-12">
                        {/* Status + Address Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 }}
                            className="bg-slate-900 rounded-[3.5rem] p-16 text-white shadow-2xl shadow-slate-900/10 relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-bl-[140px] transition-all group-hover:bg-blue-600/10" />
                            <div className="space-y-12 relative z-10">
                                <div className="flex items-center gap-4">
                                    <MapPin className="w-6 h-6 text-blue-400" />
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/30 border-b border-white/5 pb-6 w-full italic">Delivery Sector</h4>
                                </div>
                                <div className="space-y-8">
                                    <p className="text-2xl font-black leading-tight italic tracking-tighter uppercase">
                                        {typeof order?.shipping_address === 'string' ? order.shipping_address : (order?.shipping_address?.line1 || "Coordinates Pending")}
                                    </p>
                                    <div className="flex items-center gap-4 p-6 bg-white/5 rounded-[2rem] border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] italic text-blue-400">
                                        <Truck className="w-6 h-5" /> ET: 48-72 OPERATIONAL HOURS
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Payment Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-[3.5rem] p-16 border border-slate-50 shadow-2xl shadow-slate-200/20 space-y-12"
                        >
                            <div className="flex items-center gap-4">
                                <CreditCard className="w-6 h-6 text-blue-600" />
                                <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-300 italic">Settlement</h4>
                            </div>
                            <div className="space-y-8">
                                <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Method</span>
                                    <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest italic">
                                        {order.payment_method === "cod" ? "Manual Transfer (COD)" : (order.payment_method || "Online Matrix")}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Status</span>
                                    <span className={cn("text-[10px] font-black uppercase px-6 py-2.5 rounded-xl border italic tracking-widest", order.payment_status === "paid" ? "bg-slate-900 text-blue-400 border-slate-800" : "bg-slate-50 text-slate-400 border-slate-100")}>
                                        {order.payment_status || "Processing"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Date</span>
                                    <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest italic">
                                        {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                    </span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Support Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            className="bg-blue-600 rounded-[3.5rem] p-16 text-white shadow-2xl shadow-blue-600/20 space-y-12 relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-[80px] group-hover:scale-125 transition-all duration-700" />
                            <div className="text-center space-y-8 relative z-10">
                                <MessageSquare className="w-12 h-12 mx-auto text-white" />
                                <div className="space-y-4">
                                    <h5 className="font-black uppercase text-3xl leading-none italic tracking-tighter">Support <br />Center</h5>
                                    <p className="text-[10px] text-white/50 font-black uppercase tracking-[0.3em] italic">Available 24/7 for assistance</p>
                                </div>
                                <Button
                                    onClick={() => window.open(`https://wa.me/${settings?.whatsapp_number || "919000000000"}`, '_blank')}
                                    className="w-full bg-white text-blue-600 hover:bg-slate-900 hover:text-white rounded-3xl h-20 font-black uppercase tracking-[0.4em] text-[11px] border-none italic transition-all shadow-2xl"
                                >
                                    Uplink Now
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
