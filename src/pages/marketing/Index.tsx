import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle,
  ShoppingCart,
  DollarSign,
  Settings,
  Users,
  BarChart3,
  UserCheck,
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
  ChevronDown,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import PLATFORM_CONFIG from "@/config/platform";
import { motion, useInView } from "framer-motion";

/* ── Animated Counter ────────────────────────────────────────────────────── */
const AnimatedCounter = ({
  target,
  suffix = "",
  label,
}: {
  target: number;
  suffix?: string;
  label: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-1">
        {count}
        {suffix}
      </div>
      <div className="text-sm text-gray-500 font-medium">{label}</div>
    </div>
  );
};

/* ── Module Tabs ─────────────────────────────────────────────────────────── */
const MODULE_TABS = [
  {
    id: "commerce",
    label: "Commerce",
    icon: ShoppingCart,
    color: "text-teal-600",
    bg: "bg-blue-50",
    accent: "border-teal-500",
    title: "Unified Commerce Platform",
    description:
      "Manage your online store, point-of-sale, and inventory from a single dashboard. Real-time sync across all channels.",
    bullets: [
      "Multi-channel order management",
      "Live inventory tracking",
      "Integrated POS & storefront",
      "Smart discount & pricing rules",
    ],
  },
  {
    id: "finance",
    label: "Finance",
    icon: DollarSign,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    accent: "border-emerald-500",
    title: "Finance & Accounting",
    description:
      "Automate invoicing, expense tracking, and financial reporting. Close books faster with AI-powered reconciliation.",
    bullets: [
      "Automated invoicing & billing",
      "Real-time P&L dashboards",
      "GST & tax compliance",
      "Multi-currency support",
    ],
  },
  {
    id: "operations",
    label: "Operations",
    icon: Settings,
    color: "text-orange-600",
    bg: "bg-orange-50",
    accent: "border-orange-500",
    title: "Supply Chain & Logistics",
    description:
      "Streamline procurement, warehousing, and vendor management. Reduce lead times and optimize stock levels automatically.",
    bullets: [
      "Purchase order automation",
      "Vendor performance tracking",
      "Warehouse management",
      "Demand forecasting",
    ],
  },
  {
    id: "people",
    label: "HRMS",
    icon: Users,
    color: "text-violet-600",
    bg: "bg-violet-50",
    accent: "border-violet-500",
    title: "Human Resource Management",
    description:
      "From hiring to payroll, manage your entire workforce in one place. Compliant with Indian labour laws.",
    bullets: [
      "Payroll & attendance automation",
      "Leave & policy management",
      "Employee self-service portal",
      "Performance appraisals",
    ],
  },
  {
    id: "customer",
    label: "CRM",
    icon: UserCheck,
    color: "text-pink-600",
    bg: "bg-pink-50",
    accent: "border-pink-500",
    title: "Customer Relationship Management",
    description:
      "Track leads, manage pipelines, and close deals faster with built-in sales automation and customer insights.",
    bullets: [
      "Visual sales pipeline",
      "Lead scoring & nurturing",
      "WhatsApp & email integration",
      "Customer lifetime analytics",
    ],
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    color: "text-cyan-600",
    bg: "bg-cyan-50",
    accent: "border-cyan-500",
    title: "Business Intelligence & Reports",
    description:
      "Turn raw data into actionable insights. Build custom dashboards and schedule automated reports for every team.",
    bullets: [
      "Drag-and-drop dashboard builder",
      "Scheduled email reports",
      "Cross-module data views",
      "Export to Excel / PDF",
    ],
  },
];

const DUMMY_LOGOS = [
  "Ramraj Cotton",
  "Sri Kumaran",
  "Nithyasree",
  "Bharath Mills",
  "Annai Stores",
  "Vetrivel Tex",
];

const TESTIMONIALS = [
  {
    quote:
      "SmartSeyali replaced 4 different tools we were juggling. Our team onboarded in a week and we cut operational overhead by 35%.",
    author: "Rajan K.",
    role: "Managing Director",
    company: "Ramraj Cotton",
    rating: 5,
  },
  {
    quote:
      "The inventory and POS modules alone were worth the switch. Real-time stock sync across 3 outlets changed everything for us.",
    author: "Priya M.",
    role: "Operations Head",
    company: "Annai Stores",
    rating: 5,
  },
  {
    quote:
      "Finance reporting used to take 2 days every month. With SmartSeyali it's automated and ready in minutes — accurate every time.",
    author: "Suresh V.",
    role: "CFO",
    company: "Bharath Mills",
    rating: 5,
  },
];

/* ── Page ────────────────────────────────────────────────────────────────── */
const Index = () => {
  const [activeTab, setActiveTab] = useState("commerce");
  const [modules, setModules] = useState<any[]>([]);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const { data } = await supabase
          .from("system_modules")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true })
          .limit(6);
        if (data && data.length > 0) setModules(data);
      } catch {}
    };
    fetchModules();
  }, []);

  const activeModule = MODULE_TABS.find((m) => m.id === activeTab) || MODULE_TABS[0];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-white pt-32 pb-20 lg:pt-40 lg:pb-28">
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(37,99,235,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute top-0 right-0 w-[700px] h-[500px] bg-gradient-to-bl from-blue-50 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[#2563EB] text-xs font-semibold uppercase tracking-wide mb-8"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-pulse" />
              All-in-One Business Platform for Indian Enterprises
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-6"
            >
              Run Your Entire Business
              <br />
              <span className="text-[#2563EB]">From One Platform</span>
            </motion.h1>

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed mb-10"
            >
              {PLATFORM_CONFIG.name} unifies commerce, finance, HR, CRM, and analytics into a
              single, deeply integrated platform — built for growing businesses in India.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 justify-center mb-12"
            >
              <Button
                asChild
                size="lg"
                className="bg-[#2563EB] hover:bg-blue-700 h-12 px-8 rounded font-semibold text-sm shadow-lg shadow-blue-500/20 text-white"
              >
                <Link to="/contact">
                  Request a Demo <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 px-8 rounded border-gray-200 text-gray-700 hover:border-blue-200 hover:text-[#2563EB] font-semibold text-sm"
              >
                <Link to="/products" className="flex items-center gap-2">
                  <Play className="h-3.5 w-3.5" /> View All Modules
                </Link>
              </Button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-gray-400"
            >
              {[
                { icon: Shield, text: "SOC 2 Compliant" },
                { icon: Lock, text: "Data Encrypted" },
                { icon: HeadphonesIcon, text: "24/7 Support" },
                { icon: Globe, text: "99.9% Uptime SLA" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>{text}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Dashboard preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 relative"
          >
            <div className="absolute -inset-x-4 top-8 bottom-0 bg-gradient-to-b from-blue-50/50 to-transparent rounded-3xl" />
            <div className="relative bg-white border border-gray-200 rounded-xl shadow-2xl shadow-gray-900/10 overflow-hidden mx-auto max-w-5xl">
              {/* Fake browser chrome */}
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
              {/* Dashboard content mockup */}
              <div className="bg-gray-50 p-6 min-h-[320px] flex gap-4">
                {/* Sidebar */}
                <div className="w-40 shrink-0 bg-white rounded-lg border border-gray-100 p-3 space-y-1">
                  {["Dashboard", "Orders", "Inventory", "Finance", "CRM", "Reports"].map(
                    (item, i) => (
                      <div
                        key={item}
                        className={`px-3 py-2 rounded text-xs font-medium ${
                          i === 0
                            ? "bg-[#2563EB] text-white"
                            : "text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {item}
                      </div>
                    )
                  )}
                </div>
                {/* Main content */}
                <div className="flex-1 space-y-4">
                  {/* Stat cards */}
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: "Total Revenue", value: "₹12.4L", change: "+18%", up: true },
                      { label: "Orders Today", value: "248", change: "+7%", up: true },
                      { label: "Active Users", value: "1,842", change: "+12%", up: true },
                      { label: "Pending Bills", value: "₹3.1L", change: "-4%", up: false },
                    ].map(({ label, value, change, up }) => (
                      <div
                        key={label}
                        className="bg-white rounded-lg border border-gray-100 p-3"
                      >
                        <p className="text-[10px] text-gray-400 mb-1">{label}</p>
                        <p className="text-lg font-bold text-gray-900">{value}</p>
                        <p
                          className={`text-[10px] font-semibold mt-1 ${
                            up ? "text-emerald-600" : "text-red-500"
                          }`}
                        >
                          {change} vs last month
                        </p>
                      </div>
                    ))}
                  </div>
                  {/* Chart placeholder */}
                  <div className="bg-white rounded-lg border border-gray-100 p-4 h-36 flex items-end gap-2">
                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-blue-100 rounded-sm"
                        style={{ height: `${h}%` }}
                      >
                        <div
                          className="w-full bg-[#2563EB] rounded-sm"
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

      {/* ── Client Logos ─────────────────────────────────────────────────── */}
      <section className="py-14 border-y border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-8">
            Trusted by 50+ businesses across Tamil Nadu
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {DUMMY_LOGOS.map((name) => (
              <span key={name} className="text-sm font-semibold text-gray-300 tracking-wide">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            <AnimatedCounter target={50} suffix="+" label="Active Clients" />
            <AnimatedCounter target={20} suffix="+" label="Business Modules" />
            <AnimatedCounter target={99} suffix="%" label="Uptime SLA" />
            <AnimatedCounter target={24} suffix="/7" label="Expert Support" />
          </div>
        </div>
      </section>

      {/* ── Module Feature Tabs ───────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-[#2563EB] mb-3 block">
              Platform Modules
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Everything Your Business Needs
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              One platform, all departments. Each module works standalone or deeply integrated with
              the rest — no plugins, no hidden fees.
            </p>
          </motion.div>

          {/* Tab bar */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {MODULE_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded text-sm font-medium transition-all border ${
                    isActive
                      ? "bg-white border-[#2563EB] text-[#2563EB] shadow-sm"
                      : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid lg:grid-cols-2 gap-10 items-center bg-white border border-gray-200 rounded-xl p-8 lg:p-12 shadow-sm"
          >
            <div>
              <div
                className={`inline-flex items-center justify-center w-12 h-12 ${activeModule.bg} rounded-lg mb-6`}
              >
                <activeModule.icon className={`w-6 h-6 ${activeModule.color}`} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{activeModule.title}</h3>
              <p className="text-gray-500 leading-relaxed mb-8">{activeModule.description}</p>
              <ul className="space-y-3">
                {activeModule.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-center gap-3 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-[#2563EB] shrink-0" />
                    {bullet}
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <Button
                  asChild
                  size="sm"
                  className="bg-[#2563EB] hover:bg-blue-700 text-white rounded px-5 h-9 text-sm font-semibold"
                >
                  <Link to="/products">
                    Explore {activeModule.label} <ArrowRight className="ml-2 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Module visual mockup */}
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 min-h-[280px]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-gray-700">{activeModule.title}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${activeModule.bg} ${activeModule.color}`}>
                  Live
                </span>
              </div>
              <div className="space-y-3">
                {activeModule.bullets.map((bullet, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white border border-gray-100 rounded-lg p-3">
                    <div className={`w-2 h-2 rounded-full ${activeModule.bg.replace("bg-", "bg-").replace("50", "400")}`} style={{ background: activeModule.color.includes("blue") ? "#3b82f6" : activeModule.color.includes("emerald") ? "#10b981" : activeModule.color.includes("orange") ? "#f97316" : activeModule.color.includes("violet") ? "#7c3aed" : activeModule.color.includes("pink") ? "#ec4899" : "#06b6d4" }} />
                    <span className="text-xs text-gray-600">{bullet}</span>
                    <CheckCircle className="w-3 h-3 text-gray-300 ml-auto" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Why SmartSeyali ──────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-[#2563EB] mb-3 block">
              Why Choose Us
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Built for Scale. Designed for Simplicity.
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Enterprise-grade capabilities without enterprise complexity. Get started in days, not
              months.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
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
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="group border border-gray-100 rounded-xl p-6 hover:border-blue-100 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 bg-white"
              >
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#2563EB] transition-colors duration-300">
                  <item.icon className="w-5 h-5 text-[#2563EB] group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-[#2563EB] mb-3 block">
              Customer Stories
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Businesses That Made the Switch
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col"
              >
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.rating)].map((_, si) => (
                    <Star key={si} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-sm font-bold text-[#2563EB]">
                    {t.author[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.author}</p>
                    <p className="text-xs text-gray-400">
                      {t.role}, {t.company}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Integration strip ────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-xs font-semibold uppercase tracking-widest text-[#2563EB] mb-3 block">
                Integrations
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Works with Your Existing Tools
              </h2>
              <p className="text-gray-500 leading-relaxed mb-8">
                Connect SmartSeyali to the services you already use. Native integrations with payment
                gateways, logistics partners, WhatsApp Business, and more — all configured in
                minutes.
              </p>
              <ul className="space-y-3">
                {[
                  "Razorpay, Stripe, PayU payment gateways",
                  "Shiprocket, Delhivery, BlueDart logistics",
                  "WhatsApp Business API",
                  "Tally & GST filing portals",
                  "Custom REST API & webhooks",
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
              className="grid grid-cols-3 gap-4"
            >
              {[
                { name: "Razorpay", icon: DollarSign, color: "text-teal-600 bg-blue-50" },
                { name: "WhatsApp", icon: Globe, color: "text-green-600 bg-green-50" },
                { name: "Shiprocket", icon: Zap, color: "text-orange-600 bg-orange-50" },
                { name: "GST Portal", icon: Shield, color: "text-violet-600 bg-violet-50" },
                { name: "Tally", icon: BarChart3, color: "text-red-600 bg-red-50" },
                { name: "REST API", icon: Settings, color: "text-cyan-600 bg-cyan-50" },
              ].map(({ name, icon: Icon, color }) => (
                <div
                  key={name}
                  className="flex flex-col items-center justify-center gap-2 bg-gray-50 border border-gray-100 rounded-xl p-5 text-center hover:border-blue-100 hover:bg-white transition-all"
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

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-[#EFF6FF] border-t border-blue-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Award className="w-10 h-10 text-blue-400 mx-auto mb-6" />
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Ready to Modernize Your Operations?
            </h2>
            <p className="text-gray-500 text-lg mb-10 max-w-xl mx-auto">
              Book a free 30-minute demo and see exactly how SmartSeyali fits your business —
              no obligation, no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-[#2563EB] hover:bg-blue-700 text-white h-12 px-8 rounded font-semibold text-sm shadow-md"
              >
                <Link to="/contact">
                  Book a Free Demo <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-blue-200 text-[#2563EB] hover:bg-blue-50 h-12 px-8 rounded font-semibold text-sm"
              >
                <Link to="/login">Sign In to Your Account</Link>
              </Button>
            </div>
            <p className="text-gray-500 text-xs mt-6">
              Already using SmartSeyali?{" "}
              <Link to="/login" className="text-[#2563EB] font-medium underline underline-offset-2 hover:text-blue-700">
                Sign in here →
              </Link>
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
