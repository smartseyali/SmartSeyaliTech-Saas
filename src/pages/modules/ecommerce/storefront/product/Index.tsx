import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import {
    Star, ShoppingCart, Heart, ShieldCheck,
    Truck, ChevronRight, Minus, Plus, Share2,
    MessageCircle, Shield, Zap, Layout, Box, Code
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
    const [activeTab, setActiveTab] = useState("System Intel");

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
        <div className="bg-[#f8fafc] min-h-screen container mx-auto px-6 py-32 flex flex-col items-center justify-center gap-8">
            <Box className="w-16 h-16 text-blue-600/20 animate-pulse" />
            <p className="text-xs font-bold  tracking-widest text-slate-500">Interrogating Inventory Matrix...</p>
        </div>
    );

    if (!product) return <div className="text-center py-40 font-bold text-slate-500 bg-[#f8fafc] min-h-screen  tracking-[0.5em] ">Critical Error: Asset Signature Not Identified</div>;

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
        <div className="bg-[#f8fafc] min-h-screen pb-32 font-sans text-slate-900 pt-24">
            {/* Asset Top Banner */}
            <div className="max-w-7xl mx-auto px-6 pt-6">
                <PageBanner position="product_top" height="h-28 md:h-40" className="rounded-[2.5rem] shadow-xl" />
            </div>
            <div className="max-w-7xl mx-auto px-6">
                {/* Architectural Breadcrumb */}
                <nav className="py-12">
                    <div className="flex items-center gap-4 text-xs font-bold  tracking-widest text-slate-500">
                        <Link to={storeLink("/")} className="hover:text-blue-600 transition-colors ">Core Ecosystem</Link>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-200" />
                        <Link to={storeLink("/shop")} className="hover:text-blue-600 transition-colors ">Inventory Hub</Link>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-200" />
                        <span className="text-slate-900">{product.name}</span>
                    </div>
                </nav>

                <div className="flex flex-col lg:flex-row gap-20 items-start">
                    {/* Visual Asset Gallery */}
                    <div className="w-full lg:w-[55%] lg:sticky lg:top-32 space-y-8">
                        <div className="relative aspect-[4/5] bg-white rounded-[4rem] overflow-hidden shadow-2xl group border border-slate-50">
                            <motion.img
                                initial={{ opacity: 0, scale: 1.05 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8 }}
                                src={product.image_url || `https://source.unsplash.com/1200x1600/?tech,inventory,${product.category}`}
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[30%] group-hover:grayscale-0"
                                alt={product.name}
                            />
                            <div className="absolute top-10 right-10 flex flex-col gap-4 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
                                <button className="w-14 h-14 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center text-slate-900 hover:text-red-500 shadow-2xl transition-all">
                                    <Heart className="w-5 h-5" />
                                </button>
                                <button className="w-14 h-14 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center text-slate-900 hover:text-blue-600 shadow-2xl transition-all">
                                    <Share2 className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="absolute bottom-10 left-10 flex items-center gap-4 px-8 py-3 bg-slate-900/90 backdrop-blur-xl rounded-2xl text-xs font-bold  tracking-widest text-white shadow-2xl border border-white/10">
                                <Zap className="w-4 h-4 text-blue-400" /> Verified Platform Spec
                            </div>
                        </div>
                    </div>

                    {/* Technical Specifications */}
                    <div className="w-full lg:w-[45%] space-y-12 py-4">
                        <div className="space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="h-0.5 w-12 bg-blue-600" />
                                <span className="text-xs font-bold  tracking-widest text-blue-600">
                                    {product.category || "General Asset"} System
                                </span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-slate-900 leading-[0.8]  ">
                                {product.name}
                            </h1>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-1.5 text-blue-600">
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                                </div>
                                <span className="text-xs font-bold text-slate-500  tracking-widest border-l border-slate-100 pl-6 ">Performance Yield: 4.9/5</span>
                            </div>
                            <div className="flex items-baseline gap-8 pt-4">
                                <span className="text-5xl font-bold text-slate-900 tracking-tighter  leading-none">₹{Number(currentPrice).toLocaleString()}</span>
                                <span className="text-xl text-slate-200 font-bold  tracking-widest  line-through decoration-blue-600/30 decoration-4">
                                    ₹{(Number(currentPrice) * 1.5).toLocaleString()}
                                </span>
                            </div>
                            <p className="text-[13px] font-bold text-slate-500 flex items-center gap-3  tracking-widest">
                                <Layout className="w-5 h-5 text-blue-600" /> High-frequency delivery ready
                            </p>
                        </div>

                        <div className="h-px bg-slate-100" />

                        <div className="space-y-4">
                            <p className="text-xs font-bold  tracking-widest text-slate-500 ">Core Overview</p>
                            <p className="text-lg text-slate-500 leading-relaxed  font-medium">
                                "{product.description || "Optimized for high-demand environments, this asset delivers superior efficiency and architectural reliability within your operational framework."}"
                            </p>
                        </div>

                        {/* Variants as Logic Nodes */}
                        {variants.length > 0 && (
                            <div className="space-y-8">
                                <h4 className="text-[13px] font-bold  tracking-widest text-slate-900 flex items-center gap-3">
                                    <Box className="w-4 h-4 text-blue-600" /> Select Configuration
                                </h4>
                                <div className="flex flex-wrap gap-4">
                                    {variants.map((v) => (
                                        <button
                                            key={v.id}
                                            onClick={() => setSelectedVariant(v)}
                                            className={cn(
                                                "px-10 py-4 rounded-2xl border-2 transition-all font-bold text-xs  tracking-widest",
                                                selectedVariant?.id === v.id
                                                    ? "border-slate-900 bg-slate-900 text-white shadow-2xl shadow-slate-900/20"
                                                    : "border-slate-100 bg-white text-slate-300 hover:border-slate-900"
                                            )}
                                        >
                                            {v.attributes_summary || v.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity + Deployment CTA */}
                        <div className="flex flex-col sm:flex-row gap-8 pt-6">
                            <div className="flex items-center bg-white rounded-3xl w-full sm:w-auto border border-slate-100 p-1.5 shadow-xl shadow-slate-200/40">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-14 h-14 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-all">
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-16 text-center font-bold text-2xl text-slate-900 tracking-tighter">{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)} className="w-14 h-14 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-all">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <Button
                                onClick={handleAddToCart}
                                className="h-16 rounded-[2rem] bg-blue-600 hover:bg-slate-900 text-white font-bold  tracking-[.3em] text-[13px] flex-1 shadow-2xl shadow-blue-600/20 transition-all border-none"
                            >
                                <ShoppingCart className="w-5 h-5 mr-4" /> Initialize Deployment
                            </Button>
                        </div>

                        {/* Support Channel */}
                        <a
                            href={`https://wa.me/${settings?.whatsapp_number || "919000000000"}?text=Operational Inquiry: ${product.name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-4 w-full h-16 bg-slate-50 text-slate-900 hover:bg-slate-900 hover:text-white rounded-[2rem] font-bold  text-xs tracking-widest transition-all border border-slate-100"
                        >
                            <MessageCircle className="w-5 h-5 text-blue-600" /> Acquire Technical Support
                        </a>

                        {/* Efficiency Tags */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
                            {[
                                { icon: ShieldCheck, title: "Secure", sub: "Enterprise Compliance" },
                                { icon: Truck, title: "Rapid Fulfilment", sub: "Priority Logistics" }
                            ].map((g, i) => (
                                <div key={i} className="flex gap-6 items-center bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-blue-600 border border-slate-100">
                                        <g.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-bold  tracking-widest text-slate-900">{g.title}</p>
                                        <p className="text-[13px] font-bold text-slate-300  tracking-widest mt-1">{g.sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Analytical Data */}
                <section className="mt-40 pt-20 border-t border-slate-100">
                    <div className="flex gap-16 border-b border-slate-100 mb-16 overflow-x-auto no-scrollbar scrollbar-hide">
                        {["System Intel", "Architecture", "Compliance"].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "pb-8 text-[13px] font-bold  tracking-widest transition-all border-b-4 whitespace-nowrap",
                                    activeTab === tab ? "text-blue-600 border-blue-600" : "text-slate-200 border-transparent hover:text-slate-500"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="max-w-5xl py-4">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4 }}
                                className="min-h-[300px]"
                            >
                                {activeTab === "System Intel" && (
                                    <div className="space-y-10 text-slate-500 text-xl leading-relaxed  font-medium">
                                        <p>"{product.description || "Our platform guarantees the highest level of component integrity and operational reliability for this specified asset."}"</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-10">
                                            {[
                                                { t: "Scalable Logic", s: "Engineered for rapid growth and high throughput." },
                                                { t: "Global Precision", s: "Consistent quality control across all territories." },
                                                { t: "Dynamic Response", s: "Adaptive performance levels based on demand." },
                                                { t: "Certified Integrity", s: "Strict adherence to platform security standards." }
                                            ].map((f, i) => (
                                                <div key={i} className="flex gap-5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-3 shrink-0" />
                                                    <div>
                                                        <h5 className="font-bold  text-[13px] tracking-widest text-slate-900 mb-2">{f.t}</h5>
                                                        <p className="text-sm font-medium  text-slate-500">{f.s}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {activeTab === "Architecture" && (
                                    <div className="max-w-2xl bg-white rounded-[3rem] p-12 border border-slate-100 shadow-xl shadow-slate-200/50">
                                        {[
                                            ["Core Module", "Industrial Standard"],
                                            ["Interface", "Seamless API Access"],
                                            ["Encryption", "Quantum-Resistant Node"],
                                            ["Redundancy", "Triple-Layer Cache"]
                                        ].map(([k, v]) => (
                                            <div key={k} className="flex justify-between py-6 border-b last:border-0 border-slate-50">
                                                <span className="text-xs font-bold  tracking-widest text-slate-300">{k}</span>
                                                <span className="text-xs font-bold text-slate-900  tracking-widest">{v}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {activeTab === "Compliance" && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3">
                                                <Shield className="w-5 h-5 text-blue-600" />
                                                <h4 className="font-bold text-xs  tracking-widest text-slate-900">Regulatory Framework</h4>
                                            </div>
                                            <p className="text-slate-500 text-sm leading-relaxed ">Fully compliant with the latest enterprise safety and security protocols, ensuring data sovereignty and operational continuity.</p>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3">
                                                <Code className="w-5 h-5 text-blue-600" />
                                                <h4 className="font-bold text-xs  tracking-widest text-slate-900">Architecture Zero</h4>
                                            </div>
                                            <p className="text-slate-500 text-sm leading-relaxed ">Built on a zero-trust model to eliminate systemic vulnerabilities and optimize resource utilization across the ecosystem.</p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </section>

                {/* Related Inventory Matrix */}
                {relatedProducts.length > 0 && (
                    <section className="mt-40 pt-20 border-t border-slate-100">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Layout className="w-5 h-5 text-blue-600" />
                                    <span className="text-xs font-bold  tracking-widest text-slate-500 ">Inventory Clusters</span>
                                </div>
                                <h2 className="text-4xl lg:text-6xl font-bold text-slate-900  tracking-tighter  leading-none">Similar <span className="text-blue-600">Assets</span></h2>
                            </div>
                            <Link
                                to={storeLink("/shop")}
                                className="text-xs font-bold  tracking-widest text-blue-600 hover:text-slate-900 transition-all border-b-2 border-transparent hover:border-slate-900 pb-2 "
                            >
                                Full Discovery Hub
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                            {relatedProducts.map((p, i) => (
                                <motion.div
                                    key={p.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="group"
                                >
                                    <Link to={storeLink(`/product/${p.id}`)} className="block space-y-6">
                                        <div className="aspect-[4/5] relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-50 shadow-sm transition-all duration-700 group-hover:shadow-2xl group-hover:shadow-blue-600/10 group-hover:-translate-y-2">
                                            <img
                                                src={p.image_url || `https://source.unsplash.com/800x1200/?tech,asset,${p.category}`}
                                                alt={p.name}
                                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[30%] group-hover:grayscale-0"
                                            />
                                            <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors" />
                                        </div>
                                        <div className="space-y-2 px-2">
                                            <h4 className="font-bold text-lg text-slate-900 leading-tight  tracking-tighter  group-hover:text-blue-600 transition-colors line-clamp-1">{p.name}</h4>
                                            <p className="text-xl font-bold text-slate-900 tracking-tighter  opacity-80">
                                                ₹ {Number(p.rate || p.price || 0).toLocaleString()}
                                            </p>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
