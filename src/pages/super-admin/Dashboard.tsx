import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { PLATFORM_MODULES } from "@/config/modules";
import { toast } from "sonner";
import {
    Building2, Users, CreditCard, LayoutGrid,
    Eye, Pause, Loader2
} from "lucide-react";

interface DashboardStats {
    totalTenants: number;
    tenantsThisMonth: number;
    activeUsers: number;
    monthlyRevenue: number;
    appsInstalled: number;
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

            // Fetch active company modules with system_modules for pricing
            const { data: companyModules, error: modErr } = await supabase
                .from("company_modules")
                .select("id, company_id, is_active, system_modules(price_monthly)")
                .eq("is_active", true);

            if (modErr) throw modErr;

            // Calculate monthly revenue from active module prices
            const monthlyRevenue = (companyModules || []).reduce((sum: number, cm: any) => {
                return sum + (cm.system_modules?.price_monthly || 0);
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
