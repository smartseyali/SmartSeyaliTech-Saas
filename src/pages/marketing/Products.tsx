
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Search,
  ArrowRight,
  Code,
  Settings,
  X,
  SlidersHorizontal,
  ListFilter,
} from "lucide-react";
import { motion } from "framer-motion";
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
    <div className="min-h-screen bg-white font-sans selection:bg-primary-600 selection:text-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden bg-slate-50 border-b border-gray-100">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 bg-primary-600 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
                Explore Our <span className="text-primary-600">Product Lineup</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Powerful, modular software solutions designed to scale your business and automate your workflows.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Sticky Filters Section */}
      <section className="py-4 bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col gap-4">
            {/* Search & Main Actions */}
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
              {/* Search Input */}
              <div className="relative flex-grow group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                <Input
                  type="text"
                  placeholder="Search modules and capabilities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-primary-600/20 focus:ring-1 focus:ring-primary-600/20 shadow-none transition-all text-base"
                />
              </div>

              <div className="flex gap-3 items-center">
                {/* Desktop Status Select */}
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

                {/* Mobile & Tablet Filter Drawer */}
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
                      {/* Search in Drawer */}
                      <div className="space-y-3">
                        <label className="text-sm font-bold uppercase tracking-widest text-gray-400 block">Search</label>
                        <div className="relative group">
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

                      {/* Status in Drawer */}
                      <div className="space-y-3">
                        <div className="text-sm font-bold uppercase tracking-widest text-gray-400">Status</div>
                        <div className="grid grid-cols-2 gap-2">
                          {STATUSES.map((status) => (
                            <button
                              key={status}
                              onClick={() => setSelectedStatus(status)}
                              className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-all border",
                                selectedStatus === status
                                  ? "bg-primary-600 border-primary-600 text-white shadow-sm"
                                  : "bg-gray-50 border-transparent text-gray-700 hover:border-primary-600/30"
                              )}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Categories in Drawer */}
                      <div className="space-y-3">
                        <div className="text-sm font-bold uppercase tracking-widest text-gray-400">Categories</div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleCategoryChange("All")}
                            className={cn(
                              "px-4 py-2 rounded-lg text-sm font-medium transition-all border",
                              selectedCategory === "All"
                                ? "bg-primary-600 border-primary-600 text-white shadow-sm"
                                : "bg-gray-50 border-transparent text-gray-700 hover:border-primary-600/30"
                            )}
                          >
                            All Categories
                          </button>
                          {CATEGORIES.map((category) => (
                            <button
                              key={category}
                              onClick={() => handleCategoryChange(category)}
                              className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-all border capitalize",
                                selectedCategory === category
                                  ? "bg-primary-600 border-primary-600 text-white shadow-sm"
                                  : "bg-gray-50 border-transparent text-gray-700 hover:border-primary-600/30"
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
                        <button
                          onClick={clearAllFilters}
                          className="text-sm font-semibold text-gray-500 hover:text-primary-600 transition-colors px-4 py-2"
                        >
                          Clear All
                        </button>
                        <SheetClose asChild>
                          <Button className="flex-grow rounded-xl h-11 font-bold bg-primary-600 hover:bg-primary-700 text-white">
                            Apply Filters
                          </Button>
                        </SheetClose>
                      </div>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {/* Desktop Categories (Horizontal Scroll) */}
            <div className="hidden lg:flex items-center gap-4">
              <span className="text-sm font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap">
                Categories:
              </span>
              <div className="flex gap-2 pb-1 overflow-x-auto no-scrollbar scroll-smooth">
                <button
                  onClick={() => handleCategoryChange("All")}
                  className={cn(
                    "shrink-0 px-5 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 border",
                    selectedCategory === "All"
                      ? "bg-primary-600 border-primary-600 text-white shadow-md"
                      : "bg-gray-50 border-transparent text-gray-700 hover:border-primary-600/30"
                  )}
                >
                  All
                </button>
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={cn(
                      "shrink-0 px-5 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 border capitalize",
                      selectedCategory === category
                        ? "bg-primary-600 border-primary-600 text-white shadow-md"
                        : "bg-gray-50 border-transparent text-gray-700 hover:border-primary-600/30"
                    )}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="ml-auto text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1.5 transition-colors"
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
                    <div className="px-3 py-1.5 rounded-lg bg-primary-600/10 text-primary-600 border border-primary-600/20 flex items-center gap-1.5 text-xs font-semibold capitalize">
                      {selectedCategory}
                      <X className="w-3 h-3 cursor-pointer hover:text-gray-900 transition-colors" onClick={() => handleCategoryChange("All")} />
                    </div>
                  )}
                  {selectedStatus !== "All" && (
                    <div className="px-3 py-1.5 rounded-lg bg-orange-50 text-orange-700 border border-orange-200 flex items-center gap-1.5 text-xs font-semibold">
                      {selectedStatus}
                      <X className="w-3 h-3 cursor-pointer hover:text-gray-900 transition-colors" onClick={() => setSelectedStatus("All")} />
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
          {/* Results count */}
          <div className="mb-8">
            <p className="text-gray-500">
              Showing <span className="font-semibold text-gray-900">{filteredModules.length}</span> modules
            </p>
          </div>

          {loading ? (
            <div className="text-center py-40">
              <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
              <p className="text-gray-500 font-medium">Loading module inventory...</p>
            </div>
          ) : Object.keys(modulesByCategory).length > 0 ? (
            <div className="space-y-20">
              {Object.entries(modulesByCategory).map(([category, items]: [string, any]) => (
                <div key={category} className="space-y-10 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary-100 p-3 rounded-xl">
                        <Settings className="w-6 h-6 text-primary-600" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 capitalize">
                        {category} <span className="text-primary-600 font-medium ml-1">Solutions</span>
                      </h2>
                    </div>
                    <span className="text-sm font-semibold text-gray-400 bg-gray-50 px-4 py-1.5 rounded-full border border-gray-100 uppercase tracking-wider">
                      {items.length} {items.length === 1 ? "Module" : "Modules"}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {items.map((mod: any, i: number) => (
                      <motion.div
                        key={mod.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="group flex flex-col h-full bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 overflow-hidden"
                      >
                        <Link to={`/products/${mod.slug}`} className="block flex-1">
                          <div className="aspect-[1.8/1] bg-slate-50 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-indigo-50 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                              <div className="p-4 bg-white rounded-2xl shadow-lg border border-white/50 transform group-hover:scale-105 transition-transform duration-500">
                                <span className="text-4xl filter grayscale group-hover:grayscale-0 transition-all">
                                  {mod.icon || "📦"}
                                </span>
                              </div>
                            </div>
                            <div className="absolute top-4 left-4">
                              <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-white/50 shadow-sm text-[13px] font-bold text-primary-600 uppercase tracking-wider">
                                {mod.status || "Operational"}
                              </div>
                            </div>
                          </div>

                          <div className="p-4 space-y-2">
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                              {mod.name}
                            </h3>
                            <p className="text-[13px] font-semibold text-primary-600/60 uppercase tracking-widest">
                              {mod.tagline || category + " Engine"}
                            </p>
                          </div>
                        </Link>

                        <div className="p-4 pt-0 mt-auto">
                          <Button
                            onClick={() => navigate(`/login?module=${mod.slug}`)}
                            className="w-full h-9 rounded-lg bg-gray-50 text-gray-900 border border-gray-100 font-bold text-xs hover:bg-primary-600 hover:text-white transition-all group/btn"
                          >
                            Initialize <ArrowRight className="ml-1.5 w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-40 border-2 border-dashed border-gray-100 rounded-3xl">
              <Box className="w-16 h-16 mx-auto text-gray-200 mb-6" />
              <h3 className="text-2xl font-bold text-gray-900">No Modules Found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your search filters to find what you're looking for.</p>
              <Button variant="link" onClick={clearAllFilters} className="mt-4 text-primary-600 font-bold">
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-24 bg-slate-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="bg-primary-600 rounded-3xl p-16 md:p-24 text-white space-y-10 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

            <div className="relative z-10 space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                Ready to Experience <br /> the Dashboard?
              </h2>
              <p className="text-primary-100 text-lg max-w-2xl mx-auto opacity-90">
                Contact our team to get a personalized demo of any module or start your journey today by creating an instance.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                <Button asChild size="lg" className="h-16 px-12 rounded-xl bg-white text-primary-600 hover:bg-gray-100 font-bold text-lg shadow-xl">
                  <Link to="/contact">Book a Demo</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-16 px-12 rounded-xl border-white/20 text-white hover:bg-white/10 font-bold text-lg backdrop-blur-sm">
                  <Link to="/services">Platform FAQ</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Products;
