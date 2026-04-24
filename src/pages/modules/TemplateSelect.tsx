import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import { toast } from "sonner";
import {
    ArrowLeft, Check, ExternalLink, Eye, Loader2, Search, Sparkles, Tag,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useTenant } from "@/contexts/TenantContext";
import { getModule } from "@/config/modules";
import {
    listTemplates,
} from "@/lib/services/storefrontTemplateService";
import type { StorefrontTemplate, TemplateConfigOverrides } from "@/types/storefront";
import { cn } from "@/lib/utils";
import { TemplateDeployDialog } from "@/components/templates/TemplateDeployDialog";
import { ErrorBoundary } from "@/components/ErrorBoundary";

/**
 * Tenant-facing template picker.
 *
 *   /apps/:moduleId/setup/template?return=<url>
 *
 * Lists storefront templates filtered by the module's category, lets the
 * tenant preview them and select one. Selection writes to
 * companies.active_template_id and redirects to `return` (or the module
 * dashboard).
 */
export default function TemplateSelect() {
    return (
        <ErrorBoundary label="Template picker">
            <TemplateSelectInner />
        </ErrorBoundary>
    );
}

function TemplateSelectInner() {
    const navigate = useNavigate();
    const { moduleId = "" } = useParams<{ moduleId: string }>();
    const [searchParams] = useSearchParams();
    const returnTo = searchParams.get("return");
    const { activeCompany } = useTenant();

    const module = useMemo(() => getModule(moduleId), [moduleId]);

    const [templates, setTemplates] = useState<StorefrontTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [deployFor, setDeployFor] = useState<StorefrontTemplate | null>(null);
    const [initialOverrides, setInitialOverrides] = useState<TemplateConfigOverrides>({});

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        listTemplates({ moduleId })
            .then((rows) => {
                if (cancelled) return;
                setTemplates(rows);
                const currentId = (activeCompany as any)?.active_template_id ?? null;
                if (currentId) setSelectedId(Number(currentId));
            })
            .catch((err) => toast.error(err?.message || "Failed to load templates"))
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [moduleId, activeCompany?.id]);

    const categories = useMemo(() => {
        const set = new Set<string>();
        templates.forEach((t) => set.add(t.category));
        return ["all", ...Array.from(set)];
    }, [templates]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return templates.filter((t) => {
            if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
            if (!q) return true;
            return (
                t.name.toLowerCase().includes(q) ||
                (t.description ?? "").toLowerCase().includes(q) ||
                (t.tags ?? []).some((tag) => tag.toLowerCase().includes(q))
            );
        });
    }, [templates, query, categoryFilter]);

    const openDeployDialog = (template: StorefrontTemplate) => {
        if (!activeCompany?.id) {
            toast.error("No active company. Please select a company first.");
            return;
        }
        const existing = ((activeCompany as any)?.template_config as TemplateConfigOverrides) || {};
        setInitialOverrides(existing);
        setDeployFor(template);
    };

    const handleDeployed = () => {
        if (deployFor) setSelectedId(deployFor.id);
        if (returnTo) {
            setTimeout(() => navigate(returnTo, { replace: true }), 600);
        }
    };

    const handlePreview = (template: StorefrontTemplate) => {
        if (!activeCompany?.subdomain) {
            window.open(template.entry_path, "_blank", "noopener");
            return;
        }
        window.open(
            `/store/${activeCompany.subdomain}?preview_template=${template.slug}`,
            "_blank",
            "noopener",
        );
    };

    return (
        <div className="min-h-full bg-background">
            {/* Toolbar */}
            <div className="sticky top-0 z-30 bg-card border-b border-border">
                <div className="max-w-6xl mx-auto px-5 py-3 flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(module?.dashboardRoute || "/apps")}
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back
                    </Button>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-base font-semibold text-foreground flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" /> Pick a storefront template
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            {module?.name ? `for ${module.name}` : moduleId}
                            {activeCompany?.name ? ` · ${activeCompany.name}` : ""}
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-5 py-6 space-y-5">
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[220px] max-w-sm">
                        <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <Input
                            placeholder="Search templates…"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {categories.map((c) => (
                            <button
                                key={c}
                                onClick={() => setCategoryFilter(c)}
                                className={cn(
                                    "h-8 px-3 rounded-md text-xs font-medium capitalize transition-colors border",
                                    categoryFilter === c
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-card text-foreground border-border hover:bg-accent",
                                )}
                            >
                                {c === "all" ? "All" : c.replace("_", " ")}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="py-24 flex justify-center">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-24 text-center">
                        <p className="text-sm text-muted-foreground">No templates match your filters.</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Super-admin can add templates in <Link className="text-primary hover:underline" to="/super-admin/templates">Platform → Templates</Link>.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((t) => {
                            const selected = selectedId === t.id;
                            return (
                                <div
                                    key={t.id}
                                    className={cn(
                                        "group bg-card rounded-xl border overflow-hidden transition-all",
                                        selected
                                            ? "border-primary ring-2 ring-primary/30 shadow-md"
                                            : "border-border hover:border-gray-300 hover:shadow-md",
                                    )}
                                >
                                    {/* Thumbnail */}
                                    <div className="aspect-[16/10] bg-muted relative overflow-hidden">
                                        {t.thumbnail_url ? (
                                            <img
                                                src={t.thumbnail_url}
                                                alt={t.name}
                                                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                                                onError={(e) => {
                                                    (e.currentTarget as HTMLImageElement).style.display = "none";
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Sparkles className="w-6 h-6 text-muted-foreground/40" />
                                            </div>
                                        )}
                                        {selected && (
                                            <div className="absolute top-2 right-2 h-7 px-2.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold inline-flex items-center gap-1 shadow-sm">
                                                <Check className="w-3 h-3" /> Active
                                            </div>
                                        )}
                                        {t.is_premium && (
                                            <div className="absolute top-2 left-2 h-7 px-2.5 rounded-full bg-yellow-500 text-white text-xs font-semibold inline-flex items-center gap-1 shadow-sm">
                                                <Tag className="w-3 h-3" /> Premium
                                            </div>
                                        )}
                                    </div>

                                    {/* Body */}
                                    <div className="p-4 space-y-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="text-sm font-semibold text-foreground">{t.name}</h3>
                                            <Badge variant="secondary" className="capitalize shrink-0">
                                                {t.category.replace("_", " ")}
                                            </Badge>
                                        </div>
                                        {t.description && (
                                            <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
                                                {t.description}
                                            </p>
                                        )}
                                        {(t.features?.length ?? 0) > 0 && (
                                            <div className="flex flex-wrap gap-1 pt-0.5">
                                                {t.features.slice(0, 3).map((f) => (
                                                    <span
                                                        key={f}
                                                        className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                                                    >
                                                        {f}
                                                    </span>
                                                ))}
                                                {t.features.length > 3 && (
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                                        +{t.features.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="px-4 pb-4 flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => handlePreview(t)}
                                        >
                                            <Eye className="w-3.5 h-3.5" /> Preview
                                            <ExternalLink className="w-3 h-3 opacity-60" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => openDeployDialog(t)}
                                        >
                                            {selected ? (
                                                <>
                                                    <Check className="w-3.5 h-3.5" /> Re-deploy
                                                </>
                                            ) : (
                                                "Use this template"
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <TemplateDeployDialog
                open={!!deployFor}
                onOpenChange={(open) => { if (!open) setDeployFor(null); }}
                template={deployFor}
                companyId={activeCompany?.id ?? null}
                companyName={activeCompany?.name || ""}
                initialOverrides={initialOverrides}
                onDeployed={handleDeployed}
            />
        </div>
    );
}
