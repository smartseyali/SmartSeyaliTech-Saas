import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
    Search, AlertTriangle, Clock, CreditCard, CheckCircle2,
    XCircle, ChevronRight, Building2, Loader2, RefreshCw,
    CalendarDays, TrendingUp, Ban
} from "lucide-react";

interface TenantSubscription {
    company_id: number;
    company_name: string;
    plan_name: string | null;
    plan_id: string | null;
    status: string;
    current_period_start: string | null;
    current_period_end: string | null;
    modules_count: number;
    monthly_spend: number;
    days_remaining: number | null;
    is_expiring_soon: boolean;
    is_expired: boolean;
}

type FilterStatus = "all" | "active" | "expiring" | "expired" | "trialing" | "cancelled";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
    active: { label: "Active", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
    trialing: { label: "Trial", color: "bg-blue-50 text-blue-700 border-blue-200", icon: Clock },
    expiring: { label: "Expiring Soon", color: "bg-amber-50 text-amber-700 border-amber-200", icon: AlertTriangle },
    expired: { label: "Expired", color: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
    cancelled: { label: "Cancelled", color: "bg-slate-50 text-slate-600 border-slate-200", icon: Ban },
    past_due: { label: "Past Due", color: "bg-orange-50 text-orange-700 border-orange-200", icon: AlertTriangle },
};

export default function Subscriptions() {
    const navigate = useNavigate();
    const [subscriptions, setSubscriptions] = useState<TenantSubscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<FilterStatus>("all");
    const [editModal, setEditModal] = useState<TenantSubscription | null>(null);
    const [editForm, setEditForm] = useState({ status: "", period_end: "" });
    const [saving, setSaving] = useState(false);
    const [plans, setPlans] = useState<{ id: string; name: string }[]>([]);

    useEffect(() => {
        loadSubscriptions();
        loadPlans();
    }, []);

    const loadPlans = async () => {
        const { data } = await supabase
            .from("subscription_plans")
            .select("id, name")
            .eq("is_active", true);
        if (data) setPlans(data);
    };

    const loadSubscriptions = async () => {
        setLoading(true);
        try {
            // Fetch all companies
            const { data: companies, error: compErr } = await supabase
                .from("companies")
                .select("id, name, is_active")
                .order("created_at", { ascending: false });
            if (compErr) throw compErr;

            // Fetch subscriptions
            const { data: subs } = await supabase
                .from("subscriptions")
                .select("company_id, plan_id, status, current_period_start, current_period_end, subscription_plans(name)");

            // Fetch company modules for spend calculation
            const { data: compModules } = await supabase
                .from("company_modules")
                .select("company_id, is_active, module_slug, system_modules(price_monthly)")
                .eq("is_active", true);

            // Build lookup maps
            const subsByCompany: Record<number, any> = {};
            (subs || []).forEach((s: any) => {
                subsByCompany[s.company_id] = s;
            });

            const modulesByCompany: Record<number, { count: number; spend: number }> = {};
            (compModules || []).forEach((cm: any) => {
                if (!modulesByCompany[cm.company_id]) modulesByCompany[cm.company_id] = { count: 0, spend: 0 };
                modulesByCompany[cm.company_id].count++;
                modulesByCompany[cm.company_id].spend += cm.system_modules?.price_monthly || 0;
            });

            const now = new Date();
            const EXPIRY_WARNING_DAYS = 7;

            const mapped: TenantSubscription[] = (companies || []).map((c: any) => {
                const sub = subsByCompany[c.id];
                const mods = modulesByCompany[c.id] || { count: 0, spend: 0 };
                const periodEnd = sub?.current_period_end ? new Date(sub.current_period_end) : null;
                const daysRemaining = periodEnd ? Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
                const isExpiringSoon = daysRemaining !== null && daysRemaining > 0 && daysRemaining <= EXPIRY_WARNING_DAYS;
                const isExpired = daysRemaining !== null && daysRemaining <= 0;

                let status = sub?.status || (mods.count > 0 ? "active" : "no_subscription");
                if (isExpired && status !== "cancelled") status = "expired";
                else if (isExpiringSoon && status === "active") status = "expiring";

                return {
                    company_id: c.id,
                    company_name: c.name,
                    plan_name: sub?.subscription_plans?.name || null,
                    plan_id: sub?.plan_id || null,
                    status,
                    current_period_start: sub?.current_period_start || null,
                    current_period_end: sub?.current_period_end || null,
                    modules_count: mods.count,
                    monthly_spend: mods.spend,
                    days_remaining: daysRemaining,
                    is_expiring_soon: isExpiringSoon,
                    is_expired: isExpired,
                };
            });

            setSubscriptions(mapped);
        } catch (err) {
            console.error("Failed to load subscriptions:", err);
            toast.error("Failed to load subscriptions");
        } finally {
            setLoading(false);
        }
    };

    const filtered = useMemo(() => {
        return subscriptions.filter((s) => {
            if (filter === "expiring" && !s.is_expiring_soon) return false;
            if (filter === "expired" && !s.is_expired) return false;
            if (filter === "active" && s.status !== "active") return false;
            if (filter === "trialing" && s.status !== "trialing") return false;
            if (filter === "cancelled" && s.status !== "cancelled") return false;
            if (search) {
                const q = search.toLowerCase();
                return s.company_name.toLowerCase().includes(q) || (s.plan_name || "").toLowerCase().includes(q);
            }
            return true;
        });
    }, [subscriptions, filter, search]);

    // Stats
    const stats = useMemo(() => {
        const active = subscriptions.filter(s => s.status === "active").length;
        const expiring = subscriptions.filter(s => s.is_expiring_soon).length;
        const expired = subscriptions.filter(s => s.is_expired).length;
        const totalRevenue = subscriptions.reduce((sum, s) => sum + s.monthly_spend, 0);
        return { active, expiring, expired, totalRevenue };
    }, [subscriptions]);

    const openEdit = (sub: TenantSubscription) => {
        setEditModal(sub);
        setEditForm({
            status: sub.status === "expiring" ? "active" : sub.status,
            period_end: sub.current_period_end ? sub.current_period_end.split("T")[0] : "",
        });
    };

    const handleSaveSubscription = async () => {
        if (!editModal) return;
        setSaving(true);
        try {
            // Check if subscription record exists
            const { data: existing } = await supabase
                .from("subscriptions")
                .select("id")
                .eq("company_id", editModal.company_id)
                .maybeSingle();

            const payload = {
                status: editForm.status,
                current_period_end: editForm.period_end ? new Date(editForm.period_end).toISOString() : null,
            };

            if (existing) {
                const { error } = await supabase
                    .from("subscriptions")
                    .update(payload)
                    .eq("company_id", editModal.company_id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from("subscriptions")
                    .insert({
                        company_id: editModal.company_id,
                        ...payload,
                        current_period_start: new Date().toISOString(),
                    });
                if (error) throw error;
            }

            toast.success(`Subscription updated for ${editModal.company_name}`);
            setEditModal(null);
            loadSubscriptions();
        } catch (err: any) {
            toast.error(err.message || "Failed to update subscription");
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    };

    const filterPills: { label: string; value: FilterStatus; count?: number }[] = [
        { label: "All", value: "all" },
        { label: "Active", value: "active", count: stats.active },
        { label: "Expiring Soon", value: "expiring", count: stats.expiring },
        { label: "Expired", value: "expired", count: stats.expired },
        { label: "Trial", value: "trialing" },
        { label: "Cancelled", value: "cancelled" },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-6 space-y-5 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-semibold text-slate-900">Subscriptions</h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Manage tenant subscriptions, billing, and expiry alerts
                    </p>
                </div>
                <button
                    onClick={loadSubscriptions}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Alert Banner - Expiring Soon */}
            {stats.expiring > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-amber-800">
                            {stats.expiring} tenant{stats.expiring > 1 ? "s" : ""} with subscriptions expiring within 7 days
                        </p>
                        <p className="text-xs text-amber-600 mt-0.5">Review and renew to avoid service interruption.</p>
                    </div>
                    <button
                        onClick={() => setFilter("expiring")}
                        className="px-3 py-1.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-md hover:bg-amber-200 transition-colors"
                    >
                        View
                    </button>
                </div>
            )}

            {stats.expired > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center gap-3">
                    <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-red-800">
                            {stats.expired} tenant{stats.expired > 1 ? "s" : ""} with expired subscriptions
                        </p>
                        <p className="text-xs text-red-600 mt-0.5">These tenants may have lost access to their apps.</p>
                    </div>
                    <button
                        onClick={() => setFilter("expired")}
                        className="px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                    >
                        View
                    </button>
                </div>
            )}

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded-lg bg-emerald-50">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-semibold text-slate-900">{stats.active}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Active subscriptions</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded-lg bg-amber-50">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-semibold text-slate-900">{stats.expiring}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Expiring soon</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded-lg bg-red-50">
                            <XCircle className="w-4 h-4 text-red-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-semibold text-slate-900">{stats.expired}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Expired</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded-lg bg-teal-50">
                            <TrendingUp className="w-4 h-4 text-teal-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-semibold text-slate-900">
                        {"\u20B9"}{stats.totalRevenue.toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">Monthly revenue</p>
                </div>
            </div>

            {/* Search + Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search tenants..."
                        className="w-full h-9 pl-9 pr-4 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
                    />
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                    {filterPills.map((pill) => (
                        <button
                            key={pill.value}
                            onClick={() => setFilter(pill.value)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors inline-flex items-center gap-1.5 ${
                                filter === pill.value
                                    ? "bg-slate-900 text-white"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                        >
                            {pill.label}
                            {pill.count !== undefined && pill.count > 0 && (
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    filter === pill.value ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                                }`}>
                                    {pill.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/60">
                                <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Tenant</th>
                                <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Plan</th>
                                <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Status</th>
                                <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Apps</th>
                                <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Monthly Spend</th>
                                <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Period End</th>
                                <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Days Left</th>
                                <th className="px-4 py-2.5 text-xs font-medium text-slate-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filtered.map((sub) => {
                                const statusConf = STATUS_CONFIG[sub.status] || STATUS_CONFIG.active;
                                const StatusIcon = statusConf.icon;

                                return (
                                    <tr key={sub.company_id} className={`hover:bg-slate-50/50 transition-colors ${sub.is_expired ? "bg-red-50/30" : sub.is_expiring_soon ? "bg-amber-50/30" : ""}`}>
                                        <td className="px-4 py-2.5">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600 shrink-0">
                                                    {sub.company_name[0]}
                                                </div>
                                                <span className="text-sm font-medium text-slate-900">{sub.company_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5 text-sm text-slate-600">
                                            {sub.plan_name || <span className="text-slate-400">No plan</span>}
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${statusConf.color}`}>
                                                <StatusIcon className="w-3 h-3" />
                                                {statusConf.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2.5 text-sm text-slate-600">{sub.modules_count}</td>
                                        <td className="px-4 py-2.5 text-sm text-slate-600">
                                            {sub.monthly_spend > 0 ? `\u20B9${sub.monthly_spend.toLocaleString("en-IN")}` : "-"}
                                        </td>
                                        <td className="px-4 py-2.5 text-sm text-slate-500">
                                            {formatDate(sub.current_period_end)}
                                        </td>
                                        <td className="px-4 py-2.5">
                                            {sub.days_remaining !== null ? (
                                                <span className={`text-sm font-medium ${
                                                    sub.days_remaining <= 0 ? "text-red-600" :
                                                    sub.days_remaining <= 7 ? "text-amber-600" :
                                                    "text-slate-600"
                                                }`}>
                                                    {sub.days_remaining <= 0 ? "Expired" : `${sub.days_remaining}d`}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-slate-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2.5 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => openEdit(sub)}
                                                    className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                                                >
                                                    Manage
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/super-admin/tenants?id=${sub.company_id}`)}
                                                    className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                                                    title="View tenant"
                                                >
                                                    <ChevronRight className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-400">
                                        {search ? "No tenants match your search" : "No subscriptions found"}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="text-xs text-slate-400 text-right">
                {filtered.length} of {subscriptions.length} tenants
            </div>

            {/* Edit Subscription Modal */}
            {editModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                            <div>
                                <h2 className="text-base font-semibold text-slate-900">
                                    Manage Subscription
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">{editModal.company_name}</p>
                            </div>
                            <button
                                onClick={() => setEditModal(null)}
                                className="p-1 rounded hover:bg-slate-100 text-slate-400"
                            >
                                <XCircle className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="px-5 py-4 space-y-4">
                            {/* Current info */}
                            <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500">Current Plan</span>
                                    <span className="font-medium text-slate-700">{editModal.plan_name || "None"}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500">Apps Installed</span>
                                    <span className="font-medium text-slate-700">{editModal.modules_count}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500">Monthly Spend</span>
                                    <span className="font-medium text-slate-700">
                                        {editModal.monthly_spend > 0 ? `\u20B9${editModal.monthly_spend.toLocaleString("en-IN")}` : "Free"}
                                    </span>
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                                    Subscription Status
                                </label>
                                <select
                                    value={editForm.status}
                                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                    className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                >
                                    <option value="active">Active</option>
                                    <option value="trialing">Trial</option>
                                    <option value="past_due">Past Due</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="expired">Expired</option>
                                </select>
                            </div>

                            {/* Period End Date */}
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                                    Subscription End Date
                                </label>
                                <input
                                    type="date"
                                    value={editForm.period_end}
                                    onChange={(e) => setEditForm({ ...editForm, period_end: e.target.value })}
                                    className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                />
                                <p className="text-xs text-slate-400 mt-1">
                                    Leave empty for unlimited subscription. Tenants will be alerted 7 days before expiry.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100">
                            <button
                                onClick={() => setEditModal(null)}
                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveSubscription}
                                disabled={saving}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors"
                            >
                                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
