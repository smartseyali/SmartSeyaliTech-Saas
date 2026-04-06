import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { PLATFORM_MODULES } from "@/config/modules";
import { toast } from "sonner";
import {
    Building2, Users, CreditCard, LayoutGrid,
    Eye, Pause, Loader2, AlertTriangle, Clock, ArrowRight
} from "lucide-react";

interface DashboardStats {
    totalTenants: number;
    tenantsThisMonth: number;
    activeUsers: number;
    monthlyRevenue: number;
    appsInstalled: number;
}

interface ExpiringSubscription {
    company_id: number;
    company_name: string;
    days_remaining: number;
    period_end: string;
}

interface RecentTenant {
    id: number;
    name: string;
    industry_type: string;
    contact_email: string;
    is_active: boolean;
    created_at: string;
    apps_count: number;
}

export default function SuperAdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats>({
        totalTenants: 0,
        tenantsThisMonth: 0,
        activeUsers: 0,
        monthlyRevenue: 0,
        appsInstalled: 0,
    });
    const [recentTenants, setRecentTenants] = useState<RecentTenant[]>([]);
    const [expiringSubs, setExpiringSubs] = useState<ExpiringSubscription[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch companies
            const { data: companies, error: compErr } = await supabase
                .from("companies")
                .select("id, name, industry_type, contact_email, is_active, created_at")
                .order("created_at", { ascending: false });

            if (compErr) throw compErr;

            // Fetch user count
            const { count: userCount, error: userErr } = await supabase
                .from("users")
                .select("id", { count: "exact" });

            if (userErr) throw userErr;

            // Fetch system modules for pricing lookup by slug
            const { data: sysModules } = await supabase
                .from("system_modules")
                .select("slug, price_monthly");

            const priceBySlug: Record<string, number> = {};
            (sysModules || []).forEach((sm: any) => { priceBySlug[sm.slug] = sm.price_monthly || 0; });

            // Fetch active company modules
            const { data: companyModules, error: modErr } = await supabase
                .from("company_modules")
                .select("id, company_id, module_slug, is_active")
                .eq("is_active", true);

            if (modErr) throw modErr;

            // Calculate monthly revenue from active module prices
            const monthlyRevenue = (companyModules || []).reduce((sum: number, cm: any) => {
                return sum + (priceBySlug[cm.module_slug] || 0);
            }, 0);

            // Count tenants created this month
            const now = new Date();
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            const tenantsThisMonth = (companies || []).filter(
                (c: any) => c.created_at >= monthStart
            ).length;

            // Build apps count per company for recent tenants
            const appsByCompany: Record<number, number> = {};
            (companyModules || []).forEach((cm: any) => {
                appsByCompany[cm.company_id] = (appsByCompany[cm.company_id] || 0) + 1;
            });

            const recent: RecentTenant[] = (companies || []).slice(0, 10).map((c: any) => ({
                id: c.id,
                name: c.name,
                industry_type: c.industry_type || "-",
                contact_email: c.contact_email || "-",
                is_active: c.is_active !== false,
                created_at: c.created_at,
                apps_count: appsByCompany[c.id] || 0,
            }));

            // Fetch expiring subscriptions
            const { data: subs } = await supabase
                .from("subscriptions")
                .select("company_id, current_period_end, companies(name)")
                .not("current_period_end", "is", null);

            const nowTs = now.getTime();
            const WARNING_DAYS = 14;
            const expiring: ExpiringSubscription[] = (subs || [])
                .map((s: any) => {
                    const endDate = new Date(s.current_period_end);
                    const daysLeft = Math.ceil((endDate.getTime() - nowTs) / (1000 * 60 * 60 * 24));
                    return {
                        company_id: s.company_id,
                        company_name: s.companies?.name || "Unknown",
                        days_remaining: daysLeft,
                        period_end: s.current_period_end,
                    };
                })
                .filter((s: ExpiringSubscription) => s.days_remaining <= WARNING_DAYS)
                .sort((a: ExpiringSubscription, b: ExpiringSubscription) => a.days_remaining - b.days_remaining);

            setExpiringSubs(expiring);

            setStats({
                totalTenants: companies?.length || 0,
                tenantsThisMonth,
                activeUsers: userCount || 0,
                monthlyRevenue,
                appsInstalled: companyModules?.length || 0,
            });
            setRecentTenants(recent);
        } catch (err) {
            console.error("Dashboard fetch error:", err);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const handleSuspend = async (tenantId: number, tenantName: string) => {
        if (!confirm(`Suspend "${tenantName}"? This will deactivate their account.`)) return;

        const { error } = await supabase
            .from("companies")
            .update({ is_active: false })
            .eq("id", tenantId);

        if (error) {
            toast.error("Failed to suspend tenant");
            return;
        }

        toast.success(`${tenantName} has been suspended`);
        setRecentTenants((prev) =>
            prev.map((t) => (t.id === tenantId ? { ...t, is_active: false } : t))
        );
    };

    const statCards = [
        {
            label: "Total tenants",
            value: stats.totalTenants,
            subtitle: `+${stats.tenantsThisMonth} this month`,
            icon: Building2,
            iconBg: "bg-blue-50",
            iconColor: "text-blue-600",
        },
        {
            label: "Active users",
            value: stats.activeUsers,
            subtitle: "Across all tenants",
            icon: Users,
            iconBg: "bg-violet-50",
            iconColor: "text-violet-600",
        },
        {
            label: "Monthly revenue",
            value: `₹${stats.monthlyRevenue.toLocaleString("en-IN")}`,
            subtitle: "From active app subscriptions",
            icon: CreditCard,
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-600",
        },
        {
            label: "Apps installed",
            value: stats.appsInstalled,
            subtitle: "Active module installs",
            icon: LayoutGrid,
            iconBg: "bg-amber-50",
            iconColor: "text-amber-600",
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
                <p className="text-sm text-slate-500 mt-0.5">
                    Platform overview and recent activity
                </p>
            </div>

            {/* Stat cards — 2x2 grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card, i) => (
                    <div
                        key={i}
                        className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className={`p-2 rounded-lg ${card.iconBg}`}>
                                <card.icon className={`w-4 h-4 ${card.iconColor}`} />
                            </div>
                        </div>
                        <p className="text-2xl font-semibold text-slate-900 tracking-tight">
                            {card.value}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">{card.label}</p>
                        <p className="text-xs text-slate-400 mt-1">{card.subtitle}</p>
                    </div>
                ))}
            </div>

            {/* Subscription Expiry Alerts */}
            {expiringSubs.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                    <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            <h2 className="text-sm font-medium text-slate-900">
                                Subscription Alerts
                            </h2>
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                                {expiringSubs.length}
                            </span>
                        </div>
                        <button
                            onClick={() => navigate("/super-admin/subscriptions")}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                        >
                            Manage all
                            <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {expiringSubs.slice(0, 5).map((sub) => (
                            <div
                                key={sub.company_id}
                                className={`px-5 py-3 flex items-center justify-between ${
                                    sub.days_remaining <= 0 ? "bg-red-50/50" : sub.days_remaining <= 3 ? "bg-amber-50/50" : ""
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600">
                                        {sub.company_name[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">{sub.company_name}</p>
                                        <p className="text-xs text-slate-400">
                                            Ends {new Date(sub.period_end).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {sub.days_remaining <= 0 ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                                            Expired
                                        </span>
                                    ) : (
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                                            sub.days_remaining <= 3 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                                        }`}>
                                            <Clock className="w-3 h-3" />
                                            {sub.days_remaining}d left
                                        </span>
                                    )}
                                    <button
                                        onClick={() => navigate(`/super-admin/subscriptions`)}
                                        className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                                    >
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Middle row: Revenue chart + Recent tenants */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue chart placeholder */}
                <div className="bg-white border border-slate-200 rounded-lg p-5 lg:col-span-1">
                    <h2 className="text-sm font-medium text-slate-900 mb-4">
                        Revenue trend
                    </h2>
                    <div className="flex items-center justify-center h-48 bg-slate-50 rounded-md border border-dashed border-slate-200">
                        <p className="text-xs text-slate-400">
                            Chart coming soon
                        </p>
                    </div>
                </div>

                {/* Recent tenants table */}
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden lg:col-span-2">
                    <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-sm font-medium text-slate-900">
                            Recent tenants
                        </h2>
                        <button
                            onClick={() => navigate("/super-admin/tenants")}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                            View all
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/60">
                                    <th className="px-4 py-2.5 text-xs font-medium text-slate-500">
                                        Company
                                    </th>
                                    <th className="px-4 py-2.5 text-xs font-medium text-slate-500">
                                        Industry
                                    </th>
                                    <th className="px-4 py-2.5 text-xs font-medium text-slate-500">
                                        Apps
                                    </th>
                                    <th className="px-4 py-2.5 text-xs font-medium text-slate-500">
                                        Email
                                    </th>
                                    <th className="px-4 py-2.5 text-xs font-medium text-slate-500">
                                        Status
                                    </th>
                                    <th className="px-4 py-2.5 text-xs font-medium text-slate-500">
                                        Created
                                    </th>
                                    <th className="px-4 py-2.5 text-xs font-medium text-slate-500 text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {recentTenants.map((tenant) => (
                                    <tr
                                        key={tenant.id}
                                        className="hover:bg-slate-50/50 transition-colors"
                                    >
                                        <td className="px-4 py-2.5">
                                            <span className="text-sm font-medium text-slate-900">
                                                {tenant.name}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2.5 text-sm text-slate-600">
                                            {tenant.industry_type}
                                        </td>
                                        <td className="px-4 py-2.5 text-sm text-slate-600">
                                            {tenant.apps_count}
                                        </td>
                                        <td className="px-4 py-2.5 text-sm text-slate-500">
                                            {tenant.contact_email}
                                        </td>
                                        <td className="px-4 py-2.5">
                                            {tenant.is_active ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                                                    Suspended
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2.5 text-sm text-slate-500">
                                            {new Date(tenant.created_at).toLocaleDateString("en-IN", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </td>
                                        <td className="px-4 py-2.5 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() =>
                                                        navigate(
                                                            `/super-admin/tenants?id=${tenant.id}`
                                                        )
                                                    }
                                                    className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                                                    title="View"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>
                                                {tenant.is_active && (
                                                    <button
                                                        onClick={() =>
                                                            handleSuspend(tenant.id, tenant.name)
                                                        }
                                                        className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                                                        title="Suspend"
                                                    >
                                                        <Pause className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {recentTenants.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-4 py-8 text-center text-sm text-slate-400"
                                        >
                                            No tenants found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Bottom: Recent activity placeholder */}
            <div className="bg-white border border-slate-200 rounded-lg p-5">
                <h2 className="text-sm font-medium text-slate-900 mb-4">
                    Recent activity
                </h2>
                <div className="flex items-center justify-center h-32 bg-slate-50 rounded-md border border-dashed border-slate-200">
                    <p className="text-xs text-slate-400">
                        Activity feed coming soon
                    </p>
                </div>
            </div>
        </div>
    );
}
