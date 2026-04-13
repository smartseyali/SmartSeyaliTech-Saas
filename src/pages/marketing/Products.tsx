
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Search,
  ArrowRight,
  Settings,
  X,
  SlidersHorizontal,
  ListFilter,
  Sparkles,
  Package,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";

const CATEGORIES = ["commerce", "finance", "operations", "people", "customer", "analytics"];
const STATUSES = ["All", "Operational", "Beta", "Coming Soon"];

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
      } catch (err) {
        console.error("Error fetching modules:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, []);

  const filteredModules = useMemo(() => {
    return modules.filter((m) => {
      const matchesCategory = selectedCategory === "All" || m.category === selectedCategory;
      const matchesStatus = selectedStatus === "All" || (m.status || "Operational") === selectedStatus;
      const matchesSearch =
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.tagline?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [modules, selectedCategory, selectedStatus, searchTerm]);

  const modulesByCategory = useMemo(() => {
    return CATEGORIES.reduce((acc: any, cat) => {
      const filtered = filteredModules.filter((m) => m.category === cat);
      if (filtered.length > 0) acc[cat] = filtered;
      return acc;
    }, {});
  }, [filteredModules]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category === "All") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", category);
    }
    setSearchParams(searchParams);
  };

  const hasActiveFilters = selectedCategory !== "All" || selectedStatus !== "All" || searchTerm !== "";
  const activeFilterCount = (selectedCategory !== "All" ? 1 : 0) + (selectedStatus !== "All" ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedCategory("All");
    setSelectedStatus("All");
    setSearchTerm("");
    searchParams.delete("category");
    setSearchParams(searchParams);
  };

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 lg:pt-40 pb-20 bg-gradient-to-br from-gray-950 via-gray-900 to-primary-950 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <motion.div className="absolute top-20 right-[15%] w-72 h-72 bg-primary-600/20 rounded-full blur-[100px]" animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl space-y-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-primary-300 text-sm font-medium">
              <Package className="w-4 h-4" /> Product Catalog
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1]">
              Explore Our
              <br />
              <span className="bg-gradient-to-r from-primary-400 to-cyan-300 bg-clip-text text-transparent">Product Lineup</span>
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed max-w-xl">
              Powerful, modular software solutions designed to scale your business and automate your workflows.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Sticky Filters Section */}
      <section className="py-4 bg-white/80 backdrop-blur-xl sticky top-0 z-40 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
              <div className="relative flex-grow group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                <Input
                  type="text"
                  placeholder="Search modules and capabilities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-primary-200 focus:ring-2 focus:ring-primary-600/10 shadow-none transition-all text-base"
                />
              </div>

              <div className="flex gap-3 items-center">
                <div className="hidden lg:flex items-center gap-3">
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-[180px] h-12 rounded-xl border-transparent bg-gray-50 focus:bg-white text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <ListFilter className="w-4 h-4 text-gray-400" />
                        <span>Status: <SelectValue placeholder="All" /></span>
                      </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {STATUSES.map((status) => (
                        <SelectItem key={status} value={status} className="rounded-lg py-2">
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Sheet open={showFilters} onOpenChange={setShowFilters}>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      className="lg:hidden h-12 rounded-xl px-4 border-transparent bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <SlidersHorizontal className="w-5 h-5 mr-2" />
                      Filters
                      {activeFilterCount > 0 && (
                        <span className="ml-2 px-2 py-0.5 min-w-[1.25rem] h-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center font-bold">
                          {activeFilterCount}
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="flex flex-col h-full w-[300px] sm:w-[400px]">
                    <SheetHeader className="text-left pb-6 border-b">
                      <SheetTitle className="text-2xl font-bold">Filters</SheetTitle>
                      <SheetDescription>Refine the module list to find exactly what you need.</SheetDescription>
                    </SheetHeader>

                    <div className="flex-grow overflow-y-auto py-6 space-y-8">
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700 block">Search</label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            type="text"
                            placeholder="Search modules..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-10 rounded-lg bg-gray-50 border-transparent"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="text-sm font-semibold text-gray-700">Status</div>
                        <div className="grid grid-cols-2 gap-2">
                          {STATUSES.map((status) => (
                            <button
                              key={status}
                              onClick={() => setSelectedStatus(status)}
                              className={cn(
                                "px-4 py-2.5 rounded-xl text-sm font-medium transition-all border",
                                selectedStatus === status
                                  ? "bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-600/25"
                                  : "bg-gray-50 border-transparent text-gray-700 hover:border-primary-200"
                              )}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="text-sm font-semibold text-gray-700">Categories</div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleCategoryChange("All")}
                            className={cn(
                              "px-4 py-2.5 rounded-xl text-sm font-medium transition-all border",
                              selectedCategory === "All"
                                ? "bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-600/25"
                                : "bg-gray-50 border-transparent text-gray-700 hover:border-primary-200"
                            )}
                          >
                            All Categories
                          </button>
                          {CATEGORIES.map((category) => (
                            <button
                              key={category}
                              onClick={() => handleCategoryChange(category)}
                              className={cn(
                                "px-4 py-2.5 rounded-xl text-sm font-medium transition-all border capitalize",
                                selectedCategory === category
                                  ? "bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-600/25"
                                  : "bg-gray-50 border-transparent text-gray-700 hover:border-primary-200"
                              )}
                            >
                              {category}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <SheetFooter className="pt-6 border-t mt-auto">
                      <div className="flex items-center justify-between w-full gap-4">
                        <button onClick={clearAllFilters} className="text-sm font-semibold text-gray-500 hover:text-primary-600 transition-colors px-4 py-2">
                          Clear All
                        </button>
                        <SheetClose asChild>
                          <Button className="flex-grow rounded-xl h-11 font-semibold bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-600/25">
                            Apply Filters
                          </Button>
                        </SheetClose>
                      </div>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {/* Desktop Categories */}
            <div className="hidden lg:flex items-center gap-4">
              <span className="text-sm font-semibold text-gray-400 whitespace-nowrap">Categories:</span>
              <div className="flex gap-2 pb-1 overflow-x-auto no-scrollbar scroll-smooth">
                <button
                  onClick={() => handleCategoryChange("All")}
                  className={cn(
                    "shrink-0 px-5 py-1.5 rounded-full text-sm font-semibold transition-all duration-300",
                    selectedCategory === "All"
                      ? "bg-primary-600 text-white shadow-lg shadow-primary-600/25"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  )}
                >
                  All
                </button>
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={cn(
                      "shrink-0 px-5 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 capitalize",
                      selectedCategory === category
                        ? "bg-primary-600 text-white shadow-lg shadow-primary-600/25"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="ml-auto text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1.5 transition-colors"
                >
                  <X className="w-4 h-4" /> Reset
                </button>
              )}
            </div>

            {/* Mobile Filter Tags */}
            {activeFilterCount > 0 && (
              <div className="flex items-center gap-3 lg:hidden">
                <div className="flex flex-wrap gap-2">
                  {selectedCategory !== "All" && (
                    <div className="px-3 py-1.5 rounded-lg bg-primary-50 text-primary-600 border border-primary-100 flex items-center gap-1.5 text-xs font-semibold capitalize">
                      {selectedCategory}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => handleCategoryChange("All")} />
                    </div>
                  )}
                  {selectedStatus !== "All" && (
                    <div className="px-3 py-1.5 rounded-lg bg-orange-50 text-orange-700 border border-orange-100 flex items-center gap-1.5 text-xs font-semibold">
                      {selectedStatus}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedStatus("All")} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Modules Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8">
            <p className="text-gray-500">
              Showing <span className="font-semibold text-gray-900">{filteredModules.length}</span> modules
            </p>
          </div>

          {loading ? (
            <div className="text-center py-40">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-6"
              />
              <p className="text-gray-500 font-medium">Loading module inventory...</p>
            </div>
          ) : Object.keys(modulesByCategory).length > 0 ? (
            <div className="space-y-20">
              {Object.entries(modulesByCategory).map(([category, items]: [string, any]) => (
                <div key={category} className="space-y-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-3 rounded-xl shadow-lg shadow-primary-600/25">
                        <Settings className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 capitalize">
                        {category} <span className="text-primary-600 font-medium">Solutions</span>
                      </h2>
                    </div>
                    <span className="text-sm font-semibold text-primary-600 bg-primary-50 px-4 py-1.5 rounded-full">
                      {items.length} {items.length === 1 ? "Module" : "Modules"}
                    </span>
                  </motion.div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {items.map((mod: any, i: number) => (
                      <motion.div
                        key={mod.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08 }}
                        className="group flex flex-col h-full bg-white rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-600/[0.06] hover:-translate-y-1 transition-all duration-500 overflow-hidden"
                      >
                        <Link to={`/products/${mod.slug}`} className="block flex-1">
                          <div className="aspect-[1.8/1] bg-gradient-to-br from-gray-50 to-primary-50/30 relative overflow-hidden">
                            {mod.screenshots?.[0] || mod.image_url ? (
                              <img
                                src={mod.screenshots?.[0] || mod.image_url}
                                alt={mod.name}
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <motion.div
                                  whileHover={{ scale: 1.1, rotate: 3 }}
                                  className="p-5 bg-white rounded-2xl shadow-lg border border-gray-100"
                                >
                                  <span className="text-4xl">{mod.icon || "📦"}</span>
                                </motion.div>
                              </div>
                            )}
                            <div className="absolute top-3 left-3">
                              <div className={cn(
                                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                                (mod.status || "Operational") === "Operational"
                                  ? "bg-green-100 text-green-700"
                                  : (mod.status || "Operational") === "Beta"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-gray-100 text-gray-600"
                              )}>
                                {mod.status || "Operational"}
                              </div>
                            </div>
                          </div>

                          <div className="p-5 space-y-2">
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                              {mod.name}
                            </h3>
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider line-clamp-1">
                              {mod.tagline || category + " Engine"}
                            </p>
                          </div>
                        </Link>

                        <div className="p-5 pt-0 mt-auto">
                          <Button
                            onClick={() => navigate(`/login?module=${mod.slug}`)}
                            className="w-full h-10 rounded-xl bg-gray-50 text-gray-700 border border-gray-100 font-semibold text-sm hover:bg-primary-600 hover:text-white hover:border-primary-600 hover:shadow-lg hover:shadow-primary-600/25 transition-all duration-300 group/btn"
                          >
                            Get Started <ArrowRight className="ml-1.5 w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-40 border-2 border-dashed border-gray-100 rounded-3xl"
            >
              <Box className="w-16 h-16 mx-auto text-gray-200 mb-6" />
              <h3 className="text-2xl font-bold text-gray-900">No Modules Found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your search filters to find what you're looking for.</p>
              <Button variant="link" onClick={clearAllFilters} className="mt-4 text-primary-600 font-semibold">
                Clear all filters
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-primary-900 rounded-[2.5rem] p-12 lg:p-20 text-center text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/20 rounded-full blur-[120px]" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-600/10 rounded-full blur-[100px]" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

              <div className="relative z-10 space-y-8">
                <h2 className="text-3xl lg:text-5xl font-bold leading-tight">
                  Ready to Experience
                  <br />
                  <span className="bg-gradient-to-r from-primary-400 to-cyan-300 bg-clip-text text-transparent">the Dashboard?</span>
                </h2>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                  Contact our team for a personalized demo or start your journey today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Button asChild size="lg" className="h-14 px-10 rounded-full bg-primary-600 hover:bg-primary-500 text-white font-semibold shadow-2xl shadow-primary-600/30 group transition-all duration-300 hover:-translate-y-0.5">
                    <Link to="/contact">
                      Book a Demo <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="h-14 px-10 rounded-full border-white/40 bg-white/5 text-white hover:bg-white/10 font-semibold backdrop-blur-sm transition-all">
                    <Link to="/services">View Services</Link>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Products;
