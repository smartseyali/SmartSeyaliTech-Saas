/**
 * DashboardTemplate — Standardized module dashboard layout
 *
 * Provides consistent header, KPI cards, and content areas
 * across all module dashboards (Sales, Inventory, HRMS, etc.)
 */
import { cn } from "@/lib/utils";
import { useTenant } from "@/contexts/TenantContext";
import type { LucideIcon } from "lucide-react";

/* ── Types ─────────────────────────────────────────────────────────────────── */

export interface KPICard {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: string;   // e.g. "text-blue-600"
  bg: string;       // e.g. "bg-blue-50"
}

interface DashboardTemplateProps {
  title: string;
  subtitle?: string;
  accentColor?: string;  // Tailwind border color class, e.g. "border-blue-600"
  dotColor?: string;     // Tailwind bg color for the pulsing dot, e.g. "bg-blue-600"
  kpis?: KPICard[];
  actions?: React.ReactNode;
  children: React.ReactNode;
}

/* ── Component ─────────────────────────────────────────────────────────────── */

export default function DashboardTemplate({
  title,
  subtitle,
  accentColor = "border-blue-600",
  dotColor = "bg-blue-600",
  kpis,
  actions,
  children,
}: DashboardTemplateProps) {
  const { activeCompany } = useTenant();

  return (
    <div className="min-h-screen bg-slate-50/30 font-sans">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div className="space-y-1">
            <h1
              className={cn(
                "text-xl font-bold tracking-tight text-slate-900 border-l-4 pl-3",
                accentColor
              )}
            >
              {title}
            </h1>
            <div className="flex items-center gap-2 pl-3">
              <div
                className={cn("w-1.5 h-1.5 rounded-full animate-pulse", dotColor)}
              />
              <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                {subtitle || "Live Dashboard"} &bull; {activeCompany?.name || "—"}
              </p>
            </div>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>

        {/* ── KPI Cards ───────────────────────────────────────────────────── */}
        {kpis && kpis.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((k) => (
              <div
                key={k.label}
                className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("p-2 rounded-lg", k.bg)}>
                    <k.icon className={cn("w-4 h-4", k.color)} />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    {k.label}
                  </span>
                </div>
                <p className="text-xl font-bold text-slate-900 tabular-nums">
                  {k.value}
                </p>
                {k.subtitle && (
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-1">
                    {k.subtitle}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Content ─────────────────────────────────────────────────────── */}
        {children}
      </div>
    </div>
  );
}
