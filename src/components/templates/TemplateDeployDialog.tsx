import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
    Check, CheckCircle2, ChevronRight, Copy, ExternalLink,
    Globe, Loader2, ShieldCheck, ShoppingCart, Wifi, Zap,
} from "lucide-react";

import {
    Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import type { StorefrontTemplate, TemplateConfigOverrides } from "@/types/storefront";
import { setActiveTemplateForCompany } from "@/lib/services/storefrontTemplateService";
import {
    createDeploymentRequest,
    getActiveDeploymentForCompanyModule,
} from "@/lib/services/deploymentRequestService";

type DomainChoice = "subdomain" | "buy" | "existing";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    template: StorefrontTemplate | null;
    companyId: number | string | null;
    companyName: string;
    companySubdomain?: string;
    moduleId: string;
    initialOverrides?: TemplateConfigOverrides;
    initialCustomDomain?: string;
    onRequested?: () => void;
};

const PLATFORM_BASE_DOMAIN = (import.meta.env.VITE_PLATFORM_BASE_DOMAIN as string) || "smartseyali.com";

function slugify(str: string): string {
    return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function TemplateDeployDialog({
    open, onOpenChange, template, companyId, companyName, companySubdomain,
    moduleId, initialOverrides, initialCustomDomain, onRequested,
}: Props) {
    const navigate = useNavigate();

    const [choice, setChoice] = useState<DomainChoice>("subdomain");
    const [subdomainInput, setSubdomainInput] = useState("");
    const [customDomain, setCustomDomain] = useState("");
    const [values, setValues] = useState<TemplateConfigOverrides>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState<{ url: string } | null>(null);
    const [slugError, setSlugError] = useState("");

    type SchemaField = {
        type?: string; label?: string; required?: boolean;
        default?: string; placeholder?: string;
    };

    const schema = useMemo(() => {
        const raw = template?.config_schema;
        if (!raw) return {};
        if (typeof raw === "string") { try { return JSON.parse(raw); } catch { return {}; } }
        if (typeof raw !== "object") return {};
        return raw as Record<string, SchemaField>;
    }, [template?.id]);

    const fields = useMemo(
        () => Object.entries(schema)
            .filter(([, f]) => f && typeof f === "object")
            .map(([k, f]) => [k, f as SchemaField] as const),
        [schema],
    );

    useEffect(() => {
        if (!open) { setSubmitted(null); setSlugError(""); return; }

        const initial: TemplateConfigOverrides = {};
        for (const [key, raw] of Object.entries(schema)) {
            const field = raw as SchemaField;
            const override = initialOverrides?.[key];
            if (override !== undefined && override !== null) initial[key] = override;
            else if (key === "storeName" && companyName) initial[key] = companyName;
            else if (field?.default !== undefined) initial[key] = field.default;
        }
        setValues(initial);
        setSubdomainInput(companySubdomain || slugify(companyName) || "");

        if (initialCustomDomain) {
            if (initialCustomDomain.endsWith(`.${PLATFORM_BASE_DOMAIN}`)) {
                setChoice("subdomain");
            } else {
                setChoice("existing");
                setCustomDomain(initialCustomDomain);
            }
        } else {
            setChoice("subdomain");
        }
    }, [open, template?.id, companyName, companySubdomain]);

    const subdomainSlug = useMemo(() => slugify(subdomainInput), [subdomainInput]);
    const subdomainUrl = `${subdomainSlug || "yourstore"}.${PLATFORM_BASE_DOMAIN}`;

    const customDomainValid = useMemo(() => {
        const d = customDomain.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
        return /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/i.test(d);
    }, [customDomain]);

    const canSubmit = useMemo(() => {
        if (choice === "subdomain") return subdomainSlug.length >= 2;
        if (choice === "existing") {
            if (!customDomainValid) return false;
            for (const [key, field] of fields) {
                if (field?.required && !String(values[key] ?? "").trim()) return false;
            }
            return true;
        }
        return false;
    }, [choice, subdomainSlug, customDomainValid, fields, values]);

    if (!template) return null;

    const handleFieldChange = (key: string, val: string) =>
        setValues((v) => ({ ...v, [key]: val }));

    const handleBuyDomain = async () => {
        if (!companyId) return;
        try { await setActiveTemplateForCompany(companyId, template.id, values); } catch { /* non-critical */ }
        onOpenChange(false);
        navigate("/apps/ecommerce/domain");
    };

    const handleSubmit = async () => {
        if (!companyId || !canSubmit) return;
        setSubmitting(true);
        setSlugError("");
        try {
            const existing = await getActiveDeploymentForCompanyModule(companyId, moduleId);
            if (existing?.status === "deployed") {
                const ok = window.confirm(
                    "Your module is already deployed. Submitting again will replace the current request. Continue?",
                );
                if (!ok) { setSubmitting(false); return; }
            }

            await setActiveTemplateForCompany(companyId, template.id, values);

            if (choice === "subdomain") {
                // Validate uniqueness
                const { data: taken } = await supabase
                    .from("companies")
                    .select("id")
                    .eq("subdomain", subdomainSlug)
                    .neq("id", Number(companyId))
                    .maybeSingle();
                if (taken) {
                    setSlugError("This name is already taken. Please choose another one.");
                    setSubmitting(false);
                    return;
                }
                // Update companies.subdomain
                const { error: upErr } = await supabase
                    .from("companies")
                    .update({ subdomain: subdomainSlug })
                    .eq("id", Number(companyId));
                if (upErr) throw upErr;

                // Persist storefront_url so email templates use the correct base URL
                await supabase
                    .from("ecom_settings")
                    .update({ storefront_url: `https://${subdomainUrl}` })
                    .eq("company_id", Number(companyId));

                // Record deployment with platform subdomain as domain
                await createDeploymentRequest({
                    companyId,
                    moduleId,
                    templateId: template.id,
                    customDomain: subdomainUrl,
                    configOverrides: values,
                });

                setSubmitted({ url: `https://${subdomainUrl}` });
                toast.success("Your store is live!");
            } else {
                // existing domain → deployment request for super admin
                const cleanDomain = customDomain.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
                await createDeploymentRequest({
                    companyId,
                    moduleId,
                    templateId: template.id,
                    customDomain: cleanDomain,
                    configOverrides: values,
                });
                setSubmitted({ url: `https://${cleanDomain}` });
                toast.success("Domain request submitted! Our team will verify DNS and activate it.");
            }
            onRequested?.();
        } catch (err: any) {
            toast.error(err?.message || "Failed to submit");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-primary" />
                        Choose your store URL — {template.name}
                    </DialogTitle>
                </DialogHeader>

                {/* ── Success state ─────────────────────────────────────── */}
                {submitted ? (
                    <div className="py-8 text-center space-y-4">
                        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-7 h-7 text-green-600" />
                        </div>

                        {choice === "subdomain" ? (
                            <>
                                <div>
                                    <p className="font-semibold text-foreground text-base">Your store is live!</p>
                                    <p className="text-sm text-muted-foreground mt-1">Share this link with your customers:</p>
                                </div>
                                <div className="flex items-center gap-2 bg-muted/50 border border-border rounded-xl px-4 py-3 max-w-sm mx-auto">
                                    <code className="flex-1 text-sm font-medium text-foreground break-all">{submitted.url}</code>
                                    <button
                                        onClick={() => { navigator.clipboard.writeText(submitted.url); toast.success("Copied!"); }}
                                        className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(submitted.url, "_blank", "noopener")}
                                >
                                    Open Store <ExternalLink className="w-3.5 h-3.5" />
                                </Button>
                            </>
                        ) : (
                            <>
                                <div>
                                    <p className="font-semibold text-foreground text-base">Domain request submitted!</p>
                                    <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                                        Point your domain's CNAME to{" "}
                                        <code className="text-primary">app.{PLATFORM_BASE_DOMAIN}</code>.
                                        Our team will verify and activate it within 24 hours.
                                    </p>
                                </div>
                                <code className="text-sm bg-muted px-3 py-1.5 rounded inline-block">{submitted.url}</code>
                            </>
                        )}
                    </div>
                ) : (
                    /* ── Form state ───────────────────────────────────── */
                    <div className="space-y-4 py-1 max-h-[68vh] overflow-y-auto pr-0.5">

                        {/* 3-option radio */}
                        <div className="grid grid-cols-3 gap-3">
                            <ChoiceCard
                                active={choice === "subdomain"}
                                onClick={() => setChoice("subdomain")}
                                icon={<Zap className="w-5 h-5 text-primary" />}
                                title="Free URL"
                                subtitle={`yourname.${PLATFORM_BASE_DOMAIN}`}
                                badge="Instant · Free"
                                badgeColor="green"
                            />
                            <ChoiceCard
                                active={choice === "buy"}
                                onClick={() => setChoice("buy")}
                                icon={<ShoppingCart className="w-5 h-5 text-orange-500" />}
                                title="Buy a Domain"
                                subtitle=".com, .in, .store and more"
                                badge="From ₹299/yr"
                                badgeColor="orange"
                            />
                            <ChoiceCard
                                active={choice === "existing"}
                                onClick={() => setChoice("existing")}
                                icon={<Wifi className="w-5 h-5 text-sky-500" />}
                                title="Use My Domain"
                                subtitle="Connect a domain you own"
                                badge="DNS setup needed"
                                badgeColor="sky"
                            />
                        </div>

                        {/* ── Free subdomain ──────────────────────────── */}
                        {choice === "subdomain" && (
                            <div className="space-y-2">
                                <Label className="text-xs">Your store name</Label>
                                <div className="flex items-stretch rounded-lg border border-border overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary bg-background">
                                    <input
                                        type="text"
                                        value={subdomainInput}
                                        onChange={(e) => { setSubdomainInput(e.target.value); setSlugError(""); }}
                                        placeholder="yourbrand"
                                        className="flex-1 px-3 py-2 text-sm bg-transparent outline-none font-mono"
                                        spellCheck={false}
                                        autoComplete="off"
                                    />
                                    <span className="px-3 py-2 bg-muted/60 text-muted-foreground text-sm border-l border-border font-mono select-none">
                                        .{PLATFORM_BASE_DOMAIN}
                                    </span>
                                </div>
                                {subdomainSlug.length >= 2 && (
                                    <p className="text-[11px] text-muted-foreground">
                                        Your store URL:{" "}
                                        <code className="text-primary font-medium">{subdomainUrl}</code>
                                    </p>
                                )}
                                {slugError && (
                                    <p className="text-[11px] text-destructive">{slugError}</p>
                                )}
                            </div>
                        )}

                        {/* ── Buy domain ──────────────────────────────── */}
                        {choice === "buy" && (
                            <div className="rounded-xl border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20 p-4 space-y-3">
                                <p className="text-sm font-semibold text-foreground">Search and buy your domain</p>
                                <p className="text-xs text-muted-foreground">
                                    We'll save your template choice and open the domain purchase page. Once you complete the purchase, your store will be connected automatically — no extra steps needed.
                                </p>
                                <Button onClick={handleBuyDomain} variant="outline" className="w-full justify-between">
                                    <span className="flex items-center gap-2">
                                        <ShoppingCart className="w-4 h-4" /> Go to Domain &amp; Hosting
                                    </span>
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        )}

                        {/* ── Existing domain ─────────────────────────── */}
                        {choice === "existing" && (
                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Your domain name</Label>
                                    <Input
                                        value={customDomain}
                                        onChange={(e) => setCustomDomain(e.target.value)}
                                        placeholder="shop.yourcompany.com"
                                        autoComplete="off"
                                        spellCheck={false}
                                        className="font-mono"
                                    />
                                    {!customDomainValid && customDomain.length > 0 && (
                                        <p className="text-[11px] text-destructive">
                                            Enter a valid domain like <code>shop.example.com</code>
                                        </p>
                                    )}
                                </div>
                                <div className="rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/20 p-4 space-y-2.5">
                                    <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                        <ShieldCheck className="w-3.5 h-3.5 text-sky-600" /> DNS setup required
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">
                                        Add this record at your domain registrar (GoDaddy, Namecheap, etc.):
                                    </p>
                                    <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
                                        {[
                                            { label: "Type", value: "CNAME" },
                                            { label: "Name / Host", value: "@ or www" },
                                            { label: "Value / Points To", value: `app.${PLATFORM_BASE_DOMAIN}` },
                                        ].map(({ label, value }) => (
                                            <div key={label} className="bg-white dark:bg-background border border-border rounded-lg p-2">
                                                <p className="text-muted-foreground text-[9px] uppercase tracking-wide mb-0.5">{label}</p>
                                                <p className="font-medium text-foreground break-all">{value}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">
                                        After submitting, our team will verify your DNS and activate the domain — usually within 24 hours.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Template config fields (subdomain + existing only) */}
                        {choice !== "buy" && fields.length > 0 && (
                            <div className="space-y-3 pt-1">
                                <div className="h-px bg-border" />
                                <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">
                                    Store details
                                </p>
                                {fields.map(([key, field]) => (
                                    <div key={key} className="space-y-1">
                                        <Label className="text-xs">
                                            {field.label}
                                            {field.required && <span className="text-destructive"> *</span>}
                                        </Label>
                                        <Input
                                            type={field.type || "text"}
                                            value={String(values[key] ?? "")}
                                            onChange={(e) => handleFieldChange(key, e.target.value)}
                                            placeholder={field.placeholder}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <DialogFooter className="gap-2 pt-2">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
                        {submitted ? "Close" : "Cancel"}
                    </Button>
                    {!submitted && choice !== "buy" && (
                        <Button onClick={handleSubmit} disabled={submitting || !canSubmit}>
                            {submitting ? (
                                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Please wait…</>
                            ) : choice === "subdomain" ? (
                                <><Zap className="w-3.5 h-3.5" /> Use this URL</>
                            ) : (
                                <><Check className="w-3.5 h-3.5" /> Submit request</>
                            )}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function ChoiceCard({
    active, onClick, icon, title, subtitle, badge, badgeColor,
}: {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    badge: string;
    badgeColor: "green" | "orange" | "sky";
}) {
    const badgeClass = {
        green: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
        orange: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
        sky: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400",
    }[badgeColor];

    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "text-left p-4 rounded-xl border-2 transition-all w-full",
                active
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20 dark:bg-primary/10"
                    : "border-border bg-card hover:border-muted-foreground/30",
            )}
        >
            <div className="flex items-center justify-between mb-2">
                {icon}
                {active && <Check className="w-4 h-4 text-primary" />}
            </div>
            <p className="text-sm font-semibold text-foreground leading-tight">{title}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{subtitle}</p>
            <span className={cn("inline-block mt-2 text-[10px] px-1.5 py-0.5 rounded font-semibold", badgeClass)}>
                {badge}
            </span>
        </button>
    );
}
