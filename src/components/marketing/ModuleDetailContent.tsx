"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MODULES } from "./FeaturesContent";

export function ModuleDetailContent({ slug }: { slug: string }) {
  const mod = MODULES.find((m) => m.slug === slug);

  if (!mod) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Module Not Found</h1>
          <Button asChild variant="outline">
            <Link href="/products"><ArrowLeft className="mr-2 h-4 w-4" />Back to Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <section className="relative bg-white pt-32 pb-16 lg:pt-40 lg:pb-20 border-b border-gray-100">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(37,99,235,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-3xl">
            <Link href="/products" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" /> All Modules
            </Link>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary-600 mb-4 block">Platform Module</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-6">
              {mod.name}
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed max-w-2xl">{mod.tagline}</p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>
              <ul className="space-y-4">
                {mod.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle className="w-5 h-5 text-primary-600 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-10 flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg">
                  <Link href="/contact">Request a Demo <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/pricing">View Pricing</Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className={`rounded-2xl p-10 bg-gradient-to-br ${mod.color} text-white`}
            >
              <h3 className="text-xl font-bold mb-6">{mod.name} at a glance</h3>
              <div className="space-y-4">
                {mod.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3 bg-white/10 rounded-lg px-4 py-3">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span className="text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary-50 border-t border-primary-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to get started with {mod.name}?</h2>
            <p className="text-gray-500 text-lg mb-10 max-w-xl mx-auto">
              Book a free demo and see exactly how this module fits your business.
            </p>
            <Button asChild size="lg" className="h-12 px-8">
              <Link href="/contact">Book a Free Demo <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
