import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTenant } from "@/contexts/TenantContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { listTemplates, setActiveTemplateForCompany } from "@/lib/services/storefrontTemplateService";
import { createDeploymentRequest } from "@/lib/services/deploymentRequestService";
import {
    registerSubdomain,
    addExternalDomain,
    deployTemplateFiles,
} from "@/lib/services/hostingerService";
import type { StorefrontTemplate, TemplateConfigOverrides } from "@/types/storefront";
import {
    Check, ChevronRight, Copy, ExternalLink, Globe, Loader2,
    Zap, ShoppingCart, Wifi, ShieldCheck, ArrowLeft,
    Store, Eye, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PLATFORM_BASE_DOMAIN =
    (import.meta.env.VITE_PLATFORM_BASE_DOMAIN as string) || "smartseyali.com";

function slugify(s: string) {
    return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function isValidDomain(d: string) {
    return /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/i.test(
        d.trim().replace(/^https?:\/\//, "").replace(/\/$/, ""),
    );
}

type DomainOption = "free" | "buy" | "existing";

const DEPLOY_PHASES = [
    "Saving configuration...",
    "Fetching template files...",
    "Building deployment package...",
    "Uploading to hosting...",
];

// ── Step indicator ────────────────────────────────────────────────────────────

function Stepper({ current }: { current: number }) {
    const steps = ["Choose Domain", "Select Template", "Configure & Deploy"];
    return (
        <div className="flex items-center justify-center gap-0 mb-8">
            {steps.map((label, i) => (
                <div key={i} className="flex items-center">
                    <div className="flex flex-col items-center gap-1.5">
                        <div
                            className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all",
                                i < current
                                    ? "bg-primary border-primary text-white"
                                    : i === current
                                        ? "border-primary text-primary bg-primary/10"
                                        : "border-border text-muted-foreground bg-background",
                            )}
                        >
                            {i < current ? <Check className="w-3.5 h-3.5" /> : i + 1}
                        </div>
                        <span
                            className={cn(
                                "text-[11px] font-medium hidden sm:block whitespace-nowrap",
                                i <= current ? "text-foreground" : "text-muted-foreground",
                            )}
                        >
                            {label}
                        </span>
                    </div>
                    {i < steps.length - 1 && (
                        <div
                            className={cn(
                                "h-px w-16 sm:w-24 mx-2 mb-5 transition-colors",
                                i < current ? "bg-primary" : "bg-border",
                            )}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}

// ── Domain option card ────────────────────────────────────────────────────────

function OptionCard({
    active, onClick, icon, title, subtitle, badge, badgeClass,
}: {
    active: boolean; onClick: () => void;
    icon: React.ReactNode; title: string; subtitle: string;
    badge: string; badgeClass: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "text-left p-4 rounded-xl border-2 transition-all w-full",
                active
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border bg-card hover:border-muted-foreground/30",
            )}
        >
            <div className="flex items-center justify-between mb-2.5">
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

// ── Template card ────────────────────────────────────────────────────────────

function TemplateCard({
    template, selected, onSelect,
}: {
    template: StorefrontTemplate; selected: boolean; onSelect: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onSelect}
            className={cn(
                "text-left rounded-xl border-2 overflow-hidden transition-all group w-full",
                selected
                    ? "border-primary ring-1 ring-primary/20"
                    : "border-border hover:border-muted-foreground/40",
            )}
        >
            {/* Thumbnail */}
            <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                {template.thumbnail_url ? (
                    <img
                        src={template.thumbnail_url}
                        alt={template.name}
                        className="w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Store className="w-10 h-10 text-muted-foreground/30" />
                    </div>
                )}
                {selected && (
                    <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg">
                            <Check className="w-5 h-5 text-white" />
                        </div>
                    </div>
                )}
                {template.is_premium && (
                    <span className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 bg-amber-500 text-white rounded font-semibold">
                        Premium
                    </span>
                )}
            </div>

            {/* Info */}
            <div className="p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground leading-tight">{template.name}</p>
                    {template.preview_url && (
                        <a
                            href={template.preview_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-muted-foreground hover:text-primary transition-colors"
                            title="Preview"
                        >
                            <Eye className="w-3.5 h-3.5" />
                        </a>
                    )}
                </div>
                {template.description && (
                    <p className="text-[11px] text-muted-foreground line-clamp-2">{template.description}</p>
                )}
                {template.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-0.5">
                        {template.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-muted rounded text-muted-foreground">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </button>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function EcomOnboarding() {
    const { activeCompany } = useTenant();
    const navigate = useNavigate();

    const [step, setStep] = useState(0);

    // Step 1
    const [domainOption, setDomainOption] = useState<DomainOption>("free");
    const [brandName, setBrandName] = useState("");
    const [existingDomain, setExistingDomain] = useState("");
    const [chosenDomain, setChosenDomain] = useState("");
    const [step1Loading, setStep1Loading] = useState(false);
    const [slugError, setSlugError] = useState("");

    // Step 2
    const [templates, setTemplates] = useState<StorefrontTemplate[]>([]);
    const [templatesLoading, setTemplatesLoading] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<StorefrontTemplate | null>(null);

    // Step 3
    const [configValues, setConfigValues] = useState<TemplateConfigOverrides>({});
    const [deploying, setDeploying] = useState(false);
    const [deployPhaseIdx, setDeployPhaseIdx] = useState(0);
    const [storeUrl, setStoreUrl] = useState("");
    const phaseTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const brandSlug = useMemo(() => slugify(brandName), [brandName]);
    const subdomainUrl = `${brandSlug || "yourstore"}.${PLATFORM_BASE_DOMAIN}`;

    // Pre-fill brand name / subdomain from company
    useEffect(() => {
        if (!activeCompany) return;
        if (activeCompany.subdomain) {
            setBrandName(activeCompany.subdomain);
            setChosenDomain(`${activeCompany.subdomain}.${PLATFORM_BASE_DOMAIN}`);
        } else if (activeCompany.name) {
            setBrandName(slugify(activeCompany.name));
        }
    }, [activeCompany?.id]);

    // Load templates when reaching step 2
    useEffect(() => {
        if (step !== 1) return;
        setTemplatesLoading(true);
        listTemplates({ moduleId: "ecommerce", activeOnly: true })
            .then(setTemplates)
            .catch((e) => toast.error(e.message))
            .finally(() => setTemplatesLoading(false));
    }, [step]);

    // Auto-select single template
    useEffect(() => {
        if (templates.length === 1 && !selectedTemplate) {
            setSelectedTemplate(templates[0]);
        }
    }, [templates]);

    // Pre-fill config defaults when template selected
    useEffect(() => {
        if (!selectedTemplate) return;
        const initial: TemplateConfigOverrides = {};
        for (const [key, field] of Object.entries(selectedTemplate.config_schema || {})) {
            if (key === "storeName" && activeCompany?.name) initial[key] = activeCompany.name;
            else if (field?.default !== undefined) initial[key] = field.default;
        }
        setConfigValues(initial);
    }, [selectedTemplate?.id]);

    // Cleanup phase timer on unmount
    useEffect(() => () => { if (phaseTimerRef.current) clearInterval(phaseTimerRef.current); }, []);

    // ── Step 1: proceed with domain choice
    const handleDomainContinue = async () => {
        if (domainOption === "buy") {
            navigate("/apps/ecommerce/domain");
            return;
        }
        if (!activeCompany?.id) return;
        setStep1Loading(true);
        setSlugError("");

        try {
            if (domainOption === "free") {
                if (brandSlug.length < 2) { setSlugError("Must be at least 2 characters."); return; }

                const { data: taken } = await supabase
                    .from("companies")
                    .select("id")
                    .eq("subdomain", brandSlug)
                    .neq("id", Number(activeCompany.id))
                    .maybeSingle();
                if (taken) { setSlugError("This name is already taken. Please choose another."); return; }

                await registerSubdomain(brandSlug, Number(activeCompany.id));
                setChosenDomain(`${brandSlug}.${PLATFORM_BASE_DOMAIN}`);
                toast.success(`Subdomain registered: ${brandSlug}.${PLATFORM_BASE_DOMAIN}`);
            } else {
                const clean = existingDomain.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
                if (!isValidDomain(clean)) { toast.error("Enter a valid domain name."); return; }
                await addExternalDomain(clean, Number(activeCompany.id));
                setChosenDomain(clean);
                toast.success("Domain registered. Configure DNS as shown above.");
            }
            setStep(1);
        } catch (err: any) {
            toast.error(err.message || "Domain setup failed.");
        } finally {
            setStep1Loading(false);
        }
    };

    // ── Step 3: deploy template to Hostinger
    const handleDeploy = async () => {
        if (!activeCompany?.id || !selectedTemplate || !chosenDomain) return;
        setDeploying(true);
        setDeployPhaseIdx(0);

        phaseTimerRef.current = setInterval(() => {
            setDeployPhaseIdx((i) => Math.min(i + 1, DEPLOY_PHASES.length - 1));
        }, 2800);

        try {
            await setActiveTemplateForCompany(activeCompany.id, selectedTemplate.id, configValues);

            await createDeploymentRequest({
                companyId: activeCompany.id,
                moduleId: "ecommerce",
                templateId: selectedTemplate.id,
                customDomain: chosenDomain,
                configOverrides: configValues,
            });

            const result = await deployTemplateFiles({
                domain: chosenDomain,
                templateSlug: selectedTemplate.slug,
                configOverrides: configValues as Record<string, unknown>,
                companyId: Number(activeCompany.id),
                platformBaseUrl: window.location.origin,
            });

            clearInterval(phaseTimerRef.current!);
            phaseTimerRef.current = null;
            setStoreUrl(result.deployed_url || `https://${chosenDomain}`);
            toast.success("Your store is live!");
        } catch (err: any) {
            clearInterval(phaseTimerRef.current!);
            phaseTimerRef.current = null;
            toast.error(err.message || "Deployment failed.");
            setDeploying(false);
        }
    };

    const configFields = useMemo(
        () => Object.entries(selectedTemplate?.config_schema || {}).filter(([, f]) => f && typeof f === "object"),
        [selectedTemplate?.id],
    );

    const isDone = storeUrl !== "";

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="p-6 md:p-8 max-w-3xl mx-auto animate-in fade-in duration-400">

            {/* Page header */}
            <div className="mb-6">
                <button
                    onClick={() =>
                        step > 0 && !deploying
                            ? setStep(step - 1)
                            : navigate("/apps/ecommerce/billing")
                    }
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    {step > 0 ? "Back" : "Back to Billing"}
                </button>
                <h1 className="text-xl font-semibold text-foreground">Set Up Your Online Store</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Complete 3 quick steps to launch your storefront.
                </p>
            </div>

            <Stepper current={step} />

            {/* ─── Step 1: Domain ─────────────────────────────────────── */}
            {step === 0 && (
                <div className="bg-card border border-border rounded-xl p-6 space-y-5">
                    <div>
                        <h2 className="text-base font-semibold text-foreground">Choose your store address</h2>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            How would you like to publish your storefront?
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <OptionCard
                            active={domainOption === "free"}
                            onClick={() => setDomainOption("free")}
                            icon={<Zap className="w-5 h-5 text-primary" />}
                            title="Free URL"
                            subtitle={`yourname.${PLATFORM_BASE_DOMAIN}`}
                            badge="Instant · Free"
                            badgeClass="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                        />
                        <OptionCard
                            active={domainOption === "buy"}
                            onClick={() => setDomainOption("buy")}
                            icon={<ShoppingCart className="w-5 h-5 text-orange-500" />}
                            title="Buy a Domain"
                            subtitle=".com, .in, .store and more"
                            badge="From ₹299/yr"
                            badgeClass="bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400"
                        />
                        <OptionCard
                            active={domainOption === "existing"}
                            onClick={() => setDomainOption("existing")}
                            icon={<Wifi className="w-5 h-5 text-sky-500" />}
                            title="Existing Domain"
                            subtitle="Connect a domain you own"
                            badge="DNS setup needed"
                            badgeClass="bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400"
                        />
                    </div>

                    {/* Free URL form */}
                    {domainOption === "free" && (
                        <div className="space-y-2">
                            <Label className="text-xs">Your store name</Label>
                            <div className="flex items-stretch rounded-lg border border-border overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary bg-background">
                                <input
                                    type="text"
                                    value={brandName}
                                    onChange={(e) => { setBrandName(e.target.value); setSlugError(""); }}
                                    placeholder="yourbrand"
                                    className="flex-1 px-3 py-2 text-sm bg-transparent outline-none font-mono"
                                    spellCheck={false}
                                    autoComplete="off"
                                />
                                <span className="px-3 py-2 bg-muted/60 text-muted-foreground text-sm border-l border-border font-mono select-none">
                                    .{PLATFORM_BASE_DOMAIN}
                                </span>
                            </div>
                            {brandSlug.length >= 2 && (
                                <p className="text-[11px] text-muted-foreground">
                                    Your store URL:{" "}
                                    <code className="text-primary font-medium">{subdomainUrl}</code>
                                </p>
                            )}
                            {slugError && <p className="text-[11px] text-destructive">{slugError}</p>}
                        </div>
                    )}

                    {/* Buy domain info */}
                    {domainOption === "buy" && (
                        <div className="rounded-xl border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20 p-4 space-y-2">
                            <p className="text-sm font-semibold text-foreground">Purchase your custom domain</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Search and buy a domain (e.g. <code>myshop.in</code>) on the Domain &amp; Hosting
                                page. Once purchased, come back here to choose a template and deploy your store.
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                                Clicking <strong>Continue</strong> will open the Domain Manager.
                            </p>
                        </div>
                    )}

                    {/* Existing domain form */}
                    {domainOption === "existing" && (
                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs">Your domain name</Label>
                                <Input
                                    value={existingDomain}
                                    onChange={(e) => setExistingDomain(e.target.value)}
                                    placeholder="shop.yourcompany.com"
                                    className="font-mono text-sm"
                                    spellCheck={false}
                                    autoComplete="off"
                                />
                            </div>
                            <div className="rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/20 p-4 space-y-2.5">
                                <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                    <ShieldCheck className="w-3.5 h-3.5 text-sky-600" /> DNS configuration required
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                    Add the following record at your domain registrar before continuing:
                                </p>
                                <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
                                    {[
                                        { label: "Type", value: "CNAME" },
                                        { label: "Name / Host", value: "@ or www" },
                                        { label: "Points To", value: `app.${PLATFORM_BASE_DOMAIN}` },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="bg-background border border-border rounded-lg p-2">
                                            <p className="text-muted-foreground text-[9px] uppercase tracking-wide mb-0.5">{label}</p>
                                            <p className="font-medium text-foreground break-all">{value}</p>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[11px] text-muted-foreground">
                                    DNS changes can take up to 24 hours to propagate. Our team will verify and activate your domain.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end pt-1">
                        <Button
                            onClick={handleDomainContinue}
                            disabled={
                                step1Loading ||
                                (domainOption === "free" && brandSlug.length < 2) ||
                                (domainOption === "existing" && !isValidDomain(existingDomain))
                            }
                        >
                            {step1Loading ? (
                                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Please wait…</>
                            ) : domainOption === "buy" ? (
                                <>Go to Domain Manager <ChevronRight className="w-3.5 h-3.5" /></>
                            ) : (
                                <>Continue <ChevronRight className="w-3.5 h-3.5" /></>
                            )}
                        </Button>
                    </div>
                </div>
            )}

            {/* ─── Step 2: Template ────────────────────────────────────── */}
            {step === 1 && (
                <div className="bg-card border border-border rounded-xl p-6 space-y-5">
                    <div>
                        <h2 className="text-base font-semibold text-foreground">Choose your store template</h2>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Select the design for your online store.
                        </p>
                    </div>

                    {templatesLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : templates.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Store className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">No templates available yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {templates.map((t) => (
                                <TemplateCard
                                    key={t.id}
                                    template={t}
                                    selected={selectedTemplate?.id === t.id}
                                    onSelect={() => setSelectedTemplate(t)}
                                />
                            ))}
                        </div>
                    )}

                    {selectedTemplate && (
                        <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                            <Check className="w-4 h-4 text-primary shrink-0" />
                            <p className="text-sm text-foreground">
                                <span className="font-medium">{selectedTemplate.name}</span> selected
                            </p>
                            {selectedTemplate.preview_url && (
                                <a
                                    href={selectedTemplate.preview_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-auto flex items-center gap-1 text-xs text-primary hover:underline"
                                >
                                    <Eye className="w-3 h-3" /> Preview
                                </a>
                            )}
                        </div>
                    )}

                    <div className="flex justify-between pt-1">
                        <Button variant="ghost" onClick={() => setStep(0)}>
                            <ArrowLeft className="w-3.5 h-3.5" /> Back
                        </Button>
                        <Button onClick={() => setStep(2)} disabled={!selectedTemplate}>
                            Continue <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>
            )}

            {/* ─── Step 3: Configure & Deploy ─────────────────────────── */}
            {step === 2 && (
                <div className="bg-card border border-border rounded-xl p-6 space-y-5">

                    {/* Success */}
                    {isDone ? (
                        <div className="py-8 text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                                <CheckCircle2 className="w-8 h-8 text-green-600" />
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-foreground">Your store is live!</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Share this link with your customers:
                                </p>
                            </div>
                            <div className="flex items-center gap-2 bg-muted/50 border border-border rounded-xl px-4 py-3 max-w-sm mx-auto">
                                <code className="flex-1 text-sm font-medium text-foreground break-all">{storeUrl}</code>
                                <button
                                    onClick={() => { navigator.clipboard.writeText(storeUrl); toast.success("Copied!"); }}
                                    className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex items-center justify-center gap-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(storeUrl, "_blank", "noopener")}
                                >
                                    <ExternalLink className="w-3.5 h-3.5" /> Open Store
                                </Button>
                                <Button size="sm" onClick={() => navigate("/apps/ecommerce")}>
                                    <Globe className="w-3.5 h-3.5" /> Go to Dashboard
                                </Button>
                            </div>
                        </div>
                    ) : deploying ? (
                        /* Deploying progress */
                        <div className="py-12 flex flex-col items-center gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-primary" />
                            <div className="text-center">
                                <p className="text-sm font-medium text-foreground">
                                    {DEPLOY_PHASES[deployPhaseIdx]}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    This may take 30–60 seconds. Please don't close this tab.
                                </p>
                            </div>
                            <div className="flex gap-2 mt-1">
                                {DEPLOY_PHASES.map((_, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "w-2 h-2 rounded-full transition-colors duration-500",
                                            i <= deployPhaseIdx ? "bg-primary" : "bg-border",
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* Config form */
                        <>
                            <div>
                                <h2 className="text-base font-semibold text-foreground">Configure your store</h2>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                    Customise{" "}
                                    <span className="font-medium text-foreground">{selectedTemplate?.name}</span>
                                    {" "}— deploying to{" "}
                                    <code className="text-primary text-xs">{chosenDomain}</code>
                                </p>
                            </div>

                            {configFields.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {configFields.map(([key, field]) => (
                                        <div key={key} className="space-y-1.5">
                                            <Label className="text-xs">
                                                {field.label}
                                                {field.required && <span className="text-destructive ml-0.5">*</span>}
                                            </Label>
                                            <Input
                                                type={field.type || "text"}
                                                value={String(configValues[key] ?? "")}
                                                onChange={(e) =>
                                                    setConfigValues((v) => ({ ...v, [key]: e.target.value }))
                                                }
                                                placeholder={field.placeholder}
                                                className="text-sm"
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground py-2">
                                    No additional configuration required for this template.
                                </p>
                            )}

                            <div className="flex justify-between pt-2">
                                <Button variant="ghost" onClick={() => setStep(1)}>
                                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                                </Button>
                                <Button onClick={handleDeploy}>
                                    <Zap className="w-3.5 h-3.5" /> Deploy My Store
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
