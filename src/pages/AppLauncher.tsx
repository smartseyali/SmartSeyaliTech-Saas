import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, ExternalLink, ShoppingBag, Grid3X3, Plus, Trash2, MoreVertical, X, LogOut } from "lucide-react";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useTenant } from "@/contexts/TenantContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import PLATFORM_CONFIG from "@/config/platform";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface InstalledModule {
    id: string;
    slug: string;
    name: string;
    tagline: string;
    icon: string;
    color_from: string;
    color_to: string;
    route: string;
    dashboard_route: string;
    category: string;
    status: string;
    is_core: boolean;
}

export default function AppLauncher() {
    const navigate = useNavigate();
    const { activeCompany } = useTenant();
    const { hasModule, isSuperAdmin, refreshPermissions } = usePermissions();
    const { signOut } = useAuth();
    const [search, setSearch] = useState("");
    const [dbModules, setDbModules] = useState<InstalledModule[]>([]);
    const [companySlugs, setCompanySlugs] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [menuOpen, setMenuOpen] = useState<string | null>(null);
    const [uninstalling, setUninstalling] = useState(false);

    // Fetch all system modules + this company's installed module slugs
    useEffect(() => {
        const fetchModules = async () => {
            setLoading(true);

            const { data, error } = await supabase
                .from("system_modules")
                .select("id, slug, name, tagline, icon, color_from, color_to, route, dashboard_route, category, status, is_core")
                .eq("is_active", true)
                .order("sort_order", { ascending: true });

            if (!error && data) {
                setDbModules(data as InstalledModule[]);
            }

            // Fetch this company's installed modules
            if (activeCompany) {
                const { data: cmData } = await supabase
                    .from("company_modules")
                    .select("module_slug")
                    .eq("company_id", activeCompany.id)
                    .eq("is_active", true);
                setCompanySlugs(new Set((cmData || []).map((cm: any) => cm.module_slug)));
            } else {
                setCompanySlugs(new Set());
            }

            setLoading(false);
        };
        fetchModules();
    }, [activeCompany?.id]);

    // Close menu on outside click
    useEffect(() => {
        if (!menuOpen) return;
        const handler = () => setMenuOpen(null);
        document.addEventListener("click", handler);
        return () => document.removeEventListener("click", handler);
    }, [menuOpen]);

    const handleUninstall = async (mod: InstalledModule) => {
        if (!activeCompany) return;
        if (mod.is_core) {
            toast.error("Core modules cannot be uninstalled.");
            return;
        }
        if (!confirm(`Uninstall "${mod.name}" from ${activeCompany.name}?`)) return;

        setUninstalling(true);
        try {
            const { error } = await supabase
                .from("company_modules")
                .delete()
                .eq("company_id", activeCompany.id)
                .eq("module_slug", mod.slug);
            if (error) throw error;

            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    await supabase.from("user_modules").delete()
                        .eq("company_id", activeCompany.id)
                        .eq("module_slug", mod.slug);
                }
            } catch { /* optional */ }

            refreshPermissions();
            setDbModules(prev => prev); // trigger re-filter
            toast.success(`${mod.name} has been uninstalled.`);
        } catch (err: any) {
            toast.error(err.message || "Failed to uninstall");
        } finally {
            setUninstalling(false);
            setMenuOpen(null);
        }
    };

    const installedModules = useMemo(() => {
        return dbModules.filter((m) => {
            if (m.slug === "masters") return false;
            // Show only core modules + modules actually installed for this company
            const installed = m.is_core || companySlugs.has(m.slug) || hasModule(m.name) || hasModule(m.slug);
            if (!installed) return false;
            // Search filter
            const q = search.toLowerCase();
            return !q || m.name.toLowerCase().includes(q) || (m.tagline || "").toLowerCase().includes(q);
        });
    }, [search, dbModules, companySlugs, hasModule]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-gray-500 font-medium">Loading apps...</p>
                </div>
            </div>
        );
    }

    // No installed modules → direct to marketplace
    if (installedModules.length === 0 && !search) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <ShoppingBag className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">No apps installed yet</h2>
                    <p className="text-gray-500 mb-8">
                        Visit the Marketplace to browse and install apps for{" "}
                        <span className="font-semibold text-gray-700">{activeCompany?.name || "your business"}</span>
                    </p>
                    <Link
                        to="/marketplace"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <ShoppingBag className="w-4 h-4" />
                        Go to Marketplace
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                                Your Apps
                            </h1>
                            <p className="text-sm text-gray-500 mt-0.5">
                                {installedModules.length} app{installedModules.length !== 1 ? "s" : ""} installed for{" "}
                                <span className="font-medium text-gray-700">{activeCompany?.name || "your business"}</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link
                                to="/marketplace"
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">Get More Apps</span>
                                <span className="sm:hidden">More</span>
                            </Link>
                            <button
                                onClick={async () => { await signOut(); navigate("/login"); }}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>

                    {/* Search */}
                    {installedModules.length > 4 && (
                        <div className="relative max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search your apps..."
                                className="w-full h-10 bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* App Grid */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {search && installedModules.length === 0 ? (
                    <div className="text-center py-16">
                        <Search className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No installed apps match "{search}"</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {installedModules.map((mod) => (
                            <div key={mod.slug} className="relative group">
                                <button
                                    onClick={() => navigate(mod.dashboard_route || mod.route || "/")}
                                    className="w-full bg-white rounded-2xl border border-gray-200 p-5 text-center hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                >
                                    <div className={cn(
                                        "w-14 h-14 rounded-xl flex items-center justify-center text-3xl bg-gradient-to-br shadow-sm mx-auto mb-3 group-hover:scale-110 transition-transform",
                                        mod.color_from || "from-blue-500",
                                        mod.color_to || "to-blue-600"
                                    )}>
                                        {mod.icon}
                                    </div>
                                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                        {mod.name}
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{mod.tagline}</p>
                                </button>

                                {/* Uninstall menu - only for non-core modules */}
                                {!mod.is_core && (
                                    <div className="absolute top-2 right-2 z-10">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === mod.slug ? null : mod.slug); }}
                                            className="p-1 rounded-lg bg-white/80 border border-gray-200 opacity-0 group-hover:opacity-100 hover:bg-gray-100 transition-all"
                                        >
                                            <MoreVertical className="w-3.5 h-3.5 text-gray-500" />
                                        </button>
                                        {menuOpen === mod.slug && (
                                            <div className="absolute right-0 top-8 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); navigate(`/marketplace`); }}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                    View in Marketplace
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleUninstall(mod); }}
                                                    disabled={uninstalling}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    {uninstalling ? "Uninstalling..." : "Uninstall"}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Add more apps tile */}
                        <Link
                            to="/marketplace"
                            className="group bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-5 text-center hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-200 flex flex-col items-center justify-center"
                        >
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-white border border-gray-200 mx-auto mb-3 group-hover:border-blue-300 transition-colors">
                                <Plus className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                            </div>
                            <h3 className="text-sm font-medium text-gray-500 group-hover:text-blue-600 transition-colors">
                                Get More Apps
                            </h3>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
