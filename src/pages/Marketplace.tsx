import { useState, useMemo, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    Search, Check, Download, ExternalLink, ArrowLeft, Shield, Clock, Zap,
    ChevronRight, Package, Globe, Trash2, CreditCard, Loader2,
} from "lucide-react";
import { CATEGORY_LABELS } from "@/config/modules";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useTenant } from "@/contexts/TenantContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { initiateRazorpayPayment, logPaymentTransaction } from "@/lib/services/paymentService";
import { toast } from "sonner";
import PLATFORM_CONFIG from "@/config/platform";
import { cn } from "@/lib/utils";

interface PlatformSettings {
    razorpay_key_id: string | null;
    razorpay_key_secret: string | null;
    razorpay_test_mode: boolean;
    billing_mode: "monthly" | "yearly" | "both";
    currency: string;
    currency_symbol: string;
}

interface SystemModule {
    id: string;
    slug: string;
    name: string;
    tagline: string;
    description: string;
    icon: string;
    color: string;
    color_from: string;
    color_to: string;
    route: string;
    dashboard_route: string;
    category: string;
    status: string;
    features: string[];
    included_in_plans: string[];
    is_core: boolean;
    is_active: boolean;
    needs_template: boolean;
    is_free: boolean;
    price_monthly: number;
    price_yearly: number;
    trial_days: number;
    sort_order: number;
}

type CategoryFilter = "all" | string;

const CATEGORY_PILLS: { key: CategoryFilter; label: string }[] = [
    { key: "all",           label: "All Apps" },
    { key: "commerce",      label: "Commerce" },
    { key: "operations",    label: "Operations" },
    { key: "customer",      label: "Customer" },
    { key: "people",        label: "People" },
    { key: "finance",       label: "Finance" },
    { key: "analytics",     label: "Analytics" },
    { key: "collaboration", label: "Collaboration" },
];

/** Frappe-style indicator tone per category */
const CATEGORY_TONE: Record<string, string> = {
    commerce:      "bg-primary-100 text-primary-700",
    operations:    "bg-warning-100 text-warning-700",
    customer:      "bg-destructive-100 text-destructive-700",
    people:        "bg-success-100 text-success-700",
    finance:       "bg-success-100 text-success-700",
    analytics:     "bg-purple-100 text-purple-500",
    collaboration: "bg-warning-100 text-warning-700",
};

export default function Marketplace() {
    const navigate = useNavigate();
    const { activeCompany } = useTenant();
    const { user } = useAuth();
    const { hasModule, refreshPermissions } = usePermissions();
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState<CategoryFilter>("all");
    const [installing, setInstalling] = useState(false);
    const [uninstalling, setUninstalling] = useState(false);
    const [dbModules, setDbModules] = useState<SystemModule[]>([]);
    const [loadingModules, setLoadingModules] = useState(true);
    const [companySlugs, setCompanySlugs] = useState<Set<string>>(new Set());
    const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
    const [platformSettings, setPlatformSettings] = useState<PlatformSettings | null>(null);
    const [selectedApp, setSelectedApp] = useState<SystemModule | null>(null);

    useEffect(() => {
        const fetchModules = async () => {
            setLoadingModules(true);

            const { data: psData } = await supabase
                .from("platform_settings")
                .select("*")
                .eq("id", 1)
                .maybeSingle();

            if (psData) {
                setPlatformSettings(psData as PlatformSettings);
                if (psData.billing_mode === "yearly") setBillingPeriod("yearly");
            }

            const { data, error } = await supabase
                .from("system_modules")
                .select("*")
                .eq("is_active", true)
                .order("sort_order", { ascending: true });

            if (!error && data) setDbModules(data as SystemModule[]);

            if (activeCompany) {
                const { data: cmData } = await supabase
                    .from("company_modules")
                    .select("module_slug")
                    .eq("company_id", activeCompany.id)
                    .eq("is_active", true);
                setCompanySlugs(new Set((cmData || []).map((cm: any) => cm.module_slug)));
            }

            setLoadingModules(false);
        };
        fetchModules();
    }, [activeCompany?.id]);

    const modules = useMemo(() => {
        return dbModules.filter((m) => {
            if (m.slug === "masters") return false;
            if (m.status === "planned") return false;
            const q = search.toLowerCase();
            const matchesSearch =
                !q ||
                m.name.toLowerCase().includes(q) ||
                (m.tagline || "").toLowerCase().includes(q) ||
                (m.description || "").toLowerCase().includes(q);
            const matchesCategory = category === "all" || m.category === category;
            return matchesSearch && matchesCategory;
        });
    }, [search, category, dbModules]);

    const isInstalled = (mod: SystemModule) =>
        mod.is_core || companySlugs.has(mod.slug) || hasModule(mod.name) || hasModule(mod.slug);

    const getModulePrice = (mod: SystemModule) => {
        if (mod.is_core || mod.is_free) return 0;
        return billingPeriod === "yearly" && mod.price_yearly > 0 ? mod.price_yearly : mod.price_monthly || 0;
    };

    const currencySymbol = platformSettings?.currency_symbol || "₹";
    const showBillingToggle = platformSettings?.billing_mode === "both";

    const activateModule = async (mod: SystemModule) => {
        const trialEndsAt = mod.trial_days > 0
            ? new Date(Date.now() + mod.trial_days * 86400000).toISOString()
            : null;

        const { error: cmErr } = await supabase.from("company_modules").upsert({
            company_id: activeCompany!.id,
            module_id: mod.id,
            module_slug: mod.slug,
            is_active: true,
            installed_at: new Date().toISOString(),
            trial_ends_at: trialEndsAt,
            billing_status: "active",
        }, { onConflict: "company_id,module_slug" });
        if (cmErr) throw cmErr;

        try {
            if (user) {
                await supabase.from("user_modules").insert({
                    user_id: user.id,
                    module_slug: mod.slug,
                    company_id: activeCompany!.id,
                });
            }
        } catch { /* optional */ }

        if (mod.slug === "ecommerce") {
            await supabase.from("ecom_settings").insert([{
                company_id: activeCompany!.id,
                store_name: activeCompany!.name,
                primary_color: "#2490EF",
            }]).then(() => {});
        }

        refreshPermissions();
        setCompanySlugs((prev) => new Set([...prev, mod.slug]));
    };

    const handleInstall = async (mod: SystemModule) => {
        if (!activeCompany) { toast.error("Please select a company first."); return; }
        if (isInstalled(mod)) { toast.info(`${mod.name} is already installed.`); return; }

        const price = getModulePrice(mod);
        const isFreeModule = mod.is_core || mod.is_free || price <= 0;

        if (isFreeModule) {
            setInstalling(true);
            try {
                await activateModule(mod);
                toast.success(`${mod.name} installed successfully!`);
            } catch (err: any) {
                toast.error(err.message || "Failed to install module");
            } finally { setInstalling(false); }
            return;
        }

        const keyId = platformSettings?.razorpay_key_id;
        if (!keyId) { toast.error("Payment gateway is not configured."); return; }

        setInstalling(true);
        const orderNumber = `MOD-${mod.slug}-${Date.now()}`;

        try {
            await logPaymentTransaction(activeCompany.id, orderNumber, "razorpay", price, "initiated").catch(() => {});

            const result = await initiateRazorpayPayment({
                keyId,
                amount: price,
                currency: platformSettings?.currency || "INR",
                orderNumber,
                customerName: user?.user_metadata?.full_name || user?.email || "User",
                customerEmail: user?.email || "",
                customerPhone: user?.user_metadata?.phone || "",
                businessName: PLATFORM_CONFIG.name,
                description: `${mod.name} — ${billingPeriod} subscription`,
            });

            await logPaymentTransaction(
                activeCompany.id, orderNumber, "razorpay", price, "success",
                result.razorpay_payment_id,
                { ...result, module_slug: mod.slug, billing_period: billingPeriod },
            ).catch(() => {});

            await activateModule(mod);
            toast.success(`Payment successful! ${mod.name} has been installed.`);
        } catch (err: any) {
            await logPaymentTransaction(
                activeCompany.id, orderNumber, "razorpay", price, "failed",
                undefined, { error: err.message, module_slug: mod.slug },
            ).catch(() => {});

            if (err.message?.includes("cancelled")) toast.info("Payment was cancelled.");
            else toast.error(err.message || "Payment failed. Please try again.");
        } finally { setInstalling(false); }
    };

    const handleUninstall = async (mod: SystemModule) => {
        if (!activeCompany) { toast.error("Please select a company first."); return; }
        if (mod.is_core) { toast.error("Core modules cannot be uninstalled."); return; }
        if (!confirm(`Uninstall "${mod.name}" from ${activeCompany.name}?`)) return;

        setUninstalling(true);
        try {
            const { error: cmErr } = await supabase
                .from("company_modules")
                .delete()
                .eq("company_id", activeCompany.id)
                .eq("module_slug", mod.slug);
            if (cmErr) throw cmErr;

            try {
                const { data: { user: u } } = await supabase.auth.getUser();
                if (u) {
                    await supabase.from("user_modules").delete()
                        .eq("company_id", activeCompany.id)
                        .eq("module_slug", mod.slug);
                }
            } catch { /* optional */ }

            refreshPermissions();
            setCompanySlugs((prev) => { const next = new Set(prev); next.delete(mod.slug); return next; });
            toast.success(`${mod.name} has been uninstalled.`);
            setSelectedApp(null);
        } catch (err: any) {
            toast.error(err.message || "Failed to uninstall module");
        } finally { setUninstalling(false); }
    };

    const activeCategories = useMemo(() => {
        const cats = new Set(
            dbModules.filter((m) => m.slug !== "masters" && m.status !== "planned").map((m) => m.category),
        );
        return CATEGORY_PILLS.filter((p) => p.key === "all" || cats.has(p.key));
    }, [dbModules]);

    const installedCount = useMemo(
        () => dbModules.filter((m) => isInstalled(m) && m.slug !== "masters").length,
        [dbModules, companySlugs],
    );

    if (loadingModules) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
            </div>
        );
    }

    // ── APP DETAIL VIEW ──────────────────────────────────────────
    if (selectedApp) {
        const installed = isInstalled(selectedApp);
        const isAvailable = selectedApp.status === "live" || selectedApp.status === "beta";
        const catLabel = CATEGORY_LABELS[selectedApp.category as keyof typeof CATEGORY_LABELS] || selectedApp.category;
        const catTone = CATEGORY_TONE[selectedApp.category] || "bg-gray-100 text-gray-700";

        return (
            <div className="min-h-full bg-background">
                {/* Top bar */}
                <div className="bg-card border-b border-gray-200 sticky top-0 z-10 dark:border-border">
                    <div className="max-w-5xl mx-auto px-4 h-11 flex items-center gap-2">
                        <button
                            onClick={() => setSelectedApp(null)}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors dark:hover:text-foreground"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" /> Marketplace
                        </button>
                        <ChevronRight className="w-3 h-3 text-gray-300" />
                        <span className="text-xs font-medium text-gray-800 dark:text-foreground truncate">{selectedApp.name}</span>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto px-4 py-5">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Main */}
                        <div className="lg:col-span-2 space-y-3">
                            {/* Hero */}
                            <div className="bg-card rounded-lg border border-gray-200 p-5 dark:border-border">
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="w-14 h-14 rounded-md flex items-center justify-center text-2xl bg-primary-50 border border-primary-100 shrink-0 dark:bg-accent/40 dark:border-border">
                                        {selectedApp.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h1 className="text-lg font-semibold text-gray-900 dark:text-foreground">{selectedApp.name}</h1>
                                            {selectedApp.status === "beta" && (
                                                <span className="erp-pill bg-warning-100 text-warning-700">Beta</span>
                                            )}
                                            {installed && (
                                                <span className="erp-pill bg-success-100 text-success-700">
                                                    <Check className="w-3 h-3" /> Installed
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 mt-0.5">{selectedApp.tagline}</p>
                                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                                            <span className={cn("erp-pill", catTone)}>{catLabel}</span>
                                            <span className="text-gray-500 flex items-center gap-1">
                                                <Globe className="w-3 h-3" /> {PLATFORM_CONFIG.name}
                                            </span>
                                            {selectedApp.trial_days > 0 && (
                                                <span className="text-gray-500 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> {selectedApp.trial_days}-day trial
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* About */}
                            <div className="bg-card rounded-lg border border-gray-200 overflow-hidden dark:border-border">
                                <div className="px-4 h-10 flex items-center border-b border-gray-200 dark:border-border">
                                    <span className="erp-section-header text-sm">About this app</span>
                                </div>
                                <div className="px-4 py-3">
                                    <p className="text-sm text-gray-700 leading-relaxed dark:text-foreground">{selectedApp.description}</p>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="bg-card rounded-lg border border-gray-200 overflow-hidden dark:border-border">
                                <div className="px-4 h-10 flex items-center border-b border-gray-200 dark:border-border">
                                    <span className="erp-section-header text-sm">Features & Capabilities</span>
                                </div>
                                <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {(selectedApp.features || []).map((feat, i) => (
                                        <div key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-foreground">
                                            <Check className="w-3.5 h-3.5 text-success-500 mt-0.5 shrink-0" />
                                            <span>{feat}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Specs */}
                            <div className="bg-card rounded-lg border border-gray-200 overflow-hidden dark:border-border">
                                <div className="px-4 h-10 flex items-center border-b border-gray-200 dark:border-border">
                                    <span className="erp-section-header text-sm">Specifications</span>
                                </div>
                                <div className="px-4 py-3">
                                    <dl className="grid grid-cols-2 gap-x-5 gap-y-2.5">
                                        <Spec label="Category" value={catLabel} />
                                        <Spec label="Status" value={<span className="capitalize">{selectedApp.status}</span>} />
                                        <Spec label="Publisher" value={PLATFORM_CONFIG.name} />
                                        <Spec label="License" value={selectedApp.is_core ? "Core (always included)" : selectedApp.is_free ? "Free" : "Subscription"} />
                                        {selectedApp.trial_days > 0 && <Spec label="Trial" value={`${selectedApp.trial_days} days`} />}
                                        <Spec label="Requires" value="Master Data Hub" />
                                    </dl>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-3">
                            <div className="bg-card rounded-lg border border-gray-200 p-4 sticky top-16 dark:border-border">
                                {/* Pricing */}
                                <div className="mb-4">
                                    {selectedApp.is_core ? (
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-lg font-semibold text-gray-900 dark:text-foreground">Included</span>
                                            <span className="text-xs text-gray-500">with all plans</span>
                                        </div>
                                    ) : selectedApp.is_free ? (
                                        <span className="text-lg font-semibold text-success-700">Free</span>
                                    ) : (
                                        <div className="space-y-2">
                                            {showBillingToggle && selectedApp.price_yearly > 0 && (
                                                <BillingSwitch period={billingPeriod} onChange={setBillingPeriod} />
                                            )}
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-2xl font-semibold text-gray-900 dark:text-foreground tabular-nums">
                                                    {currencySymbol}{getModulePrice(selectedApp)}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    /{billingPeriod === "yearly" && selectedApp.price_yearly > 0 ? "year" : "month"}
                                                </span>
                                            </div>
                                            {billingPeriod === "yearly" && selectedApp.price_yearly > 0 && selectedApp.price_monthly > 0 && (
                                                <p className="text-xs font-medium text-success-700">
                                                    Save {Math.round((1 - selectedApp.price_yearly / (selectedApp.price_monthly * 12)) * 100)}% vs monthly
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Action */}
                                {isAvailable && installed ? (
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => navigate(selectedApp.dashboard_route || selectedApp.route || "/")}
                                            className="w-full h-9 px-3 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary-600 transition-colors inline-flex items-center justify-center gap-1.5"
                                        >
                                            Open App <ExternalLink className="w-3.5 h-3.5" />
                                        </button>
                                        <p className="text-xs text-center text-success-700 font-medium inline-flex items-center justify-center w-full gap-1">
                                            <Check className="w-3 h-3" /> Already installed
                                        </p>
                                        {!selectedApp.is_core && (
                                            <button
                                                onClick={() => handleUninstall(selectedApp)}
                                                disabled={uninstalling}
                                                className="w-full h-8 px-3 rounded-md text-xs font-medium border border-destructive-100 text-destructive hover:bg-destructive-100 transition-colors inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
                                            >
                                                {uninstalling
                                                    ? <><Loader2 className="w-3 h-3 animate-spin" /> Uninstalling…</>
                                                    : <><Trash2 className="w-3 h-3" /> Uninstall</>}
                                            </button>
                                        )}
                                    </div>
                                ) : isAvailable ? (
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => handleInstall(selectedApp)}
                                            disabled={installing}
                                            className="w-full h-9 px-3 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary-600 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
                                        >
                                            {installing
                                                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing…</>
                                                : getModulePrice(selectedApp) > 0
                                                    ? <><CreditCard className="w-3.5 h-3.5" /> Pay {currencySymbol}{getModulePrice(selectedApp)} & Install</>
                                                    : <><Download className="w-3.5 h-3.5" /> Install</>}
                                        </button>
                                        {selectedApp.trial_days > 0 && !selectedApp.is_free && (
                                            <p className="text-xs text-center text-primary font-medium">
                                                {selectedApp.trial_days}-day free trial
                                            </p>
                                        )}
                                        {getModulePrice(selectedApp) > 0 && (
                                            <p className="text-[11px] text-center text-gray-400 inline-flex items-center justify-center w-full gap-1">
                                                <Shield className="w-3 h-3" /> Secured by Razorpay
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <button disabled className="w-full h-9 rounded-md text-sm font-medium bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-accent/40">
                                        Coming Soon
                                    </button>
                                )}

                                {/* Quick info */}
                                <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 dark:border-border">
                                    <InfoRow icon={<Shield className="w-3.5 h-3.5 text-success-500" />} text={`Verified by ${PLATFORM_CONFIG.name}`} />
                                    <InfoRow icon={<Zap className="w-3.5 h-3.5 text-warning-500" />} text="Instant activation" />
                                    <InfoRow icon={<Package className="w-3.5 h-3.5 text-primary-500" />} text="Works with all master data" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── APP LIST VIEW ────────────────────────────────────────────
    return (
        <div className="min-h-full bg-background">
            {/* Header toolbar */}
            <div className="bg-card border-b border-gray-200 sticky top-0 z-20 dark:border-border">
                <div className="max-w-6xl mx-auto px-4 py-3">
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <Link
                                to="/apps"
                                className="inline-flex items-center justify-center w-7 h-7 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors dark:hover:bg-accent"
                                title="Back to apps"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                            </Link>
                            <div className="min-w-0">
                                <h1 className="text-base font-semibold text-gray-900 dark:text-foreground truncate">Marketplace</h1>
                                <p className="text-xs text-gray-500 truncate">
                                    Discover apps for{" "}
                                    <span className="font-medium text-gray-700 dark:text-foreground">
                                        {activeCompany?.name || "your workspace"}
                                    </span>
                                </p>
                            </div>
                        </div>
                        <div className="text-right hidden sm:block">
                            <div className="text-lg font-semibold text-gray-900 tabular-nums dark:text-foreground">{installedCount}</div>
                            <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Installed</div>
                        </div>
                    </div>

                    {/* Search + toggle row */}
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search apps…"
                                className="w-full h-8 pl-8 pr-2.5 bg-white border border-gray-200 rounded-md text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none dark:bg-card dark:border-border"
                            />
                        </div>

                        {showBillingToggle && (
                            <BillingSwitch period={billingPeriod} onChange={setBillingPeriod} />
                        )}
                    </div>

                    {/* Category tabs — underline style */}
                    <div className="mt-2 -mb-3 flex items-stretch gap-1 border-b border-gray-200 overflow-x-auto erp-scrollbar dark:border-border">
                        {activeCategories.map((pill) => (
                            <button
                                key={pill.key}
                                onClick={() => setCategory(pill.key)}
                                className={cn(
                                    "relative px-3 pb-2 pt-1 text-sm font-medium transition-colors whitespace-nowrap",
                                    category === pill.key
                                        ? "text-primary after:absolute after:left-0 after:right-0 after:-bottom-px after:h-[2px] after:bg-primary"
                                        : "text-gray-500 hover:text-gray-800 dark:hover:text-foreground",
                                )}
                            >
                                {pill.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-6xl mx-auto px-4 py-5">
                {modules.length === 0 ? (
                    <div className="text-center py-16">
                        <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No apps match your search.</p>
                        <button
                            onClick={() => { setSearch(""); setCategory("all"); }}
                            className="mt-2 text-xs text-primary hover:text-primary-700 font-medium"
                        >
                            Clear filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {modules.map((mod) => {
                            const installed = isInstalled(mod);
                            const isAvailable = mod.status === "live" || mod.status === "beta";
                            const catTone = CATEGORY_TONE[mod.category] || "bg-gray-100 text-gray-700";

                            return (
                                <div
                                    key={mod.slug}
                                    onClick={() => setSelectedApp(mod)}
                                    className={cn(
                                        "bg-card rounded-lg border cursor-pointer group transition-colors",
                                        installed
                                            ? "border-primary-200 hover:border-primary-300"
                                            : "border-gray-200 hover:border-gray-300 dark:border-border",
                                        !isAvailable && "opacity-60",
                                    )}
                                >
                                    <div className="p-4">
                                        {/* Header row */}
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-md flex items-center justify-center text-lg bg-primary-50 border border-primary-100 shrink-0 dark:bg-accent/40 dark:border-border">
                                                {mod.icon}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-sm font-semibold text-gray-900 dark:text-foreground group-hover:text-primary transition-colors truncate">
                                                    {mod.name}
                                                </h3>
                                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{mod.tagline}</p>
                                            </div>
                                        </div>

                                        {/* Badges */}
                                        <div className="flex flex-wrap items-center gap-1 mb-3">
                                            <span className={cn("erp-pill", catTone)}>
                                                {CATEGORY_LABELS[mod.category as keyof typeof CATEGORY_LABELS] || mod.category}
                                            </span>
                                            {installed && (
                                                <span className="erp-pill bg-primary-100 text-primary-700">
                                                    <Check className="w-3 h-3" /> Installed
                                                </span>
                                            )}
                                            {mod.status === "beta" && !installed && (
                                                <span className="erp-pill bg-warning-100 text-warning-700">Beta</span>
                                            )}
                                            {mod.status === "coming-soon" && (
                                                <span className="erp-pill bg-gray-100 text-gray-600">Soon</span>
                                            )}
                                        </div>

                                        {/* Features preview */}
                                        <ul className="space-y-1 mb-3 min-h-[54px]">
                                            {(mod.features || []).slice(0, 3).map((f, i) => (
                                                <li key={i} className="text-xs text-gray-600 dark:text-foreground/80 flex items-start gap-1.5">
                                                    <Check className="w-3 h-3 text-success-500 mt-0.5 shrink-0" />
                                                    <span className="line-clamp-1">{f}</span>
                                                </li>
                                            ))}
                                            {(mod.features || []).length > 3 && (
                                                <li className="text-[11px] text-primary font-medium pl-4">
                                                    +{mod.features.length - 3} more
                                                </li>
                                            )}
                                        </ul>

                                        {/* Footer: Price + Action */}
                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-border">
                                            <div>
                                                {mod.is_core ? (
                                                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Included</span>
                                                ) : mod.is_free ? (
                                                    <span className="text-sm font-semibold text-success-700">Free</span>
                                                ) : getModulePrice(mod) > 0 ? (
                                                    <div>
                                                        <span className="text-sm font-semibold text-gray-900 dark:text-foreground tabular-nums">
                                                            {currencySymbol}{getModulePrice(mod)}
                                                        </span>
                                                        <span className="text-[11px] text-gray-500 ml-0.5">
                                                            /{billingPeriod === "yearly" && mod.price_yearly > 0 ? "yr" : "mo"}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm font-semibold text-success-700">Free</span>
                                                )}
                                            </div>

                                            {isAvailable && installed ? (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); navigate(mod.dashboard_route || mod.route || "/"); }}
                                                    className="inline-flex items-center gap-1 h-7 px-2.5 rounded text-xs font-medium bg-primary text-primary-foreground hover:bg-primary-600 transition-colors"
                                                >
                                                    Open <ExternalLink className="w-3 h-3" />
                                                </button>
                                            ) : isAvailable ? (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setSelectedApp(mod); }}
                                                    className="inline-flex items-center gap-1 h-7 px-2.5 rounded text-xs font-medium border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                                                >
                                                    Details <ChevronRight className="w-3 h-3" />
                                                </button>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ── Helpers ─────────────────────────────────────────────────── */

function Spec({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div>
            <dt className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{label}</dt>
            <dd className="text-sm font-medium text-gray-800 mt-0.5 dark:text-foreground">{value}</dd>
        </div>
    );
}

function InfoRow({ icon, text }: { icon: React.ReactNode; text: string }) {
    return (
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-foreground/80">
            <span className="shrink-0">{icon}</span>
            <span>{text}</span>
        </div>
    );
}

function BillingSwitch({ period, onChange }: { period: "monthly" | "yearly"; onChange: (p: "monthly" | "yearly") => void }) {
    return (
        <div className="flex items-center bg-gray-100 rounded-md p-0.5 dark:bg-accent/40">
            {(["monthly", "yearly"] as const).map((p) => (
                <button
                    key={p}
                    onClick={() => onChange(p)}
                    className={cn(
                        "px-2.5 h-6 rounded text-[11px] font-medium transition-colors capitalize",
                        period === p
                            ? "bg-white text-gray-900 shadow-sm dark:bg-card dark:text-foreground"
                            : "text-gray-500 hover:text-gray-700 dark:hover:text-foreground",
                    )}
                >
                    {p}
                </button>
            ))}
        </div>
    );
}
