"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight, CheckCircle,
  ShoppingCart, DollarSign, Settings, Users, UserCheck, BarChart3,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type ModuleTab = {
  id: string; label: string; icon: LucideIcon; color: string; bg: string;
  title: string; description: string; bullets: string[];
};

const MODULE_TABS: ModuleTab[] = [
  { id: "commerce", label: "Commerce", icon: ShoppingCart, color: "text-teal-600", bg: "bg-blue-50",
    title: "Unified Commerce Platform",
    description: "Manage your online store, point-of-sale, and inventory from a single dashboard. Real-time sync across all channels.",
    bullets: ["Multi-channel order management", "Live inventory tracking", "Integrated POS & storefront", "Smart discount & pricing rules"] },
  { id: "finance", label: "Finance", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50",
    title: "Finance & Accounting",
    description: "Automate invoicing, expense tracking, and financial reporting. Close books faster with AI-powered reconciliation.",
    bullets: ["Automated invoicing & billing", "Real-time P&L dashboards", "GST & tax compliance", "Multi-currency support"] },
  { id: "operations", label: "Operations", icon: Settings, color: "text-orange-600", bg: "bg-orange-50",
    title: "Supply Chain & Logistics",
    description: "Streamline procurement, warehousing, and vendor management. Reduce lead times and optimize stock levels automatically.",
    bullets: ["Purchase order automation", "Vendor performance tracking", "Warehouse management", "Demand forecasting"] },
  { id: "people", label: "HRMS", icon: Users, color: "text-violet-600", bg: "bg-violet-50",
    title: "Human Resource Management",
    description: "From hiring to payroll, manage your entire workforce in one place. Compliant with Indian labour laws.",
    bullets: ["Payroll & attendance automation", "Leave & policy management", "Employee self-service portal", "Performance appraisals"] },
  { id: "customer", label: "CRM", icon: UserCheck, color: "text-pink-600", bg: "bg-pink-50",
    title: "Customer Relationship Management",
    description: "Track leads, manage pipelines, and close deals faster with built-in sales automation and customer insights.",
    bullets: ["Visual sales pipeline", "Lead scoring & nurturing", "WhatsApp & email integration", "Customer lifetime analytics"] },
  { id: "analytics", label: "Analytics", icon: BarChart3, color: "text-cyan-600", bg: "bg-cyan-50",
    title: "Business Intelligence & Reports",
    description: "Turn raw data into actionable insights. Build custom dashboards and schedule automated reports for every team.",
    bullets: ["Drag-and-drop dashboard builder", "Scheduled email reports", "Cross-module data views", "Export to Excel / PDF"] },
];

export function ModuleTabs() {
  const [activeTab, setActiveTab] = useState("commerce");
  const activeModule = MODULE_TABS.find((m) => m.id === activeTab) || MODULE_TABS[0];
  const Icon = activeModule.icon;

  return (
    <>
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {MODULE_TABS.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded text-sm font-medium transition-all border ${isActive ? "bg-white border-primary-600 text-primary-600 shadow-sm" : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700"}`}>
              <TabIcon className="w-4 h-4" />{tab.label}
            </button>
          );
        })}
      </div>

      <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="grid lg:grid-cols-2 gap-10 items-center bg-white border border-gray-200 rounded-xl p-8 lg:p-12 shadow-sm">
        <div>
          <div className={`inline-flex items-center justify-center w-12 h-12 ${activeModule.bg} rounded-lg mb-6`}>
            <Icon className={`w-6 h-6 ${activeModule.color}`} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">{activeModule.title}</h3>
          <p className="text-gray-500 leading-relaxed mb-8">{activeModule.description}</p>
          <ul className="space-y-3">
            {activeModule.bullets.map((bullet) => (
              <li key={bullet} className="flex items-center gap-3 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-primary-600 shrink-0" />{bullet}
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <Button asChild size="sm">
              <Link href="/services">Explore {activeModule.label} <ArrowRight className="ml-2 h-3.5 w-3.5" /></Link>
            </Button>
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 min-h-[280px]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-gray-700">{activeModule.title}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${activeModule.bg} ${activeModule.color}`}>Live</span>
          </div>
          <div className="space-y-3">
            {activeModule.bullets.map((bullet, i) => (
              <div key={i} className="flex items-center gap-3 bg-white border border-gray-100 rounded-lg p-3">
                <div className={`w-2 h-2 rounded-full ${activeModule.color.replace("text-", "bg-")}`} />
                <span className="text-xs text-gray-600">{bullet}</span>
                <CheckCircle className="w-3 h-3 text-gray-300 ml-auto" />
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
}
