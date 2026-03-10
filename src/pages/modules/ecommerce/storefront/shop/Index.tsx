import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useSearchParams, Link } from "react-router-dom";
import { Filter, Search, ChevronDown, Star, ShoppingCart, Heart, X, SlidersHorizontal, Leaf, Sparkles, Box, Activity } from "lucide-react";
import { useTenant } from "@/contexts/TenantContext";
import { useCart } from "@/contexts/CartContext";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PageBanner } from "@/components/storefront/PageBanner";

const SORT_OPTIONS = [
    { value: "newest", label: "NEW_ARRIVALS" },
    { value: "price-low", label: "PRICE_LOW_TO_HIGH" },
    { value: "price-high", label: "PRICE_HIGH_TO_LOW" },
];

export default function Shop() {
    const { activeCompany } = useTenant();
    const { addToCart } = useCart();
    const { settings } = useStoreSettings();
    const [searchParams] = useSearchParams();

    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "All");
    const [sort, setSort] = useState("newest");
    const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const storeLink = (path: string) => {
        const slug = activeCompany?.subdomain || "";
        return `/${slug}${path === "/" ? "" : path}`;
    };

    const primaryColor = settings?.primary_color || "#14532d";

    useEffect(() => {
        if (!activeCompany) return;
        supabase.from("products").select("category").eq("company_id", activeCompany.id).then(({ data }) => {
            const cats = Array.from(new Set((data || []).map(p => p.category))).filter(Boolean) as string[];
            setCategories(["All", ...cats]);
        });
    }, [activeCompany?.id]);

    useEffect(() => {
        if (!activeCompany) return;
        setLoading(true);
        let query = supabase.from("products").select("*").eq("company_id", activeCompany.id).eq("is_ecommerce", true);
        if (selectedCategory !== "All") query = query.eq("category", selectedCategory);
        if (searchQuery) query = query.ilike("name", `%${searchQuery}%`);

        query.then(({ data }) => {
            let sorted = [...(data || [])];
            if (sort === "price-low") sorted.sort((a, b) => (a.price || a.rate) - (b.price || b.rate));
            if (sort === "price-high") sorted.sort((a, b) => (b.price || b.rate) - (a.price || a.rate));
            setProducts(sorted);
            setLoading(false);
        });
    }, [selectedCategory, searchQuery, sort, activeCompany?.id]);

    return (
        <div className="bg-[#f8fafc] min-h-screen font-sans py-20 pt-28">
            {/* Shop Header Banner */}
            <div className="container mx-auto px-6 mb-16">
                <PageBanner position="shop_header" height="h-48 md:h-72" className="rounded-[3rem] shadow-2xl" />
            </div>
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-12 mb-20 border-b border-slate-100 pb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Activity className="w-5 h-5 text-blue-600" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Store Inventory</span>
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black text-slate-900 uppercase tracking-tighter italic leading-[0.8] mb-2">Our <span className="text-blue-600">Store</span></h1>
                        <p className="text-sm font-medium text-slate-500 italic">Premium assets curated for professional-scale operations.</p>
                    </div>

                    <div className="flex items-center gap-4 flex-grow md:max-w-xl">
                        <div className="relative flex-grow group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                            <input
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search products..."
                                className="w-full h-16 pl-16 pr-8 bg-white border border-slate-100 rounded-3xl text-sm font-black text-slate-900 shadow-xl shadow-slate-200/50 outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600/20 transition-all font-sans uppercase tracking-widest"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-16 items-start">
                    {/* Sidebar */}
                    <aside className="w-full lg:w-72 shrink-0 space-y-10">
                        <div className="space-y-8 bg-white p-10 rounded-[2.5rem] border border-slate-50 shadow-xl shadow-slate-200/40">
                            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] border-b border-slate-50 pb-6 italic">Categories</h3>
                            <div className="space-y-4">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={cn(
                                            "w-full text-left text-[11px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-between group py-2 italic",
                                            selectedCategory === cat ? "text-blue-600" : "text-slate-300 hover:text-slate-900"
                                        )}
                                    >
                                        {cat}
                                        {selectedCategory === cat && <div className="w-2 h-2 rounded-full bg-blue-600 shadow-lg shadow-blue-600/50" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-8 bg-white p-10 rounded-[2.5rem] border border-slate-50 shadow-xl shadow-slate-200/40">
                            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] border-b border-slate-50 pb-6 italic">Sort By</h3>
                            <div className="space-y-5">
                                {SORT_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setSort(opt.value)}
                                        className={cn(
                                            "w-full text-left text-[10px] font-black uppercase tracking-[0.2em] transition-all italic",
                                            sort === opt.value ? "text-slate-900" : "text-slate-300 hover:text-slate-900"
                                        )}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <PageBanner position="shop_mid" height="h-72" className="rounded-[2.5rem] shadow-2xl" autoPlay={false} />
                    </aside>

                    {/* Inventory Grid */}
                    <div className="flex-grow">
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="aspect-[4/5] bg-white rounded-[3rem] animate-pulse border border-slate-50" />
                                ))}
                            </div>
                        ) : !products.length ? (
                            <div className="flex flex-col items-center justify-center py-48 bg-white rounded-[4rem] border border-dashed border-slate-100">
                                <Search className="w-16 h-16 text-slate-100 mb-8" />
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">No Products Found</h3>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-4 italic">Adjust your search parameters.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-20 gap-x-10">
                                {products.map((p, i) => {
                                    const price = Number(p.rate || p.price || 0);
                                    return (
                                        <motion.div
                                            key={p.id}
                                            initial={{ opacity: 0, y: 30 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: (i % 6) * 0.05 }}
                                            className="group"
                                        >
                                            <Link to={storeLink(`/product/${p.id}`)} className="block space-y-8">
                                                <div className="aspect-[4/5] relative overflow-hidden rounded-[3.5rem] bg-white border border-slate-50 shadow-sm transition-all duration-700 group-hover:shadow-[0_40px_80px_-20px_rgba(37,99,235,0.15)] group-hover:-translate-y-3">
                                                    <img
                                                        src={p.image_url || `https://source.unsplash.com/800x1200/?tech,product,${p.category}`}
                                                        alt={p.name}
                                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[50%] group-hover:grayscale-0"
                                                    />
                                                    <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors" />

                                                    <div className="absolute bottom-10 left-10 right-10 translate-y-20 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                                        <Button
                                                            onClick={e => {
                                                                e.preventDefault();
                                                                addToCart({ id: p.id, product_id: p.id, name: p.name, price, image_url: p.image_url || "" }, 1);
                                                            }}
                                                            className="w-full h-16 rounded-2xl bg-slate-900 hover:bg-blue-600 text-white font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl border-none transition-all italic"
                                                        >
                                                            <ShoppingCart className="w-4 h-4 mr-3" /> Add to Cart
                                                        </Button>
                                                    </div>

                                                    <div className="absolute top-10 right-10 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-10 group-hover:translate-x-0 duration-500">
                                                        <button
                                                            onClick={e => e.preventDefault()}
                                                            className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center text-slate-900 hover:text-red-500 transition-all shadow-xl"
                                                        >
                                                            <Heart className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="space-y-4 px-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 italic">{p.category || "General Asset"}</span>
                                                        <div className="h-px grow bg-slate-100" />
                                                    </div>
                                                    <h3 className="font-black text-2xl text-slate-900 leading-none line-clamp-2 uppercase tracking-tighter italic group-hover:text-blue-600 transition-colors">{p.name}</h3>
                                                    <p className="text-3xl font-black text-slate-900 tracking-tighter flex items-center gap-2">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2 italic">Price</span>
                                                        ₹ {price.toLocaleString()}
                                                    </p>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
