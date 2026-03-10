
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
  Cpu,
  ArrowUpRight,
  Info,
  Settings,
  Layers
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
      features: [
        "Scalable Frameworks",
        "Responsive Interfaces",
        "Secure Databank",
        "Cloud Integration"
      ],
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80"
    }
  ];

  const additionalServices = [
    {
      icon: Database,
      title: "Data Intelligence",
      description: "Comprehensive data warehousing and analytics to drive informed business decisions."
    },
    {
      icon: Cloud,
      title: "Cloud Solutions",
      description: "Scalable cloud infrastructure management to ensure maximum uptime and performance."
    },
    {
      icon: Shield,
      title: "Cyber Security",
      description: "Advanced protection protocols to keep your business data secure and compliant."
    },
    {
      icon: Users,
      title: "Tech Consulting",
      description: "Strategic guidance to navigate complex technology landscapes and digital transformation."
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-primary-600 selection:text-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden bg-slate-50 border-b border-gray-100 text-center">
        <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-center gap-3">
              <Settings className="w-5 h-5 text-primary-600 animate-spin-slow" />
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Our Capabilities</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-bold text-gray-900 tracking-tight leading-tight">
              Comprehensive <span className="text-primary-600">Services</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              We specialize in delivering robust software engineering and strategic technology solutions
              that empower modern enterprises to scale effortlessly.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Services */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 space-y-32">
          {loading ? (
            <div className="text-center py-40">
              <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
              <p className="text-gray-500 font-medium">Scanning service catalog...</p>
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
              <div className="flex-1 space-y-10">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary-50 p-4 rounded-2xl text-primary-600 shadow-sm">
                      <service.icon className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight">{service.title}</h2>
                  </div>
                  <p className="text-xl text-gray-500 font-medium italic leading-relaxed">"{service.description}"</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  {(service.features || []).map((feature: string, featureIndex: number) => (
                    <div key={featureIndex} className="flex items-center gap-4 p-5 rounded-2xl bg-slate-50 border border-gray-50 hover:border-primary-100 transition-colors">
                      <CheckCircle className="h-5 w-5 text-primary-600" />
                      <span className="text-sm font-bold text-gray-700 uppercase tracking-tight">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-8 flex flex-wrap gap-6">
                  <Button asChild className="h-16 px-10 rounded-xl bg-gray-900 hover:bg-primary-600 text-white font-bold transition-all shadow-xl">
                    <Link to={service.id ? `/login?module=${service.id}` : "/contact"} className="flex items-center gap-4">
                      Initialize <ArrowUpRight className="w-5 h-5" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-16 px-10 rounded-xl border-gray-200 hover:bg-gray-50 text-gray-700 font-bold transition-all">
                    <Link to="/login" className="flex items-center gap-4">
                      Login Access <Info className="w-5 h-5" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="flex-1 w-full group">
                <div className="relative">
                  <div className="absolute -inset-4 bg-primary-600/5 blur-2xl rounded-3xl" />
                  <img
                    src={service.image}
                    alt={service.title}
                    className="relative rounded-[2.5rem] shadow-2xl w-full object-cover aspect-video border border-gray-100"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Auxiliary Services */}
      <section className="py-32 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-6 mb-24">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight">Auxiliary <span className="text-primary-600">Solutions</span></h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto italic font-medium">Supporting services designed to enhance your core operational ecosystem.</p>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {additionalServices.map((service, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center space-y-4 group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 mx-auto flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-all shadow-sm">
                <service.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 tracking-tight transition-colors group-hover:text-primary-600">{service.title}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-32 bg-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="bg-primary-600 rounded-[3rem] p-16 md:p-24 text-white space-y-10 relative overflow-hidden shadow-2xl">
            <h2 className="text-4xl md:text-6xl font-bold leading-tight">Ready to Innovate?</h2>
            <p className="text-xl text-primary-50 max-w-2xl mx-auto opacity-90 italic">Let's discuss your requirements and build a roadmap for your next business milestone.</p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
              <Button asChild size="lg" className="h-16 px-12 rounded-xl bg-white text-primary-600 hover:bg-gray-100 font-bold text-lg shadow-xl">
                <Link to="/contact">Initialize Project</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-16 px-12 rounded-xl border-white/20 text-white hover:bg-white/10 font-bold text-lg backdrop-blur-sm">
                <Link to="/login">Login Access</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
