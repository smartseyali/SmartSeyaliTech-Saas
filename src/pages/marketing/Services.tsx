import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  ShoppingCart, BarChart3, ShoppingBag, Users, Target,
  Database, Monitor, Globe, TrendingUp, Package,
  MessageCircle, CheckCircle, ArrowRight, ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const MODULE_ICONS: Record<string, LucideIcon> = {
  ecommerce: ShoppingCart,
  pos: Monitor,
  crm: Target,
  sales: TrendingUp,
  inventory: Package,
  purchase: ShoppingBag,
  hrms: Users,
  finance: BarChart3,
  whatsapp: MessageCircle,
  website: Globe,
  masters: Database,
};

const ADDITIONAL = [
  { icon: Database, title: "Data Intelligence", description: "Comprehensive data warehousing and analytics to drive informed business decisions." },
  { icon: Globe, title: "Cloud Infrastructure", description: "Scalable cloud-native hosting with automatic failover and 99.9% uptime SLA." },
  { icon: ShoppingCart, title: "E-Commerce Suite", description: "End-to-end online store, payments, and fulfilment management in one platform." },
  { icon: MessageCircle, title: "WhatsApp Business", description: "Automate customer messaging, order notifications, and support via WhatsApp API." },
];

const PROCESS = [
  { step: "01", title: "Discovery", desc: "We analyze your business workflows, pain points, and goals to define the right scope." },
  { step: "02", title: "Design", desc: "Configuration and UI design aligned to your brand and team's daily operations." },
  { step: "03", title: "Deployment", desc: "Go live in under a week with full data migration, training, and handover." },
  { step: "04", title: "Support", desc: "Ongoing monitoring, updates, and a dedicated account manager for long-term success." },
];

const Services = () => {
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("system_modules")
          .select("id, slug, name, tagline, description, features, color_from, color_to")
          .eq("is_active", true)
          .order("sort_order", { ascending: true });
        if (error) throw error;
        setModules(data || []);
      } catch {
        setModules([]);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative bg-white pt-32 pb-16 lg:pt-40 lg:pb-20 border-b border-gray-100">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(37,99,235,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-gradient-to-bl from-blue-50 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-[#2563EB] mb-4 block">
              Our Capabilities
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-6">
              Comprehensive
              <br />
              <span className="text-[#2563EB]">Business Services</span>
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed max-w-2xl">
              Modular enterprise software and strategic technology services — built to scale your
              operations, automate workflows, and unlock data-driven decisions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Module Services Grid ────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-[#2563EB] mb-3 block">
              Platform Modules
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              What We Deliver
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Each module is fully functional standalone and integrates seamlessly with the rest of
              the platform.
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-24">
              <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {modules.map((mod, i) => {
                const Icon = MODULE_ICONS[mod.slug] || Package;
                const features: string[] = Array.isArray(mod.features)
                  ? mod.features.slice(0, 4)
                  : ["Module Integration", "Real-time Sync", "Role-based Access", "Custom Reports"];
                return (
                  <motion.div
                    key={mod.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="group bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-100 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300"
                  >
                    {/* Icon */}
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center mb-5 shadow-sm bg-gradient-to-br",
                      mod.color_from || "from-blue-500",
                      mod.color_to || "to-blue-600"
                    )}>
                      <Icon className="w-6 h-6 text-white" strokeWidth={1.75} />
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#2563EB] transition-colors">
                      {mod.name}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-5">
                      {mod.tagline || mod.description || "Enterprise-grade module for your business operations."}
                    </p>

                    <ul className="space-y-2 mb-6">
                      {features.map((f: string, fi: number) => (
                        <li key={fi} className="flex items-center gap-2 text-xs text-gray-600">
                          <CheckCircle className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <Link
                      to={`/products/${mod.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:text-blue-700 transition-colors group/link"
                    >
                      Learn more
                      <ArrowUpRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Additional Services ─────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-[#2563EB] mb-3 block">
              Additional Solutions
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Supporting Services
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {ADDITIONAL.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-100 hover:shadow-md transition-all text-center"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-[#2563EB] transition-colors duration-300">
                  <s.icon className="w-6 h-6 text-[#2563EB] group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-[#2563EB] transition-colors">
                  {s.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How We Work ────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-[#2563EB] mb-3 block">
              Our Process
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              How We Work
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            {PROCESS.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative bg-gray-50 border border-gray-100 rounded-xl p-6 hover:bg-white hover:border-blue-100 hover:shadow-md transition-all"
              >
                <div className="text-4xl font-bold text-blue-100 mb-4 select-none">{item.step}</div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                {i < 3 && (
                  <div className="hidden md:block absolute top-8 -right-3 w-6 h-px bg-gray-200" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-[#EFF6FF] border-t border-blue-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Ready to Modernize Your Operations?
            </h2>
            <p className="text-gray-500 text-lg mb-10 max-w-xl mx-auto">
              Book a free consultation and we'll map out the right modules for your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-[#2563EB] hover:bg-blue-700 text-white h-12 px-8 rounded font-semibold text-sm shadow-md"
              >
                <Link to="/contact">
                  Book a Free Demo <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-blue-200 text-[#2563EB] hover:bg-blue-50 h-12 px-8 rounded font-semibold text-sm"
              >
                <Link to="/products">View All Products</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Services;
