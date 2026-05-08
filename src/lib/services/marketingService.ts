// Fetches platform-level marketing content from Supabase.
// All tables here are publicly readable (no auth required).
//
// Pricing tables:
//   pricing_plans   → subscription bundle tiers (Starter / Growth / Enterprise)
//                     managed via /super-admin/plans
//   system_modules  → individual app/module pricing (price_monthly, is_free, is_core)
//                     managed via /super-admin/modules

import { supabase } from "@/lib/supabase";

export type PlatformTestimonial = {
  id: string;
  author_name: string;
  author_role: string | null;
  company: string | null;
  quote: string;
  rating: number;
  sort_order: number;
};

export type PlatformClientLogo = {
  id: string;
  name: string;
  logo_url: string | null;
  sort_order: number;
};

export type PlatformFaq = {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
};

// Subscription bundle tier — stored in pricing_plans table
export type PricingPlan = {
  id: string;
  name: string;
  tagline: string | null;
  price_monthly: number;
  price_yearly: number;
  is_highlighted: boolean;
  cta_label: string;
  cta_href: string | null;
  features: string[];
  not_included: string[];
  modules_included: string[];
  sort_order: number;
  trial_days: number;
};

// Module metadata — stored in system_modules table.
export type SystemModule = {
  slug: string;
  name: string;
  tagline: string | null;
  features: string[];
  color_from: string | null;
  color_to: string | null;
  category: string | null;
  sort_order: number;
  price_monthly: number;
  price_yearly: number;
  is_free: boolean;
  is_core: boolean;
  trial_days: number;
};

export async function getMarketingTestimonials(): Promise<PlatformTestimonial[]> {
  const { data, error } = await supabase
    .from("platform_testimonials")
    .select("id, author_name, author_role, company, quote, rating, sort_order")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getClientLogos(): Promise<PlatformClientLogo[]> {
  const { data, error } = await supabase
    .from("platform_client_logos")
    .select("id, name, logo_url, sort_order")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

// Tenant showcase — active businesses running on the platform.
// Reads from companies via a SECURITY DEFINER function to bypass RLS on the public marketing page.
export type TenantShowcase = {
  name: string;
  logo_url: string | null;
};

export async function getTenantShowcase(): Promise<TenantShowcase[]> {
  const { data, error } = await supabase.rpc("fn_public_tenant_showcase");
  if (error) return [];
  return (data ?? []).map((row: any) => ({
    name:     row.name     ?? "",
    logo_url: row.logo_url ?? null,
  })).filter((t: TenantShowcase) => t.name);
}

export async function getMarketingFaqs(category?: string): Promise<PlatformFaq[]> {
  let query = supabase
    .from("platform_faqs")
    .select("id, question, answer, category, sort_order")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (category) query = query.eq("category", category);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

// Reads subscription bundle tiers from pricing_plans.
// Managed via /super-admin/plans.
export async function getPricingPlans(): Promise<PricingPlan[]> {
  const { data, error } = await supabase
    .from("pricing_plans")
    .select("id, name, tagline, price_monthly, price_yearly, is_highlighted, cta_label, cta_href, features, not_included, modules_included, sort_order, trial_days")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;

  const toStringArray = (val: any): string[] => {
    const arr = Array.isArray(val) ? val : (() => { try { return JSON.parse(val ?? "[]"); } catch { return []; } })();
    return arr.map((v: any) => (typeof v === "string" ? v : JSON.stringify(v)));
  };

  return (data ?? []).map((row) => ({
    ...row,
    features:          toStringArray(row.features),
    not_included:      toStringArray(row.not_included),
    modules_included:  toStringArray(row.modules_included),
    cta_label:         row.cta_label ?? "Get Started",
    trial_days:        row.trial_days ?? 14,
  }));
}

// Reads active module metadata from system_modules (metadata only — no pricing columns).
// Pricing for the individual-app section of the pricing page falls back to
// PLATFORM_MODULES config in mergeModulePrices() inside PricingContent.
export async function getSystemModules(): Promise<SystemModule[]> {
  const { data, error } = await supabase
    .from("system_modules")
    .select("slug, name, tagline, features, color_from, color_to, category, sort_order, price_monthly, price_yearly, is_free, is_core, trial_days")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) return [];

  return (data ?? []).map((row) => ({
    ...row,
    features:      Array.isArray(row.features) ? row.features : [],
    price_monthly: row.price_monthly ?? 0,
    price_yearly:  row.price_yearly  ?? 0,
    is_free:       row.is_free       ?? false,
    is_core:       row.is_core       ?? false,
    trial_days:    row.trial_days    ?? 14,
  }));
}

// Platform-level tax config — stored in platform_settings (singleton id=1).
export type PlatformTaxConfig = {
  tax_label:    string;
  tax_rate:     number;
  tax_included: boolean;
};

export async function getPlatformTaxConfig(): Promise<PlatformTaxConfig> {
  const { data } = await supabase
    .from("platform_settings")
    .select("tax_label, tax_rate, tax_included")
    .eq("id", 1)
    .maybeSingle();
  return {
    tax_label:    data?.tax_label    ?? "GST",
    tax_rate:     data?.tax_rate     ?? 18,
    tax_included: data?.tax_included ?? false,
  };
}

// Reads from the site_info view which exposes only safe marketing columns
export type SiteInfo = {
  contact_email: string;
  contact_phone: string;
  contact_whatsapp: string;
  contact_address: string;
  contact_address_detail: string;
  contact_hours: string;
  contact_hours_sub: string;
  stat_clients_raw: number;
  stat_modules_raw: number;
  stat_uptime_raw: number;
  stat_support_raw: number;
};

export async function getPlatformSettings(_keys?: string[]): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from("site_info")
    .select("*")
    .single();

  if (error) throw error;

  const row = (data ?? {}) as Partial<SiteInfo>;
  return Object.fromEntries(
    Object.entries(row).map(([k, v]) => [k, String(v ?? "")])
  );
}
