import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import {
    Star, ShoppingCart, Heart, ShieldCheck,
    Truck, RotateCcw, ChevronRight, Minus, Plus, Share2,
    MessageCircle, Shield, HelpCircle, Leaf, Sparkles, Sprout
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";
import { useTenant } from "@/contexts/TenantContext";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { motion, AnimatePresence } from "framer-motion";
import { PageBanner } from "@/components/storefront/PageBanner";

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { activeCompany } = useTenant();
    const { settings } = useStoreSettings();

    const [product, setProduct] = useState<any>(null);
    const [variants, setVariants] = useState<any[]>([]);
    const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState<any>(null);
    const [activeTab, setActiveTab] = useState("Harvest Story");

    const storeLink = (path: string) => {
        const slug = activeCompany?.subdomain || "";
        return `/${slug}${path === "/" ? "" : path}`;
    };

    const primaryColor = settings?.primary_color || "#14532d";

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                if (!activeCompany) return;
                const { data: p } = await supabase.from("products").select("*").eq("id", id).eq("company_id", activeCompany.id).single();
                setProduct(p);
                const { data: v } = await supabase.from("product_variants").select("*").eq("product_id", id).eq("company_id", activeCompany.id);
                setVariants(v || []);
                if (v && v.length > 0) setSelectedVariant(v[0]);
                if (p?.category) {
                    const { data: related } = await supabase.from("products").select("*").eq("category", p.category).eq("company_id", activeCompany.id).neq("id", id).limit(4);
                    setRelatedProducts(related || []);
                }
            } catch (error) {
                console.error("Error fetching product:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
        window.scrollTo(0, 0);
    }, [id, activeCompany?.id]);

    if (loading) return (
        <div className="bg-[#fafaf9] min-h-screen container mx-auto px-6 py-32 flex flex-col items-center justify-center gap-6">
            <Leaf className="w-12 h-12 text-[#14532d]/20 animate-bounce" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#14532d]/40">Gathering Harvest Details...</p>
        </div>
    );

    if (!product) return <div className="text-center py-40 font-bold text-slate-500 bg-[#fafaf9] min-h-screen uppercase tracking-widest">Harvest Protocol: Specimen Not Identified</div>;

    const currentPrice = selectedVariant?.price || product.rate || product.price || 0;

    const handleAddToCart = () => {
        addToCart({
            id: product.id,
            product_id: product.id,
            name: product.name,
            price: currentPrice,
            image_url: product.image_url || "",
            variant_id: selectedVariant?.id,
            variant_name: selectedVariant?.attributes_summary || selectedVariant?.name
        }, quantity);
    };

    return (
        <div className="bg-[#fafaf9] min-h-screen pb-24 font-sans text-slate-900 pt-24">
            {/* Product Top Banner — set position='product_top' in admin */}
            <div className="max-w-7xl mx-auto px-6 pt-4">
                <PageBanner position="product_top" height="h-28 md:h-36" />
            </div>
            <div className="max-w-7xl mx-auto px-6">
                {/* Elegant Breadcrumb */}
                <nav className="py-8">
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#14532d]/40">
                        <Link to={storeLink("/")} className="hover:text-[#14532d] transition-colors">Origins</Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <Link to={storeLink("/shop")} className="hover:text-[#14532d] transition-colors">The Market</Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span className="text-[#14532d]">{product.name}</span>
                    </div>
                </nav>

                <div className="flex flex-col lg:flex-row gap-16 items-start">
                    {/* Organic Gallery */}
                    <div className="w-full lg:w-[55%] lg:sticky lg:top-32 space-y-6">
                        <div className="relative aspect-[4/5] bg-white rounded-[48px] overflow-hidden shadow-sm group border border-slate-50">
                            <motion.img
                                initial={{ opacity: 0, scale: 1.05 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8 }}
                                src={product.image_url || `https://source.unsplash.com/1200x1600/?organic,${product.category}`}
                                className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                                alt={product.name}
                            />
                            <div className="absolute top-8 right-8 flex flex-col gap-4">
                                <button className="w-12 h-12 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-[#14532d] hover:bg-[#14532d] hover:text-white shadow-xl transition-all">
                                    <Heart className="w-5 h-5" />
                                </button>
                                <button className="w-12 h-12 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-[#14532d] hover:bg-[#14532d] hover:text-white shadow-xl transition-all">
                                    <Share2 className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="absolute bottom-8 left-8 flex items-center gap-3 px-6 py-2 bg-white/80 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-[#14532d]">
                                <Sparkles className="w-3.5 h-3.5 text-[#f97316]" /> Hand-Picked Selection
                            </div>
                        </div>
                    </div>

                    {/* Harvest Details */}
                    <div className="w-full lg:w-[45%] space-y-10 py-4">
                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <Leaf className="w-4 h-4 text-[#f97316]" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#14532d]/60">
                                    {product.category || "Organic Selection"}
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-[#14532d] leading-[0.9] uppercase">
                                {product.name}
                            </h1>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1 text-[#f97316]">
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-l border-slate-200 pl-4">4.9 Harvest Rating</span>
                            </div>
                            <div className="flex items-baseline gap-6 pt-2">
                                <span className="text-4xl font-black text-[#14532d]">₹{Number(currentPrice).toLocaleString()}</span>
                                <span className="text-lg text-[#14532d]/20 font-bold uppercase tracking-widest italic line-through decoration-[#f97316]/30 decoration-2">
                                    ₹{(Number(currentPrice) * 1.5).toLocaleString()}
                                </span>
                            </div>
                            <p className="text-sm font-bold text-[#14532d]/40 flex items-center gap-2">
                                <Sprout className="w-4 h-4 text-[#f97316]" /> Sustainably sourced and fresh
                            </p>
                        </div>

                        <div className="h-px bg-slate-100" />

                        <p className="text-base text-slate-500 leading-relaxed italic font-medium">
                            {product.description || "Nature's finest offering, cultivated with traditional organic methods to ensure the highest purity and nutrient density for your wellness."}
                        </p>

                        {/* Variants */}
                        {variants.length > 0 && (
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#14532d] flex items-center gap-2">
                                    <Sparkles className="w-3.5 h-3.5 text-[#f97316]" /> Choose Harvest Size
                                </h4>
                                <div className="flex flex-wrap gap-4">
                                    {variants.map((v) => (
                                        <button
                                            key={v.id}
                                            onClick={() => setSelectedVariant(v)}
                                            className={cn(
                                                "px-8 py-3 rounded-2xl border-2 transition-all font-bold text-xs uppercase tracking-widest",
                                                selectedVariant?.id === v.id
                                                    ? "border-[#14532d] bg-[#14532d] text-white shadow-xl shadow-[#14532d]/20"
                                                    : "border-slate-100 bg-white text-slate-400 hover:border-[#14532d]/20"
                                            )}
                                        >
                                            {v.attributes_summary || v.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity + Organic CTA */}
                        <div className="flex flex-col sm:flex-row gap-6 pt-4">
                            <div className="flex items-center bg-white rounded-3xl w-full sm:w-auto border border-slate-100 p-1 shadow-sm">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-14 h-14 flex items-center justify-center text-[#14532d] hover:bg-slate-50 rounded-2xl transition-all">
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-14 text-center font-black text-xl text-[#14532d]">{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)} className="w-14 h-14 flex items-center justify-center text-[#14532d] hover:bg-slate-50 rounded-2xl transition-all">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <Button
                                onClick={handleAddToCart}
                                style={{ backgroundColor: primaryColor }}
                                className="h-16 rounded-[24px] text-white hover:opacity-90 font-black uppercase tracking-[.2em] text-xs flex-1 shadow-2xl transition-all"
                            >
                                <ShoppingCart className="w-5 h-5 mr-3" /> Add to Harvest Box
                            </Button>
                        </div>

                        {/* Support Channel */}
                        <a
                            href={`https://wa.me/${settings?.whatsapp_number || "919000000000"}?text=Harvest Inquiry: ${product.name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-3 w-full h-14 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-[24px] font-black uppercase text-[10px] tracking-widest transition-all"
                        >
                            <MessageCircle className="w-5 h-5" /> Inquire on WhatsApp
                        </a>

                        {/* Quality Guarantees */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                            {[
                                { icon: ShieldCheck, title: "Pure Organic", sub: "100% Pesticide Free" },
                                { icon: Truck, title: "Fresh Delivery", sub: "Optimized Fulfilment" }
                            ].map((g, i) => (
                                <div key={i} className="flex gap-4 items-center bg-white p-6 rounded-[32px] border border-slate-50 shadow-sm">
                                    <div className="w-10 h-10 rounded-xl bg-[#f8fafc] flex items-center justify-center text-[#14532d]">
                                        <g.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-widest text-[#14532d]">{g.title}</p>
                                        <p className="text-[10px] font-bold text-slate-300 uppercase">{g.sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Extended Information */}
                <section className="mt-32 pt-16 border-t border-slate-100">
                    <div className="flex gap-12 border-b border-slate-100 mb-12 overflow-x-auto scrollbar-hide">
                        {["Harvest Story", "Nutrients", "Global Standards"].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "pb-6 text-xs font-black uppercase tracking-[.3em] transition-all border-b-4 whitespace-nowrap",
                                    activeTab === tab ? "text-[#14532d] border-[#f97316]" : "text-slate-300 border-transparent hover:text-[#14532d]"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="max-w-4xl py-4">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="min-h-[200px]"
                            >
                                {activeTab === "Harvest Story" && (
                                    <div className="space-y-6 text-[#14532d]/70 text-lg leading-relaxed font-medium">
                                        <p>{product.description || "Cultivated with deep respect for the earth, this harvest represents our commitment to natural purity."}</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                                            {[
                                                { t: "Sustainable Growth", s: "Methods that nurture the soil biology." },
                                                { t: "Traditional Wisdom", s: "Techniques passed through generations." },
                                                { t: "Sun Ripened", s: "Harvested at peak natural maturity." },
                                                { t: "Ethical Sourcing", s: "Ensuring fair treatment for farmers." }
                                            ].map((f, i) => (
                                                <div key={i} className="flex gap-4">
                                                    <div className="w-2 h-2 rounded-full bg-[#f97316] mt-2.5 shrink-0" />
                                                    <div>
                                                        <h5 className="font-black uppercase text-xs tracking-widest text-[#14532d] mb-1">{f.t}</h5>
                                                        <p className="text-sm font-medium italic text-slate-400">{f.s}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {activeTab === "Nutrients" && (
                                    <div className="max-w-xl bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm">
                                        {[
                                            ["Vitamins", "Rich in A, C, and E"],
                                            ["Minerals", "Active Zinc & Magnesium"],
                                            ["Antioxidants", "High Bioavailability"],
                                            ["Purity", "Non-GMO Certified"]
                                        ].map(([k, v]) => (
                                            <div key={k} className="flex justify-between py-5 border-b last:border-0 border-slate-50">
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#14532d]/40">{k}</span>
                                                <span className="text-sm font-black text-[#14532d] uppercase">{v}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {activeTab === "Global Standards" && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        <div className="space-y-4">
                                            <h4 className="font-black text-sm uppercase tracking-widest text-[#14532d]">Harvest Protection</h4>
                                            <p className="text-slate-400 text-sm leading-relaxed italic">Our packaging uses biodegradable cellulose and plant-based inks to ensure the purity of the harvest.</p>
                                        </div>
                                        <div className="space-y-4">
                                            <h4 className="font-black text-sm uppercase tracking-widest text-[#14532d]">Zero Waste Promise</h4>
                                            <p className="text-slate-400 text-sm leading-relaxed italic">We operate on a demand-harvest model to eliminate food waste and reduce ecological impact.</p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </section>
            </div>
        </div>
    );
}
