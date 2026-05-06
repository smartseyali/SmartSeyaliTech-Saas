import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";

import { supabase } from "@/lib/supabase";
import type { StorefrontTemplate, TemplateConfigOverrides } from "@/types/storefront";

type AnalyticsConfig = {
    ga4_measurement_id?: string;
    gtm_container_id?: string;
    meta_pixel_id?: string;
    clarity_project_id?: string;
    custom_head_scripts?: string;
    custom_body_scripts?: string;
};

type ResolvedTenant = {
    company_id: number | string;
    company_name: string;
    template: StorefrontTemplate;
    overrides: TemplateConfigOverrides;
    analyticsConfig: AnalyticsConfig;
};

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string) || "";
const ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || "";
const PLATFORM_HOST = (import.meta.env.VITE_PLATFORM_HOST as string) || "localhost";
const PLATFORM_BASE_DOMAIN = (import.meta.env.VITE_PLATFORM_BASE_DOMAIN as string) || "";

/**
 * Public storefront renderer — resolves tenant from hostname only.
 *
 *   pattikadai.smartseyali.com            → live store (platform subdomain)
 *   pattikadai.smartseyali.com?preview_template=X → admin template preview
 *   www.customdomain.com                  → custom domain (via hostinger_domains)
 *
 * Tenant is resolved from window.location.hostname. The route /store/:slug
 * is intentionally removed — all stores are served via subdomain.
 */
export default function Storefront() {
    const [searchParams] = useSearchParams();
    const previewTemplateSlug = searchParams.get("preview_template");

    const [tenant, setTenant] = useState<ResolvedTenant | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const hostname = window.location.hostname;

                // Resolve company from hostname
                let companyQuery = supabase
                    .from("companies")
                    .select("id, name, subdomain, active_template_id, template_config");

                if (PLATFORM_BASE_DOMAIN && hostname.endsWith(`.${PLATFORM_BASE_DOMAIN}`)) {
                    // Platform subdomain: pattikadai.smartseyali.com → subdomain = "pattikadai"
                    const subdomain = hostname.slice(0, -(PLATFORM_BASE_DOMAIN.length + 1));
                    companyQuery = companyQuery.eq("subdomain", subdomain);
                } else {
                    // Fully custom domain (purchased via Hostinger) → lookup via hostinger_domains
                    const { data: hd } = await supabase
                        .from("hostinger_domains")
                        .select("company_id")
                        .eq("domain", hostname)
                        .eq("status", "active")
                        .maybeSingle();
                    if (!hd) throw new Error(`No store found for domain "${hostname}"`);
                    companyQuery = companyQuery.eq("id", hd.company_id);
                }

                const { data: company, error: companyErr } = await companyQuery.maybeSingle();
                if (companyErr) throw companyErr;
                if (!company) throw new Error("Store not found");

                let template: StorefrontTemplate | null = null;

                if (previewTemplateSlug) {
                    const { data } = await supabase
                        .from("storefront_templates")
                        .select("*")
                        .eq("slug", previewTemplateSlug)
                        .eq("is_active", true)
                        .maybeSingle();
                    template = data as StorefrontTemplate | null;
                } else if (company.active_template_id) {
                    const { data } = await supabase
                        .from("storefront_templates")
                        .select("*")
                        .eq("id", company.active_template_id)
                        .eq("is_active", true)
                        .maybeSingle();
                    template = data as StorefrontTemplate | null;
                }

                if (!template) {
                    throw new Error(
                        previewTemplateSlug
                            ? `Template "${previewTemplateSlug}" not found`
                            : "This store has not selected a template yet.",
                    );
                }

                // Fetch analytics config from ecom_settings
                const { data: ecomSettings } = await supabase
                    .from("ecom_settings")
                    .select("integrations, custom_head_scripts, custom_body_scripts")
                    .eq("company_id", company.id)
                    .maybeSingle();

                const analyticsConfig: AnalyticsConfig = {};
                const integrations = ecomSettings?.integrations || {};
                if (integrations.ga4_measurement_id) analyticsConfig.ga4_measurement_id = integrations.ga4_measurement_id;
                if (integrations.gtm_container_id) analyticsConfig.gtm_container_id = integrations.gtm_container_id;
                if (integrations.meta_pixel_id) analyticsConfig.meta_pixel_id = integrations.meta_pixel_id;
                if (integrations.clarity_project_id) analyticsConfig.clarity_project_id = integrations.clarity_project_id;
                if (ecomSettings?.custom_head_scripts) analyticsConfig.custom_head_scripts = ecomSettings.custom_head_scripts;
                if (ecomSettings?.custom_body_scripts) analyticsConfig.custom_body_scripts = ecomSettings.custom_body_scripts;

                if (cancelled) return;
                setTenant({
                    company_id: company.id,
                    company_name: company.name,
                    template,
                    overrides: (company.template_config as TemplateConfigOverrides) || {},
                    analyticsConfig,
                });
            } catch (err: any) {
                if (!cancelled) setError(err?.message || "Failed to load storefront");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [previewTemplateSlug]);

    const iframeUrl = useMemo(() => {
        if (!tenant) return null;
        const params = new URLSearchParams({
            company_id: String(tenant.company_id),
            supabase_url: SUPABASE_URL,
            anon_key: ANON_KEY,
            template_slug: tenant.template.slug,
        });
        const mergedOverrides: Record<string, unknown> = { ...(tenant.overrides || {}) };
        if (Object.keys(tenant.analyticsConfig).length > 0) {
            mergedOverrides.analyticsConfig = tenant.analyticsConfig;
        }
        if (Object.keys(mergedOverrides).length > 0) {
            params.set("overrides", encodeURIComponent(JSON.stringify(mergedOverrides)));
        }
        const entry = tenant.template.entry_path.startsWith("/")
            ? tenant.template.entry_path
            : `/${tenant.template.entry_path}`;
        return `${entry}?${params.toString()}`;
    }, [tenant]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
        );
    }

    if (error || !tenant || !iframeUrl) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background px-4">
                <div className="max-w-md w-full text-center bg-card border border-border rounded-xl p-6 shadow-sm">
                    <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-destructive/10 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-destructive" />
                    </div>
                    <h1 className="text-lg font-semibold text-foreground mb-1">Storefront unavailable</h1>
                    <p className="text-sm text-muted-foreground">{error || "This storefront is not configured."}</p>
                </div>
            </div>
        );
    }

    return (
        <iframe
            title={`${tenant.company_name} storefront`}
            src={iframeUrl}
            className="fixed inset-0 w-screen h-screen border-0"
            allow="clipboard-read; clipboard-write; geolocation; payment"
        />
    );
}
