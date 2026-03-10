import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ChevronRight, ShieldCheck, Truck, Tag, Package, Box, ArrowRight, Zap, Layout } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useTenant } from "@/contexts/TenantContext";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PageBanner } from "@/components/storefront/PageBanner";

export default function Cart() {
    const { items, removeFromCart, updateQuantity, cartTotal } = useCart();
    const navigate = useNavigate();
    const { activeCompany } = useTenant();
    const { settings } = useStoreSettings();

    const storeLink = (path: string) => {
        const slug = activeCompany?.subdomain || "";
        return `/${slug}${path === "/" ? "" : path}`;
    };

    const tax = Math.round(cartTotal * 0.05);
    const shipping = cartTotal >= 999 ? 0 : 99;
    const total = cartTotal + tax + shipping;

    if (items.length === 0) {
        return (
            <div className="bg-[#f8fafc] min-h-screen flex items-center justify-center p-6 font-sans">
                <div className="bg-white rounded-[4rem] text-center p-20 max-w-xl w-full space-y-10 shadow-2xl shadow-slate-200/50 border border-slate-50">
                    <div className="w-32 h-32 bg-slate-50 rounded-[3rem] flex items-center justify-center mx-auto border border-slate-100 shadow-inner">
                        <Box className="w-12 h-12 text-slate-200" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">The Matrix is <span className="text-blue-600">Empty</span></h2>
                        <p className="text-slate-400 text-sm font-medium italic">"Operational grid awaiting asset initialization. No active deployments identified."</p>
                    </div>
                    <Button
                        onClick={() => navigate(storeLink("/shop"))}
                        className="w-full h-20 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl hover:bg-blue-600 transition-all border-none"
                    >
                        Initialize Acquisitions <ArrowRight className="w-5 h-5 ml-4" />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#f8fafc] min-h-screen py-20 pt-32 font-sans text-slate-900">
            {/* Cart Top Banner */}
            <div className="max-w-7xl mx-auto px-6 mb-12">
                <PageBanner position="cart_top" height="h-32 md:h-40" className="rounded-[2.5rem] shadow-xl" />
            </div>
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20 border-b border-slate-100 pb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Box className="w-5 h-5 text-blue-600 font-bold" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Inventory Lock</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-slate-900 uppercase tracking-tighter italic leading-[0.8]">Asset <span className="text-blue-600">Staging</span></h1>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] bg-white px-8 py-4 rounded-2xl border border-slate-50 shadow-xl shadow-slate-200/30 italic">
                        {items.length} ACTIVE NODE(S) IDENTIFIED
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                    {/* Items List */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="bg-white rounded-[4rem] shadow-xl shadow-slate-200/30 border border-slate-50 overflow-hidden divide-y divide-slate-50">
                            <AnimatePresence mode="popLayout">
                                {items.map(item => {
                                    const itemTotal = item.price * item.quantity;
                                    return (
                                        <motion.div
                                            key={`${item.id}-${item.variant_id}`}
                                            layout
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="p-12 flex flex-col sm:flex-row gap-12 items-center group"
                                        >
                                            {/* Product Image */}
                                            <div className="w-40 h-52 bg-white rounded-[2.5rem] overflow-hidden shrink-0 border border-slate-50 p-6 flex items-center justify-center shadow-sm group-hover:shadow-xl transition-all duration-500">
                                                <img
                                                    src={item.image_url || `https://source.unsplash.com/800x1200/?tech,inventory,${item.id}`}
                                                    alt={item.name}
                                                    className="max-w-full max-h-full object-contain grayscale-[40%] group-hover:grayscale-0 transition-all duration-700"
                                                />
                                            </div>

                                            {/* Details */}
                                            <div className="flex-grow space-y-6 text-center sm:text-left">
                                                <div className="space-y-3">
                                                    <p className="font-black text-slate-900 text-3xl uppercase tracking-tighter italic leading-none group-hover:text-blue-600 transition-colors">{item.name}</p>
                                                    {item.variant_name && <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-blue-100">{item.variant_name}</span>}
                                                </div>

                                                <div className="flex items-center justify-center sm:justify-start gap-8">
                                                    <div className="flex items-center bg-slate-50 rounded-2xl border border-slate-100 p-1.5 shadow-inner">
                                                        <button onClick={() => updateQuantity(item.product_id, item.variant_id, -1)} className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-white rounded-xl transition-all font-black text-xl">−</button>
                                                        <span className="w-12 text-center font-black text-xl tracking-tighter tabular-nums text-slate-900">{item.quantity}</span>
                                                        <button onClick={() => updateQuantity(item.product_id, item.variant_id, 1)} className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-white rounded-xl transition-all font-black text-xl">+</button>
                                                    </div>
                                                    <div className="h-6 w-px bg-slate-100" />
                                                    <button onClick={() => removeFromCart(item.product_id, item.variant_id)} className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 hover:text-blue-600 transition-all flex items-center gap-3 italic">
                                                        <Trash2 className="w-4 h-4" /> De-Initialize
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Subtotal */}
                                            <div className="text-right sm:w-40 space-y-2">
                                                <p className="text-3xl font-black text-slate-900 tracking-tighter italic tabular-nums text-center sm:text-right">₹{itemTotal.toLocaleString()}</p>
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-center sm:text-right italic">₹{item.price.toLocaleString()} / UNIT</p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>

                        {/* Efficiency Protocol Note */}
                        <div className="bg-slate-900 rounded-[3rem] p-10 flex items-center gap-8 border border-white/5 shadow-2xl">
                            <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shadow-blue-600/40 shrink-0">
                                <Zap className="w-8 h-8 font-bold" />
                            </div>
                            <p className="text-xs font-black text-white/70 uppercase tracking-[0.2em] leading-relaxed italic pr-4">
                                Strategic Fulfilment: Each unit undergoes <span className="text-blue-500">Tier-1 Verification</span> before logistics synchronization.
                                <br /><span className="text-[10px] text-white/30">Protocol: RAPID-TRANSIT-V2 ACTIVE</span>
                            </p>
                        </div>
                    </div>

                    {/* Summary Sidebar */}
                    <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-36">
                        <div className="bg-white rounded-[4rem] p-12 shadow-2xl shadow-slate-200/50 border border-slate-50 space-y-10">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-900 border-b border-slate-100 pb-8 flex items-center gap-4 italic">
                                <Layout className="w-5 h-5 text-blue-600" /> Allocation Summary
                            </h3>

                            <div className="space-y-6">
                                <div className="flex justify-between text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] italic">
                                    <span>Asset Valuation</span>
                                    <span className="text-slate-900 tabular-nums">₹{cartTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] italic">
                                    <span>Platform Tax (5%)</span>
                                    <span className="text-slate-900 tabular-nums">₹{tax.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] italic">
                                    <span>Logistics Protocol</span>
                                    {shipping === 0
                                        ? <span className="text-blue-600">FREE DEPLOYMENT</span>
                                        : <span className="text-slate-900 tabular-nums">₹{shipping}</span>
                                    }
                                </div>
                                <div className="pt-8 border-t border-dashed border-slate-100 flex flex-col gap-2">
                                    <span className="text-[11px] font-black text-blue-600 uppercase tracking-[0.4em] italic leading-none">Total Exposure</span>
                                    <span className="text-6xl font-black text-slate-900 tracking-tighter tabular-nums leading-none">₹{total.toLocaleString()}</span>
                                </div>
                            </div>

                            <Button
                                onClick={() => navigate(storeLink("/checkout"))}
                                className="w-full h-20 rounded-[1.5rem] bg-slate-900 hover:bg-blue-600 text-white font-black uppercase tracking-[0.3em] text-[12px] shadow-2xl shadow-slate-900/20 transition-all group overflow-hidden border-none"
                            >
                                <span className="flex items-center gap-4 group-hover:gap-8 transition-all">
                                    Finalize Settlement <ArrowRight className="w-5 h-5" />
                                </span>
                            </Button>
                        </div>

                        {/* Security Matrix Badge */}
                        <div className="flex items-center gap-6 px-10 py-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-sm">
                            <ShieldCheck className="w-8 h-8 text-blue-600" />
                            <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-900 italic">Encrypted Secure Bridge</p>
                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                    NODE_{Math.random().toString(36).substring(7).toUpperCase()} <span className="w-1 h-1 bg-blue-600 rounded-full animate-pulse" /> ACTIVE
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

