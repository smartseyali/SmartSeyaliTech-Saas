import {
  Target, Users, Lightbulb, Award, Rocket, ShieldCheck,
  Globe, Cpu, ArrowRight, Heart, Zap, CheckCircle, Building2,
  HeadphonesIcon, TrendingUp,
} from "lucide-react";
import PLATFORM_CONFIG from "@/config/platform";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useRef, useState, useEffect } from "react";
import { useInView } from "framer-motion";

const AnimatedCounter = ({ target, suffix = "" }: { target: number; suffix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const inc = target / (2000 / 16);
    const t = setInterval(() => {
      start += inc;
      if (start >= target) { setCount(target); clearInterval(t); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(t);
  }, [isInView, target]);
  return <span ref={ref}>{count}{suffix}</span>;
};

const TIMELINE = [
  { phase: "Phase 01", title: "The Vision", description: "Started with a mission to simplify enterprise technology for growing businesses across India." },
  { phase: "Phase 02", title: "Platform Built", description: "Developed the modular architecture enabling rapid deployment of business applications." },
  { phase: "Phase 03", title: "Multi-Tenant SaaS", description: "Launched full multi-tenant infrastructure with enterprise-grade security and isolation." },
  { phase: "Phase 04", title: "Today", description: "Serving 50+ businesses with 20+ integrated modules and expanding nationwide." },
];

const VALUES = [
  { icon: Lightbulb, title: "Innovation First", description: "We continuously research and adopt modern technologies to keep our clients ahead of the curve." },
  { icon: Heart, title: "Client Partnership", description: "We act as an extension of your team — invested in your success long after go-live." },
  { icon: Award, title: "Quality Excellence", description: "Rigorous standards ensure every product we ship is reliable, tested, and performant." },
  { icon: Rocket, title: "Sustainable Growth", description: "Scalable foundations built to support your growth now and into the future." },
];

const CAPABILITIES = [
  { icon: Cpu, label: "Real-time Systems" },
  { icon: ShieldCheck, label: "Secure by Design" },
  { icon: Globe, label: "Multi-region Ready" },
  { icon: Building2, label: "Multi-branch Support" },
  { icon: TrendingUp, label: "Analytics Engine" },
  { icon: HeadphonesIcon, label: "24/7 Expert Support" },
];

const About = () => (
  <div className="min-h-screen bg-white">

    {/* ── Hero ─────────────────────────────────────────────────────────── */}
    <section className="relative bg-white pt-32 pb-16 lg:pt-40 lg:pb-20 border-b border-gray-100">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(37,99,235,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-[#2563EB] mb-4 block">
            About Us
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-6">
            Built to Simplify
            <br />
            <span className="text-[#2563EB]">Enterprise Operations</span>
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed max-w-2xl">
            {PLATFORM_CONFIG.name} Tech engineers robust business software that eliminates operational
            friction and helps companies grow with confidence — from one branch to many.
          </p>
        </motion.div>
      </div>
    </section>

    {/* ── Stats strip ──────────────────────────────────────────────────── */}
    <section className="py-14 bg-gray-50 border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
          {[
            { target: 50, suffix: "+", label: "Businesses Served" },
            { target: 20, suffix: "+", label: "Platform Modules" },
            { target: 99, suffix: "%", label: "Uptime SLA" },
            { target: 24, suffix: "/7", label: "Support Available" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-1">
                <AnimatedCounter target={s.target} suffix={s.suffix} />
              </div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── Story ────────────────────────────────────────────────────────── */}
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-[#2563EB] block">
              Our Story
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
              Technology That Works
              <br />for Your Business
            </h2>
            <div className="space-y-4 text-gray-500 leading-relaxed border-l-2 border-blue-100 pl-5">
              <p>
                {PLATFORM_CONFIG.name} Tech was founded on a simple belief: enterprise software
                should empower businesses, not complicate them. We bridge the gap between complex
                operational challenges and user-friendly digital solutions.
              </p>
              <p>
                Today we serve a growing network of businesses across Tamil Nadu and beyond,
                delivering mission-critical platforms built for the real challenges of running
                a modern company.
              </p>
            </div>
            <div className="pt-4">
              <Button
                asChild
                className="bg-[#2563EB] hover:bg-blue-700 text-white rounded px-6 h-10 text-sm font-semibold"
              >
                <Link to="/contact">
                  Work With Us <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4"
          >
            {CAPABILITIES.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl p-4 hover:border-blue-100 hover:bg-white transition-all"
              >
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-[#2563EB]" />
                </div>
                <span className="text-sm font-medium text-gray-700">{label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>

    {/* ── Timeline ─────────────────────────────────────────────────────── */}
    <section className="py-24 bg-gray-50 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-[#2563EB] mb-3 block">
            Our Journey
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
            How We Got Here
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-6">
          {TIMELINE.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-100 hover:shadow-md transition-all"
            >
              <div className="text-xs font-bold text-[#2563EB] bg-blue-50 px-2.5 py-1 rounded-full inline-block mb-4">
                {item.phase}
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
              {i < TIMELINE.length - 1 && (
                <div className="hidden md:block absolute top-8 -right-3 w-6 h-px bg-gray-200" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* ── Values ───────────────────────────────────────────────────────── */}
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-[#2563EB] mb-3 block">
            Our Values
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
            Principles That Drive Us
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            The engineering culture and client-success principles behind everything we build.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {VALUES.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group border border-gray-100 rounded-xl p-6 hover:border-blue-100 hover:shadow-lg hover:shadow-blue-500/5 transition-all bg-white"
            >
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#2563EB] transition-colors duration-300">
                <v.icon className="w-5 h-5 text-[#2563EB] group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{v.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* ── Why us checklist ─────────────────────────────────────────────── */}
    <section className="py-24 bg-gray-50 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-[#2563EB] mb-3 block">
              Why Partner With Us
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Strategic Technical Partnership
            </h2>
            <p className="text-gray-500 leading-relaxed mb-8">
              We don't just deliver software — we design digital strategies that help businesses
              achieve sustainable, measurable growth.
            </p>
            <ul className="space-y-3">
              {[
                "100% custom-fit solutions, no generic templates",
                "Dedicated account manager from day one",
                "Rapid deployment — go live in under a week",
                "Ongoing post-launch support included",
                "Transparent pricing, no hidden fees",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-[#2563EB] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white border border-gray-200 rounded-xl p-8"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 bg-blue-50 border border-blue-100 rounded-xl p-5 text-center">
                <div className="text-3xl font-bold text-[#2563EB] mb-1">100%</div>
                <div className="text-sm text-gray-600">Custom Solutions</div>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">24/7</div>
                <div className="text-sm text-gray-500">Support</div>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">&lt; 7</div>
                <div className="text-sm text-gray-500">Days to Go Live</div>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">50+</div>
                <div className="text-sm text-gray-500">Clients</div>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">20+</div>
                <div className="text-sm text-gray-500">Modules</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>

    {/* ── CTA ──────────────────────────────────────────────────────────── */}
    <section className="py-24 bg-[#EFF6FF] border-t border-blue-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Zap className="w-10 h-10 text-blue-400 mx-auto mb-6" />
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Ready to Work With Us?
          </h2>
          <p className="text-gray-500 text-lg mb-10 max-w-xl mx-auto">
            Let's collaborate to build the digital infrastructure your business deserves.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-[#2563EB] hover:bg-blue-700 text-white h-12 px-8 rounded font-semibold text-sm shadow-md"
            >
              <Link to="/contact">
                Start a Project <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-blue-200 text-[#2563EB] hover:bg-blue-50 h-12 px-8 rounded font-semibold text-sm"
            >
              <Link to="/products">View Our Products</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  </div>
);

export default About;
