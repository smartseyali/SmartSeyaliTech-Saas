"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Lightbulb,
  Award,
  Rocket,
  ShieldCheck,
  Globe,
  Cpu,
  ArrowRight,
  Heart,
  Zap,
  CheckCircle,
  Building2,
  HeadphonesIcon,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "./AnimatedCounter";

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

export function AboutContent() {
  return (
    <div className="bg-white">
      <section className="relative bg-white pt-32 pb-16 lg:pt-40 lg:pb-20 border-b border-gray-100">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(37,99,235,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary-600 mb-4 block">About Us</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-6">
              Built to Simplify
              <br />
              <span className="text-primary-600">Enterprise Operations</span>
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed max-w-2xl">
              SmartSeyali Tech engineers robust business software that eliminates operational friction and helps companies grow with
              confidence — from one branch to many.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-14 bg-gray-50 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
            <AnimatedCounter target={50} suffix="+" label="Businesses Served" />
            <AnimatedCounter target={20} suffix="+" label="Platform Modules" />
            <AnimatedCounter target={99} suffix="%" label="Uptime SLA" />
            <AnimatedCounter target={24} suffix="/7" label="Support Available" />
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6">
              <span className="text-xs font-semibold uppercase tracking-widest text-primary-600 block">Our Story</span>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                Technology That Works
                <br />
                for Your Business
              </h2>
              <div className="space-y-4 text-gray-500 leading-relaxed border-l-2 border-primary-100 pl-5">
                <p>
                  SmartSeyali Tech was founded on a simple belief: enterprise software should empower businesses, not complicate
                  them. We bridge the gap between complex operational challenges and user-friendly digital solutions.
                </p>
                <p>
                  Today we serve a growing network of businesses across Tamil Nadu and beyond, delivering mission-critical platforms
                  built for the real challenges of running a modern company.
                </p>
              </div>
              <div className="pt-4">
                <Button asChild>
                  <Link href="/contact">
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
                  className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl p-4 hover:border-primary-100 hover:bg-white transition-all"
                >
                  <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-primary-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary-600 mb-3 block">Our Journey</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">How We Got Here</h2>
          </motion.div>
          <div className="max-w-xl mx-auto">
            {TIMELINE.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-5"
              >
                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center shrink-0 shadow-md shadow-primary-500/20 z-10">
                    <span className="text-[11px] font-bold text-white">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  {i < TIMELINE.length - 1 && (
                    <div className="w-px flex-1 bg-gray-200 my-1 min-h-[48px]" />
                  )}
                </div>
                <div className="pb-8 pt-1">
                  <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full inline-block mb-2">
                    {item.phase}
                  </span>
                  <h3 className="text-base font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary-600 mb-3 block">Our Values</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Principles That Drive Us</h2>
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
                className="group border border-gray-100 rounded-xl p-6 hover:border-primary-100 hover:shadow-lg hover:shadow-primary-500/5 transition-all bg-white"
              >
                <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-600 transition-colors duration-300">
                  <v.icon className="w-5 h-5 text-primary-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="text-xs font-semibold uppercase tracking-widest text-primary-600 mb-3 block">Why Partner With Us</span>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Strategic Technical Partnership</h2>
              <p className="text-gray-500 leading-relaxed mb-8">
                We don&apos;t just deliver software — we design digital strategies that help businesses achieve sustainable, measurable
                growth.
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
              className="bg-white border border-gray-200 rounded-xl p-8"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 bg-primary-50 border border-primary-100 rounded-xl p-5 text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-1">100%</div>
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

      <section className="py-24 bg-[#0F172A] border-t border-blue-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-600/30 flex items-center justify-center mx-auto mb-6">
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight mb-4">Ready to Work With Us?</h2>
            <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
              Let&apos;s collaborate to build the digital infrastructure your business deserves.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-500 text-white border-0">
                <Link href="/contact">
                  Start a Project <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Link
                href="/services"
                className="inline-flex items-center justify-center h-11 px-8 rounded font-semibold text-sm text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-colors"
              >
                View Our Services
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
