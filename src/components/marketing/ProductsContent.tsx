"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MARKETING_MODULES, MARKETING_MODULE_CATEGORIES } from "@/config/marketing";

export function ProductsContent() {
  const params = useSearchParams();
  const activeCategory = params.get("category") ?? "all";

  const filtered = activeCategory === "all"
    ? MARKETING_MODULES
    : MARKETING_MODULES.filter((m) => m.categories.includes(activeCategory));

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative bg-white pt-32 pb-14 lg:pt-40 lg:pb-16 border-b border-gray-100">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(37,99,235,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary-600 mb-4 block">Platform Modules</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-6">
              Everything your
              <br />
              <span className="text-primary-600">business needs</span>
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed max-w-2xl">
              11 integrated modules. One subscription. Built for Indian businesses — from startups to enterprises.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category filter */}
      <section className="sticky top-16 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-hide">
            {MARKETING_MODULE_CATEGORIES.map((cat) => (
              <Link
                key={cat.value}
                href={cat.value === "all" ? "/products" : `/products?category=${cat.value}`}
                className={cn(
                  "shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                  activeCategory === cat.value
                    ? "bg-primary-600 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Module grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-400 mb-8">{filtered.length} module{filtered.length !== 1 ? "s" : ""}</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((mod, i) => {
              const Icon = mod.icon;
              return (
                <motion.div
                  key={mod.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group bg-white border border-gray-200 rounded-xl p-6 hover:border-primary-100 hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300 flex flex-col"
                >
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-5 shadow-sm bg-gradient-to-br", mod.color)}>
                    <Icon className="w-6 h-6 text-white" strokeWidth={1.75} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1.5 group-hover:text-primary-600 transition-colors">
                    {mod.name}
                  </h3>
                  <p className="text-xs font-medium text-gray-400 mb-3">{mod.tagline}</p>
                  <p className="text-sm text-gray-500 leading-relaxed mb-5 flex-1">{mod.description}</p>
                  <ul className="space-y-1.5 mb-6">
                    {mod.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-gray-600">
                        <CheckCircle className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors group/link"
                  >
                    Request a demo
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary-50 border-t border-primary-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Not sure which modules you need?</h2>
            <p className="text-gray-500 text-lg mb-10 max-w-xl mx-auto">
              Book a free 30-minute consultation and we&apos;ll map out the right stack for your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="h-12 px-8 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white border-0 transition-colors">
                <Link href="/contact">Book a Free Demo <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-8 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 bg-white transition-colors">
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
