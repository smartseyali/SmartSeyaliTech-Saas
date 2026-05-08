"use client";

import { useState, useEffect } from "react";
import {
  getMarketingTestimonials,
  getClientLogos,
  getMarketingFaqs,
  getPricingPlans,
  getPlatformSettings,
  getSystemModules,
  getPlatformTaxConfig,
  getTenantShowcase,
  type PlatformTestimonial,
  type PlatformClientLogo,
  type PlatformFaq,
  type PricingPlan,
  type SystemModule,
  type PlatformTaxConfig,
  type TenantShowcase,
} from "@/lib/services/marketingService";

export function useMarketingTestimonials() {
  const [data, setData]       = useState<PlatformTestimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMarketingTestimonials()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { testimonials: data, loading };
}

export function useClientLogos() {
  const [data, setData]       = useState<PlatformClientLogo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClientLogos()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { logos: data, loading };
}

export function useTenantShowcase() {
  const [data, setData]       = useState<TenantShowcase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTenantShowcase()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { tenants: data, loading };
}

export function useMarketingFaqs(category?: string) {
  const [data, setData]       = useState<PlatformFaq[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMarketingFaqs(category)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category]);

  return { faqs: data, loading };
}

// Returns subscription bundle tiers from pricing_plans table
export function usePricingPlans() {
  const [data, setData]       = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    getPricingPlans()
      .then(setData)
      .catch((err) => setError(err?.message ?? "Failed to load plans"))
      .finally(() => setLoading(false));
  }, []);

  return { plans: data, loading, error };
}

// Returns active modules with pricing from system_modules table
export function useSystemModules() {
  const [data, setData]       = useState<SystemModule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSystemModules()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { modules: data, loading };
}

export function usePlatformTaxConfig() {
  const [data, setData] = useState<PlatformTaxConfig>({ tax_label: "GST", tax_rate: 18, tax_included: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPlatformTaxConfig()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { taxConfig: data, loading };
}

export function usePlatformSettings(keys: string[]) {
  const [data, setData]       = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const keyStr = keys.join(",");

  useEffect(() => {
    getPlatformSettings(keys)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyStr]);

  return { settings: data, loading };
}
