import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useSearchParams, Link } from "react-router-dom";
import { Filter, Search, ChevronDown, Star, ShoppingCart, Heart, X, SlidersHorizontal, Leaf, Sparkles } from "lucide-react";
import { useTenant } from "@/contexts/TenantContext";
import { useCart } from "@/contexts/CartContext";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PageBanner } from "@/components/storefront/PageBanner";

const SORT_OPTIONS = [
    { value: "newest", label: "Fresh Arrivals" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
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
        <div className="bg-[#fafaf9] min-h-screen font-sans py-20 pt-28">
            {/* Shop Header Banner — set position='shop_header' in admin */}
            <div className="container mx-auto px-6 mb-10">
                <PageBanner position="shop_header" height="h-48 md:h-64" />
            </div>
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-12 mb-16">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Leaf className="w-4 h-4 text-[#f97316]" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#14532d]/40">Our Collection</span>
                        </div>
                        <h1 className="text-4xl font-black text-[#14532d] uppercase tracking-tighter">The <span className="text-[#f97316]">Market</span></h1>
                    </div>

                    <div className="flex items-center gap-4 flex-grow md:max-w-xl">
                        <div className="relative flex-grow">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                            <input
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search nature's bounty..."
                                className="w-full h-16 pl-14 pr-8 bg-white border border-slate-100 rounded-3xl text-sm font-bold text-[#14532d] shadow-sm outline-none focus:border-[#14532d]/20 transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 items-start">
                    {/* Sidebar */}
                    <aside className="w-full lg:w-64 shrink-0 space-y-12">
                        <div className="space-y-6 bg-white p-8 rounded-[32px] border border-slate-50 shadow-sm">
                            <h3 className="text-[10px] font-black text-[#14532d] uppercase tracking-[0.3em] border-b border-slate-50 pb-4">Categories</h3>
                            <div className="space-y-4">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={cn(
                                            "w-full text-left text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between group",
                                            selectedCategory === cat ? "text-[#f97316]" : "text-slate-300 hover:text-[#14532d]"
                                        )}
                                    >
                                        {cat}
                                        {selectedCategory === cat && <div className="w-1 h-1 rounded-full bg-[#f97316]" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6 bg-white p-8 rounded-[32px] border border-slate-50 shadow-sm">
                            <h3 className="text-[10px] font-black text-[#14532d] uppercase tracking-[0.3em] border-b border-slate-50 pb-4">Sort By</h3>
                            <div className="space-y-4">
                                {SORT_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setSort(opt.value)}
                                        className={cn(
                                            "w-full text-left text-[10px] font-black uppercase tracking-widest transition-all",
                                            sort === opt.value ? "text-[#14532d]" : "text-slate-300 hover:text-[#14532d]"
                                        )}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sidebar Promo Banner — set position='shop_mid' in admin */}
                        <PageBanner position="shop_mid" height="h-64" className="rounded-[32px]" autoPlay={false} />
                    </aside>

                    {/* Product Grid */}
                    <div className="flex-grow">
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="aspect-[4/5] bg-white rounded-[40px] animate-pulse border border-slate-50" />
                                ))}
                            </div>
                        ) : !products.length ? (
                            <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[48px] border border-dashed border-slate-100">
                                <Search className="w-12 h-12 text-[#14532d]/10 mb-6" />
                                <h3 className="text-xl font-bold text-[#14532d]">No harvest matches</h3>
                                <p className="text-sm text-slate-400 font-medium mt-2">Try adjusting your filters.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-8">
                                {products.map((p, i) => {
                                    const price = Number(p.rate || p.price || 0);
                                    return (
                                        <motion.div
                                            key={p.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: (i % 6) * 0.05 }}
                                            className="group"
                                        >
                                            <Link to={storeLink(`/product/${p.id}`)} className="block space-y-6">
                                                <div className="aspect-[4/5] relative overflow-hidden rounded-[40px] bg-white border border-slate-50 shadow-sm transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-[#14532d]/5 group-hover:-translate-y-2">
                                                    <img
                                                        src={p.image_url || `https://source.unsplash.com/800x1200/?organic,${p.category}`}
                                                        alt={p.name}
                                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

                                                    <div className="absolute bottom-8 left-8 right-8 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                                                        <Button
                                                            onClick={e => {
                                                                e.preventDefault();
                                                                addToCart({ id: p.id, product_id: p.id, name: p.name, price, image_url: p.image_url || "" }, 1);
                                                            }}
                                                            style={{ backgroundColor: primaryColor }}
                                                            className="w-full h-14 rounded-2xl text-white font-black uppercase text-[10px] tracking-widest shadow-xl border-none"
                                                        >
                                                            <ShoppingCart className="w-4 h-4 mr-2" /> Add to Box
                                                        </Button>
                                                    </div>

                                                    <button
                                                        onClick={e => e.preventDefault()}
                                                        className="absolute top-8 right-8 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Heart className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <div className="space-y-2 text-center">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#f97316]">{p.category}</p>
                                                    <h3 className="font-bold text-xl text-[#14532d] leading-none px-4 line-clamp-2 uppercase tracking-tight">{p.name}</h3>
                                                    <p className="text-2xl font-black text-[#14532d] tracking-tighter">₹ {price.toLocaleString()}</p>
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
