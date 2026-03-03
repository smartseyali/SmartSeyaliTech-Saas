import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import {
    Package, ChevronRight, Search,
    Calendar, Clock, ShoppingBag, ArrowUpRight,
    Zap, Hash, ListFilter, SlidersHorizontal, ArrowLeft, ArrowRight, ShieldCheck,
    Leaf, Sparkles, Sprout
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Orders() {
    const { user } = useAuth();
    const { activeCompany } = useTenant();
    const { settings } = useStoreSettings();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const storeLink = (path: string) => {
        const slug = activeCompany?.subdomain || "";
        return `/${slug}${path === "/" ? "" : path}`;
    };

    const primaryColor = settings?.primary_color || "#14532d";

    useEffect(() => {
        if (user && activeCompany) {
            fetchOrders();
        }
    }, [user, activeCompany?.id]);

    const fetchOrders = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("ecom_orders")
            .select("*")
            .eq("company_id", activeCompany?.id)
            .eq("user_id", user?.id)
            .order("created_at", { ascending: false });

        if (data) setOrders(data);
        setLoading(false);
    };

    const getStatusStyles = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
            case 'delivered': return 'bg-[#14532d] text-white border-[#14532d]';
            case 'pending': return 'bg-[#fafaf9] text-[#14532d]/40 border-slate-100';
            case 'shipped':
            case 'processing': return 'bg-[#f8fafc] text-[#14532d] border-[#14532d]/10';
            case 'cancelled': return 'bg-rose-50 text-rose-400 border-rose-100';
            default: return 'bg-white text-slate-300 border-slate-50';
        }
    };

    return (
        <div className="bg-[#fafaf9] min-h-screen pb-40 font-sans selection:bg-[#14532d] selection:text-white pt-24">
            <div className="container mx-auto px-6 py-20">
                {/* Organic Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-12 border-b border-slate-100 pb-16">
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <Leaf className="w-5 h-5 text-[#f97316]" />
                            <span className="text-[#14532d]/40 font-black uppercase tracking-[0.4em] text-[10px]">Customer Journey</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-[#14532d] uppercase leading-[0.85]">Harvest <br /> <span className="text-slate-200 italic">History</span></h1>
                    </div>
                    <div className="flex flex-col md:items-end gap-6">
                        <p className="text-xl text-slate-400 font-medium italic md:text-right max-w-sm">
                            A complete record of your <br /> natural acquisitions.
                        </p>
                        <Link
                            to={storeLink("/shop")}
                            className="text-[10px] font-black uppercase tracking-[0.6em] text-[#14532d]/40 hover:text-[#f97316] transition-all border-b-2 border-transparent hover:border-[#f97316] pb-2"
                        >
                            Back to Market
                        </Link>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-80 bg-white rounded-[40px] animate-pulse border border-slate-50" />
                        ))}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="max-w-2xl mx-auto text-center py-40 space-y-12 bg-white rounded-[48px] border border-dashed border-slate-100 shadow-sm">
                        <div className="w-24 h-24 bg-[#fafaf9] rounded-[32px] flex items-center justify-center mx-auto shadow-inner relative overflow-hidden">
                            <ShoppingBag className="w-10 h-10 text-[#14532d]/10" />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-2xl font-black uppercase tracking-tight text-[#14532d]">No Selection Found</h3>
                            <p className="text-slate-400 font-medium italic px-20">Your account record contains no historical harvests at this time.</p>
                        </div>
                        <Button
                            onClick={() => navigate(storeLink("/shop"))}
                            style={{ backgroundColor: primaryColor }}
                            className="h-16 px-12 rounded-2xl text-white font-black uppercase tracking-widest text-[10px] shadow-xl transition-all"
                        >
                            Explore Market
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        <AnimatePresence>
                            {orders.map((order, i) => (
                                <motion.div
                                    key={order.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-white rounded-[40px] p-10 border border-slate-50 hover:shadow-2xl hover:shadow-[#14532d]/5 transition-all duration-700 group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#14532d]/5 rounded-bl-[100px]" />

                                    <div className="space-y-10 relative z-10">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-[#14532d]/20 leading-none">Order Ref</p>
                                                <h4 className="font-black text-2xl text-[#14532d] tracking-tighter uppercase whitespace-nowrap">#{order.order_number || order.id.slice(0, 8).toUpperCase()}</h4>
                                            </div>
                                            <div className={cn("px-6 py-2 rounded-2xl border font-black uppercase text-[10px] tracking-widest shadow-sm", getStatusStyles(order.status))}>
                                                {order.status}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-6 py-8 border-y border-slate-50">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-[#fafaf9] flex items-center justify-center text-[#14532d] border border-slate-100">
                                                    <Calendar className="w-4 h-4" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#14532d]">{new Date(order.created_at).toLocaleDateString()}</span>
                                                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest italic leading-none">Recorded Date</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-[#fafaf9] flex items-center justify-center text-[#14532d] border border-slate-100">
                                                    <Clock className="w-4 h-4" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#14532d]">{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest italic leading-none">Acquisition Time</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-end">
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-[#f97316]">Settlement</p>
                                                <p className="text-3xl font-black text-[#14532d] tracking-tighter italic leading-none">₹ {Number(order.grand_total || order.total_amount).toLocaleString()}</p>
                                            </div>
                                            <Link
                                                to={storeLink(`/order-success/${order.id}`)}
                                                className="w-16 h-16 bg-[#14532d] text-white flex items-center justify-center rounded-2xl hover:bg-[#f97316] transition-all duration-500 shadow-xl shadow-[#14532d]/10 group/btn"
                                            >
                                                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Quality Footer */}
            <div className="container mx-auto px-6 mt-24">
                <div className="p-16 bg-white rounded-[48px] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-12 shadow-sm">
                    <div className="flex items-center gap-8 group">
                        <div className="w-16 h-16 rounded-[24px] bg-[#fafaf9] border border-slate-50 flex items-center justify-center text-[#f97316] group-hover:bg-[#14532d] group-hover:text-white transition-all shadow-inner">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[11px] font-black text-[#14532d] uppercase tracking-[0.4em]">Acquisition Guard</p>
                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">Fully Encrypted Session</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 text-[#14532d]/20 px-8 py-4 bg-[#fafaf9] rounded-full">
                        <Leaf className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-[1em]">Harvested with Care</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
