import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import {
    Package, ChevronLeft, Calendar,
    MapPin, Truck, CheckCircle2,
    Clock, MessageCircle, Download,
    ShieldCheck, ArrowLeft, CreditCard,
    Leaf, Sparkles, Sprout
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_STEPS = [
    { id: "pending", label: "Harvest Placed", icon: Clock },
    { id: "processing", label: "Nurturing", icon: Sprout },
    { id: "shipped", label: "In Transit", icon: Truck },
    { id: "completed", label: "Arrived", icon: CheckCircle2 },
];

const STATUS_COLORS: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    processing: "bg-emerald-50 text-emerald-700 border-emerald-200",
    shipped: "bg-blue-50 text-blue-700 border-blue-200",
    completed: "bg-[#14532d] text-white border-[#14532d]",
    cancelled: "bg-rose-50 text-rose-700 border-rose-200",
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

    const primaryColor = settings?.primary_color || "#14532d";

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
        <div className="bg-[#fafaf9] min-h-screen flex flex-col items-center justify-center gap-6 pt-24">
            <Leaf className="w-12 h-12 text-[#14532d]/20 animate-bounce" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#14532d]/40">Syncing Harvest Status...</p>
        </div>
    );

    if (!order) return (
        <div className="bg-[#fafaf9] min-h-screen flex flex-col items-center justify-center p-6 space-y-8 pt-24">
            <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center shadow-inner">
                <Package className="w-10 h-10 text-slate-100" />
            </div>
            <div className="text-center space-y-2">
                <h1 className="text-2xl font-black text-[#14532d] uppercase tracking-tighter">Harvest Not Found</h1>
                <p className="text-slate-400 font-medium italic">This record does not exist in our organic registry.</p>
            </div>
            <Button
                onClick={() => navigate(storeLink("/orders"))}
                style={{ backgroundColor: primaryColor }}
                className="rounded-2xl text-white px-10 h-14 font-black uppercase tracking-widest text-[10px]"
            >
                Back to Records
            </Button>
        </div>
    );

    const currentStepIndex = STATUS_STEPS.findIndex(s => s.id === (order.status || 'pending').toLowerCase());
    const displayStepIndex = currentStepIndex === -1 ? 0 : currentStepIndex;
    const statusColor = STATUS_COLORS[(order.status || 'pending').toLowerCase()] || "bg-slate-50 text-slate-700 border-slate-200";

    return (
        <div className="bg-[#fafaf9] min-h-screen pb-24 font-sans pt-24">
            <div className="max-w-7xl mx-auto px-6 py-10">
                {/* Back + Header */}
                <div className="mb-12 space-y-6">
                    <button
                        onClick={() => navigate(storeLink("/orders"))}
                        className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-[#14532d] transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> My Selection History
                    </button>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Leaf className="w-4 h-4 text-[#f97316]" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#14532d]/40">Authenticated Record</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-[#14532d] tracking-tighter uppercase leading-none">
                                Harvest Details
                            </h1>
                            <p className="text-[#14532d]/30 font-bold text-sm tracking-tight">
                                Ref: #{order.order_number || order.id?.slice(0, 10).toUpperCase()}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className={cn("px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm", statusColor)}>
                                {order.status}
                            </span>
                            <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-slate-100 bg-white shadow-sm hover:bg-slate-50 transition-all">
                                <Download className="w-4 h-4 text-[#14532d]" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                    {/* Left Main */}
                    <div className="xl:col-span-8 space-y-10">
                        {/* Order Timeline */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[40px] p-10 border border-slate-50 shadow-sm"
                        >
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#14532d] border-b border-slate-50 pb-6 mb-10 italic">Harvest Timeline</h3>
                            <div className="flex items-start">
                                {STATUS_STEPS.map((step, idx) => (
                                    <div key={step.id} className="flex-1 flex flex-col items-center text-center gap-4 relative">
                                        {idx > 0 && (
                                            <div className={cn(
                                                "absolute top-6 right-1/2 w-full h-1",
                                                idx <= displayStepIndex ? "bg-[#14532d]" : "bg-slate-50"
                                            )} />
                                        )}
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center z-10 transition-all shadow-md",
                                            idx <= displayStepIndex ? "bg-[#14532d] text-white" : "bg-white border-2 border-slate-50 text-slate-100"
                                        )}>
                                            <step.icon className="w-5 h-5" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className={cn("text-[10px] font-black uppercase tracking-widest", idx <= displayStepIndex ? "text-[#14532d]" : "text-slate-200")}>
                                                {step.label}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Order Items */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-[40px] p-10 border border-slate-50 shadow-sm space-y-8"
                        >
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#14532d] border-b border-slate-50 pb-6 mb-4">
                                Items for Fulfilment ({order.ecom_order_items?.length || 0})
                            </h3>
                            <div className="space-y-6">
                                {order.ecom_order_items?.map((item: any) => (
                                    <div key={item.id} className="flex gap-6 items-center group">
                                        <div className="w-24 h-24 rounded-[28px] overflow-hidden bg-[#fafaf9] shrink-0 border border-slate-50 shadow-inner">
                                            <img
                                                src={item.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                alt={item.name}
                                            />
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Sparkles className="w-3 h-3 text-[#f97316]" />
                                                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Organic Premium</span>
                                            </div>
                                            <h4 className="font-black text-xl text-[#14532d] truncate uppercase tracking-tight">{item.name}</h4>
                                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-[0.2em] italic">{item.variant_name || "Standard Unit"}</p>
                                            <p className="text-[10px] font-black text-[#14532d]/40 mt-2 uppercase tracking-widest leading-none">Qty: {item.quantity} × ₹{Number(item.price_at_time || item.price).toLocaleString()}</p>
                                        </div>
                                        <p className="font-black text-2xl text-[#14532d] shrink-0 tracking-tighter italic whitespace-nowrap">₹{Number(item.total_price || (item.quantity * (item.price_at_time || item.price))).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-8 border-t border-slate-50 space-y-4">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-[#14532d]/30">
                                    <span>Harvest Subtotal</span>
                                    <span>₹{(Number(order.grand_total || order.total_amount) * 0.95).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-[#14532d]/30">
                                    <span>Fulfilment Tax (5%)</span>
                                    <span>₹{(Number(order.grand_total || order.total_amount) * 0.05).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-end pt-6 border-t border-slate-100">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#f97316]">Grand Settlement</p>
                                        <p className="text-4xl font-black text-[#14532d] tracking-tighter leading-none italic">₹{Number(order.grand_total || order.total_amount).toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-1.5 bg-[#14532d]/5 rounded-full border border-[#14532d]/10">
                                        <ShieldCheck className="w-3 h-3 text-[#14532d]" />
                                        <span className="text-[9px] font-black uppercase text-[#14532d]">Secure Transaction</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="xl:col-span-4 space-y-6">
                        {/* Delivery Address */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 }}
                            className="bg-[#14532d] rounded-[48px] p-10 text-white shadow-xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[100px]" />
                            <div className="space-y-8 relative z-10">
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-[#f97316]" />
                                    <h4 className="text-xs font-black uppercase tracking-[.3em] text-white/40 border-b border-white/10 pb-4 w-full">Destination</h4>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-lg font-bold leading-relaxed italic">
                                        {typeof order?.shipping_address === 'string' ? order.shipping_address : (order?.shipping_address?.line1 || "Co-ordinates pending")}
                                    </p>
                                    <div className="flex items-center gap-3 p-4 bg-white/10 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest">
                                        <Truck className="w-4 h-4 text-[#f97316]" /> Estimated: 2-3 Sun Cycles
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Payment Info */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm space-y-8"
                        >
                            <div className="flex items-center gap-3">
                                <CreditCard className="w-5 h-5 text-[#f97316]" />
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#14532d]/40">Payment Details</h4>
                            </div>
                            <div className="space-y-6">
                                <div className="flex justify-between items-center group">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Method</span>
                                    <span className="text-xs font-black text-[#14532d] uppercase tracking-tight">
                                        {order.payment_method === "cod" ? "Manual Exchange (COD)" : (order.payment_method || "Online Session")}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center group">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Status</span>
                                    <span className={cn("text-[10px] font-black uppercase px-4 py-1.5 rounded-full border", order.payment_status === "paid" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100")}>
                                        {order.payment_status || "Processing"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center group">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Auth Date</span>
                                    <span className="text-xs font-black text-[#14532d] uppercase tracking-tight">
                                        {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                    </span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Help Concierge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            className="bg-[#f97316] rounded-[40px] p-10 text-white space-y-8 shadow-xl relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-bl-[60px] group-hover:scale-110 transition-transform" />
                            <div className="space-y-4 relative z-10 text-center">
                                <MessageCircle className="w-10 h-10 mx-auto text-white/50" />
                                <div className="space-y-1">
                                    <h5 className="font-black uppercase text-xl leading-none">Harvest <br />Concierge</h5>
                                    <p className="text-[10px] text-white/60 font-medium uppercase tracking-widest mt-2 overflow-hidden text-ellipsis whitespace-nowrap">Available for immediate assistance</p>
                                </div>
                            </div>
                            <Button
                                onClick={() => window.open(`https://wa.me/${settings?.whatsapp_number || "919000000000"}`, '_blank')}
                                className="w-full bg-white text-[#f97316] hover:bg-[#fafaf9] rounded-2xl h-14 font-black uppercase tracking-widest text-[10px] shadow-lg relative z-10"
                            >
                                WhatsApp Live
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
