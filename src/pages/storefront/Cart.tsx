import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ChevronRight, ShieldCheck, Truck, Tag, Package, Leaf, ArrowRight } from "lucide-react";
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
    const savings = items.reduce((s, i) => s + Math.round(i.price * 0.4) * i.quantity, 0);

    const primaryColor = settings?.primary_color || "#14532d";

    if (items.length === 0) {
        return (
            <div className="bg-[#fafaf9] min-h-screen flex items-center justify-center p-6">
                <div className="bg-white rounded-[48px] text-center p-16 max-w-lg w-full space-y-8 shadow-xl shadow-slate-200/50 border border-slate-50">
                    <div className="w-24 h-24 bg-[#14532d]/5 rounded-full flex items-center justify-center mx-auto">
                        <ShoppingBag className="w-10 h-10 text-[#14532d]/20" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-[#14532d] uppercase tracking-tight">Your harvest box is empty</h2>
                        <p className="text-slate-400 text-sm font-medium">Nature's bounty is waiting for you at the market.</p>
                    </div>
                    <Button
                        onClick={() => navigate(storeLink("/shop"))}
                        style={{ backgroundColor: primaryColor }}
                        className="w-full h-14 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-[#14532d]/10"
                    >
                        Browse The Market
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#fafaf9] min-h-screen py-12 pt-28">
            {/* Cart Top Banner — set position='cart_top' in admin */}
            <div className="container mx-auto px-6 mb-8">
                <PageBanner position="cart_top" height="h-32 md:h-40" />
            </div>
            <div className="container mx-auto px-6">
                <div className="flex items-center justify-between mb-12">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Leaf className="w-4 h-4 text-[#f97316]" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#14532d]/40">Your Selection</span>
                        </div>
                        <h1 className="text-4xl font-black text-[#14532d] uppercase tracking-tighter">Harvest <span className="text-[#f97316]">Box</span></h1>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-white px-6 py-3 rounded-2xl border border-slate-50 shadow-sm">
                        {items.length} Product(s) ready
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    {/* Items List */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-white rounded-[40px] shadow-sm border border-slate-50 overflow-hidden divide-y divide-slate-50">
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
                                            className="p-8 flex flex-col sm:flex-row gap-8 items-center"
                                        >
                                            {/* Product Image */}
                                            <div className="w-32 h-40 bg-slate-50 rounded-3xl overflow-hidden shrink-0 border border-slate-100 p-4 flex items-center justify-center">
                                                <img
                                                    src={item.image_url || `https://source.unsplash.com/400x600/?organic,${item.id}`}
                                                    alt={item.name}
                                                    className="max-w-full max-h-full object-contain mix-blend-multiply"
                                                />
                                            </div>

                                            {/* Details */}
                                            <div className="flex-grow space-y-4 text-center sm:text-left">
                                                <div className="space-y-1">
                                                    <p className="font-black text-[#14532d] text-xl uppercase tracking-tight leading-none">{item.name}</p>
                                                    {item.variant_name && <span className="text-[10px] font-black uppercase tracking-widest text-[#f97316]">{item.variant_name}</span>}
                                                </div>

                                                <div className="flex items-center justify-center sm:justify-start gap-4">
                                                    <div className="flex items-center bg-slate-50 rounded-2xl border border-slate-100 p-1">
                                                        <button onClick={() => updateQuantity(item.product_id, item.variant_id, -1)} className="w-10 h-10 flex items-center justify-center text-[#14532d] hover:bg-white rounded-xl transition-all font-bold text-lg">−</button>
                                                        <span className="w-10 text-center font-black text-sm">{item.quantity}</span>
                                                        <button onClick={() => updateQuantity(item.product_id, item.variant_id, 1)} className="w-10 h-10 flex items-center justify-center text-[#14532d] hover:bg-white rounded-xl transition-all font-bold text-lg">+</button>
                                                    </div>
                                                    <div className="h-4 w-px bg-slate-100" />
                                                    <button onClick={() => removeFromCart(item.product_id, item.variant_id)} className="text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-red-500 transition-colors flex items-center gap-2">
                                                        <Trash2 className="w-3.5 h-3.5" /> Remove
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Subtotal */}
                                            <div className="text-right sm:w-32 space-y-1">
                                                <p className="text-xl font-black text-[#14532d] tracking-tighter tabular-nums text-center sm:text-right">₹{itemTotal.toLocaleString()}</p>
                                                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest text-center sm:text-right">₹{item.price.toLocaleString()} / unit</p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>

                        {/* Sustainability Note */}
                        <div className="bg-[#14532d]/5 rounded-3xl p-6 flex items-center gap-4 border border-[#14532d]/10">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#14532d] shadow-sm shrink-0">
                                <Truck className="w-5 h-5" />
                            </div>
                            <p className="text-xs font-bold text-[#14532d] uppercase tracking-wider leading-relaxed">
                                Your choice supports <span className="text-[#f97316]">Zero-Waste Harvest</span>. Every item is packed in 100% biodegradable materials.
                            </p>
                        </div>
                    </div>

                    {/* Summary Sidebar */}
                    <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-36">
                        <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-50 space-y-8">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#14532d] border-b border-slate-50 pb-6 flex items-center gap-2">
                                <Package className="w-4 h-4 text-[#f97316]" /> Harvest Summary
                            </h3>

                            <div className="space-y-5">
                                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    <span>Produce Value</span>
                                    <span className="text-[#14532d] tabular-nums">₹{cartTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    <span>Harvest Tax (5%)</span>
                                    <span className="text-[#14532d] tabular-nums">₹{tax.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    <span>Delivery Protocol</span>
                                    {shipping === 0
                                        ? <span className="text-[#f97316]">FREE HARVEST</span>
                                        : <span className="text-[#14532d] tabular-nums">₹{shipping}</span>
                                    }
                                </div>
                                <div className="pt-6 border-t border-dashed border-slate-100 flex justify-between items-end">
                                    <span className="text-[10px] font-black text-[#f97316] uppercase tracking-[0.2em] mb-1">Total Due</span>
                                    <span className="text-4xl font-black text-[#14532d] tracking-tighter tabular-nums">₹{total.toLocaleString()}</span>
                                </div>
                            </div>

                            <Button
                                onClick={() => navigate(storeLink("/checkout"))}
                                style={{ backgroundColor: primaryColor }}
                                className="w-full h-16 rounded-2xl text-white font-black uppercase tracking-[0.2em] text-xs shadow-2xl transition-all group overflow-hidden border-none"
                            >
                                <span className="flex items-center gap-2 group-hover:gap-4 transition-all">
                                    Secure Settlement <ArrowRight className="w-4 h-4" />
                                </span>
                            </Button>
                        </div>

                        {/* Security Badge */}
                        <div className="flex items-center gap-4 px-8 py-5 bg-white rounded-3xl border border-slate-50 shadow-sm">
                            <ShieldCheck className="w-6 h-6 text-[#14532d]" />
                            <p className="text-[9px] font-black uppercase tracking-widest text-[#14532d]/40 leading-relaxed">
                                Encrypted Merchant Bridge <br /> <span className="text-slate-200">Session ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
