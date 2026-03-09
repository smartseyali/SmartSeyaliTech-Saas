import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Code,
  Smartphone,
  Database,
  Cloud,
  Shield,
  Zap,
  Users,
  CheckCircle,
  Box,
  Cpu,
  ArrowUpRight,
  Info
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
            features: Array.isArray(mod.features) ? mod.features.slice(0, 5) : [],
            technologies: mod.technologies || ["SaaS", "Enterprise", "Cloud"],
            image: mod.screenshots?.[0] || mod.image_url || "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80",
            id: mod.id,
            color: mod.color || "#3B82F6"
          }));
          setMainServices(mapped);
        } else {
          setMainServices(STATIC_SERVICES);
        }
      } catch (err) {
        console.error("Error fetching services:", err);
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
      slug: "architectural-development",
      icon: Code,
      title: "Architectural Development",
      description: "High-performance software engines built with modern frameworks and multi-tenant logic.",
      features: [
        "Scalable Microservices",
        "Advanced Multi-tenancy",
        "Real-time Data Processing",
        "Custom API Ecosystems"
      ],
      technologies: ["React", "Node.js", "Supabase"],
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80"
    }
  ];

  const additionalServices = [
    {
      icon: Database,
      title: "Data Intelligence",
      description: "Big data warehousing and predictive analytics for enterprise growth."
    },
    {
      icon: Cloud,
      title: "Cloud Hub",
      description: "Seamless orchestration and management of multi-cloud environments."
    },
    {
      icon: Shield,
      title: "Fortified Security",
      description: "Zero-trust architecture and enterprise-grade encryption protocols."
    },
    {
      icon: Users,
      title: "Strategic Advisory",
      description: "Deep technology consulting for digital transformation and scaling."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-black uppercase tracking-widest text-[10px]"
          >
            <Zap className="w-3 h-3" /> Capability Matrix
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl lg:text-8xl font-black text-white tracking-tighter uppercase italic leading-none"
          >
            Precision <span className="text-blue-500">Services</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl text-slate-400 max-w-3xl mx-auto font-medium leading-relaxed italic"
          >
            Engineering digital solutions that redefine industry standards through architectural excellence and innovative technology.
          </motion.p>
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-32">
            {loading ? (
              <div className="flex justify-center p-20">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : mainServices.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={cn(
                  "flex flex-col lg:flex-row items-center gap-20",
                  index % 2 === 1 && "lg:flex-row-reverse"
                )}
              >
                <div className="flex-1 space-y-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <service.icon className="w-8 h-8" />
                      </div>
                      <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter uppercase italic">{service.title}</h2>
                    </div>
                    <p className="text-xl text-slate-500 font-medium italic leading-relaxed">{service.description}</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {(service.features || []).map((feature: string, featureIndex: number) => (
                      <div key={featureIndex} className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-blue-200 transition-colors">
                        <CheckCircle className="h-5 w-5 text-blue-500" />
                        <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-8 flex flex-wrap gap-4">
                    <Button asChild size="lg" className="h-16 px-10 rounded-2xl bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest text-xs group">
                      <Link to={service.id ? `/login?module=${service.id}` : "/contact"} className="flex items-center gap-3">
                        Deploy Framework <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </Link>
                    </Button>
                    {service.slug && (
                      <Button asChild variant="outline" size="lg" className="h-16 px-10 rounded-2xl border-2 border-slate-200 font-black uppercase tracking-widest text-xs group">
                        <Link to={`/products/${service.slug}`} className="flex items-center gap-3">
                          View Blueprint <Info className="w-5 h-5" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex-1 w-full">
                  <Link to={`/products/${service.slug}`} className="relative group block">
                    <div className="absolute -inset-4 bg-blue-500/5 rounded-[3rem] blur-2xl group-hover:bg-blue-500/10 transition-colors duration-500" />
                    <img
                      src={service.image}
                      alt={service.title}
                      className="relative rounded-[2.5rem] shadow-2xl w-full object-cover aspect-[4/3] group-hover:scale-[1.02] transition-transform duration-700"
                    />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Services Grid */}
      <section className="py-32 bg-slate-50/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center mb-20 space-y-4">
          <h2 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tighter uppercase italic">Extension <span className="text-blue-600">Modules</span></h2>
          <p className="text-slate-500 max-w-2xl mx-auto font-medium italic">Universal auxiliary services designed to fortify your core infrastructure.</p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {additionalServices.map((service, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -10 }}
              className="bg-white p-10 rounded-[2.5rem] border border-slate-200/60 shadow-xl shadow-slate-200/20 text-center space-y-6 group transition-all"
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mx-auto group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                <service.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">{service.title}</h3>
              <p className="text-sm font-medium text-slate-500 italic leading-relaxed">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="bg-blue-600 rounded-[4rem] p-16 lg:p-32 text-center text-white space-y-12 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[150px] -z-0" />
            <h2 className="text-5xl lg:text-7xl font-black uppercase italic tracking-tighter leading-none relative z-10">
              Ready to <span className="text-blue-200">Engineer</span>?
            </h2>
            <p className="text-xl lg:text-2xl text-blue-100 max-w-3xl mx-auto font-medium italic relative z-10 leading-relaxed">
              Connect with our lead architects to discuss your technical requirements and initiate the blueprint for your next SaaS engine.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center relative z-10 pt-8">
              <Button asChild size="lg" className="h-20 px-16 rounded-3xl bg-white text-blue-600 hover:bg-black hover:text-white font-black uppercase tracking-widest text-sm shadow-[0_20px_40px_-15px_rgba(255,255,255,0.3)] transition-all">
                <Link to="/contact">Contact Architects</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-20 px-16 rounded-3xl border-2 border-white/30 text-white hover:bg-white hover:text-blue-600 font-black uppercase tracking-widest text-sm transition-all">
                <Link to="/products">Explore Inventory</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Services;
