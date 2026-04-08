
import { Target, Eye, Users, Lightbulb, Award, Rocket, ShieldCheck, Globe, Cpu, Activity, ArrowRight, Sparkles, Heart, Zap } from "lucide-react";
import PLATFORM_CONFIG from "@/config/platform";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRef, useState, useEffect } from "react";

const AnimatedCounter = ({ target, suffix = "" }: { target: number; suffix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return <span ref={ref}>{count}{suffix}</span>;
};

const About = () => {
  const values = [
    { icon: Lightbulb, title: "Innovation First", description: "We constantly research and implement new technologies to keep our clients ahead.", color: "from-amber-500 to-orange-500" },
    { icon: Heart, title: "Client Partnership", description: "We work as an extension of our clients' core teams for long-term success.", color: "from-pink-500 to-rose-500" },
    { icon: Award, title: "Quality Excellence", description: "Our rigorous standards ensure every product we ship is reliable and performant.", color: "from-violet-500 to-purple-500" },
    { icon: Rocket, title: "Sustainable Growth", description: "We build scalable foundations that support growth now and in the future.", color: "from-blue-500 to-cyan-500" },
  ];

  const timeline = [
    { year: "Foundation", title: "The Vision Begins", description: "Started with a mission to simplify enterprise technology for businesses of all sizes." },
    { year: "Growth", title: "Platform Evolution", description: "Built the modular DocType architecture enabling rapid business app deployment." },
    { year: "Scale", title: "Multi-Tenant SaaS", description: "Launched full multi-tenant infrastructure with enterprise-grade security." },
    { year: "Today", title: "Global Operations", description: "Serving businesses worldwide with 20+ integrated modules and growing." },
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 lg:pt-40 pb-24 bg-gradient-to-br from-gray-950 via-gray-900 to-primary-950 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <motion.div className="absolute top-20 right-[20%] w-72 h-72 bg-primary-600/20 rounded-full blur-[100px]" animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} />

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="space-y-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-primary-300 text-sm font-medium">
              <Activity className="w-4 h-4" /> Our Story
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1]">
              Crafting Future-Ready
              <br />
              <span className="bg-gradient-to-r from-primary-400 to-cyan-300 bg-clip-text text-transparent">Technologies</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              {PLATFORM_CONFIG.name} Tech is a team of passionate engineers dedicated to building robust digital ecosystems for enterprises worldwide.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-8">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 text-primary-600 text-sm font-semibold">
                  <Sparkles className="w-4 h-4" /> Our Journey
                </span>
                <h2 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
                  Bridging <span className="text-primary-600">Innovation</span> & Business
                </h2>
                <p className="text-lg text-gray-500 leading-relaxed">
                  {PLATFORM_CONFIG.name} Tech was founded to bridge the gap between complex software challenges and innovative, user-friendly solutions.
                </p>
              </div>

              <div className="space-y-4 text-gray-500 leading-relaxed border-l-4 border-primary-200 pl-6">
                <p>We started with a simple belief: technology should empower businesses, not complicate them. Our architecture eliminates operational friction and fosters seamless growth.</p>
                <p>Today, we serve a growing network of enterprise partners, delivering mission-critical solutions that define excellence in modern software engineering.</p>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-6 pt-4">
                {[
                  { value: 50, suffix: "+", label: "Clients" },
                  { value: 20, suffix: "+", label: "Modules" },
                  { value: 100, suffix: "%", label: "Custom" },
                ].map((stat, i) => (
                  <div key={i} className="text-center p-4 bg-gray-50 rounded-2xl">
                    <div className="text-2xl font-bold text-gray-900"><AnimatedCounter target={stat.value} suffix={stat.suffix} /></div>
                    <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative">
              <div className="absolute -inset-8 bg-gradient-to-r from-primary-100/50 to-cyan-100/50 blur-3xl rounded-full" />
              <img
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop"
                alt="Team collaboration"
                className="rounded-3xl shadow-2xl relative z-10 w-full border border-gray-100"
              />
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-6 -left-6 bg-white p-5 rounded-2xl shadow-2xl z-20 border border-gray-100 flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400">Status</p>
                  <p className="text-lg font-bold text-gray-900">Enterprise Verified</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-28 bg-gray-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[600px] h-[400px] bg-primary-100/30 rounded-full blur-[120px]" />

        <div className="max-w-7xl mx-auto px-6 relative">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 text-primary-600 text-sm font-semibold mb-6">
              <Zap className="w-4 h-4" /> Our Milestones
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900">
              The Path We've <span className="text-primary-600">Traveled</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            {timeline.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative group"
              >
                <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-600/[0.05] transition-all duration-500 h-full">
                  <div className="text-sm font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full inline-block mb-4">
                    {item.year}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                </div>
                {index < timeline.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-primary-200" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 text-primary-600 text-sm font-semibold mb-6">
              <Heart className="w-4 h-4" /> Our Values
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900">
              Principles That <span className="text-primary-600">Drive</span> Us
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto mt-4">
              The engineering culture and client success principles behind everything we build.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-600/[0.06] transition-all duration-500 h-full flex flex-col group"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${value.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500`}>
                  <value.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                  {value.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed flex-grow">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Expertise Section */}
      <section className="py-28 bg-gray-50 relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary-100/30 rounded-full blur-[120px]" />

        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-8">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 text-primary-600 text-sm font-semibold">
                  <Target className="w-4 h-4" /> Expertise
                </span>
                <h2 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
                  Strategic <span className="text-primary-600">Technical</span> Partnership
                </h2>
                <p className="text-lg text-gray-500 leading-relaxed">
                  We don't just write code — we design robust digital strategies that help businesses achieve sustainable scalability.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100">
                  <h4 className="text-3xl font-bold text-gray-900 mb-1"><AnimatedCounter target={100} suffix="%" /></h4>
                  <p className="text-sm font-medium text-gray-400">Custom Solutions</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100">
                  <h4 className="text-3xl font-bold text-gray-900 mb-1">24/7</h4>
                  <p className="text-sm font-medium text-gray-400">Technical Support</p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="grid grid-cols-2 gap-5">
              {[
                { icon: Activity, label: "Realtime Systems", color: "from-blue-500 to-cyan-500" },
                { icon: ShieldCheck, label: "Secure Protocol", color: "from-green-500 to-emerald-500" },
                { icon: Globe, label: "Global Nodes", color: "from-primary-500 to-cyan-500" },
                { icon: Cpu, label: "Modular Logic", color: "from-orange-500 to-red-500" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="bg-white border border-gray-100 p-8 rounded-2xl text-center space-y-4 hover:shadow-xl transition-all duration-500"
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-2xl mx-auto flex items-center justify-center shadow-lg`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-bold text-gray-700">{item.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-28 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-primary-900 rounded-[2.5rem] p-12 lg:p-20 text-center text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/20 rounded-full blur-[120px]" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-600/10 rounded-full blur-[100px]" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

              <div className="relative z-10 space-y-8">
                <h2 className="text-3xl lg:text-5xl font-bold leading-tight">
                  Ready to Work
                  <br />
                  <span className="bg-gradient-to-r from-primary-400 to-cyan-300 bg-clip-text text-transparent">With Us?</span>
                </h2>
                <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                  Let's collaborate to build the digital infrastructure your business deserves.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Button asChild size="lg" className="h-14 px-10 rounded-full bg-primary-600 hover:bg-primary-500 text-white font-semibold shadow-2xl shadow-primary-600/30 group transition-all duration-300 hover:-translate-y-0.5">
                    <Link to="/contact">
                      Start a Project <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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

export default About;
