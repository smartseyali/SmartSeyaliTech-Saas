import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";

import { supabase } from "@/lib/supabase";
import type { StorefrontTemplate, TemplateConfigOverrides } from "@/types/storefront";

type ResolvedTenant = {
    company_id: number | string;
    company_name: string;
    template: StorefrontTemplate;
    overrides: TemplateConfigOverrides;
};

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string) || "";
const ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || "";

/**
 * Public storefront renderer.
 *
 *   /store/:slug                     → live: company's active_template
 *   /store/:slug?preview_template=X  → preview: force template slug X
 *
 * The route looks up the tenant's active template, builds the static template
 * URL with runtime config appended as query params, and renders it in a
 * full-viewport iframe. Templates read company_id / supabase_url / anon_key
 * from the query string in their own config.js bootstrapper.
 */
export default function Storefront() {
    const { slug } = useParams<{ slug: string }>();
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
                if (!slug) throw new Error("No store specified");

                const { data: company, error: companyErr } = await supabase
                    .from("companies")
                    .select("id, name, subdomain, active_template_id, template_config")
                    .eq("subdomain", slug)
                    .maybeSingle();

                if (companyErr) throw companyErr;
                if (!company) throw new Error(`Store "${slug}" not found`);

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

                if (cancelled) return;
                setTenant({
                    company_id: company.id,
                    company_name: company.name,
                    template,
                    overrides: (company.template_config as TemplateConfigOverrides) || {},
                });
            } catch (err: any) {
                if (!cancelled) setError(err?.message || "Failed to load storefront");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [slug, previewTemplateSlug]);

    const iframeUrl = useMemo(() => {
        if (!tenant) return null;
        const params = new URLSearchParams({
            company_id: String(tenant.company_id),
            supabase_url: SUPABASE_URL,
            anon_key: ANON_KEY,
            template_slug: tenant.template.slug,
        });
        if (tenant.overrides && Object.keys(tenant.overrides).length > 0) {
            params.set("overrides", encodeURIComponent(JSON.stringify(tenant.overrides)));
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
