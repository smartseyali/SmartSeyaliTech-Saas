import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Check, Download, ExternalLink, X } from "lucide-react";
import { PLATFORM_MODULES, CATEGORY_LABELS } from "@/config/modules";
import type { PlatformModule } from "@/config/modules";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useTenant } from "@/contexts/TenantContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import PLATFORM_CONFIG from "@/config/platform";

type CategoryFilter = "all" | PlatformModule["category"];

const CATEGORY_PILLS: { key: CategoryFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "commerce", label: "Commerce" },
    { key: "operations", label: "Operations" },
    { key: "customer", label: "Customer" },
    { key: "people", label: "People" },
    { key: "finance", label: "Finance" },
    { key: "analytics", label: "Analytics" },
    { key: "collaboration", label: "Collaboration" },
];

export default function AppLauncher() {
    const navigate = useNavigate();
    const { activeCompany } = useTenant();
    const { hasModule, isSuperAdmin, refreshPermissions } = usePermissions();
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState<CategoryFilter>("all");
    const [installTarget, setInstallTarget] = useState<PlatformModule | null>(null);
    const [installing, setInstalling] = useState(false);

    const modules = useMemo(() => {
        return PLATFORM_MODULES.filter((m) => {
            // Masters is always accessed via sidebar, never shown in the grid
            if (m.id === "masters") return false;
            // Hide planned modules
            if (m.status === "planned") return false;

            const q = search.toLowerCase();
            const matchesSearch =
                !q ||
                m.name.toLowerCase().includes(q) ||
                m.tagline.toLowerCase().includes(q) ||
                m.description.toLowerCase().includes(q);
            const matchesCategory = category === "all" || m.category === category;
            return matchesSearch && matchesCategory;
        });
    }, [search, category]);

    const isInstalled = (mod: PlatformModule) =>
        mod.isCore || isSuperAdmin || hasModule(mod.name) || hasModule(mod.id);

    const handleInstall = async (mod: PlatformModule) => {
        if (!activeCompany) {
            toast.error("Please select a company first.");
            return;
        }
        setInstalling(true);
        try {
            // Insert into company_modules
            const { error: cmErr } = await supabase.from("company_modules").insert({
                company_id: activeCompany.id,
                module_slug: mod.id,
                is_active: true,
                installed_at: new Date().toISOString(),
            });
            if (cmErr) throw cmErr;

            // Insert into user_modules (best-effort, table may not exist)
            try {
                const {
                    data: { user },
                } = await supabase.auth.getUser();
                if (user) {
                    await supabase.from("user_modules").insert({
                        user_id: user.id,
                        module_slug: mod.id,
                        company_id: activeCompany.id,
                    });
                }
            } catch {
                // user_modules insert is optional
            }

            refreshPermissions();
            toast.success(`${mod.name} installed successfully`);
            setInstallTarget(null);
        } catch (err: any) {
            console.error("Install error:", err);
            toast.error(err.message || "Failed to install module");
        } finally {
            setInstalling(false);
        }
    };

    // Derive which category pills actually have modules (excluding masters)
    const activeCategories = useMemo(() => {
        const cats = new Set(
            PLATFORM_MODULES.filter((m) => m.id !== "masters" && m.status !== "planned").map(
                (m) => m.category
            )
        );
        return CATEGORY_PILLS.filter((p) => p.key === "all" || cats.has(p.key as any));
    }, []);

    return (
        <div className="min-h-screen bg-gray-50/80">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col gap-5">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">
                                App Marketplace
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Install apps to extend {PLATFORM_CONFIG.name} for{" "}
                                <span className="font-medium text-gray-700">
                                    {activeCompany?.name || "your business"}
                                </span>
                            </p>
                        </div>

                        {/* Search */}
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search apps..."
                                className="w-full h-10 bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
                            />
                        </div>

                        {/* Category pills */}
                        <div className="flex flex-wrap gap-2">
                            {activeCategories.map((pill) => (
                                <button
                                    key={pill.key}
                                    onClick={() => setCategory(pill.key)}
                                    className={`rounded-full px-3 py-1 text-sm transition-colors ${
                                        category === pill.key
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                                >
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
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-sm">No apps match your search.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {modules.map((mod) => {
                            const installed = isInstalled(mod);
                            const isAvailable = mod.status === "live" || mod.status === "beta";

                            return (
                                <div
                                    key={mod.id}
                                    className={`relative bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow ${
                                        installed ? "border-l-4 border-l-blue-500 border-t border-r border-b border-t-gray-200 border-r-gray-200 border-b-gray-200" : "border-gray-200"
                                    } ${!isAvailable ? "opacity-60" : ""}`}
                                >
                                    {/* Badges */}
                                    {installed && (
                                        <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                            <Check className="w-3 h-3" />
                                            Installed
                                        </span>
                                    )}
                                    {mod.status === "beta" && !installed && (
                                        <span className="absolute top-3 right-3 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                                            Beta
                                        </span>
                                    )}
                                    {mod.status === "coming-soon" && (
                                        <span className="absolute top-3 right-3 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                                            Coming soon
                                        </span>
                                    )}

                                    <div className="p-5">
                                        {/* Icon + Name + Tagline */}
                                        <div className="flex items-start gap-3 mb-4">
                                            <div
                                                className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 bg-gradient-to-br ${mod.colorFrom} ${mod.colorTo} shadow-sm`}
                                            >
                                                {mod.icon}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-sm font-semibold text-gray-900 leading-tight">
                                                    {mod.name}
                                                </h3>
                                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                                    {mod.tagline}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Features */}
                                        <ul className="space-y-1 mb-5">
                                            {mod.features.slice(0, 3).map((f, i) => (
                                                <li
                                                    key={i}
                                                    className="text-xs text-gray-500 flex items-start gap-1.5"
                                                >
                                                    <span className="text-gray-300 mt-0.5 shrink-0">
                                                        &#8226;
                                                    </span>
                                                    <span className="line-clamp-1">{f}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        {/* Price + Action */}
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                            <div>
                                                {mod.isCore ? (
                                                    <span className="text-xs font-medium text-gray-500">
                                                        Included
                                                    </span>
                                                ) : mod.isFree ? (
                                                    <span className="text-xs font-medium text-green-600">
                                                        Free
                                                    </span>
                                                ) : (
                                                    <span className="text-sm font-semibold text-gray-900">
                                                        ₹{mod.priceMonthly}
                                                        <span className="text-xs font-normal text-gray-400">
                                                            /mo
                                                        </span>
                                                    </span>
                                                )}
                                            </div>

                                            {isAvailable && installed ? (
                                                <button
                                                    onClick={() => navigate(mod.dashboardRoute)}
                                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                                >
                                                    Open
                                                    <ExternalLink className="w-3 h-3" />
                                                </button>
                                            ) : isAvailable ? (
                                                <button
                                                    onClick={() => setInstallTarget(mod)}
                                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                                                >
                                                    Install
                                                    <Download className="w-3 h-3" />
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

            {/* Install Confirmation Modal */}
            {installTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => !installing && setInstallTarget(null)}
                    />
                    <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <button
                            onClick={() => !installing && setInstallTarget(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-4">
                            <div
                                className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br ${installTarget.colorFrom} ${installTarget.colorTo}`}
                            >
                                {installTarget.icon}
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Install {installTarget.name}?
                                </h2>
                                <p className="text-sm text-gray-500">{installTarget.tagline}</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 mb-5 space-y-2">
                            {installTarget.isFree ? (
                                <p className="text-sm text-gray-600">
                                    This is a <span className="font-medium text-green-600">free</span> app.
                                </p>
                            ) : (
                                <p className="text-sm text-gray-600">
                                    This will add{" "}
                                    <span className="font-semibold text-gray-900">
                                        ₹{installTarget.priceMonthly}/mo
                                    </span>{" "}
                                    to your billing.
                                </p>
                            )}
                            {installTarget.trialDays > 0 && (
                                <p className="text-sm text-blue-600 font-medium">
                                    {installTarget.trialDays}-day free trial included
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-3 justify-end">
                            <button
                                onClick={() => setInstallTarget(null)}
                                disabled={installing}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleInstall(installTarget)}
                                disabled={installing}
                                className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                            >
                                {installing ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Installing...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4" />
                                        Install
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
