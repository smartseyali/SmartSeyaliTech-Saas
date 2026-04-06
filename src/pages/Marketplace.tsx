import { useState, useMemo, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, Check, Download, ExternalLink, X, ArrowLeft, Star, Shield, Clock, Zap, ChevronRight, Tag, Package, Globe, Trash2 } from "lucide-react";
import { CATEGORY_LABELS } from "@/config/modules";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useTenant } from "@/contexts/TenantContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import PLATFORM_CONFIG from "@/config/platform";
import { cn } from "@/lib/utils";

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

const CATEGORY_PILLS: { key: CategoryFilter; label: string; icon: string }[] = [
    { key: "all", label: "All Apps", icon: "🏪" },
    { key: "commerce", label: "Commerce", icon: "🛒" },
    { key: "operations", label: "Operations", icon: "⚙️" },
    { key: "customer", label: "Customer", icon: "🎯" },
    { key: "people", label: "People", icon: "👥" },
    { key: "finance", label: "Finance", icon: "💰" },
    { key: "analytics", label: "Analytics", icon: "📊" },
    { key: "collaboration", label: "Collaboration", icon: "🤝" },
];

const CATEGORY_COLORS: Record<string, string> = {
    commerce: "bg-blue-50 text-blue-700 border-blue-200",
    operations: "bg-amber-50 text-amber-700 border-amber-200",
    customer: "bg-red-50 text-red-700 border-red-200",
    people: "bg-green-50 text-green-700 border-green-200",
    finance: "bg-teal-50 text-teal-700 border-teal-200",
    analytics: "bg-purple-50 text-purple-700 border-purple-200",
    collaboration: "bg-orange-50 text-orange-700 border-orange-200",
};

export default function Marketplace() {
    const navigate = useNavigate();
    const { activeCompany } = useTenant();
    const { hasModule, isSuperAdmin, refreshPermissions } = usePermissions();
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState<CategoryFilter>("all");
    const [installing, setInstalling] = useState(false);
    const [uninstalling, setUninstalling] = useState(false);
    const [dbModules, setDbModules] = useState<SystemModule[]>([]);
    const [loadingModules, setLoadingModules] = useState(true);
    const [companySlugs, setCompanySlugs] = useState<Set<string>>(new Set());

    // Detail view state
    const [selectedApp, setSelectedApp] = useState<SystemModule | null>(null);

    useEffect(() => {
        const fetchModules = async () => {
            setLoadingModules(true);
            const { data, error } = await supabase
                .from("system_modules")
                .select("*")
                .eq("is_active", true)
                .order("sort_order", { ascending: true });

            if (!error && data) {
                setDbModules(data as SystemModule[]);
            }

            // Fetch this company's installed modules
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

    const handleInstall = async (mod: SystemModule) => {
        if (!activeCompany) {
            toast.error("Please select a company first.");
            return;
        }
        // Prevent double-install
        if (isInstalled(mod)) {
            toast.info(`${mod.name} is already installed.`);
            return;
        }
        setInstalling(true);
        try {
            const { error: cmErr } = await supabase.from("company_modules").upsert({
                company_id: activeCompany.id,
                module_id: mod.id,
                module_slug: mod.slug,
                is_active: true,
                installed_at: new Date().toISOString(),
            }, { onConflict: "company_id,module_slug" });
            if (cmErr) throw cmErr;

            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    await supabase.from("user_modules").insert({
                        user_id: user.id,
                        module_slug: mod.slug,
                        company_id: activeCompany.id,
                    });
                }
            } catch {
                // user_modules insert is optional
            }

            // Create ecom_settings if ecommerce module
            if (mod.slug === "ecommerce") {
                await supabase.from("ecom_settings").insert([{
                    company_id: activeCompany.id,
                    store_name: activeCompany.name,
                    primary_color: "#2563eb",
                }]).then(() => {});
            }

            refreshPermissions();
            setCompanySlugs(prev => new Set([...prev, mod.slug]));
            toast.success(`${mod.name} installed successfully!`);
        } catch (err: any) {
            console.error("Install error:", err);
            toast.error(err.message || "Failed to install module");
        } finally {
            setInstalling(false);
        }
    };

    const handleUninstall = async (mod: SystemModule) => {
        if (!activeCompany) {
            toast.error("Please select a company first.");
            return;
        }
        if (mod.is_core) {
            toast.error("Core modules cannot be uninstalled.");
            return;
        }
        if (!confirm(`Uninstall "${mod.name}" from ${activeCompany.name}? This will remove access to this app.`)) return;

        setUninstalling(true);
        try {
            // Remove from company_modules
            const { error: cmErr } = await supabase
                .from("company_modules")
                .delete()
                .eq("company_id", activeCompany.id)
                .eq("module_slug", mod.slug);
            if (cmErr) throw cmErr;

            // Remove from user_modules
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    await supabase
                        .from("user_modules")
                        .delete()
                        .eq("company_id", activeCompany.id)
                        .eq("module_slug", mod.slug);
                }
            } catch {
                // user_modules delete is optional
            }

            refreshPermissions();
            setCompanySlugs(prev => { const next = new Set(prev); next.delete(mod.slug); return next; });
            toast.success(`${mod.name} has been uninstalled.`);
            setSelectedApp(null);
        } catch (err: any) {
            console.error("Uninstall error:", err);
            toast.error(err.message || "Failed to uninstall module");
        } finally {
            setUninstalling(false);
        }
    };

    const activeCategories = useMemo(() => {
        const cats = new Set(
            dbModules.filter((m) => m.slug !== "masters" && m.status !== "planned").map((m) => m.category)
        );
        return CATEGORY_PILLS.filter((p) => p.key === "all" || cats.has(p.key));
    }, [dbModules]);

    const installedCount = useMemo(() => dbModules.filter(m => isInstalled(m) && m.slug !== "masters").length, [dbModules]);

    if (loadingModules) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-gray-500 font-medium">Loading marketplace...</p>
                </div>
            </div>
        );
    }

    // ── APP DETAIL VIEW ──────────────────────────────────────────
    if (selectedApp) {
        const installed = isInstalled(selectedApp);
        const isAvailable = selectedApp.status === "live" || selectedApp.status === "beta";
        const catLabel = CATEGORY_LABELS[selectedApp.category as keyof typeof CATEGORY_LABELS] || selectedApp.category;
        const catColor = CATEGORY_COLORS[selectedApp.category] || "bg-gray-50 text-gray-700 border-gray-200";

        return (
            <div className="min-h-screen bg-gray-50">
                {/* Top bar */}
                <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3">
                        <button
                            onClick={() => setSelectedApp(null)}
                            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Marketplace
                        </button>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                        <span className="text-sm font-medium text-gray-900">{selectedApp.name}</span>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Hero */}
                            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                                {/* Banner gradient */}
                                <div className={cn("h-32 bg-gradient-to-br", selectedApp.color_from || "from-blue-500", selectedApp.color_to || "to-blue-700", "relative")}>
                                    <div className="absolute inset-0 bg-black/10" />
                                </div>

                                <div className="px-6 pb-6 -mt-10 relative">
                                    <div className="flex items-end gap-4 mb-4">
                                        <div className={cn("w-20 h-20 rounded-2xl flex items-center justify-center text-4xl bg-white shadow-lg border border-gray-100 shrink-0")}>
                                            {selectedApp.icon}
                                        </div>
                                        <div className="pb-1 flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h1 className="text-2xl font-bold text-gray-900">{selectedApp.name}</h1>
                                                {selectedApp.status === "beta" && (
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Beta</span>
                                                )}
                                                {installed && (
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 inline-flex items-center gap-1">
                                                        <Check className="w-3 h-3" /> Installed
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 mt-0.5">{selectedApp.tagline}</p>
                                        </div>
                                    </div>

                                    {/* Meta row */}
                                    <div className="flex flex-wrap items-center gap-3 text-xs">
                                        <span className={cn("px-2.5 py-1 rounded-full font-medium border", catColor)}>
                                            {catLabel}
                                        </span>
                                        <span className="text-gray-400 flex items-center gap-1">
                                            <Globe className="w-3.5 h-3.5" /> {PLATFORM_CONFIG.name}
                                        </span>
                                        {selectedApp.trial_days > 0 && (
                                            <span className="text-gray-400 flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" /> {selectedApp.trial_days}-day trial
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-3">About this app</h2>
                                <p className="text-sm text-gray-600 leading-relaxed">{selectedApp.description}</p>
                            </div>

                            {/* Features */}
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Features & Capabilities</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {(selectedApp.features || []).map((feat, i) => (
                                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                                                <Check className="w-3.5 h-3.5 text-green-600" />
                                            </div>
                                            <span className="text-sm text-gray-700 font-medium">{feat}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Specifications */}
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h2>
                                <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
                                    <div>
                                        <dt className="text-xs font-medium text-gray-400 uppercase tracking-wider">Category</dt>
                                        <dd className="text-sm font-medium text-gray-900 mt-1">{catLabel}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-gray-400 uppercase tracking-wider">Status</dt>
                                        <dd className="text-sm font-medium text-gray-900 mt-1 capitalize">{selectedApp.status}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-gray-400 uppercase tracking-wider">Publisher</dt>
                                        <dd className="text-sm font-medium text-gray-900 mt-1">{PLATFORM_CONFIG.name}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-gray-400 uppercase tracking-wider">License</dt>
                                        <dd className="text-sm font-medium text-gray-900 mt-1">
                                            {selectedApp.is_core ? "Core (Always Included)" : selectedApp.is_free ? "Free" : "Subscription"}
                                        </dd>
                                    </div>
                                    {selectedApp.trial_days > 0 && (
                                        <div>
                                            <dt className="text-xs font-medium text-gray-400 uppercase tracking-wider">Trial Period</dt>
                                            <dd className="text-sm font-medium text-gray-900 mt-1">{selectedApp.trial_days} days</dd>
                                        </div>
                                    )}
                                    <div>
                                        <dt className="text-xs font-medium text-gray-400 uppercase tracking-wider">Requires</dt>
                                        <dd className="text-sm font-medium text-gray-900 mt-1">Master Data Hub</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-5">
                            {/* Install / Open Card */}
                            <div className="bg-white rounded-2xl border border-gray-200 p-5 sticky top-20">
                                {/* Pricing */}
                                <div className="mb-5">
                                    {selectedApp.is_core ? (
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-bold text-gray-900">Included</span>
                                            <span className="text-sm text-gray-500">with all plans</span>
                                        </div>
                                    ) : selectedApp.is_free ? (
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-bold text-green-600">Free</span>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-bold text-gray-900">₹{selectedApp.price_monthly}</span>
                                                <span className="text-sm text-gray-500">/month</span>
                                            </div>
                                            {selectedApp.price_yearly > 0 && (
                                                <p className="text-xs text-gray-400 mt-1">
                                                    or ₹{selectedApp.price_yearly}/year (save {Math.round((1 - selectedApp.price_yearly / (selectedApp.price_monthly * 12)) * 100)}%)
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                {isAvailable && installed ? (
                                    <div className="space-y-3">
                                        <button
                                            onClick={() => navigate(selectedApp.dashboard_route || selectedApp.route || "/")}
                                            className="w-full py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2"
                                        >
                                            Open App
                                            <ExternalLink className="w-4 h-4" />
                                        </button>
                                        <p className="text-xs text-center text-green-600 font-medium flex items-center justify-center gap-1">
                                            <Check className="w-3.5 h-3.5" /> Already installed
                                        </p>
                                        {!selectedApp.is_core && (
                                            <button
                                                onClick={() => handleUninstall(selectedApp)}
                                                disabled={uninstalling}
                                                className="w-full py-2 rounded-xl text-xs font-medium border border-red-200 text-red-600 hover:bg-red-50 transition-colors inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
                                            >
                                                {uninstalling ? (
                                                    <>
                                                        <span className="w-3.5 h-3.5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                                                        Uninstalling...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        Uninstall App
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                ) : isAvailable ? (
                                    <div className="space-y-3">
                                        <button
                                            onClick={() => handleInstall(selectedApp)}
                                            disabled={installing}
                                            className="w-full py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
                                        >
                                            {installing ? (
                                                <>
                                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Installing...
                                                </>
                                            ) : (
                                                <>
                                                    <Download className="w-4 h-4" />
                                                    Install App
                                                </>
                                            )}
                                        </button>
                                        {selectedApp.trial_days > 0 && !selectedApp.is_free && (
                                            <p className="text-xs text-center text-blue-600 font-medium">
                                                Start your {selectedApp.trial_days}-day free trial
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <button disabled className="w-full py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-400 cursor-not-allowed">
                                        Coming Soon
                                    </button>
                                )}

                                {/* Quick Info */}
                                <div className="mt-5 pt-5 border-t border-gray-100 space-y-3">
                                    <div className="flex items-center gap-2.5 text-xs text-gray-500">
                                        <Shield className="w-4 h-4 text-green-500 shrink-0" />
                                        <span>Verified by {PLATFORM_CONFIG.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 text-xs text-gray-500">
                                        <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                                        <span>Instant activation, no setup required</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 text-xs text-gray-500">
                                        <Package className="w-4 h-4 text-blue-500 shrink-0" />
                                        <span>Works with all master data</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── APP LIST VIEW (Marketplace Grid) ────────────────────────
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <Link to="/apps" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                                        <ArrowLeft className="w-4 h-4" />
                                    </Link>
                                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                                        Marketplace
                                    </h1>
                                </div>
                                <p className="text-gray-500 mt-1.5">
                                    Discover and install apps to power{" "}
                                    <span className="font-semibold text-gray-700">
                                        {activeCompany?.name || "your business"}
                                    </span>
                                </p>
                            </div>
                            <div className="text-right hidden sm:block">
                                <div className="text-2xl font-bold text-gray-900">{installedCount}</div>
                                <div className="text-xs text-gray-500 font-medium">Apps Installed</div>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="relative max-w-lg">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search apps..."
                                className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                            />
                        </div>

                        {/* Category Sidebar Pills */}
                        <div className="flex flex-wrap gap-2">
                            {activeCategories.map((pill) => (
                                <button
                                    key={pill.key}
                                    onClick={() => setCategory(pill.key)}
                                    className={cn(
                                        "rounded-xl px-4 py-2 text-sm font-medium transition-all inline-flex items-center gap-2 border",
                                        category === pill.key
                                            ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                    )}
                                >
                                    <span>{pill.icon}</span>
                                    {pill.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {modules.length === 0 ? (
                    <div className="text-center py-24">
                        <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm font-medium">No apps match your search.</p>
                        <button onClick={() => { setSearch(""); setCategory("all"); }} className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium">
                            Clear filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {modules.map((mod) => {
                            const installed = isInstalled(mod);
                            const isAvailable = mod.status === "live" || mod.status === "beta";
                            const catColor = CATEGORY_COLORS[mod.category] || "bg-gray-50 text-gray-700 border-gray-200";

                            return (
                                <div
                                    key={mod.slug}
                                    onClick={() => setSelectedApp(mod)}
                                    className={cn(
                                        "relative bg-white rounded-2xl border cursor-pointer group transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5",
                                        installed
                                            ? "border-blue-200 ring-1 ring-blue-100"
                                            : "border-gray-200 hover:border-gray-300",
                                        !isAvailable && "opacity-60"
                                    )}
                                >
                                    {/* Top gradient stripe */}
                                    <div className={cn("h-1.5 rounded-t-2xl bg-gradient-to-r", mod.color_from || "from-blue-500", mod.color_to || "to-blue-600")} />

                                    <div className="p-5">
                                        {/* Header: Icon + Name + Badge */}
                                        <div className="flex items-start gap-3.5 mb-4">
                                            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br shadow-sm shrink-0", mod.color_from || "from-blue-500", mod.color_to || "to-blue-600")}>
                                                {mod.icon}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                                                        {mod.name}
                                                    </h3>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                                    {mod.tagline}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Category + Status */}
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className={cn("px-2 py-0.5 rounded-md text-[11px] font-medium border", catColor)}>
                                                {CATEGORY_LABELS[mod.category as keyof typeof CATEGORY_LABELS] || mod.category}
                                            </span>
                                            {installed && (
                                                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 text-blue-600 border border-blue-200 inline-flex items-center gap-1">
                                                    <Check className="w-3 h-3" /> Installed
                                                </span>
                                            )}
                                            {mod.status === "beta" && !installed && (
                                                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-600 border border-amber-200">
                                                    Beta
                                                </span>
                                            )}
                                            {mod.status === "coming-soon" && (
                                                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-50 text-gray-500 border border-gray-200">
                                                    Soon
                                                </span>
                                            )}
                                        </div>

                                        {/* Features preview */}
                                        <ul className="space-y-1.5 mb-5">
                                            {(mod.features || []).slice(0, 3).map((f, i) => (
                                                <li key={i} className="text-xs text-gray-500 flex items-start gap-2">
                                                    <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                                                    <span className="line-clamp-1">{f}</span>
                                                </li>
                                            ))}
                                            {(mod.features || []).length > 3 && (
                                                <li className="text-xs text-blue-600 font-medium pl-5">
                                                    +{mod.features.length - 3} more features
                                                </li>
                                            )}
                                        </ul>

                                        {/* Footer: Price + Action */}
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                            <div>
                                                {mod.is_core ? (
                                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Included</span>
                                                ) : mod.is_free ? (
                                                    <span className="text-sm font-bold text-green-600">Free</span>
                                                ) : mod.price_monthly ? (
                                                    <div>
                                                        <span className="text-lg font-bold text-gray-900">₹{mod.price_monthly}</span>
                                                        <span className="text-xs text-gray-400 ml-0.5">/mo</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm font-bold text-green-600">Free</span>
                                                )}
                                            </div>

                                            {isAvailable && installed ? (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); navigate(mod.dashboard_route || mod.route || "/"); }}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                                                >
                                                    Open
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </button>
                                            ) : isAvailable ? (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setSelectedApp(mod); }}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                                                >
                                                    View Details
                                                    <ChevronRight className="w-3.5 h-3.5" />
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
