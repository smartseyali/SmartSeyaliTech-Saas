"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, X, ArrowRight, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { useMarketingFaqs, usePricingPlans, useSystemModules, usePlatformTaxConfig } from "@/hooks/useMarketingData";
import { MARKETING_MODULES } from "@/config/marketing";
import { PLATFORM_MODULES } from "@/config/modules";
import type { SystemModule } from "@/lib/services/marketingService";
// ── helpers ────────────────────────────────────────────────────────────────────

function formatPrice(n: number) {
  return n.toLocaleString("en-IN");
}

function yearlyPerMonth(yearly: number) {
  return Math.round(yearly / 12);
}

// Merges MARKETING_MODULES (icons/copy) with DB prices from system_modules.
// Falls back to PLATFORM_MODULES static config if DB row is missing.
function buildAppModules(dbModules: SystemModule[]) {
  return MARKETING_MODULES.map((m) => {
    const db  = dbModules.find((d) => d.slug === m.slug);
    const cfg = PLATFORM_MODULES.find((p) => p.id === m.slug);
    return {
      ...m,
      priceMonthly: db?.price_monthly ?? cfg?.priceMonthly ?? 0,
      priceYearly:  db?.price_yearly  ?? cfg?.priceYearly  ?? 0,
      isFree:       db?.is_free       ?? cfg?.isFree       ?? false,
      trialDays:    db?.trial_days ?? cfg?.trialDays ?? 14,
    };
  });
}

// ── component ──────────────────────────────────────────────────────────────────

export function PricingContent() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");

  const { plans,     loading: plansLoading, error: plansError } = usePricingPlans();
  const { faqs,      loading: faqsLoading    } = useMarketingFaqs("pricing");
  const { modules,   loading: modulesLoading } = useSystemModules();
  const { taxConfig } = usePlatformTaxConfig();

  const appModules = buildAppModules(modulesLoading ? [] : modules);

  const heroTrialDays = plans.length > 0
    ? Math.min(...plans.map(p => p.trial_days ?? 14))
    : 14;

  // ── tax display strings (derived from platform config) ─────────────────────
  const taxNote = taxConfig.tax_included
    ? `incl. ${taxConfig.tax_label}`
    : `+ ${taxConfig.tax_label}`;
  const taxNoteWithRate = taxConfig.tax_included
    ? `incl. ${taxConfig.tax_label}`
    : `+ ${taxConfig.tax_rate}% ${taxConfig.tax_label}`;

  // ── billing toggle ──────────────────────────────────────────────────────────
  const maxPlanSavings = plans.length > 0
    ? Math.max(...plans.filter(p => p.price_monthly > 0).map(p =>
        Math.round(((p.price_monthly * 12 - p.price_yearly) / (p.price_monthly * 12)) * 100)
      ))
    : 17;

  const BillingToggle = (
    <div className="flex justify-center">
      <div className="inline-flex items-center bg-gray-100 rounded-full p-1 border border-gray-200">
        <button
          type="button"
          onClick={() => setBilling("monthly")}
          className={cn(
            "px-5 py-2 rounded-full text-sm font-semibold transition-all",
            billing === "monthly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          )}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => setBilling("yearly")}
          className={cn(
            "px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2",
            billing === "yearly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          )}
        >
          Yearly
          <span className="text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">
            SAVE {maxPlanSavings}%
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white">

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative bg-white pt-32 pb-16 lg:pt-40 lg:pb-20 border-b border-gray-100">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(37,99,235,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-primary-600 mb-4 block">
              Pricing
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-6">
              Simple, Transparent
              <br />
              <span className="text-primary-600">Pricing for Every Stage</span>
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed">
              Choose a SmartOne bundle or build your own stack — pay only for what your business needs.
              {heroTrialDays}-day free trial on every plan.
            </p>
          </motion.div>

          <div className="mt-10">{BillingToggle}</div>
        </div>
      </section>

      {/* ── SmartOne Plans ───────────────────────────────────────────────────── */}
      <section id="smartone-section" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold uppercase tracking-widest mb-4">
              <Zap className="w-3 h-3" /> SmartOne — All Apps Bundled
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              Complete Platform Subscriptions
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Get all the modules your business needs in one subscription. Best value for growing businesses.
            </p>
          </motion.div>

          {plansLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
            </div>
          ) : plansError ? (
            <div className="text-center py-16 text-red-400 text-sm font-mono">Error: {plansError}</div>
          ) : plans.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">No plans available yet.</div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6 items-stretch">
              {plans.map((plan, i) => {
                const price = billing === "yearly"
                  ? yearlyPerMonth(plan.price_yearly)
                  : plan.price_monthly;
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className={cn(
                      "relative rounded-2xl p-8 border transition-all flex flex-col",
                      plan.is_highlighted
                        ? "border-primary-600 bg-primary-50/30 shadow-xl shadow-primary-500/10 scale-[1.02]"
                        : "border-gray-200 bg-white hover:border-primary-100 hover:shadow-lg"
                    )}
                  >
                    {plan.is_highlighted && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                        Most Popular
                      </div>
                    )}
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h3>
                    <p className="text-sm text-gray-500 mb-6 min-h-[40px]">{plan.tagline}</p>
                    <div className="mb-1">
                      <span className="text-4xl font-bold text-gray-900">₹{formatPrice(price)}</span>
                      <span className="text-sm text-gray-400 ml-2">/month</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-6">
                      {billing === "yearly"
                        ? `Billed yearly at ₹${formatPrice(plan.price_yearly)} ${taxNote}`
                        : `Billed monthly ${taxNoteWithRate}`}
                    </p>
                    <Button
                      asChild
                      className={cn(
                        "w-full mb-6",
                        plan.is_highlighted
                          ? "bg-primary-600 hover:bg-primary-700 text-white"
                          : "bg-gray-900 hover:bg-gray-800 text-white"
                      )}
                    >
                      <Link href={`/onboarding?plan_id=${plan.id}`}>
                        {plan.cta_label} <ArrowRight className="ml-2 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                    <ul className="space-y-3 flex-1">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                      {plan.not_included.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm text-gray-400">
                          <X className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" />
                          <span className="line-through">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                );
              })}
            </div>
          )}
          <p className="mt-10 text-center text-sm text-gray-400">
            All SmartOne plans include automatic backups, SSL, 99.5% uptime SLA, and unlimited support tickets.
          </p>
        </div>
      </section>

      {/* ── Divider ──────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t border-gray-100" />
      </div>

      {/* ── Individual Apps ──────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold uppercase tracking-widest mb-4">
              Individual Apps
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              Build Your Own Stack
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Purchase only the apps you need today. Each module runs standalone or integrates
              with others. Add more to your stack anytime.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {appModules.map((mod, i) => {
                const Icon = mod.icon;
                const price = billing === "yearly"
                  ? yearlyPerMonth(mod.priceYearly)
                  : mod.priceMonthly;
                const yearlySavings = mod.priceMonthly > 0
                  ? Math.round(((mod.priceMonthly * 12 - mod.priceYearly) / (mod.priceMonthly * 12)) * 100)
                  : 0;

                return (
                  <motion.div
                    key={mod.slug}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (i % 4) * 0.06 }}
                    className="group bg-white border border-gray-200 rounded-xl p-5 hover:border-primary-100 hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300 flex flex-col"
                  >
                    {/* Icon + Name */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br shadow-sm",
                        mod.color
                      )}>
                        <Icon className="w-5 h-5 text-white" strokeWidth={1.75} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors leading-tight">
                          {mod.name}
                        </h3>
                        {mod.isFree ? (
                          <span className="text-[10px] font-semibold text-green-600 uppercase tracking-wide">
                            Free · Included in all plans
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400">
                            {mod.trialDays}-day free trial
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price */}
                    {mod.isFree ? (
                      <div className="mb-4">
                        <span className="text-2xl font-bold text-green-600">Free</span>
                      </div>
                    ) : (
                      <div className="mb-1">
                        <span className="text-2xl font-bold text-gray-900">₹{formatPrice(price)}</span>
                        <span className="text-xs text-gray-400 ml-1">/mo</span>
                        {billing === "yearly" && yearlySavings > 0 && (
                          <span className="ml-2 text-[10px] font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full">
                            SAVE {yearlySavings}%
                          </span>
                        )}
                      </div>
                    )}
                    {!mod.isFree && (
                      <p className="text-[10px] text-gray-400 mb-4">
                        {billing === "yearly"
                          ? `₹${formatPrice(mod.priceYearly)}/yr ${taxNote}`
                          : taxNoteWithRate}
                      </p>
                    )}

                    {/* Features */}
                    <ul className="space-y-1.5 mb-5 flex-1">
                      {mod.features.slice(0, 4).map((f) => (
                        <li key={f} className="flex items-center gap-2 text-xs text-gray-600">
                          <CheckCircle className="w-3 h-3 text-primary-500 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <Link
                      href={mod.isFree ? "/onboarding" : `/onboarding?app=${mod.slug}`}
                      className="block text-center text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg py-2 transition-colors"
                    >
                      {mod.isFree ? "Get Started Free" : `Try ${mod.name.split(" ")[0]} Free →`}
                    </Link>
                  </motion.div>
                );
              })}
            </div>

          <div className="mt-10 text-center">
            <p className="text-sm text-gray-400 mb-4">
              Need multiple apps? SmartOne bundles are significantly cheaper than buying individually.
            </p>
            <Button
              variant="outline"
              onClick={() => document.getElementById("smartone-section")?.scrollIntoView({ behavior: "smooth" })}
            >
              Compare SmartOne Plans <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── FAQs ─────────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50 border-y border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-primary-600 mb-3 block">FAQ</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Pricing Questions, Answered</h2>
          </motion.div>

          {faqsLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
            </div>
          ) : (
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <AccordionItem
                    value={faq.id}
                    className="bg-white border border-gray-200 rounded-xl px-5 border-b-0 hover:border-primary-100 transition-colors data-[state=open]:border-primary-200"
                  >
                    <AccordionTrigger className="text-sm font-semibold text-gray-900 py-4 hover:no-underline text-left gap-4 [&>svg]:text-gray-400">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-gray-600 leading-relaxed pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          )}
        </div>
      </section>

      {/* ── CTA Footer ───────────────────────────────────────────────────────── */}
      <section className="py-24 bg-[#0F172A] border-t border-blue-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight mb-4">
              Not sure which plan is right?
            </h2>
            <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
              Talk to our team for a free 30-minute consultation. We&apos;ll recommend the exact stack for your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-500 text-white border-0">
                <Link href="/contact">
                  Book Free Consultation <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Link
                href="/services"
                className="inline-flex items-center justify-center h-11 px-8 rounded font-semibold text-sm text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-colors"
              >
                View All Services
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
