
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Code,
  Smartphone,
  Monitor,
  Zap,
  Users,
  Award,
  CheckCircle,
  ShoppingCart,
  DollarSign,
  Settings,
  UserCheck,
  BarChart3,
  Sparkles,
  Shield,
  Globe,
  TrendingUp,
  Play,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import PLATFORM_CONFIG from "@/config/platform";
import { motion, useInView, useScroll, useTransform } from "framer-motion";

/* ── Animated Counter ────────────────────────────────────────────────────── */
const AnimatedCounter = ({ target, suffix = "", label }: { target: number; suffix?: string; label: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = target;
    const duration = 2000;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl lg:text-5xl font-bold text-white mb-2">
        {count}{suffix}
      </div>
      <div className="text-sm font-medium text-white/60 uppercase tracking-wider">{label}</div>
    </div>
  );
};

/* ── Floating Orb ────────────────────────────────────────────────────────── */
const FloatingOrb = ({ className, delay = 0 }: { className: string; delay?: number }) => (
  <motion.div
    className={className}
    animate={{
      y: [0, -20, 0],
      x: [0, 10, 0],
      scale: [1, 1.1, 1],
    }}
    transition={{
      duration: 6,
      repeat: Infinity,
      repeatType: "reverse",
      delay,
      ease: "easeInOut",
    }}
  />
);

/* ── Categories Section ─────────────────────────────────────────────────── */

const CATEGORY_CONFIG: Record<string, { icon: any; color: string; gradient: string; description: string }> = {
  commerce: { icon: ShoppingCart, color: "text-blue-600", gradient: "from-blue-500 to-blue-600", description: "E-commerce, POS & inventory" },
  finance: { icon: DollarSign, color: "text-emerald-600", gradient: "from-emerald-500 to-emerald-600", description: "Accounting & billing" },
  operations: { icon: Settings, color: "text-orange-600", gradient: "from-orange-500 to-orange-600", description: "Supply chain & logistics" },
  people: { icon: Users, color: "text-violet-600", gradient: "from-violet-500 to-violet-600", description: "HR & payroll management" },
  customer: { icon: UserCheck, color: "text-pink-600", gradient: "from-pink-500 to-pink-600", description: "CRM & support tools" },
  analytics: { icon: BarChart3, color: "text-cyan-600", gradient: "from-cyan-500 to-cyan-600", description: "Reports & data insights" },
};

const CategoriesSection = () => {
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const { data } = await supabase
          .from("system_modules")
          .select("category")
          .eq("is_active", true);
        if (data) {
          const counts: Record<string, number> = {};
          data.forEach((m) => {
            if (m.category) counts[m.category] = (counts[m.category] || 0) + 1;
          });
          setCategoryCounts(counts);
        }
      } catch {}
    };
    fetchCounts();
  }, []);

  return (
    <section className="py-28 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-primary-50/50 to-transparent rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 text-primary-600 text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4" /> Browse Categories
          </span>
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
            Solutions for Every <span className="text-primary-600">Business Need</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Explore our modules organized by function to find the perfect fit
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-5">
          {Object.entries(CATEGORY_CONFIG).map(([key, config], index) => {
            const Icon = config.icon;
            const count = categoryCounts[key] || 0;
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <Link
                  to={`/products?category=${key}`}
                  className="group flex flex-col items-center text-center bg-white rounded-2xl border border-gray-100 p-6 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-600/[0.06] hover:-translate-y-2 transition-all duration-500"
                >
                  <div className={`bg-gradient-to-br ${config.gradient} p-4 rounded-2xl mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 capitalize mb-1 group-hover:text-primary-600 transition-colors">
                    {key}
                  </h3>
                  <p className="text-[11px] text-gray-400 leading-tight mb-2 hidden md:block">
                    {config.description}
                  </p>
                  {count > 0 && (
                    <span className="text-[10px] font-bold text-primary-600 bg-primary-50 px-2.5 py-0.5 rounded-full">
                      {count} modules
                    </span>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-14"
        >
          <Button asChild variant="outline" size="lg" className="rounded-full h-12 px-8 font-semibold border-gray-200 hover:border-primary-300 hover:text-primary-600 transition-all">
            <Link to="/products">
              View All Products <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

/* ── Page ────────────────────────────────────────────────────────────────── */

const Index = () => {
  const [services, setServices] = useState<any[]>([]);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from("system_modules")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true })
          .limit(3);

        if (error) throw error;
        if (data && data.length > 0) {
          setServices(data.map(mod => ({
            icon: Code,
            title: mod.name,
            description: mod.tagline || mod.description
          })));
        } else {
          setServices(STATIC_SERVICES);
        }
      } catch (err) {
        setServices(STATIC_SERVICES);
      }
    };
    fetchServices();
  }, []);

  const STATIC_SERVICES = [
    { icon: Code, title: "Web Development", description: "Modern, responsive web applications built with cutting-edge technologies." },
    { icon: Smartphone, title: "Mobile Development", description: "Native and cross-platform mobile apps for iOS and Android." },
    { icon: Monitor, title: "Desktop Applications", description: "Powerful Windows desktop applications for enterprise solutions." },
  ];

  const features = [
    { icon: Zap, title: "Lightning Fast", description: "Optimized performance with instant load times" },
    { icon: Shield, title: "Enterprise Security", description: "Bank-grade encryption and security protocols" },
    { icon: Globe, title: "Global Scale", description: "Multi-tenant architecture for worldwide ops" },
    { icon: TrendingUp, title: "Smart Analytics", description: "AI-powered insights and reporting dashboards" },
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center bg-gradient-to-br from-gray-950 via-gray-900 to-primary-950 overflow-hidden">
        {/* Animated background elements */}
        <FloatingOrb className="absolute top-20 right-[20%] w-72 h-72 bg-primary-600/20 rounded-full blur-[100px]" />
        <FloatingOrb className="absolute bottom-20 left-[10%] w-96 h-96 bg-primary-500/10 rounded-full blur-[120px]" delay={2} />
        <FloatingOrb className="absolute top-1/2 right-[5%] w-48 h-48 bg-blue-500/10 rounded-full blur-[80px]" delay={4} />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 relative z-10 w-full"
        >
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-primary-300 text-sm font-medium mb-6">
                  <Sparkles className="w-4 h-4" /> Next-Gen Business Platform
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight"
              >
                Build Smarter
                <br />
                <span className="bg-gradient-to-r from-primary-400 to-cyan-300 bg-clip-text text-transparent">
                  Business Systems
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-lg sm:text-xl text-gray-400 max-w-lg leading-relaxed"
              >
                {PLATFORM_CONFIG.name} delivers enterprise-grade modular software that transforms how businesses operate, scale, and compete globally.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 pt-4"
              >
                <Button asChild size="lg" className="bg-primary-600 hover:bg-primary-500 h-14 px-8 rounded-full shadow-2xl shadow-primary-600/30 text-white font-semibold text-base group transition-all duration-300 hover:-translate-y-0.5">
                  <Link to="/contact">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-14 px-8 rounded-full border-white/20 text-white hover:bg-white/10 font-semibold text-base backdrop-blur-sm transition-all duration-300">
                  <Link to="/products" className="flex items-center gap-2">
                    <Play className="h-4 w-4" /> Explore Products
                  </Link>
                </Button>
              </motion.div>

              {/* Trust badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.2 }}
                className="flex items-center gap-6 pt-8"
              >
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-cyan-400 border-2 border-gray-900 flex items-center justify-center text-xs font-bold text-white">
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <span className="text-white font-semibold">Trusted by 50+ </span>
                  <span className="text-gray-500">businesses worldwide</span>
                </div>
              </motion.div>
            </div>

            {/* Hero visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="hidden lg:block relative"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary-600/20 to-cyan-600/20 rounded-3xl blur-2xl" />
                <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-6 shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop"
                    alt="Software development workspace"
                    className="rounded-2xl w-full"
                  />
                  {/* Floating stat card */}
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-2xl border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Growth</p>
                        <p className="text-lg font-bold text-gray-900">+127%</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Floating notification */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-2xl border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Modules</p>
                        <p className="text-lg font-bold text-gray-900">20+</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1.5"
          >
            <motion.div className="w-1.5 h-1.5 bg-white/60 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section className="relative -mt-16 z-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-3xl p-8 lg:p-10 grid grid-cols-2 lg:grid-cols-4 gap-8 shadow-2xl shadow-primary-600/30"
          >
            <AnimatedCounter target={50} suffix="+" label="Active Clients" />
            <AnimatedCounter target={20} suffix="+" label="Modules Built" />
            <AnimatedCounter target={99} suffix="%" label="Uptime SLA" />
            <AnimatedCounter target={24} suffix="/7" label="Support Hours" />
          </motion.div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 text-primary-600 text-sm font-semibold mb-6">
              <Code className="w-4 h-4" /> Our Services
            </span>
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
              What We <span className="text-primary-600">Deliver</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Comprehensive software solutions tailored to your unique business requirements
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                <Link
                  to="/services"
                  className="group block bg-white rounded-2xl border border-gray-100 p-8 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-600/[0.06] transition-all duration-500 h-full"
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl mb-6 shadow-lg shadow-primary-600/30 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
                    <service.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-6">
                    {service.description}
                  </p>
                  <span className="inline-flex items-center text-primary-600 text-sm font-semibold group-hover:gap-3 gap-1.5 transition-all">
                    Learn More <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <CategoriesSection />

      {/* Features Section */}
      <section className="py-28 bg-gray-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-100/30 rounded-full blur-[120px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 text-primary-600 text-sm font-semibold">
                  <Award className="w-4 h-4" /> Why Choose Us
                </span>
                <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  Built for <span className="text-primary-600">Modern</span> Enterprises
                </h2>
                <p className="text-lg text-gray-500 max-w-lg">
                  We combine technical expertise with deep business insight to deliver solutions that drive real results.
                </p>
              </motion.div>

              <div className="grid gap-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="group flex items-start gap-4 bg-white p-5 rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="w-11 h-11 bg-primary-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary-600 transition-colors duration-300">
                      <feature.icon className="h-5 w-5 text-primary-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-0.5">{feature.title}</h4>
                      <p className="text-sm text-gray-500">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Feature visual grid */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-5"
            >
              {[
                { icon: Zap, label: "Fast Delivery", color: "from-orange-500 to-red-500", delay: 0 },
                { icon: Award, label: "Quality Assured", color: "from-violet-500 to-purple-500", delay: 0.1 },
                { icon: Users, label: "Expert Team", color: "from-blue-500 to-cyan-500", delay: 0.2 },
                { icon: Code, label: "Modern Tech", color: "from-primary-500 to-cyan-500", delay: 0.3 },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: item.delay }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className={`bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-500 text-center ${i % 2 === 1 ? "mt-8" : ""}`}
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <item.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">{item.label}</h3>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-28 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-primary-900 rounded-[2.5rem] p-12 lg:p-20 text-center text-white relative overflow-hidden">
              {/* Animated background elements */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/20 rounded-full blur-[120px]" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-600/10 rounded-full blur-[100px]" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

              <div className="relative z-10 space-y-8">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-3xl lg:text-5xl font-bold leading-tight"
                >
                  Ready to Transform
                  <br />
                  <span className="bg-gradient-to-r from-primary-400 to-cyan-300 bg-clip-text text-transparent">
                    Your Business?
                  </span>
                </motion.h2>
                <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                  Let's discuss how our innovative solutions can help your business grow and succeed in today's competitive market.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Button asChild size="lg" className="bg-primary-600 hover:bg-primary-500 h-14 px-10 rounded-full font-semibold text-base shadow-2xl shadow-primary-600/30 text-white group transition-all duration-300 hover:-translate-y-0.5">
                    <Link to="/contact">
                      Start Your Project <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 h-14 px-10 rounded-full font-semibold text-base backdrop-blur-sm transition-all duration-300">
                    <Link to="/login">Sign In</Link>
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

export default Index;
