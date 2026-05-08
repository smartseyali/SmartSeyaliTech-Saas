"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle,
  Shield,
  Globe,
  TrendingUp,
  Zap,
  ChevronRight,
  Star,
  Play,
  Building2,
  Layers,
  Lock,
  HeadphonesIcon,
  Award,
  DollarSign,
  BarChart3,
  Settings,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "./AnimatedCounter";
import { ModuleTabs } from "./ModuleTabs";
import { useMarketingTestimonials, useTenantShowcase, usePlatformSettings } from "@/hooks/useMarketingData";

const WHY_ITEMS = [
  {
    icon: Layers,
    title: "Modular Architecture",
    description:
      "Buy only what you need. Each module is fully functional standalone and integrates seamlessly with others as your needs grow.",
  },
  {
    icon: Zap,
    title: "Rapid Deployment",
    description:
      "Go live in under a week. Our onboarding team configures the platform to match your existing workflows with zero disruption.",
  },
  {
    icon: Building2,
    title: "Multi-Branch Ready",
    description:
      "Built for businesses with multiple locations. Consolidate data, manage permissions, and report across all branches in real time.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "Role-based access control, audit logs, and end-to-end encryption. Your data stays private and compliant at all times.",
  },
  {
    icon: TrendingUp,
    title: "Actionable Analytics",
    description:
      "AI-powered insights surface trends before they become problems. Custom dashboards for every role — from CEO to warehouse staff.",
  },
  {
    icon: HeadphonesIcon,
    title: "Dedicated Support",
    description:
      "A real human account manager, not a ticket queue. Priority support via WhatsApp, email, and phone — included in every plan.",
  },
];

const INTEGRATION_LIST = [
  "Razorpay, Stripe, PayU payment gateways",
  "Shiprocket, Delhivery, BlueDart logistics",
  "WhatsApp Business API",
  "Tally & GST filing portals",
  "Custom REST API & webhooks",
];

const INTEGRATION_BADGES = [
  { name: "Razorpay", icon: DollarSign, color: "text-teal-600 bg-blue-50" },
  { name: "WhatsApp", icon: Globe, color: "text-green-600 bg-green-50" },
  { name: "Shiprocket", icon: Zap, color: "text-orange-600 bg-orange-50" },
  { name: "GST Portal", icon: Shield, color: "text-violet-600 bg-violet-50" },
  { name: "Tally", icon: BarChart3, color: "text-red-600 bg-red-50" },
  { name: "REST API", icon: Settings, color: "text-cyan-600 bg-cyan-50" },
];

export function HomeContent() {
  const { testimonials, loading: testimonialsLoading } = useMarketingTestimonials();
  const { tenants }       = useTenantShowcase();
  const { settings }      = usePlatformSettings([
    "stat_clients_raw", "stat_modules_raw", "stat_uptime_raw", "stat_support_raw",
  ]);

  // Repeat tenants until we have at least 12 per half so the track always fills the viewport.
  // The marquee animates translateX(0) → translateX(-50%), so we need 2 identical halves.
  const marqueeHalf = tenants.length > 0
    ? Array.from({ length: Math.ceil(12 / tenants.length) }, () => tenants).flat()
    : [];
  const marqueeTracks = [...marqueeHalf, ...marqueeHalf];

  return (
    <div className="bg-white overflow-hidden">
      {/* Hero */}
      <section className="relative bg-[#0F172A] pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute top-0 right-0 w-[700px] h-[500px] bg-gradient-to-bl from-blue-900/40 to-transparent" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-gradient-to-tr from-blue-900/30 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-blue-300 text-xs font-semibold uppercase tracking-wide mb-8"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              All-in-One Business Platform for Indian Enterprises
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.05] tracking-tight mb-6"
            >
              Run Your Entire Business
              <br />
              <span className="text-blue-400">From One Platform</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10"
            >
              SmartSeyali unifies commerce, finance, HR, CRM, and analytics into a single, deeply
              integrated platform — built for growing businesses in India.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 justify-center mb-12"
            >
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-500 text-white border-0">
                <Link href="/contact">
                  Request a Demo <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 h-11 px-8 rounded font-semibold text-sm text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-colors"
              >
                <Play className="h-3.5 w-3.5" /> View All Modules
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-400"
            >
              {[
                { icon: Shield, text: "SOC 2 Compliant" },
                { icon: Lock, text: "Data Encrypted" },
                { icon: HeadphonesIcon, text: "24/7 Support" },
                { icon: Globe, text: "99.9% Uptime SLA" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-blue-400" />
                  <span>{text}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Dashboard preview mock */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 relative"
          >
            <div className="absolute -inset-x-4 top-8 bottom-0 bg-gradient-to-b from-blue-900/20 to-transparent rounded-3xl" />
            <div className="relative bg-white border border-gray-200 rounded-xl shadow-2xl shadow-black/50 overflow-hidden mx-auto max-w-5xl">
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-4 h-6 bg-gray-200 rounded text-xs text-gray-400 flex items-center px-3">
                  app.smartseyali.com/dashboard
                </div>
              </div>
              <div className="bg-gray-50 p-6 min-h-[320px] flex gap-4">
                <div className="w-40 shrink-0 bg-white rounded-lg border border-gray-100 p-3 space-y-1">
                  {["Dashboard", "Orders", "Inventory", "Finance", "CRM", "Reports"].map((item, i) => (
                    <div
                      key={item}
                      className={`px-3 py-2 rounded text-xs font-medium ${
                        i === 0 ? "bg-primary-600 text-white" : "text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {item}
                    </div>
                  ))}
                </div>
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: "Total Revenue", value: "₹12.4L", change: "+18%", up: true },
                      { label: "Orders Today", value: "248", change: "+7%", up: true },
                      { label: "Active Users", value: "1,842", change: "+12%", up: true },
                      { label: "Pending Bills", value: "₹3.1L", change: "-4%", up: false },
                    ].map(({ label, value, change, up }) => (
                      <div key={label} className="bg-white rounded-lg border border-gray-100 p-3">
                        <p className="text-[10px] text-gray-400 mb-1">{label}</p>
                        <p className="text-lg font-bold text-gray-900">{value}</p>
                        <p className={`text-[10px] font-semibold mt-1 ${up ? "text-emerald-600" : "text-red-500"}`}>
                          {change} vs last month
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white rounded-lg border border-gray-100 p-4 h-36 flex items-end gap-2">
                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                      <div key={i} className="flex-1 bg-primary-100 rounded-sm" style={{ height: `${h}%` }}>
                        <div
                          className="w-full bg-primary-600 rounded-sm"
                          style={{ height: `${h * 0.6}%`, marginTop: `${h * 0.4}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tenant Showcase — scrolling marquee of businesses running on the platform */}
      {tenants.length > 0 && (
        <section className="py-12 border-y border-gray-100 bg-gray-50 overflow-hidden">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-8">
            Trusted by {tenants.length}+ businesses across Tamil Nadu
          </p>
          <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <div className="flex animate-marquee whitespace-nowrap">
              {marqueeTracks.map((tenant, i) => (
                <div key={i} className="inline-flex items-center gap-2.5 mx-10 shrink-0">
                  {tenant.logo_url ? (
                    <img
                      src={tenant.logo_url}
                      alt={tenant.name}
                      className="h-7 w-auto max-w-[80px] object-contain grayscale opacity-40 inline-block"
                    />
                  ) : (
                    <span className="inline-flex w-6 h-6 rounded bg-gray-300 items-center justify-center text-[10px] font-bold text-white shrink-0">
                      {tenant.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="text-sm font-semibold text-gray-300 tracking-wide">
                    {tenant.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* India Compliance Strip */}
      <section className="py-5 bg-[#0F172A] border-b border-blue-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12">
            {[
              { icon: Shield, label: "GST Compliant" },
              { icon: MapPin, label: "Data Stored in India" },
              { icon: Globe, label: "Indian Localisation" },
              { icon: CheckCircle, label: "MSME Friendly" },
              { icon: Award, label: "Made in India" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-xs font-semibold text-blue-200 uppercase tracking-wider">
                <Icon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            <AnimatedCounter target={Number(settings.stat_clients_raw) || 50} suffix="+" label="Active Clients" />
            <AnimatedCounter target={Number(settings.stat_modules_raw) || 20} suffix="+" label="Business Modules" />
            <AnimatedCounter target={Number(settings.stat_uptime_raw)  || 99} suffix="%" label="Uptime SLA" />
            <AnimatedCounter target={Number(settings.stat_support_raw) || 24} suffix="/7" label="Expert Support" />
          </div>
        </div>
      </section>

      {/* Module tabs */}
      <section className="py-24 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-primary-600 mb-3 block">
              Platform Modules
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Everything Your Business Needs
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              One platform, all departments. Each module works standalone or deeply integrated with the rest — no plugins, no
              hidden fees.
            </p>
          </motion.div>

          <ModuleTabs />
        </div>
      </section>

      {/* Why */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-primary-600 mb-3 block">
              Why Choose Us
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Built for Scale. Designed for Simplicity.
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Enterprise-grade capabilities without enterprise complexity. Get started in days, not months.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHY_ITEMS.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="group border border-gray-100 rounded-xl p-6 hover:border-primary-100 hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300 bg-white"
              >
                <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-600 transition-colors duration-300">
                  <item.icon className="w-5 h-5 text-primary-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials — only rendered when approved reviews exist in the DB */}
      {!testimonialsLoading && testimonials.length > 0 && (
        <section className="py-24 bg-gray-50 border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <span className="text-xs font-semibold uppercase tracking-widest text-primary-600 mb-3 block">
                Customer Stories
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                Businesses That Made the Switch
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col"
                >
                  {/* Star rating — filled up to t.rating, empty beyond */}
                  <div className="flex gap-0.5 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={s <= t.rating ? "w-4 h-4 fill-yellow-400 text-yellow-400" : "w-4 h-4 text-gray-200"}
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-6">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                    <div className="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center text-sm font-bold text-primary-600">
                      {t.author_name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{t.author_name}</p>
                      <p className="text-xs text-gray-400">
                        {t.author_role}{t.company ? `, ${t.company}` : ""}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Integrations */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="text-xs font-semibold uppercase tracking-widest text-primary-600 mb-3 block">
                Integrations
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Works with Your Existing Tools
              </h2>
              <p className="text-gray-500 leading-relaxed mb-8">
                Connect SmartSeyali to the services you already use. Native integrations with payment gateways, logistics
                partners, WhatsApp Business, and more — all configured in minutes.
              </p>
              <ul className="space-y-3">
                {INTEGRATION_LIST.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-primary-600 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-3 gap-4"
            >
              {INTEGRATION_BADGES.map(({ name, icon: Icon, color }) => (
                <div
                  key={name}
                  className="flex flex-col items-center justify-center gap-2 bg-gray-50 border border-gray-100 rounded-xl p-5 text-center hover:border-primary-100 hover:bg-white transition-all"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-gray-600">{name}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#0F172A] border-t border-blue-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-600/30 flex items-center justify-center mx-auto mb-6">
              <Award className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-white mb-4 tracking-tight">
              Ready to Modernize Your Operations?
            </h2>
            <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
              Book a free 30-minute demo and see exactly how SmartSeyali fits your business — no obligation, no credit card
              required.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-500 text-white border-0">
                <Link href="/contact">
                  Book a Free Demo <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Link
                href="/login"
                className="inline-flex items-center justify-center h-11 px-8 rounded font-semibold text-sm text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-colors"
              >
                Sign In to Your Account
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
