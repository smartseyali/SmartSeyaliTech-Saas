import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
    Search, AlertTriangle, Clock, CreditCard, CheckCircle2,
    XCircle, ChevronRight, Building2, Loader2, RefreshCw,
    TrendingUp, Ban, LayoutGrid, CalendarDays, Package
} from "lucide-react";

/* ── Types ────────────────────────────────────────────────────────────────── */

interface InstalledApp {
    module_slug: string;
    module_name: string;
    module_icon: string;
    installed_at: string | null;
    trial_ends_at: string | null;
    billing_status: string | null;
    price_monthly: number;
    is_core: boolean;
    is_free: boolean;
}

interface TenantSubscription {
    company_id: number;
    company_name: string;
    is_active: boolean;
    plan_name: string | null;
    plan_id: string | null;
    sub_status: string;
    current_period_start: string | null;
    current_period_end: string | null;
    apps: InstalledApp[];
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
    no_subscription: { label: "No Plan", color: "bg-slate-50 text-slate-500 border-slate-200", icon: Package },
};

const BILLING_STATUS_COLOR: Record<string, string> = {
    active: "text-emerald-700 bg-emerald-50",
    trialing: "text-blue-700 bg-blue-50",
    past_due: "text-orange-700 bg-orange-50",
    cancelled: "text-slate-500 bg-slate-50",
};

/* ── Component ────────────────────────────────────────────────────────────── */

export default function Subscriptions() {
    const navigate = useNavigate();
    const [subscriptions, setSubscriptions] = useState<TenantSubscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<FilterStatus>("all");
    const [expandedId, setExpandedId] = useState<number | null>(null);

    // Edit modal
    const [editModal, setEditModal] = useState<TenantSubscription | null>(null);
    const [editForm, setEditForm] = useState({ status: "", period_end: "", plan_id: "" });
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
            // 1. All companies
            const { data: companies, error: compErr } = await supabase
                .from("companies")
                .select("id, name, is_active")
                .order("created_at", { ascending: false });
            if (compErr) throw compErr;

            // 2. Subscriptions with plan name
            const { data: subs } = await supabase
                .from("subscriptions")
                .select("company_id, plan_id, status, current_period_start, current_period_end, subscription_plans(name)");

            // 3. All system modules (for name/icon/price lookup by slug)
            const { data: sysModules } = await supabase
                .from("system_modules")
                .select("id, slug, name, icon, price_monthly, is_core, is_free");

            const sysModuleBySlug: Record<string, any> = {};
            (sysModules || []).forEach((sm: any) => { sysModuleBySlug[sm.slug] = sm; });

            // 4. Company modules (installed apps per tenant)
            const { data: compModules } = await supabase
                .from("company_modules")
                .select("company_id, module_slug, is_active, installed_at, trial_ends_at, billing_status, created_at")
                .eq("is_active", true);

            // Build lookup maps
            const subsByCompany: Record<number, any> = {};
            (subs || []).forEach((s: any) => { subsByCompany[s.company_id] = s; });

            const appsByCompany: Record<number, InstalledApp[]> = {};
            (compModules || []).forEach((cm: any) => {
                if (!appsByCompany[cm.company_id]) appsByCompany[cm.company_id] = [];
                const sm = sysModuleBySlug[cm.module_slug] || {};
                appsByCompany[cm.company_id].push({
                    module_slug: cm.module_slug,
                    module_name: sm.name || cm.module_slug,
                    module_icon: sm.icon || "📦",
                    installed_at: cm.installed_at || cm.created_at || null,
                    trial_ends_at: cm.trial_ends_at || null,
                    billing_status: cm.billing_status || "active",
                    price_monthly: sm.price_monthly || 0,
                    is_core: sm.is_core || false,
                    is_free: sm.is_free || false,
                });
            });

            const now = new Date();
            const EXPIRY_WARNING_DAYS = 7;

            const mapped: TenantSubscription[] = (companies || []).map((c: any) => {
                const sub = subsByCompany[c.id];
                const apps = appsByCompany[c.id] || [];
                const monthlySpend = apps.reduce((sum, a) => sum + a.price_monthly, 0);
                const periodEnd = sub?.current_period_end ? new Date(sub.current_period_end) : null;
                const daysRemaining = periodEnd ? Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
                const isExpiringSoon = daysRemaining !== null && daysRemaining > 0 && daysRemaining <= EXPIRY_WARNING_DAYS;
                const isExpired = daysRemaining !== null && daysRemaining <= 0;

                let status = sub?.status || (apps.length > 0 ? "active" : "no_subscription");
                if (isExpired && status !== "cancelled") status = "expired";
                else if (isExpiringSoon && status === "active") status = "expiring";

                return {
                    company_id: c.id,
                    company_name: c.name,
                    is_active: c.is_active !== false,
                    plan_name: sub?.subscription_plans?.name || null,
                    plan_id: sub?.plan_id || null,
                    sub_status: status,
                    current_period_start: sub?.current_period_start || null,
                    current_period_end: sub?.current_period_end || null,
                    apps,
                    monthly_spend: monthlySpend,
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

    /* ── Filtering ──────────────────────────────────────────────────────────── */

    const filtered = useMemo(() => {
        return subscriptions.filter((s) => {
            if (filter === "expiring" && !s.is_expiring_soon) return false;
            if (filter === "expired" && !s.is_expired) return false;
            if (filter === "active" && s.sub_status !== "active") return false;
            if (filter === "trialing" && s.sub_status !== "trialing") return false;
            if (filter === "cancelled" && s.sub_status !== "cancelled") return false;
            if (search) {
                const q = search.toLowerCase();
                return s.company_name.toLowerCase().includes(q) || (s.plan_name || "").toLowerCase().includes(q);
            }
            return true;
        });
    }, [subscriptions, filter, search]);

    const stats = useMemo(() => {
        const active = subscriptions.filter(s => s.sub_status === "active").length;
        const expiring = subscriptions.filter(s => s.is_expiring_soon).length;
        const expired = subscriptions.filter(s => s.is_expired).length;
        const totalRevenue = subscriptions.reduce((sum, s) => sum + s.monthly_spend, 0);
        return { active, expiring, expired, totalRevenue };
    }, [subscriptions]);

    /* ── Edit modal ─────────────────────────────────────────────────────────── */

    const openEdit = (sub: TenantSubscription) => {
        setEditModal(sub);
        setEditForm({
            status: sub.sub_status === "expiring" ? "active" : sub.sub_status,
            period_end: sub.current_period_end ? sub.current_period_end.split("T")[0] : "",
            plan_id: sub.plan_id || "",
        });
    };

    const handleSaveSubscription = async () => {
        if (!editModal) return;
        setSaving(true);
        try {
            const { data: existing } = await supabase
                .from("subscriptions")
                .select("id")
                .eq("company_id", editModal.company_id)
                .maybeSingle();

            const payload: any = {
                status: editForm.status,
                current_period_end: editForm.period_end ? new Date(editForm.period_end).toISOString() : null,
            };
            if (editForm.plan_id) payload.plan_id = editForm.plan_id;

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

    /* ── Helpers ─────────────────────────────────────────────────────────────── */

    const fmtDate = (dateStr: string | null) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    };

    const filterPills: { label: string; value: FilterStatus; count?: number }[] = [
        { label: "All", value: "all" },
        { label: "Active", value: "active", count: stats.active },
        { label: "Expiring", value: "expiring", count: stats.expiring },
        { label: "Expired", value: "expired", count: stats.expired },
        { label: "Trial", value: "trialing" },
        { label: "Cancelled", value: "cancelled" },
    ];

    /* ── Render ──────────────────────────────────────────────────────────────── */

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
                        Manage tenant subscriptions, installed apps, and billing
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

            {/* Alert banners */}
            {stats.expiring > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-amber-800">
                            {stats.expiring} tenant{stats.expiring > 1 ? "s" : ""} expiring within 7 days
                        </p>
                    </div>
                    <button onClick={() => setFilter("expiring")} className="px-3 py-1.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-md hover:bg-amber-200 transition-colors">
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
                    </div>
                    <button onClick={() => setFilter("expired")} className="px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors">
                        View
                    </button>
                </div>
            )}

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Active", value: stats.active, icon: CheckCircle2, bg: "bg-emerald-50", fg: "text-emerald-600" },
                    { label: "Expiring Soon", value: stats.expiring, icon: AlertTriangle, bg: "bg-amber-50", fg: "text-amber-600" },
                    { label: "Expired", value: stats.expired, icon: XCircle, bg: "bg-red-50", fg: "text-red-600" },
                    { label: "Monthly Revenue", value: `\u20B9${stats.totalRevenue.toLocaleString("en-IN")}`, icon: TrendingUp, bg: "bg-blue-50", fg: "text-teal-600" },
                ].map((card, i) => (
                    <div key={i} className="bg-white border border-slate-200 rounded-lg p-4">
                        <div className={`p-1.5 rounded-lg ${card.bg} inline-flex mb-2`}>
                            <card.icon className={`w-4 h-4 ${card.fg}`} />
                        </div>
                        <p className="text-2xl font-semibold text-slate-900">{card.value}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{card.label}</p>
                    </div>
                ))}
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
                                }`}>{pill.count}</span>
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
                                <th className="px-4 py-2.5 text-xs font-medium text-slate-500 w-8" />
                                <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Tenant</th>
                                <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Plan</th>
                                <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Status</th>
                                <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Installed Apps</th>
                                <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Monthly Spend</th>
                                <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Subscription Period</th>
                                <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Days Left</th>
                                <th className="px-4 py-2.5 text-xs font-medium text-slate-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filtered.map((sub) => {
                                const statusConf = STATUS_CONFIG[sub.sub_status] || STATUS_CONFIG.active;
                                const StatusIcon = statusConf.icon;
                                const isExpanded = expandedId === sub.company_id;

                                return (
                                    <>
                                        <tr
                                            key={sub.company_id}
                                            className={`hover:bg-slate-50/50 transition-colors ${
                                                sub.is_expired ? "bg-red-50/30" : sub.is_expiring_soon ? "bg-amber-50/30" : ""
                                            }`}
                                        >
                                            {/* Expand */}
                                            <td className="px-4 py-2.5">
                                                <button
                                                    onClick={() => setExpandedId(isExpanded ? null : sub.company_id)}
                                                    className="p-0.5 rounded hover:bg-slate-100 transition-colors"
                                                >
                                                    <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                                                </button>
                                            </td>

                                            {/* Tenant */}
                                            <td className="px-4 py-2.5">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600 shrink-0">
                                                        {sub.company_name[0]}
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-medium text-slate-900">{sub.company_name}</span>
                                                        {!sub.is_active && (
                                                            <span className="ml-2 text-[10px] font-medium text-red-600 bg-red-50 px-1.5 py-0.5 rounded">Suspended</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Plan */}
                                            <td className="px-4 py-2.5 text-sm text-slate-600">
                                                {sub.plan_name || <span className="text-slate-400">-</span>}
                                            </td>

                                            {/* Status */}
                                            <td className="px-4 py-2.5">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${statusConf.color}`}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {statusConf.label}
                                                </span>
                                            </td>

                                            {/* Installed Apps — show names inline */}
                                            <td className="px-4 py-2.5">
                                                {sub.apps.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1 max-w-[240px]">
                                                        {sub.apps.slice(0, 3).map((app) => (
                                                            <span key={app.module_slug} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                                                                <span className="text-xs">{app.module_icon}</span>
                                                                {app.module_name}
                                                            </span>
                                                        ))}
                                                        {sub.apps.length > 3 && (
                                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-600">
                                                                +{sub.apps.length - 3} more
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400">No apps</span>
                                                )}
                                            </td>

                                            {/* Monthly Spend */}
                                            <td className="px-4 py-2.5 text-sm text-slate-600">
                                                {sub.monthly_spend > 0 ? `\u20B9${sub.monthly_spend.toLocaleString("en-IN")}` : <span className="text-slate-400">Free</span>}
                                            </td>

                                            {/* Period */}
                                            <td className="px-4 py-2.5">
                                                {sub.current_period_start || sub.current_period_end ? (
                                                    <div className="text-xs text-slate-500">
                                                        <span>{fmtDate(sub.current_period_start)}</span>
                                                        <span className="mx-1 text-slate-300">→</span>
                                                        <span className={sub.is_expired ? "text-red-600 font-medium" : sub.is_expiring_soon ? "text-amber-600 font-medium" : ""}>
                                                            {fmtDate(sub.current_period_end)}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400">-</span>
                                                )}
                                            </td>

                                            {/* Days Left */}
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

                                            {/* Actions */}
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

                                        {/* ── Expanded detail row ────────────────────────── */}
                                        {isExpanded && (
                                            <tr key={`detail-${sub.company_id}`}>
                                                <td colSpan={9} className="bg-slate-50/80 px-6 py-4">
                                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                                                        {/* Subscription Details */}
                                                        <div className="space-y-3">
                                                            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                                                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                                                                Subscription Details
                                                            </h3>
                                                            <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2.5">
                                                                <DetailRow label="Plan" value={sub.plan_name || "No plan assigned"} />
                                                                <DetailRow label="Status" value={statusConf.label} />
                                                                <DetailRow label="Start Date" value={fmtDate(sub.current_period_start)} />
                                                                <DetailRow label="End Date" value={fmtDate(sub.current_period_end)} />
                                                                <DetailRow
                                                                    label="Days Remaining"
                                                                    value={
                                                                        sub.days_remaining !== null
                                                                            ? sub.days_remaining <= 0 ? "Expired" : `${sub.days_remaining} days`
                                                                            : "Unlimited"
                                                                    }
                                                                    highlight={sub.days_remaining !== null && sub.days_remaining <= 7}
                                                                />
                                                                <DetailRow label="Monthly Spend" value={sub.monthly_spend > 0 ? `\u20B9${sub.monthly_spend.toLocaleString("en-IN")}/mo` : "Free"} />
                                                                <DetailRow label="Tenant Status" value={sub.is_active ? "Active" : "Suspended"} />
                                                            </div>
                                                        </div>

                                                        {/* Installed Apps — full detail */}
                                                        <div className="lg:col-span-2 space-y-3">
                                                            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                                                <LayoutGrid className="w-3.5 h-3.5 text-slate-400" />
                                                                Installed Apps ({sub.apps.length})
                                                            </h3>
                                                            {sub.apps.length > 0 ? (
                                                                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                                                                    <table className="w-full text-left">
                                                                        <thead>
                                                                            <tr className="bg-slate-50/60 border-b border-slate-100">
                                                                                <th className="px-3 py-2 text-[11px] font-medium text-slate-500">App</th>
                                                                                <th className="px-3 py-2 text-[11px] font-medium text-slate-500">Installed</th>
                                                                                <th className="px-3 py-2 text-[11px] font-medium text-slate-500">Trial Ends</th>
                                                                                <th className="px-3 py-2 text-[11px] font-medium text-slate-500">Billing</th>
                                                                                <th className="px-3 py-2 text-[11px] font-medium text-slate-500 text-right">Price</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody className="divide-y divide-slate-50">
                                                                            {sub.apps.map((app) => (
                                                                                <tr key={app.module_slug} className="hover:bg-slate-50/50">
                                                                                    <td className="px-3 py-2">
                                                                                        <div className="flex items-center gap-2">
                                                                                            <span className="text-base">{app.module_icon}</span>
                                                                                            <div>
                                                                                                <span className="text-sm font-medium text-slate-800">{app.module_name}</span>
                                                                                                {app.is_core && (
                                                                                                    <span className="ml-1.5 text-[10px] font-medium text-slate-400 bg-slate-100 px-1 py-0.5 rounded">Core</span>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td className="px-3 py-2 text-xs text-slate-500">
                                                                                        {fmtDate(app.installed_at)}
                                                                                    </td>
                                                                                    <td className="px-3 py-2 text-xs">
                                                                                        {app.trial_ends_at ? (
                                                                                            <span className={
                                                                                                new Date(app.trial_ends_at) < new Date()
                                                                                                    ? "text-red-600 font-medium"
                                                                                                    : "text-slate-500"
                                                                                            }>
                                                                                                {fmtDate(app.trial_ends_at)}
                                                                                            </span>
                                                                                        ) : (
                                                                                            <span className="text-slate-400">-</span>
                                                                                        )}
                                                                                    </td>
                                                                                    <td className="px-3 py-2">
                                                                                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[11px] font-medium capitalize ${
                                                                                            BILLING_STATUS_COLOR[app.billing_status || "active"] || "text-slate-500 bg-slate-50"
                                                                                        }`}>
                                                                                            {app.billing_status || "active"}
                                                                                        </span>
                                                                                    </td>
                                                                                    <td className="px-3 py-2 text-xs text-slate-600 text-right">
                                                                                        {app.is_core || app.is_free
                                                                                            ? <span className="text-slate-400">Free</span>
                                                                                            : app.price_monthly > 0
                                                                                                ? `\u20B9${app.price_monthly}/mo`
                                                                                                : <span className="text-slate-400">Free</span>
                                                                                        }
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            ) : (
                                                                <div className="bg-white border border-slate-200 rounded-lg px-4 py-8 text-center">
                                                                    <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                                                    <p className="text-sm text-slate-400">No apps installed for this tenant</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                );
                            })}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="px-4 py-12 text-center text-sm text-slate-400">
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

            {/* ── Edit Subscription Modal ─────────────────────────────────────── */}
            {editModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                            <div>
                                <h2 className="text-base font-semibold text-slate-900">Manage Subscription</h2>
                                <p className="text-xs text-slate-500 mt-0.5">{editModal.company_name}</p>
                            </div>
                            <button onClick={() => setEditModal(null)} className="p-1 rounded hover:bg-slate-100 text-slate-400">
                                <XCircle className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="px-5 py-4 space-y-4">
                            {/* Current info summary */}
                            <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500">Current Plan</span>
                                    <span className="font-medium text-slate-700">{editModal.plan_name || "None"}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500">Apps Installed</span>
                                    <span className="font-medium text-slate-700">
                                        {editModal.apps.map(a => a.module_name).join(", ") || "None"}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500">Monthly Spend</span>
                                    <span className="font-medium text-slate-700">
                                        {editModal.monthly_spend > 0 ? `\u20B9${editModal.monthly_spend.toLocaleString("en-IN")}` : "Free"}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500">Current Period</span>
                                    <span className="font-medium text-slate-700">
                                        {fmtDate(editModal.current_period_start)} → {fmtDate(editModal.current_period_end)}
                                    </span>
                                </div>
                            </div>

                            {/* Plan */}
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1.5">Subscription Plan</label>
                                <select
                                    value={editForm.plan_id}
                                    onChange={(e) => setEditForm({ ...editForm, plan_id: e.target.value })}
                                    className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                >
                                    <option value="">No plan</option>
                                    {plans.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1.5">Subscription Status</label>
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
                                <label className="block text-xs font-medium text-slate-600 mb-1.5">Subscription End Date</label>
                                <input
                                    type="date"
                                    value={editForm.period_end}
                                    onChange={(e) => setEditForm({ ...editForm, period_end: e.target.value })}
                                    className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                />
                                <p className="text-xs text-slate-400 mt-1">Leave empty for unlimited. Alerts trigger 7 days before expiry.</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100">
                            <button onClick={() => setEditModal(null)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors">
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

/* ── Helper Components ────────────────────────────────────────────────────── */

function DetailRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
    return (
        <div className="flex items-start justify-between gap-2">
            <span className="text-xs text-slate-400 shrink-0">{label}</span>
            <span className={`text-xs font-medium text-right ${highlight ? "text-red-600" : "text-slate-700"}`}>
                {value}
            </span>
        </div>
    );
}
