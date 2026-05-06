import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PLATFORM_MODULES, type PlatformModule } from "@/config/modules";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useTenant } from "@/contexts/TenantContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
    Check, Trash2, CreditCard, Calendar,
    Loader2, Plus, Clock, Shield, FileText,
    ShoppingCart, Monitor, Target, TrendingUp, Package, ShoppingBag,
    Users, BarChart3, MessageCircle, Globe, Database, type LucideIcon,
} from "lucide-react";

const MODULE_ICONS: Record<string, LucideIcon> = {
    ecommerce:  ShoppingCart,
    pos:        Monitor,
    crm:        Target,
    sales:      TrendingUp,
    inventory:  Package,
    purchase:   ShoppingBag,
    hrms:       Users,
    finance:    BarChart3,
    whatsapp:   MessageCircle,
    website:    Globe,
    masters:    Database,
};

interface ActiveApp {
    module: PlatformModule;
    installedAt: string | null;
    billingStatus: string;
    trialEndsAt: string | null;
}

export default function Billing() {
    const { activeCompany } = useTenant();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { refreshPermissions, hasModule, isSuperAdmin } = usePermissions();

    const [loading, setLoading] = useState(true);
    const [systemModules, setSystemModules] = useState<any[]>([]);
    const [companyModules, setCompanyModules] = useState<any[]>([]);
    const [uninstallTarget, setUninstallTarget] = useState<PlatformModule | null>(null);
    const [uninstalling, setUninstalling] = useState(false);
    const [installing, setInstalling] = useState<string | null>(null);

    // Load billing data
    useEffect(() => {
        const fetchData = async () => {
            if (!activeCompany?.id) return;
            setLoading(true);
            try {
                const [sysRes, compRes] = await Promise.all([
                    supabase.from("system_modules").select("*"),
                    supabase
                        .from("company_modules")
                        .select("*, system_modules(*)")
                        .eq("company_id", activeCompany.id)
                        .eq("is_active", true),
                ]);
                if (sysRes.data) setSystemModules(sysRes.data);
                if (compRes.data) setCompanyModules(compRes.data);
            } catch (err) {
                console.error("Billing fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [activeCompany?.id]);

    // Derive active apps from company_modules + PLATFORM_MODULES
    const activeApps: ActiveApp[] = PLATFORM_MODULES.filter((mod) => {
        if (mod.isCore) return true;
        return (
            isSuperAdmin ||
            hasModule(mod.name) ||
            hasModule(mod.id)
        );
    }).map((mod) => {
        const cm = companyModules.find(
            (c) =>
                c.system_modules?.slug === mod.id ||
                c.system_modules?.name?.toLowerCase() === mod.name.toLowerCase()
        );
        return {
            module: mod,
            installedAt: cm?.created_at || null,
            billingStatus: mod.isCore ? "core" : cm?.billing_status || "active",
            trialEndsAt: cm?.trial_ends_at || null,
        };
    });

    // Available (not installed) apps
    const availableApps = PLATFORM_MODULES.filter((mod) => {
        if (mod.isCore) return false;
        if (mod.status !== "live" && mod.status !== "beta") return false;
        return !activeApps.some((a) => a.module.id === mod.id);
    });

    // Monthly total
    const monthlyTotal = activeApps.reduce(
        (sum, a) => sum + (a.module.priceMonthly || 0),
        0
    );

    // Next billing date (first of next month)
    const nextBilling = new Date();
    nextBilling.setMonth(nextBilling.getMonth() + 1, 1);
    const nextBillingStr = nextBilling.toLocaleDateString("en-IN", {
        month: "long",
        day: "numeric",
    });

    // Trial days remaining
    const getTrialDaysLeft = (trialEndsAt: string | null): number | null => {
        if (!trialEndsAt) return null;
        const end = new Date(trialEndsAt);
        const now = new Date();
        const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 0;
    };

    // Status label
    const getStatusLabel = (app: ActiveApp) => {
        if (app.module.isCore) return { text: "Core", color: "text-slate-500 bg-slate-50" };
        const trialDays = getTrialDaysLeft(app.trialEndsAt);
        if (app.billingStatus === "trial" && trialDays !== null && trialDays > 0) {
            return {
                text: `Trial (${trialDays} days left)`,
                color: "text-amber-600 bg-amber-50",
            };
        }
        return { text: "Active", color: "text-emerald-600 bg-emerald-50" };
    };

    // Install handler
    const handleInstall = async (mod: PlatformModule) => {
        if (!activeCompany?.id || installing) return;
        setInstalling(mod.id);
        try {
            const sysMod = systemModules.find(
                (m) => m.slug === mod.id || m.name.toLowerCase() === mod.name.toLowerCase()
            );
            if (!sysMod) throw new Error(`Module '${mod.id}' not found in system registry.`);

            const { error } = await supabase.from("company_modules").insert({
                company_id: activeCompany.id,
                module_id: sysMod.id,
                is_active: true,
                billing_status: mod.trialDays > 0 ? "trial" : "active",
                trial_ends_at:
                    mod.trialDays > 0
                        ? new Date(Date.now() + mod.trialDays * 86400000).toISOString()
                        : null,
            });
            if (error && error.code !== "23505") throw error;

            // Ensure user_modules mapping
            if (user) {
                try {
                    await supabase.from("user_modules").insert({
                        company_id: activeCompany.id,
                        user_id: user.id,
                        module_id: sysMod.id,
                        is_active: true,
                    });
                } catch (_) {}
            }

            toast.success(`${mod.name} installed`);
            refreshPermissions();

            // E-Commerce gets an onboarding wizard to set up domain + storefront
            if (mod.id === "ecommerce") {
                navigate("/apps/ecommerce/onboarding");
                return;
            }

            // Refresh company modules
            const { data } = await supabase
                .from("company_modules")
                .select("*, system_modules(*)")
                .eq("company_id", activeCompany.id)
                .eq("is_active", true);
            if (data) setCompanyModules(data);
        } catch (err: any) {
            toast.error(err.message || "Install failed");
        } finally {
            setInstalling(null);
        }
    };

    // Uninstall handler
    const handleUninstall = async () => {
        if (!activeCompany?.id || !uninstallTarget || uninstalling) return;
        setUninstalling(true);
        try {
            const sysMod = systemModules.find(
                (m) =>
                    m.slug === uninstallTarget.id ||
                    m.name.toLowerCase() === uninstallTarget.name.toLowerCase()
            );
            if (!sysMod) throw new Error("Module not found in registry.");

            const { error } = await supabase
                .from("company_modules")
                .update({ is_active: false, billing_status: "cancelled" })
                .eq("company_id", activeCompany.id)
                .eq("module_id", sysMod.id);

            if (error) throw error;

            toast.success(`${uninstallTarget.name} uninstalled`);
            refreshPermissions();

            // Refresh company modules
            const { data } = await supabase
                .from("company_modules")
                .select("*, system_modules(*)")
                .eq("company_id", activeCompany.id)
                .eq("is_active", true);
            if (data) setCompanyModules(data);
        } catch (err: any) {
            toast.error(err.message || "Uninstall failed");
        } finally {
            setUninstalling(false);
            setUninstallTarget(null);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <p className="text-sm text-slate-500">Loading billing...</p>
                </div>
            </div>
        );
    }

    const activeNonCore = activeApps.filter((a) => !a.module.isCore).length;

    return (
        <div className="p-6 md:p-8 max-w-[1100px] mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Section 1: Billing Summary */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 md:p-8 text-white shadow-lg shadow-blue-600/20">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <p className="text-blue-200 text-sm font-medium mb-1">Monthly bill</p>
                        <p className="text-4xl font-bold tracking-tight">
                            {"\u20B9"}{monthlyTotal.toLocaleString("en-IN")}
                            <span className="text-lg font-normal text-blue-200 ml-1">/month</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-blue-100">
                        <span className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            Active apps: {activeNonCore}
                        </span>
                        <span className="hidden md:inline text-blue-300">|</span>
                        <span className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Next billing: {nextBillingStr}
                        </span>
                    </div>
                </div>
            </div>

            {/* Section 2: Active Apps */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                    <h2 className="text-lg font-semibold text-slate-900">Active apps</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-xs text-slate-500 font-medium border-b border-slate-100">
                                <th className="px-6 py-3">App</th>
                                <th className="px-6 py-3">Price</th>
                                <th className="px-6 py-3 hidden md:table-cell">Installed</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeApps.map((app) => {
                                const status = getStatusLabel(app);
                                return (
                                    <tr
                                        key={app.module.id}
                                        className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-sm flex-shrink-0",
                                                    app.module.colorFrom || "from-blue-500",
                                                    app.module.colorTo || "to-blue-700"
                                                )}>
                                                    {(() => { const Icon = MODULE_ICONS[app.module.id]; return Icon ? <Icon className="w-[18px] h-[18px] text-white" strokeWidth={1.75} /> : <span className="text-sm">{app.module.icon}</span>; })()}
                                                </div>
                                                <span className="font-medium text-slate-900">
                                                    {app.module.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-700">
                                            {app.module.isFree
                                                ? "Free"
                                                : `\u20B9${app.module.priceMonthly.toLocaleString("en-IN")}/mo`}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 hidden md:table-cell">
                                            {app.module.isCore
                                                ? "Included"
                                                : app.installedAt
                                                ? new Date(app.installedAt).toLocaleDateString(
                                                      "en-IN",
                                                      { month: "short", day: "numeric", year: "numeric" }
                                                  )
                                                : "--"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}
                                            >
                                                {status.text === "Active" && (
                                                    <Check className="w-3 h-3" />
                                                )}
                                                {status.text === "Core" && (
                                                    <Shield className="w-3 h-3" />
                                                )}
                                                {status.text.startsWith("Trial") && (
                                                    <Clock className="w-3 h-3" />
                                                )}
                                                {status.text}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {app.module.isCore ? (
                                                <span className="text-xs text-slate-300">--</span>
                                            ) : (
                                                <button
                                                    onClick={() => setUninstallTarget(app.module)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    Uninstall
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {activeApps.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                        No active apps
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Section 3: Available Apps */}
            {availableApps.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Available apps</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {availableApps.map((mod) => (
                            <div
                                key={mod.id}
                                className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 hover:border-blue-200 hover:shadow-sm transition-all"
                            >
                                <div className={cn(
                                    "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-sm flex-shrink-0",
                                    mod.colorFrom || "from-blue-500",
                                    mod.colorTo || "to-blue-700"
                                )}>
                                    {(() => { const Icon = MODULE_ICONS[mod.id]; return Icon ? <Icon className="w-6 h-6 text-white" strokeWidth={1.75} /> : <span className="text-2xl">{mod.icon}</span>; })()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-slate-900 text-sm truncate">
                                        {mod.name}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {mod.isFree
                                            ? "Free"
                                            : `\u20B9${mod.priceMonthly.toLocaleString("en-IN")}/mo`}
                                        {mod.trialDays > 0 && (
                                            <span className="text-blue-500 ml-1">
                                                ({mod.trialDays}-day trial)
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleInstall(mod)}
                                    disabled={installing === mod.id}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
                                >
                                    {installing === mod.id ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <Plus className="w-3.5 h-3.5" />
                                    )}
                                    Install
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Section 4: Billing History Placeholder */}
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-500">Payment history coming soon</p>
                <p className="text-xs text-slate-400 mt-1">
                    Invoices and payment records will appear here.
                </p>
            </div>

            {/* Uninstall Confirmation Dialog */}
            {uninstallTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-sm flex-shrink-0",
                                uninstallTarget.colorFrom || "from-blue-500",
                                uninstallTarget.colorTo || "to-blue-700"
                            )}>
                                {(() => { const Icon = MODULE_ICONS[uninstallTarget.id]; return Icon ? <Icon className="w-5 h-5 text-white" strokeWidth={1.75} /> : <span className="text-lg">{uninstallTarget.icon}</span>; })()}
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">
                                Uninstall {uninstallTarget.name}?
                            </h3>
                        </div>
                        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                            You will lose access to all {uninstallTarget.name} features. Your data
                            will be preserved and available if you reinstall later.
                        </p>
                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={() => setUninstallTarget(null)}
                                disabled={uninstalling}
                                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUninstall}
                                disabled={uninstalling}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                            >
                                {uninstalling ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Trash2 className="w-4 h-4" />
                                )}
                                Uninstall
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
