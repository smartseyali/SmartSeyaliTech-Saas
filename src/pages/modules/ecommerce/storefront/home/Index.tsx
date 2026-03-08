import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
    ShoppingBag, Star, ChevronRight,
    Truck, ShieldCheck, Search, ArrowUpRight,
    Zap, Percent, Heart, MessageCircle, ArrowRight,
    Leaf, Sparkles, Sprout, Globe, MapPin, CreditCard,
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
        <div className="bg-white min-h-screen relative font-sans">
            {/* 1. MAIN BANNER */}
            <section className="relative h-[450px] md:h-[600px] overflow-hidden bg-slate-100">
                <AnimatePresence mode="wait">
                    {bannersLoading ? (
                        <div key="loading" className="absolute inset-0 bg-slate-200 animate-pulse" />
                    ) : (
                        <motion.div
                            key={currentBanner}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1 }}
                            className="absolute inset-0"
                        >
                            <img
                                src={banners[currentBanner]?.image_url || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600"}
                                alt="Banner"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/20" />
                            <div className="absolute inset-0 flex items-center">
                                <div className="container mx-auto px-6">
                                    <div className="max-w-2xl text-white space-y-6">
                                        {banners[currentBanner]?.badge_text && (
                                            <span className="inline-block px-4 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest leading-none">
                                                {banners[currentBanner].badge_text}
                                            </span>
                                        )}
                                        <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                                            {banners[currentBanner]?.title || "Sabse Sasta, Sabse Acha"}
                                        </h1>
                                        <p className="text-lg md:text-xl text-white/90 max-w-xl">
                                            {banners[currentBanner]?.subtitle || "Premium quality products delivered to your doorstep across India."}
                                        </p>
                                        <Button
                                            onClick={() => navigate(storeLink("/shop"))}
                                            className="h-14 px-10 rounded-xl bg-white text-slate-900 border-none hover:bg-slate-50 shadow-xl transition-all font-bold"
                                        >
                                            Abhi Kharido <ArrowRight className="w-5 h-5 ml-2" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {banners.length > 1 && (
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
                        {banners.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentBanner(idx)}
                                className={cn(
                                    "h-1.5 transition-all duration-500 rounded-full",
                                    currentBanner === idx ? "w-10 bg-white" : "w-2 bg-white/40"
                                )}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* 2. DATABASE CONTENT (HIGHLIGHTS) */}
            {highlights.length > 0 && (
                <section className="py-16 bg-[#f8fafc]">
                    <div className="container mx-auto px-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            {highlights.slice(0, 3).map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="flex items-center gap-6 p-8 bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow"
                                >
                                    {item.image_url ? (
                                        <img src={item.image_url} alt={item.title} className="w-16 h-16 object-contain" />
                                    ) : (
                                        <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                                            <Sparkles className="w-8 h-8" />
                                        </div>
                                    )}
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-800">{item.title}</h4>
                                        <p className="text-sm text-slate-500">{item.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 3. TOP CATEGORIES */}
            <section className="py-20">
                <div className="container mx-auto px-6">
                    <div className="flex items-center justify-between mb-12">
                        <h2 className="text-3xl font-bold text-slate-800">Top Categories</h2>
                        <Link to={storeLink("/shop")} className="text-sm font-bold text-[#14532d] hover:underline flex items-center">
                            View All <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="flex gap-8 overflow-x-auto pb-4 scrollbar-hide no-scrollbar -mx-6 px-6">
                        {categoriesLoading ? (
                            [1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="flex flex-col items-center gap-4 shrink-0">
                                    <div className="w-32 h-32 rounded-full bg-slate-50 animate-pulse" />
                                    <div className="w-20 h-4 bg-slate-100 rounded" />
                                </div>
                            ))
                        ) : (
                            categories.map((cat, i) => (
                                <motion.div
                                    key={cat.id}
                                    whileHover={{ y: -5 }}
                                    className="flex flex-col items-center gap-4 shrink-0 cursor-pointer group"
                                    onClick={() => navigate(storeLink(`/shop?category=${cat.name}`))}
                                >
                                    <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-slate-100 group-hover:border-[#14532d] transition-all p-1">
                                        <img
                                            src={cat.image_url || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200"}
                                            className="w-full h-full object-cover rounded-full"
                                            alt={cat.name}
                                        />
                                    </div>
                                    <span className="text-sm font-bold text-slate-700 group-hover:text-[#14532d]">{cat.name}</span>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* 4. OFFER ZONE */}
            <section className="py-20 bg-[#fffbeb]">
                <div className="container mx-auto px-6">
                    <div className="flex items-center gap-4 mb-12">
                        <div className="w-12 h-1 bg-[#d97706]" />
                        <h2 className="text-3xl font-bold text-slate-800">Offer Zone</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {offers.length > 0 ? offers.map((offer, i) => (
                            <motion.div
                                key={offer.id || i}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                className="relative h-64 rounded-3xl overflow-hidden group shadow-lg"
                            >
                                {offer.image_url ? (
                                    <img src={offer.image_url} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt={offer.title} />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-500" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center p-10">
                                    <div className="text-white space-y-4">
                                        <div className="bg-[#d97706] text-white px-3 py-1 rounded-full text-[10px] font-bold w-fit uppercase">
                                            {offer.badge_label || offer.type?.replace("_", " ") || "Special Offer"}
                                        </div>
                                        <h3 className="text-2xl font-bold">{offer.title}</h3>
                                        {offer.description && <p className="text-white/80 text-sm max-w-[200px]">{offer.description}</p>}
                                        {offer.discount_value > 0 && (
                                            <p className="text-yellow-300 font-black text-lg">
                                                {offer.discount_type === "percentage" ? `${offer.discount_value}% OFF` : `₹${offer.discount_value} OFF`}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )) : (
                            <div className="lg:col-span-3 h-40 flex items-center justify-center border-2 border-dashed border-amber-200 rounded-3xl text-amber-400 font-bold text-sm">
                                🎉 Festival deals coming soon — stay tuned!
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* 5. TOP SELLING PRODUCTS */}
            <section className="py-24">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-1.5 bg-orange-50 text-orange-500 text-xs font-black uppercase tracking-widest rounded-full mb-4">🔥 Bestsellers</span>
                        <h2 className="text-3xl font-bold text-slate-800">Top Selling Products</h2>
                        <p className="text-slate-400 text-sm mt-2">Trusted by lakhs of customers across India</p>
                    </div>

                    {productsLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="space-y-4">
                                    <div className="aspect-[4/5] bg-slate-50 animate-pulse rounded-2xl" />
                                    <div className="h-4 w-2/3 bg-slate-50 animate-pulse rounded" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            {products.slice(0, 8).map((p, i) => (
                                <motion.div
                                    key={p.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="group"
                                >
                                    <Link to={storeLink(`/product/${p.id}`)} className="block space-y-4">
                                        <div className="aspect-square relative overflow-hidden rounded-2xl bg-slate-50 border border-slate-100">
                                            <img
                                                src={p.image_url || `https://source.unsplash.com/800x1000/?organic,product`}
                                                className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                                                alt={p.name}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-slate-800 group-hover:text-[#14532d] transition-colors">{p.name}</h3>
                                            <p className="text-lg font-bold text-[#14532d]">₹ {Number(p.rate || p.price || 0).toLocaleString()}</p>
                                        </div>
                                    </Link>
                                    <Button
                                        onClick={() => addToCart(p, 1)}
                                        className="w-full mt-4 h-12 rounded-xl bg-[#14532d] hover:bg-[#1a6639] border-none text-white font-bold"
                                    >
                                        Add to Cart
                                    </Button>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* 6. BOTTOM BANNER IMAGES SCROLLABLE */}
            {bottomBanners.length > 0 && (
                <section className="py-20 bg-slate-50 overflow-hidden">
                    <div className="container mx-auto px-6">
                        <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide no-scrollbar -mx-6 px-6">
                            {bottomBanners.map((banner, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ scale: 1.02 }}
                                    className="min-w-[400px] h-[200px] rounded-3xl overflow-hidden shadow-md flex-shrink-0"
                                >
                                    <img src={banner.image_url} className="w-full h-full object-cover" alt="Ad" />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
