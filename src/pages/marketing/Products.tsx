import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";
import {
  Box,
  Zap,
  Search,
  ChevronRight,
  ArrowUpRight,
  Info,
  Layout
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const Products = () => {
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchModules = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("system_modules")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (error) throw error;
        setModules(data || []);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, []);

  const categories = ["commerce", "finance", "operations", "people", "customer", "analytics"];

  const filteredModules = modules.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const modulesByCategory = categories.reduce((acc: any, cat) => {
    const filtered = filteredModules.filter(m => m.category === cat);
    if (filtered.length > 0) acc[cat] = filtered;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/10 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8"
          >
            <Badge className="px-4 py-1.5 rounded-full bg-blue-600/10 text-blue-600 border-none font-black uppercase tracking-[0.2em] text-[10px]">
              Platform Ecosystem
            </Badge>
            <h1 className="text-6xl lg:text-8xl font-black text-slate-900 tracking-tighter uppercase italic leading-[0.9]">
              Inventory <span className="text-blue-600">Hub</span>
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed italic">
              Group-optimized SaaS engines designed to scale your business operations with architectural precision.
            </p>

            <div className="max-w-xl mx-auto relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="text"
                placeholder="Search across categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-16 pl-14 pr-6 rounded-2xl bg-white border border-slate-200 shadow-xl shadow-slate-200/50 focus:ring-4 focus:ring-blue-500/10 focus:outline-none font-bold text-lg transition-all"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Grouped Listings (Odoo Style) */}
      <section className="pb-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center gap-6">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="font-black text-slate-400 uppercase tracking-widest text-xs">Calibrating Hub...</span>
            </div>
          ) : Object.keys(modulesByCategory).length > 0 ? (
            Object.entries(modulesByCategory).map(([category, items]: [string, any]) => (
              <div key={category} className="space-y-10 group/section">
                <div className="flex items-center gap-6">
                  <h2 className="text-2xl font-black uppercase italic tracking-widest text-slate-900">{category}</h2>
                  <div className="h-px bg-slate-200 grow group-hover/section:bg-blue-200 transition-colors" />
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {items.map((mod: any) => (
                    <motion.div
                      key={mod.id}
                      whileHover={{ y: -8 }}
                      className="bg-white rounded-[2.5rem] border border-slate-200/60 overflow-hidden hover:shadow-[0_40px_80px_-15px_rgba(37,99,235,0.1)] transition-all duration-500 flex flex-col group"
                    >
                      <Link to={`/products/${mod.slug}`} className="relative h-48 overflow-hidden">
                        <div className={cn(
                          "absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-20 transition-opacity",
                          mod.color_from || "from-blue-500",
                          mod.color_to || "to-indigo-600"
                        )} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-6xl group-hover:scale-125 transition-transform duration-700">{mod.icon || "📦"}</span>
                        </div>
                        <div className="absolute bottom-6 left-6">
                          <Badge className="bg-white/90 backdrop-blur-md text-slate-900 border-none text-[10px] font-black uppercase tracking-widest">
                            {mod.status}
                          </Badge>
                        </div>
                      </Link>

                      <div className="p-8 space-y-6 flex-1 flex flex-col">
                        <div className="space-y-1">
                          <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 group-hover:text-blue-600 transition-colors">{mod.name}</h3>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{mod.tagline || "Platform Core Engine"}</p>
                        </div>

                        <p className="text-sm font-medium italic text-slate-500 line-clamp-2">"{mod.description}"</p>

                        <div className="flex flex-wrap gap-2">
                          {(mod.features || []).slice(0, 3).map((feat: string, i: number) => (
                            <span key={i} className="text-[8px] font-black uppercase bg-slate-50 text-slate-400 px-2 py-1.5 rounded-lg border border-slate-100 flex items-center gap-1.5">
                              <Zap className="w-2.5 h-2.5 text-blue-500" /> {feat}
                            </span>
                          ))}
                        </div>

                        <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                          <Link to={`/products/${mod.slug}`} className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors">
                            Details <ChevronRight className="w-3 h-3" />
                          </Link>
                          <Link to={`/login?module=${mod.slug}`} className="bg-slate-900 text-white h-10 px-6 rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center gap-2 hover:bg-black transition-all">
                            Initialize <ArrowUpRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 grayscale opacity-50">
              <Box className="w-16 h-16 mx-auto text-slate-200 mb-6" />
              <h3 className="text-xl font-black uppercase italic tracking-tighter">No modules matching your search</h3>
            </div>
          )}
        </div>
      </section>

      {/* Custom CTA */}
      <section className="py-20 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <h2 className="text-4xl font-black uppercase italic tracking-tighter">Ready to <span className="text-blue-600">Scale</span>?</h2>
          <div className="flex justify-center gap-8">
            <Link to="/contact" className="h-16 px-12 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-xs flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-500/20">
              Contact Architects
            </Link>
            <Link to="/services" className="h-16 px-12 rounded-2xl border-2 border-slate-900 text-slate-900 font-black uppercase tracking-widest text-xs flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all">
              View Capabilities
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Products;
