import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Box, Search, ArrowRight, X, SlidersHorizontal, ListFilter,
  ShoppingCart, Monitor, Target, TrendingUp, Package, ShoppingBag,
  Users, BarChart3, MessageCircle, Globe, Database,
  type LucideIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
  SheetTrigger, SheetFooter, SheetClose,
} from "@/components/ui/sheet";

/* ── Same icon map as AppLauncher ─────────────────────────────────────── */
const MODULE_ICONS: Record<string, LucideIcon> = {
  ecommerce: ShoppingCart,
  pos:       Monitor,
  crm:       Target,
  sales:     TrendingUp,
  inventory: Package,
  purchase:  ShoppingBag,
  hrms:      Users,
  finance:   BarChart3,
  whatsapp:  MessageCircle,
  website:   Globe,
  masters:   Database,
};

/* Category icons */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  commerce:   ShoppingCart,
  finance:    BarChart3,
  operations: ShoppingBag,
  people:     Users,
  customer:   Target,
  analytics:  BarChart3,
};

const CATEGORIES = ["commerce", "finance", "operations", "people", "customer", "analytics"];
const STATUSES   = ["All", "Operational", "Beta", "Coming Soon"];

const Products = () => {
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialCategory = searchParams.get("category") || "All";
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

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
      } catch {
        /* noop */
      } finally {
        setLoading(false);
      }
    };
    fetchModules();
  }, []);

  const filteredModules = useMemo(() => modules.filter((m) => {
    const matchCat    = selectedCategory === "All" || m.category === selectedCategory;
    const matchStatus = selectedStatus === "All"   || (m.status || "Operational") === selectedStatus;
    const q           = searchTerm.toLowerCase();
    const matchSearch = !q || m.name.toLowerCase().includes(q)
      || m.category?.toLowerCase().includes(q)
      || m.tagline?.toLowerCase().includes(q);
    return matchCat && matchStatus && matchSearch;
  }), [modules, selectedCategory, selectedStatus, searchTerm]);

  const modulesByCategory = useMemo(() => CATEGORIES.reduce((acc: any, cat) => {
    const filtered = filteredModules.filter((m) => m.category === cat);
    if (filtered.length > 0) acc[cat] = filtered;
    return acc;
  }, {}), [filteredModules]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category === "All") searchParams.delete("category");
    else searchParams.set("category", category);
    setSearchParams(searchParams);
  };

  const hasActiveFilters  = selectedCategory !== "All" || selectedStatus !== "All" || searchTerm !== "";
  const activeFilterCount = (selectedCategory !== "All" ? 1 : 0) + (selectedStatus !== "All" ? 1 : 0);
  const clearAllFilters   = () => {
    setSelectedCategory("All"); setSelectedStatus("All"); setSearchTerm("");
    searchParams.delete("category"); setSearchParams(searchParams);
  };

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-white pt-32 pb-16 lg:pt-40 lg:pb-20 border-b border-gray-100">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(37,99,235,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-gradient-to-bl from-blue-50 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-[#2563EB] mb-4 block">
              Product Catalog
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-6">
              Explore Our
              <br />
              <span className="text-[#2563EB]">Module Lineup</span>
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed max-w-xl">
              Powerful, modular software solutions — each designed to solve a specific business
              challenge and integrate seamlessly with the rest.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Sticky filters ───────────────────────────────────────────────── */}
      <section className="py-3 bg-white/90 backdrop-blur-xl sticky top-0 z-40 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3">
            {/* Search + status row */}
            <div className="flex gap-3 items-center">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search modules..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-10 rounded border-gray-200 bg-gray-50 focus:bg-white text-sm"
                />
              </div>

              <div className="hidden lg:block">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-44 h-10 rounded border-gray-200 bg-gray-50 text-sm">
                    <div className="flex items-center gap-2">
                      <ListFilter className="w-3.5 h-3.5 text-gray-400" />
                      <SelectValue placeholder="Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Mobile sheet */}
              <Sheet open={showFilters} onOpenChange={setShowFilters}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden h-10 rounded border-gray-200 bg-gray-50 text-sm px-3">
                    <SlidersHorizontal className="w-4 h-4 mr-1.5" />
                    Filters
                    {activeFilterCount > 0 && (
                      <span className="ml-1.5 w-4 h-4 rounded-full bg-[#2563EB] text-white text-[10px] flex items-center justify-center font-bold">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[380px] flex flex-col">
                  <SheetHeader className="pb-4 border-b">
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>Refine the module list.</SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto py-5 space-y-6">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Status</p>
                      <div className="grid grid-cols-2 gap-2">
                        {STATUSES.map((s) => (
                          <button key={s} onClick={() => setSelectedStatus(s)}
                            className={cn("px-3 py-2 rounded text-sm font-medium border transition-all",
                              selectedStatus === s
                                ? "bg-[#2563EB] border-[#2563EB] text-white"
                                : "bg-gray-50 border-gray-200 text-gray-600 hover:border-blue-200"
                            )}>{s}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Category</p>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => handleCategoryChange("All")}
                          className={cn("px-3 py-1.5 rounded text-sm font-medium border transition-all",
                            selectedCategory === "All"
                              ? "bg-[#2563EB] border-[#2563EB] text-white"
                              : "bg-gray-50 border-gray-200 text-gray-600"
                          )}>All</button>
                        {CATEGORIES.map((cat) => (
                          <button key={cat} onClick={() => handleCategoryChange(cat)}
                            className={cn("px-3 py-1.5 rounded text-sm font-medium border capitalize transition-all",
                              selectedCategory === cat
                                ? "bg-[#2563EB] border-[#2563EB] text-white"
                                : "bg-gray-50 border-gray-200 text-gray-600"
                            )}>{cat}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <SheetFooter className="border-t pt-4">
                    <div className="flex gap-3 w-full">
                      <button onClick={clearAllFilters} className="text-sm text-gray-500 hover:text-[#2563EB] font-medium px-3">
                        Clear All
                      </button>
                      <SheetClose asChild>
                        <Button className="flex-1 rounded bg-[#2563EB] hover:bg-blue-700 text-white h-10 font-semibold text-sm">
                          Apply
                        </Button>
                      </SheetClose>
                    </div>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop category pills */}
            <div className="hidden lg:flex items-center gap-3">
              <span className="text-xs font-semibold text-gray-400 whitespace-nowrap uppercase tracking-wide">
                Category:
              </span>
              <div className="flex gap-1.5 overflow-x-auto">
                <button
                  onClick={() => handleCategoryChange("All")}
                  className={cn("shrink-0 px-4 py-1 rounded text-xs font-semibold transition-all",
                    selectedCategory === "All"
                      ? "bg-[#2563EB] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >All</button>
                {CATEGORIES.map((cat) => {
                  const CatIcon = CATEGORY_ICONS[cat] || Package;
                  return (
                    <button
                      key={cat}
                      onClick={() => handleCategoryChange(cat)}
                      className={cn(
                        "shrink-0 flex items-center gap-1.5 px-4 py-1 rounded text-xs font-semibold capitalize transition-all",
                        selectedCategory === cat
                          ? "bg-[#2563EB] text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      )}
                    >
                      <CatIcon className="w-3 h-3" />
                      {cat}
                    </button>
                  );
                })}
              </div>
              {hasActiveFilters && (
                <button onClick={clearAllFilters} className="ml-auto text-xs font-semibold text-[#2563EB] flex items-center gap-1">
                  <X className="w-3 h-3" /> Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Modules Grid ─────────────────────────────────────────────────── */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-400 mb-8">
            Showing <span className="font-semibold text-gray-700">{filteredModules.length}</span> module{filteredModules.length !== 1 ? "s" : ""}
          </p>

          {loading ? (
            <div className="flex justify-center py-24">
              <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : Object.keys(modulesByCategory).length > 0 ? (
            <div className="space-y-16">
              {Object.entries(modulesByCategory).map(([category, items]: [string, any]) => {
                const CatIcon = CATEGORY_ICONS[category] || Package;
                return (
                  <div key={category}>
                    {/* Category header */}
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                          <CatIcon className="w-4.5 h-4.5 text-[#2563EB]" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 capitalize">
                          {category} Solutions
                        </h2>
                      </div>
                      <span className="text-xs font-semibold text-[#2563EB] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                        {items.length} {items.length === 1 ? "Module" : "Modules"}
                      </span>
                    </motion.div>

                    {/* Cards — AppLauncher style */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {items.map((mod: any, i: number) => {
                        const Icon = MODULE_ICONS[mod.slug] || Package;
                        const statusColor =
                          (mod.status || "Operational") === "Operational" ? "bg-green-100 text-green-700"
                          : (mod.status || "Operational") === "Beta"        ? "bg-amber-100 text-amber-700"
                          : "bg-gray-100 text-gray-600";
                        return (
                          <motion.div
                            key={mod.id}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.06 }}
                            className="group"
                          >
                            <div className="bg-white border border-gray-200 rounded-2xl p-5 text-center hover:shadow-lg hover:-translate-y-0.5 hover:border-gray-300 transition-all duration-200 flex flex-col items-center">
                              {/* Gradient icon — identical to AppLauncher */}
                              <div className={cn(
                                "w-14 h-14 rounded-2xl flex items-center justify-center shadow-md mb-3 bg-gradient-to-br group-hover:scale-110 transition-transform duration-200",
                                mod.color_from || "from-blue-500",
                                mod.color_to || "to-blue-600"
                              )}>
                                <Icon className="w-7 h-7 text-white" strokeWidth={1.75} />
                              </div>

                              <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[#2563EB] transition-colors mb-0.5 line-clamp-1">
                                {mod.name}
                              </h3>
                              <p className="text-[11px] text-gray-400 line-clamp-1 mb-3">
                                {mod.tagline || category + " module"}
                              </p>

                              <span className={cn("text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-4", statusColor)}>
                                {mod.status || "Operational"}
                              </span>

                              <Button
                                size="sm"
                                onClick={() => navigate(`/login?module=${mod.slug}`)}
                                className="w-full h-8 rounded-xl bg-gray-50 text-gray-700 border border-gray-100 font-semibold text-xs hover:bg-[#2563EB] hover:text-white hover:border-[#2563EB] transition-all duration-200"
                              >
                                Get Started <ArrowRight className="ml-1 w-3 h-3" />
                              </Button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-32 border-2 border-dashed border-gray-100 rounded-xl"
            >
              <Box className="w-12 h-12 mx-auto text-gray-200 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">No Modules Found</h3>
              <p className="text-sm text-gray-400">Try adjusting your filters.</p>
              <Button variant="link" onClick={clearAllFilters} className="mt-3 text-[#2563EB] font-semibold text-sm">
                Clear all filters
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-[#EFF6FF] border-t border-blue-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Ready to Experience the Platform?
            </h2>
            <p className="text-gray-500 text-lg mb-10 max-w-xl mx-auto">
              Book a personalized demo and see exactly how each module fits your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                asChild size="lg"
                className="bg-[#2563EB] hover:bg-blue-700 text-white h-12 px-8 rounded font-semibold text-sm shadow-md"
              >
                <Link to="/contact">Book a Demo <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button
                asChild variant="outline" size="lg"
                className="border-blue-200 text-[#2563EB] hover:bg-blue-50 h-12 px-8 rounded font-semibold text-sm"
              >
                <Link to="/services">View Services</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Products;
