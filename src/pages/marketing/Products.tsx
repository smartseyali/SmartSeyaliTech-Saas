
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Search,
  ArrowUpRight,
  Code,
  ArrowRight,
  Globe,
  Settings,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const Products = () => {
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-white font-sans selection:bg-primary-600 selection:text-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden bg-slate-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight leading-tight">
              Explore Our <span className="text-primary-600">Product Lineup</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Powerful, modular software solutions designed to scale your business and automate your workflows.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-xl mx-auto"
          >
            <div className="relative flex items-center bg-white rounded-2xl border border-gray-200 shadow-xl p-2 pl-6 focus-within:border-primary-500 transition-all">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search modules and capabilities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 h-12 bg-transparent outline-none px-4 text-gray-900 placeholder:text-gray-400"
              />
              <Button className="bg-primary-600 hover:bg-primary-700 rounded-xl h-12 px-8 font-semibold">
                Search
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Modules Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 space-y-24">
          {loading ? (
            <div className="text-center py-40">
              <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
              <p className="text-gray-500 font-medium">Loading module inventory...</p>
            </div>
          ) : Object.keys(modulesByCategory).length > 0 ? (
            Object.entries(modulesByCategory).map(([category, items]: [string, any]) => (
              <div key={category} className="space-y-12 animate-fade-in">
                <div className="flex items-center justify-between border-b border-gray-100 pb-8">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary-100 p-3 rounded-xl">
                      <Settings className="w-6 h-6 text-primary-600" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 capitalize">
                      {category} <span className="text-primary-600 font-medium ml-1">Solutions</span>
                    </h2>
                  </div>
                  <span className="text-sm font-semibold text-gray-400 bg-gray-50 px-4 py-1.5 rounded-full border border-gray-100 uppercase tracking-wider">
                    {items.length} {items.length === 1 ? 'Module' : 'Modules'}
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
                          {/* Card image/placeholder */}
                          <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-indigo-50 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                            <div className="p-4 bg-white rounded-2xl shadow-lg border border-white/50 transform group-hover:scale-105 transition-transform duration-500">
                              <span className="text-4xl filter grayscale group-hover:grayscale-0 transition-all">
                                {mod.icon || "📦"}
                              </span>
                            </div>
                          </div>
                          <div className="absolute top-4 left-4">
                            <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-white/50 shadow-sm text-[9px] font-bold text-primary-600 uppercase tracking-wider">
                              {mod.status || "Operational"}
                            </div>
                          </div>
                        </div>

                        <div className="p-4 space-y-2">
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                            {mod.name}
                          </h3>
                          <p className="text-[9px] font-semibold text-primary-600/60 uppercase tracking-widest">
                            {mod.tagline || (category + " Engine")}
                          </p>
                        </div>
                      </Link>

                      <div className="p-4 pt-0 mt-auto">
                        <Button
                          onClick={() => navigate(`/login?module=${mod.slug}`)}
                          className="w-full h-9 rounded-lg bg-gray-50 text-gray-900 border border-gray-100 font-bold text-[10px] hover:bg-primary-600 hover:text-white transition-all group/btn"
                        >
                          Initialize <ArrowRight className="ml-1.5 w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-40 border-2 border-dashed border-gray-100 rounded-[3rem]">
              <Box className="w-16 h-16 mx-auto text-gray-200 mb-6" />
              <h3 className="text-2xl font-bold text-gray-900">No Modules Found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your search filters to find what you're looking for.</p>
              <Button variant="link" onClick={() => setSearchTerm("")} className="mt-4 text-primary-600 font-bold">
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-24 bg-slate-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="bg-primary-600 rounded-[3rem] p-16 md:p-24 text-white space-y-10 relative overflow-hidden shadow-2xl">
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
