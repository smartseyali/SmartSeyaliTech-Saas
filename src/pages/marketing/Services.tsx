
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Code,
  Database,
  Cloud,
  Shield,
  Users,
  CheckCircle,
  Cpu,
  ArrowUpRight,
  ArrowRight,
  Settings,
  Layers,
  Sparkles,
  Zap,
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const Services = () => {
  const [mainServices, setMainServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("system_modules")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          const mapped = data.map(mod => ({
            icon: Cpu,
            title: mod.name,
            slug: mod.slug,
            description: mod.description || mod.tagline,
            features: Array.isArray(mod.features) ? mod.features.slice(0, 5) : ["Scalable Core", "Custom API", "Security Layer"],
            image: mod.screenshots?.[0] || mod.image_url || "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80",
            id: mod.id
          }));
          setMainServices(mapped);
        } else {
          setMainServices(STATIC_SERVICES);
        }
      } catch (err) {
        setMainServices(STATIC_SERVICES);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const STATIC_SERVICES = [
    {
      id: "dev",
      slug: "web-development",
      icon: Code,
      title: "Web Development",
      description: "High-performance software solutions built with modern frameworks and robust logic.",
      features: ["Scalable Frameworks", "Responsive Interfaces", "Secure Databank", "Cloud Integration"],
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80"
    }
  ];

  const additionalServices = [
    { icon: Database, title: "Data Intelligence", description: "Comprehensive data warehousing and analytics to drive informed decisions.", color: "from-violet-500 to-purple-500" },
    { icon: Cloud, title: "Cloud Solutions", description: "Scalable cloud infrastructure for maximum uptime and performance.", color: "from-blue-500 to-cyan-500" },
    { icon: Shield, title: "Cyber Security", description: "Advanced protection protocols to keep your data secure and compliant.", color: "from-green-500 to-emerald-500" },
    { icon: Users, title: "Tech Consulting", description: "Strategic guidance to navigate complex digital transformation.", color: "from-orange-500 to-red-500" },
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 lg:pt-40 pb-24 bg-gradient-to-br from-gray-950 via-gray-900 to-primary-950 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <motion.div className="absolute top-20 left-[15%] w-72 h-72 bg-primary-600/20 rounded-full blur-[100px]" animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute bottom-10 right-[10%] w-56 h-56 bg-cyan-500/10 rounded-full blur-[80px]" animate={{ y: [0, 15, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }} />

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="space-y-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-primary-300 text-sm font-medium">
              <Settings className="w-4 h-4" /> Our Capabilities
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1]">
              Comprehensive
              <br />
              <span className="bg-gradient-to-r from-primary-400 to-cyan-300 bg-clip-text text-transparent">Services</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Robust software engineering and strategic technology solutions that empower modern enterprises to scale effortlessly.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Services */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6 space-y-32">
          {loading ? (
            <div className="text-center py-40">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-6"
              />
              <p className="text-gray-500 font-medium">Loading services...</p>
            </div>
          ) : mainServices.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className={cn(
                "flex flex-col lg:flex-row items-center gap-16",
                index % 2 === 1 && "lg:flex-row-reverse"
              )}
            >
              <div className="flex-1 space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-4 rounded-2xl text-white shadow-lg shadow-primary-600/30">
                      <service.icon className="w-7 h-7" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{service.title}</h2>
                  </div>
                  <p className="text-lg text-gray-500 leading-relaxed">{service.description}</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  {(service.features || []).map((feature: string, featureIndex: number) => (
                    <motion.div
                      key={featureIndex}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: featureIndex * 0.1 }}
                      className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-primary-200 hover:bg-primary-50/50 transition-all duration-300"
                    >
                      <CheckCircle className="h-5 w-5 text-primary-600 shrink-0" />
                      <span className="text-sm font-semibold text-gray-700">{feature}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4 pt-4">
                  <Button asChild className="h-12 px-8 rounded-full bg-primary-600 hover:bg-primary-500 text-white font-semibold shadow-lg shadow-primary-600/25 group transition-all duration-300 hover:-translate-y-0.5">
                    <Link to={service.id ? `/login?module=${service.id}` : "/contact"} className="flex items-center gap-2">
                      Get Started <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-12 px-8 rounded-full border-gray-200 hover:border-primary-300 text-gray-700 font-semibold transition-all">
                    <Link to="/login">Sign In</Link>
                  </Button>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="flex-1 w-full"
              >
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary-100/50 to-cyan-100/50 blur-2xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <img
                    src={service.image}
                    alt={service.title}
                    className="relative rounded-3xl shadow-2xl w-full object-cover aspect-video border border-gray-100 group-hover:shadow-primary-600/[0.08] transition-shadow duration-700"
                  />
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Auxiliary Services */}
      <section className="py-28 bg-gray-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-primary-100/30 rounded-full blur-[120px]" />

        <div className="max-w-7xl mx-auto px-6 relative">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 text-primary-600 text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" /> More Solutions
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900">
              Auxiliary <span className="text-primary-600">Solutions</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto mt-4">
              Supporting services designed to enhance your core operational ecosystem.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalServices.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-white p-8 rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-600/[0.06] transition-all duration-500 text-center group"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${service.color} rounded-2xl mx-auto flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500`}>
                  <service.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">{service.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 text-primary-600 text-sm font-semibold mb-6">
              <Zap className="w-4 h-4" /> How We Work
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900">
              Our <span className="text-primary-600">Process</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Discovery", desc: "We analyze your business needs and define the project scope." },
              { step: "02", title: "Design", desc: "Create user-centric interfaces and scalable architecture." },
              { step: "03", title: "Develop", desc: "Build with modern tech stack and rigorous testing." },
              { step: "04", title: "Deploy", desc: "Launch, monitor, and continuously improve your solution." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative group"
              >
                <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:bg-white hover:border-primary-200 hover:shadow-xl transition-all duration-500 h-full">
                  <span className="text-5xl font-bold text-primary-100 group-hover:text-primary-200 transition-colors">{item.step}</span>
                  <h3 className="text-xl font-bold text-gray-900 mt-4 mb-2 group-hover:text-primary-600 transition-colors">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
                {i < 3 && <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-primary-200" />}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-28 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-primary-900 rounded-[2.5rem] p-12 lg:p-20 text-center text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/20 rounded-full blur-[120px]" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-600/10 rounded-full blur-[100px]" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

              <div className="relative z-10 space-y-8">
                <h2 className="text-3xl lg:text-5xl font-bold leading-tight">
                  Ready to
                  <br />
                  <span className="bg-gradient-to-r from-primary-400 to-cyan-300 bg-clip-text text-transparent">Innovate?</span>
                </h2>
                <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                  Let's discuss your requirements and build a roadmap for your next business milestone.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Button asChild size="lg" className="h-14 px-10 rounded-full bg-primary-600 hover:bg-primary-500 text-white font-semibold shadow-2xl shadow-primary-600/30 group transition-all duration-300 hover:-translate-y-0.5">
                    <Link to="/contact">
                      Start Your Project <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="h-14 px-10 rounded-full border-white/40 bg-white/5 text-white hover:bg-white/10 font-semibold backdrop-blur-sm transition-all">
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

export default Services;
