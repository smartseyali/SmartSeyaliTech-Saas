
import { Card, CardContent } from "@/components/ui/card";
import { Target, Eye, Users, Lightbulb, Award, Rocket, ShieldCheck, Globe, Cpu, Activity, ArrowRight } from "lucide-react";
import PLATFORM_CONFIG from "@/config/platform";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const About = () => {
  const values = [
    {
      icon: Lightbulb,
      title: "Innovation First",
      description: "We constantly research and implement new technologies to keep our clients ahead of the curve."
    },
    {
      icon: Users,
      title: "Client Partnership",
      description: "We believe in long-term collaboration, working as an extension of our clients' core teams."
    },
    {
      icon: Award,
      title: "Quality Excellence",
      description: "Our rigorous engineering standards ensure that every product we ship is reliable and performant."
    },
    {
      icon: Rocket,
      title: "Sustainable Growth",
      description: "We build scalable foundations that support your business growth now and in the future."
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-primary-600 selection:text-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden bg-slate-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-center gap-3">
              <Activity className="w-5 h-5 text-primary-600" />
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ">Our Identity</span>
            </div>

            <h1 className="text-4xl md:text-7xl font-bold text-gray-900 tracking-tight leading-tight">
              Crafting Future-Ready <br /> <span className="text-primary-600">Technologies</span>
            </h1>

            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed  font-medium">
              {PLATFORM_CONFIG.name} Tech is a team of passionate software engineers dedicated to building robust digital ecosystems for enterprises worldwide.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-10">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">Our <span className="text-primary-600">Journey</span></h2>
                <p className="text-xl text-gray-500 leading-relaxed font-medium ">
                  {PLATFORM_CONFIG.name} Tech was founded to bridge the gap between complex software challenges and innovative, user-friendly solutions.
                </p>
              </div>

              <div className="space-y-6 text-lg text-gray-500 leading-relaxed border-l-4 border-primary-100 pl-8">
                <p>
                  We started with a simple belief: that technology should empower businesses, not complicate them. Our architecture is designed to eliminate operational friction and foster seamless growth.
                </p>
                <p>
                  Today, we serve a global network of enterprise partners, delivering mission-critical solutions that define excellence in modern software engineering.
                </p>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="absolute -inset-4 bg-primary-600/5 blur-2xl rounded-full" />
              <img
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop"
                alt="Team collaboration"
                className="rounded-[3rem] shadow-2xl relative z-10 w-full border border-gray-100"
              />
              <div className="absolute -bottom-8 -left-8 bg-white p-8 rounded-3xl shadow-xl z-20 border border-gray-50 flex items-center gap-6">
                <ShieldCheck className="w-10 h-10 text-primary-600" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-300  mb-1">Status</p>
                  <p className="text-xl font-bold text-gray-900 tracking-tight">Enterprise Verified</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight">Our Core <span className="text-primary-600">Values</span></h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto  font-medium">The principles that drive our engineering culture and client success.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -10 }}
                className="bg-white rounded-3xl p-10 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col group"
              >
                <div className="w-14 h-14 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center mb-8 group-hover:bg-primary-600 group-hover:text-white transition-all shadow-sm">
                  <value.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-primary-600 transition-colors">
                  {value.title}
                </h3>
                <p className="text-gray-500 font-medium  leading-relaxed text-sm mb-6 flex-grow">
                  "{value.description}"
                </p>
                <div className="h-px bg-gray-50 w-full" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-10">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight">Strategic <span className="text-primary-600">Expertise</span></h2>
                <p className="text-lg text-gray-500 leading-relaxed  font-medium">
                  We don't just write code — we design and implement robust digital strategies that help businesses achieve sustainable scalability.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-2 border-l-2 border-primary-500 pl-6">
                  <h4 className="text-4xl font-bold text-gray-900 tracking-tight">100%</h4>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 ">Custom Solutions</p>
                </div>
                <div className="space-y-2 border-l-2 border-primary-500 pl-6">
                  <h4 className="text-4xl font-bold text-gray-900 tracking-tight">24/7</h4>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 ">Technical Support</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: Activity, label: "Realtime Systems", color: "text-blue-600", bg: "bg-blue-50" },
                { icon: ShieldCheck, label: "Secure Protocol", color: "text-green-600", bg: "bg-green-50" },
                { icon: Globe, label: "Global Nodes", color: "text-primary-600", bg: "bg-primary-50" },
                { icon: Cpu, label: "Modular Logic", color: "text-orange-600", bg: "bg-orange-50" }
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-slate-50 border border-gray-100 p-10 rounded-3xl text-center space-y-4 hover:bg-white hover:shadow-xl transition-all duration-300"
                >
                  <div className={cn("w-12 h-12 rounded-xl mx-auto flex items-center justify-center", item.bg, item.color)}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 ">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-32 bg-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="bg-primary-600 rounded-[3rem] p-16 md:p-24 text-white space-y-10 relative overflow-hidden shadow-2xl">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">Ready to Work with Us?</h2>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto opacity-90 ">Let's collaborate to build the digital infrastructure your business deserves.</p>
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

export default About;
