import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
    ShoppingBag, Star, ChevronRight,
    Truck, ShieldCheck, Search, ArrowUpRight,
    Zap, Percent, Heart, MessageCircle, ArrowRight,
    Box, Globe, MapPin, CreditCard,
    ArrowUpRight as ArrowUpRightIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTenant } from "@/contexts/TenantContext";
import { useCart } from "@/contexts/CartContext";
import { useDynamicContent } from "@/hooks/useDynamicContent";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { activeCompany } = useTenant();
    const { addToCart } = useCart();
    const { settings } = useStoreSettings();

    // Data Fetching based on the new structure
    const { data: banners, loading: bannersLoading } = useDynamicContent("HOME_PAGE", "hero_banners");
    const { data: highlights } = useDynamicContent("HOME_PAGE", "site_highlights");
    const { data: categories, loading: categoriesLoading } = useDynamicContent("HOME_PAGE", "top_categories");
    const { data: offers } = useDynamicContent("HOME_PAGE", "offer_zone");
    const { data: products, loading: productsLoading } = useDynamicContent("HOME_PAGE", "top_selling");
    const { data: bottomBanners } = useDynamicContent("HOME_PAGE", "bottom_banners");

    const [currentBanner, setCurrentBanner] = useState(0);

    const storeLink = (path: string) => {
        const slug = activeCompany?.subdomain || "";
        return `/${slug}${path === "/" ? "" : path}`;
    };

    const primaryColor = settings?.primary_color || "#14532d";

    // Auto-advance banner
    useEffect(() => {
        if (banners.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentBanner(prev => (prev + 1) % banners.length);
        }, 8000);
        return () => clearInterval(timer);
    }, [banners.length]);

    return (
        <div className="bg-[#f8fafc] min-h-screen relative font-sans text-slate-900">
            {/* 1. ARCHITECTURAL HERO BANNER */}
            <section className="relative h-[500px] md:h-[750px] overflow-hidden bg-slate-900">
                <AnimatePresence mode="wait">
                    {bannersLoading ? (
                        <div key="loading" className="absolute inset-0 bg-slate-800 animate-pulse" />
                    ) : (
                        <motion.div
                            key={currentBanner}
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="absolute inset-0"
                        >
                            <img
                                src={banners[currentBanner]?.image_url || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600"}
                                alt="Banner"
                                className="w-full h-full object-cover grayscale-[40%] brightness-75 transition-all duration-1000 group-hover:grayscale-0"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent" />
                            <div className="absolute inset-0 flex items-center">
                                <div className="max-w-screen-xl mx-auto px-6 w-full">
                                    <div className="max-w-3xl text-white space-y-10">
                                        {banners[currentBanner]?.badge_text && (
                                            <div className="flex items-center gap-4">
                                                <div className="h-0.5 w-12 bg-blue-600" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500 italic">
                                                    {banners[currentBanner].badge_text}
                                                </span>
                                            </div>
                                        )}
                                        <h1 className="text-6xl md:text-9xl font-black leading-[0.8] tracking-tighter uppercase italic">
                                            {banners[currentBanner]?.title || "The Platform"}
                                        </h1>
                                        <p className="text-lg md:text-2xl text-white/70 max-w-xl font-medium italic">
                                            "{banners[currentBanner]?.subtitle || "Engineered for excellence. Architected for speed. Built for the future of commerce."}"
                                        </p>
                                        <div className="flex flex-wrap gap-6 pt-4">
                                            <Button
                                                onClick={() => navigate(storeLink("/shop"))}
                                                className="h-20 px-12 rounded-2xl bg-blue-600 text-white border-none hover:bg-white hover:text-slate-900 shadow-2xl transition-all font-black uppercase tracking-[0.3em] text-[11px]"
                                            >
                                                Initialize Access <ArrowRight className="w-5 h-5 ml-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => navigate(storeLink("/shop"))}
                                                className="h-20 px-12 rounded-2xl bg-transparent text-white border-2 border-white/20 hover:border-white shadow-2xl transition-all font-black uppercase tracking-[0.3em] text-[11px]"
                                            >
                                                View Documentation
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {banners.length > 1 && (
                    <div className="absolute bottom-12 right-12 z-20 flex gap-4">
                        {banners.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentBanner(idx)}
                                className={cn(
                                    "h-1.5 transition-all duration-700 rounded-full",
                                    currentBanner === idx ? "w-16 bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.8)]" : "w-4 bg-white/20"
                                )}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* 2. PERFORMANCE HIGHLIGHTS */}
            {highlights.length > 0 && (
                <section className="py-24 border-b border-slate-100">
                    <div className="max-w-screen-xl mx-auto px-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                            {highlights.slice(0, 3).map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="space-y-8 group"
                                >
                                    <div className="w-20 h-20 rounded-[2rem] bg-white shadow-xl shadow-slate-200/50 flex items-center justify-center border border-slate-50 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-blue-600/10">
                                        {item.image_url ? (
                                            <img src={item.image_url} alt={item.title} className="w-10 h-10 object-contain grayscale" />
                                        ) : (
                                            <Zap className="w-8 h-8 text-blue-600" />
                                        )}
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">{item.title}</h4>
                                        <p className="text-sm text-slate-400 font-medium leading-relaxed italic pr-8">{item.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 3. INVENTORY CATEGORIES */}
            <section className="py-32">
                <div className="max-w-screen-xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20 border-b border-slate-100 pb-12">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Box className="w-5 h-5 text-blue-600" />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Inventory Ecosystem</span>
                            </div>
                            <h2 className="text-5xl md:text-7xl font-black text-slate-900 uppercase tracking-tighter italic leading-[0.8]">Core <span className="text-blue-600">Clusters</span></h2>
                        </div>
                        <Link to={storeLink("/shop")} className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] flex items-center gap-4 hover:gap-6 transition-all pb-2">
                            Explore Entire Grid <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-10">
                        {categoriesLoading ? (
                            [1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="aspect-square rounded-[3rem] bg-slate-50 animate-pulse border border-slate-100" />
                            ))
                        ) : (
                            categories.map((cat, i) => (
                                <motion.div
                                    key={cat.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.05 }}
                                    className="flex flex-col items-center gap-6 cursor-pointer group"
                                    onClick={() => navigate(storeLink(`/shop?category=${cat.name}`))}
                                >
                                    <div className="aspect-[4/5] w-full rounded-[3.5rem] overflow-hidden border border-slate-50 shadow-sm group-hover:shadow-[0_40px_80px_-20px_rgba(37,99,235,0.15)] transition-all duration-700 p-1 bg-white">
                                        <img
                                            src={cat.image_url || `https://source.unsplash.com/800x1000/?tech,inventory,${cat.name}`}
                                            className="w-full h-full object-cover rounded-[3.25rem] grayscale-[70%] group-hover:grayscale-0 transition-all duration-1000"
                                            alt={cat.name}
                                        />
                                    </div>
                                    <span className="text-[11px] font-black text-slate-400 group-hover:text-blue-600 transition-colors uppercase tracking-[0.2em] italic">{cat.name}</span>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* 4. STRATEGIC DEALS */}
            <section className="py-40 bg-slate-900 border-y border-white/5">
                <div className="max-w-screen-xl mx-auto px-6">
                    <div className="max-w-3xl mb-24 space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="h-0.5 w-12 bg-blue-600" />
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500">Capital Incentives</span>
                        </div>
                        <h2 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter italic leading-[0.8]">The <span className="text-blue-600">Yield</span> Hub</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {offers.length > 0 ? offers.map((offer, i) => (
                            <motion.div
                                key={offer.id || i}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="relative h-[28rem] rounded-[4rem] overflow-hidden group border border-white/5 bg-slate-950"
                            >
                                <img
                                    src={offer.image_url || `https://source.unsplash.com/800x1200/?abstract,tech,${i}`}
                                    className="w-full h-full object-cover opacity-40 grayscale transition-all duration-1000 group-hover:scale-110 group-hover:opacity-60"
                                    alt={offer.title}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent p-12 flex flex-col justify-end gap-6 text-white">
                                    <div className="bg-blue-600 text-[9px] font-black px-4 py-2 rounded-xl w-fit uppercase tracking-[0.2em] shadow-2xl">
                                        {offer.badge_label || offer.type?.replace("_", " ") || "Special Logic"}
                                    </div>
                                    <h3 className="text-3xl font-black uppercase tracking-tighter italic leading-none">{offer.title}</h3>
                                    {offer.description && <p className="text-white/50 text-xs font-medium italic line-clamp-2">{offer.description}</p>}
                                    {offer.discount_value > 0 && (
                                        <p className="text-4xl font-black text-blue-500 tracking-tighter italic">
                                            {offer.discount_type === "percentage" ? `${offer.discount_value}% SCALE` : `₹${offer.discount_value} CREDIT`}
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        )) : (
                            <div className="lg:col-span-3 py-32 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-[4rem] bg-slate-950/50">
                                <Box className="w-16 h-16 text-white/5 mb-8" />
                                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] italic italic">Optimization Protocol In Progress</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* 5. TOP SELLING INVENTORY */}
            <section className="py-40">
                <div className="max-w-screen-xl mx-auto px-6">
                    <div className="flex flex-col items-center text-center mb-32 space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="h-px w-12 bg-blue-600" />
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-600">High-Yield Assets</span>
                            <div className="h-px w-12 bg-blue-600" />
                        </div>
                        <h2 className="text-6xl md:text-8xl font-black text-slate-900 uppercase tracking-tighter italic leading-[0.8]">Priority <span className="text-blue-600">Units</span></h2>
                        <p className="text-sm font-medium text-slate-400 italic max-w-xl">Technically superior inventory verified by our core global intelligence network.</p>
                    </div>

                    {productsLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="aspect-[4/5] bg-white rounded-[4rem] animate-pulse border border-slate-50 shadow-xl shadow-slate-200/30" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-24">
                            {products.slice(0, 8).map((p, i) => (
                                <motion.div
                                    key={p.id}
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.05 }}
                                    className="group"
                                >
                                    <Link to={storeLink(`/product/${p.id}`)} className="block space-y-8">
                                        <div className="aspect-[4/5] relative overflow-hidden rounded-[3.5rem] bg-white border border-slate-50 shadow-sm transition-all duration-700 group-hover:shadow-[0_40px_80px_-20px_rgba(37,99,235,0.15)] group-hover:-translate-y-3 p-1">
                                            <img
                                                src={p.image_url || `https://source.unsplash.com/800x1000/?inventory,tech,${p.name}`}
                                                className="w-full h-full object-cover rounded-[3.25rem] transition-all duration-1000 group-hover:scale-110 grayscale-[50%] group-hover:grayscale-0"
                                                alt={p.name}
                                            />
                                            <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors" />
                                            <div className="absolute top-8 right-8 flex flex-col gap-3 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
                                                <button className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center text-slate-900 shadow-2xl">
                                                    <Heart className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-4 px-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">{p.category || "General"}</span>
                                                <div className="h-px grow bg-slate-100" />
                                            </div>
                                            <h3 className="font-black text-2xl text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tighter italic leading-none line-clamp-2">{p.name}</h3>
                                            <p className="text-3xl font-black text-slate-900 tracking-tighter italic">₹ {Number(p.rate || p.price || 0).toLocaleString()}</p>
                                        </div>
                                    </Link>
                                    <Button
                                        onClick={() => addToCart(p, 1)}
                                        className="w-full mt-10 h-16 rounded-[1.5rem] bg-slate-900 hover:bg-blue-600 border-none text-white font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl transition-all"
                                    >
                                        Initialize Order
                                    </Button>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* 6. PLATFORM ADVISORY SCROLL */}
            {bottomBanners.length > 0 && (
                <section className="py-40 bg-slate-50 overflow-hidden border-t border-slate-100">
                    <div className="max-w-screen-xl mx-auto px-6">
                        <div className="flex gap-12 overflow-x-auto pb-8 scrollbar-hide no-scrollbar -mx-6 px-6">
                            {bottomBanners.map((banner, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ scale: 1.02, y: -5 }}
                                    className="min-w-[500px] h-[300px] rounded-[4rem] overflow-hidden shadow-2xl flex-shrink-0 bg-slate-200"
                                >
                                    <img src={banner.image_url} className="w-full h-full object-cover grayscale-[30%] hover:grayscale-0 transition-all duration-700" alt="Platform Node" />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
