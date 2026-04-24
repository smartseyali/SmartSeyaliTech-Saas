import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ExternalLink, Loader2, Rocket, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    getActiveDeploymentForCompanyModule,
    type TemplateDeploymentWithJoins,
} from "@/lib/services/deploymentRequestService";

type Props = {
    companyId: number | string | null | undefined;
    moduleId: string;
    /** Optional company subdomain used for the local preview URL. */
    companySubdomain?: string | null;
    /**
     * If true, the iframe fills the available height. Otherwise a fixed aspect
     * ratio is used so it fits neatly above other dashboard content.
     */
    fill?: boolean;
    /** Hide the header bar (title + actions). */
    headless?: boolean;
};

/**
 * Dashboard preview panel for modules that have a template (ecommerce, website).
 *
 * Flow:
 *  - No request yet      → CTA to pick a template.
 *  - status = requested  → iframe shows local /store/:slug preview; banner says "pending deployment".
 *  - status = deployed   → iframe shows deployed_url; banner says "live".
 */
export function TemplatePreviewIframe({
    companyId, moduleId, companySubdomain, fill = false, headless = false,
}: Props) {
    const [deployment, setDeployment] = useState<TemplateDeploymentWithJoins | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!companyId) {
            setLoading(false);
            return;
        }
        let cancelled = false;
        setLoading(true);
        getActiveDeploymentForCompanyModule(companyId, moduleId)
            .then((row) => { if (!cancelled) setDeployment(row); })
            .catch(() => { /* silent — dashboard shouldn't error because of preview */ })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [companyId, moduleId]);

    const previewUrl = useMemo(() => {
        if (!deployment) return null;
        if (deployment.status === "deployed" && deployment.deployed_url) {
            return deployment.deployed_url;
        }
        // Local preview from public/templates/ via the Storefront route.
        // Falls back to direct entry_path if no subdomain is available yet.
        const slug = companySubdomain || `company-${deployment.company_id}`;
        const templateSlug = deployment.template?.slug ?? deployment.template_slug;
        if (slug && templateSlug) {
            return `/store/${encodeURIComponent(slug)}?preview_template=${encodeURIComponent(templateSlug)}`;
        }
        return deployment.template?.entry_path ?? null;
    }, [deployment, companySubdomain]);

    const containerClass = cn(
        "rounded-lg border border-border bg-card overflow-hidden",
        fill ? "flex flex-col h-full" : "",
    );

    if (loading) {
        return (
            <div className={cn(containerClass, "items-center justify-center p-10")}>
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!deployment) {
        return (
            <div className={cn(containerClass, "p-8 text-center space-y-3")}>
                <div className="inline-flex w-10 h-10 items-center justify-center rounded-full bg-primary/10 mx-auto">
                    <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-foreground">Pick a template to get started</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Choose a storefront, enter your custom domain, and the super admin will deploy it for you.
                    </p>
                </div>
                <Button asChild size="sm">
                    <Link to={`/apps/${moduleId}/setup/template`}>
                        <Rocket className="w-3.5 h-3.5" /> Pick a template
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className={containerClass}>
            {!headless && (
                <div className="flex items-center justify-between gap-3 px-3 h-10 border-b border-border bg-muted/30">
                    <div className="flex items-center gap-2 text-xs min-w-0">
                        <span
                            className={cn(
                                "inline-flex items-center gap-1 h-5 px-2 rounded-full font-semibold text-[10px] uppercase tracking-wide shrink-0",
                                deployment.status === "deployed"
                                    ? "bg-success/15 text-success"
                                    : "bg-primary/15 text-primary",
                            )}
                        >
                            {deployment.status === "deployed" ? "Live" : "Pending"}
                        </span>
                        <code className="text-[11px] text-muted-foreground truncate">
                            {deployment.status === "deployed"
                                ? (deployment.deployed_url ?? deployment.custom_domain)
                                : deployment.custom_domain}
                        </code>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                        <Button asChild size="sm" variant="ghost">
                            <Link to={`/apps/${moduleId}/setup/template`}>
                                Change template
                            </Link>
                        </Button>
                        {previewUrl && (
                            <Button asChild size="sm" variant="outline">
                                <a href={previewUrl} target="_blank" rel="noreferrer">
                                    Open <ExternalLink className="w-3 h-3" />
                                </a>
                            </Button>
                        )}
                    </div>
                </div>
            )}

            <div className={cn(fill ? "flex-1 min-h-[360px]" : "aspect-[16/10]")}>
                {previewUrl ? (
                    <iframe
                        src={previewUrl}
                        title={`${moduleId} template preview`}
                        className="w-full h-full border-0 bg-background"
                        // sandbox keeps the preview from messing with the admin session
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                        loading="lazy"
                    />
                ) : (
                    <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                        Preview unavailable.
                        <Button asChild size="sm" variant="link" className="ml-2">
                            <Link to={`/apps/${moduleId}/setup/template`}>
                                Pick a template <ArrowUpRight className="w-3 h-3" />
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
