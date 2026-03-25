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
    Box, Sparkles, Layout, BarChart3
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
            case 'delivered': return 'bg-slate-900 text-blue-400 border-slate-800';
            case 'pending': return 'bg-slate-50 text-slate-400 border-slate-100';
            case 'shipped':
            case 'processing': return 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20';
            case 'cancelled': return 'bg-rose-50 text-rose-400 border-rose-100';
            default: return 'bg-white text-slate-300 border-slate-50';
        }
    };

    return (
        <div className="bg-[#f8fafc] min-h-screen pb-40 font-sans selection:bg-blue-600 selection:text-white pt-24 text-slate-900">
            <div className="container mx-auto px-6 py-20">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-12 border-b border-slate-100 pb-16">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Package className="w-5 h-5 text-blue-600" />
                            <span className="text-slate-400 font-bold  tracking-widest text-[10px] ">Order Management</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-slate-900  leading-[0.8]  mb-2">My <span className="text-blue-600">Orders</span></h1>
                    </div>
                    <div className="flex flex-col md:items-end gap-6 text-right">
                        <p className="text-lg text-slate-400 font-medium  md:text-right max-w-sm leading-relaxed">
                            Complete history of your professional acquisitions and service deployments.
                        </p>
                        <Link
                            to={storeLink("/shop")}
                            className="text-[10px] font-bold  tracking-widest text-blue-600 hover:text-slate-900 transition-all border-b-2 border-slate-100 hover:border-blue-600 pb-2 "
                        >
                            Back to Store
                        </Link>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-96 bg-white rounded-[4rem] animate-pulse border border-slate-50 shadow-2xl shadow-slate-200/20" />
                        ))}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="max-w-3xl mx-auto text-center py-48 space-y-12 bg-white rounded-[5rem] border border-slate-50 shadow-2xl shadow-slate-200/30">
                        <div className="w-32 h-32 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner relative overflow-hidden border border-slate-100">
                            <ShoppingBag className="w-12 h-12 text-slate-200" />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-3xl font-bold  tracking-tighter text-slate-900 ">No Orders Yet</h3>
                            <p className="text-slate-400 font-medium  px-24 text-lg">Your account history contains no recorded purchases at this time.</p>
                        </div>
                        <Button
                            onClick={() => navigate(storeLink("/shop"))}
                            className="h-20 px-16 rounded-3xl bg-blue-600 text-white font-bold  tracking-widest text-[11px] shadow-2xl shadow-blue-600/30 transition-all border-none  hover:bg-slate-900"
                        >
                            Start Shopping
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        <AnimatePresence>
                            {orders.map((order, i) => (
                                <motion.div
                                    key={order.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white rounded-[4rem] p-12 border border-slate-50 hover:shadow-2xl hover:shadow-slate-200 transition-all duration-700 group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-slate-50 rounded-bl-[120px] transition-all group-hover:bg-blue-50/50" />

                                    <div className="space-y-12 relative z-10">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-bold  tracking-widest text-slate-300  leading-none">ORDER_ID</p>
                                                <h4 className="font-bold text-3xl text-slate-900 tracking-tighter  whitespace-nowrap  group-hover:text-blue-600 transition-colors">#{order.order_number || order.id.slice(0, 8).toUpperCase()}</h4>
                                            </div>
                                            <div className={cn("px-6 py-2.5 rounded-2xl border font-bold  text-[9px] tracking-widest shadow-2xl ", getStatusStyles(order.status))}>
                                                {order.status}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-8 py-10 border-y border-slate-50">
                                            <div className="flex items-center gap-6">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-blue-600 border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                                                    <Calendar className="w-5 h-5" />
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[11px] font-bold  tracking-widest text-slate-900 ">{new Date(order.created_at).toLocaleDateString()}</span>
                                                    <p className="text-[10px] font-bold text-slate-300  tracking-widest  leading-none opacity-60">Confirmed Date</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-blue-600 border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                                                    <BarChart3 className="w-5 h-5" />
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[11px] font-bold  tracking-widest text-slate-900 ">{order.items?.length || 1} Products</span>
                                                    <p className="text-[10px] font-bold text-slate-300  tracking-widest  leading-none opacity-60">Verified Assets</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-end">
                                            <div className="space-y-3">
                                                <p className="text-[10px] font-bold  tracking-widest text-blue-500  leading-none">Total Amount</p>
                                                <p className="text-4xl font-bold text-slate-900 tracking-tighter  leading-none tabular-nums group-hover:scale-105 transition-transform origin-left">₹ {Number(order.grand_total || order.total_amount).toLocaleString()}</p>
                                            </div>
                                            <Link
                                                to={storeLink(`/order-success/${order.id}`)}
                                                className="w-20 h-20 bg-slate-900 text-white flex items-center justify-center rounded-[2rem] hover:bg-blue-600 transition-all duration-500 shadow-2xl shadow-slate-900/10 group/btn border-none"
                                            >
                                                <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-2 transition-transform" />
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="container mx-auto px-6 mt-32">
                <div className="p-20 bg-white rounded-[5rem] border border-slate-50 flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl shadow-slate-200/20">
                    <div className="flex items-center gap-10 group">
                        <div className="w-20 h-20 rounded-[2rem] bg-slate-50 border border-slate-50 flex items-center justify-center text-blue-600 group-hover:bg-slate-900 group-hover:text-blue-400 transition-all shadow-inner">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-[13px] font-bold text-slate-900  tracking-widest ">Secure History</p>
                            <p className="text-[10px] font-bold text-slate-300  tracking-widest  leading-none opacity-60">Verified Operational Protocol</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-slate-200 px-12 py-6 bg-slate-50 rounded-full border border-slate-100 shadow-inner">
                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                        <span className="text-[10px] font-bold  tracking-[1em] ">System Verified</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
