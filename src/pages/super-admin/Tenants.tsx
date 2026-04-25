import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { toast } from "sonner";
import {
    Search, Plus, MoreHorizontal, Eye, Pause, Play, Trash2,
    Building2, Users, CreditCard, LayoutGrid, ChevronDown,
    X, Loader2, ChevronRight
} from "lucide-react";

interface CompanyApp {
    module_slug: string;
    module_name: string;
    module_icon: string;
    installed_at: string;
    billing_status: string;
    trial_ends_at: string | null;
}

interface Company {
    id: number;
    name: string;
    industry_type: string;
    contact_email: string;
    contact_phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    gst_number: string;
    is_active: boolean;
    created_at: string;
    apps_count: number;
    modules: CompanyApp[];
    admins: { full_name: string; email: string }[];
}

type FilterStatus = "all" | "active" | "suspended";

const EMPTY_FORM = {
    name: "",
    industry_type: "",
    contact_email: "",
    contact_phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    gst_number: "",
};

export default function Tenants() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { setCompany } = useTenant();

    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState<FilterStatus>("all");
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [actionMenuId, setActionMenuId] = useState<number | null>(null);

    // Create/Edit modal
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState({ ...EMPTY_FORM });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadCompanies();
    }, []);

    // Auto-expand if ?id= is in the URL
    useEffect(() => {
        const idParam = searchParams.get("id");
        if (idParam) {
            setExpandedId(Number(idParam));
        }
    }, [searchParams]);

    const loadCompanies = async () => {
        setLoading(true);
        try {
            // Fetch companies
            const { data: compData, error: compErr } = await supabase
                .from("companies")
                .select("*")
                .order("created_at", { ascending: false });

            if (compErr) throw compErr;

            // Fetch system modules for name/icon lookup
            const { data: sysModules } = await supabase
                .from("system_modules")
                .select("slug, name, icon");

            const sysModuleBySlug: Record<string, { name: string; icon: string }> = {};
            (sysModules || []).forEach((sm: any) => {
                sysModuleBySlug[sm.slug] = { name: sm.name, icon: sm.icon || "📦" };
            });

            // Fetch all active company modules (incl. trial info)
            const { data: modules, error: modErr } = await supabase
                .from("company_modules")
                .select("company_id, module_slug, is_active, installed_at, created_at, billing_status, trial_ends_at")
                .eq("is_active", true);

            if (modErr) throw modErr;

            // Fetch company users with user details
            const { data: companyUsers, error: cuErr } = await supabase
                .from("company_users")
                .select("company_id, role, users(full_name, username)");

            if (cuErr) throw cuErr;

            // Build lookup maps
            const modulesByCompany: Record<number, CompanyApp[]> = {};
            (modules || []).forEach((m: any) => {
                if (!modulesByCompany[m.company_id]) modulesByCompany[m.company_id] = [];
                const sm = sysModuleBySlug[m.module_slug] || { name: m.module_slug, icon: "📦" };
                modulesByCompany[m.company_id].push({
                    module_slug: m.module_slug,
                    module_name: sm.name,
                    module_icon: sm.icon,
                    installed_at: m.installed_at || m.created_at,
                    billing_status: m.billing_status || "active",
                    trial_ends_at: m.trial_ends_at || null,
                });
            });

            const adminsByCompany: Record<number, { full_name: string; email: string }[]> = {};
            (companyUsers || []).forEach((cu: any) => {
                if (!adminsByCompany[cu.company_id]) adminsByCompany[cu.company_id] = [];
                if (cu.users) {
                    adminsByCompany[cu.company_id].push({
                        full_name: cu.users.full_name || "",
                        email: cu.users.username || "",
                    });
                }
            });

            const mapped: Company[] = (compData || []).map((c: any) => ({
                id: c.id,
                name: c.name,
                industry_type: c.industry_type || "",
                contact_email: c.contact_email || "",
                contact_phone: c.contact_phone || "",
                address: c.address || "",
                city: c.city || "",
                state: c.state || "",
                pincode: c.pincode || "",
                gst_number: c.gst_number || "",
                is_active: c.is_active !== false,
                created_at: c.created_at,
                apps_count: modulesByCompany[c.id]?.length || 0,
                modules: modulesByCompany[c.id] || [],
                admins: adminsByCompany[c.id] || [],
            }));

            setCompanies(mapped);
        } catch (err) {
            console.error("Failed to load tenants:", err);
            toast.error("Failed to load tenants");
        } finally {
            setLoading(false);
        }
    };

    // Filtered + searched
    const filtered = companies.filter((c) => {
        if (filter === "active" && !c.is_active) return false;
        if (filter === "suspended" && c.is_active) return false;
        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            return (
                c.name.toLowerCase().includes(q) ||
                c.contact_email.toLowerCase().includes(q) ||
                c.industry_type.toLowerCase().includes(q)
            );
        }
        return true;
    });

    // Toggle suspend/activate
    const handleToggleActive = async (company: Company) => {
        const action = company.is_active ? "suspend" : "activate";
        if (!confirm(`${company.is_active ? "Suspend" : "Activate"} "${company.name}"?`)) return;

        const { error } = await supabase
            .from("companies")
            .update({ is_active: !company.is_active })
            .eq("id", company.id);

        if (error) {
            toast.error(`Failed to ${action} tenant`);
            return;
        }

        toast.success(`${company.name} has been ${action}d`);
        setCompanies((prev) =>
            prev.map((c) =>
                c.id === company.id ? { ...c, is_active: !c.is_active } : c
            )
        );
        setActionMenuId(null);
    };

    // Delete (soft)
    const handleDelete = async (company: Company) => {
        if (!confirm(`Delete "${company.name}"? This action cannot be undone.`)) return;

        const { error } = await supabase
            .from("companies")
            .delete()
            .eq("id", company.id);

        if (error) {
            toast.error("Failed to delete tenant");
            return;
        }

        toast.success(`${company.name} has been deleted`);
        setCompanies((prev) => prev.filter((c) => c.id !== company.id));
        setActionMenuId(null);
        if (expandedId === company.id) setExpandedId(null);
    };

    // Switch to tenant
    const handleSwitchToTenant = (company: Company) => {
        setCompany(company.id);
        navigate("/apps");
        setActionMenuId(null);
    };

    // Create / Edit form submit
    const handleFormSubmit = async () => {
        if (!form.name.trim()) {
            toast.error("Company name is required");
            return;
        }

        setSaving(true);
        try {
            if (editingId) {
                // Update
                const { error } = await supabase
                    .from("companies")
                    .update({
                        name: form.name,
                        industry_type: form.industry_type,
                        contact_email: form.contact_email,
                        contact_phone: form.contact_phone,
                        address: form.address,
                        city: form.city,
                        state: form.state,
                        pincode: form.pincode,
                        gst_number: form.gst_number,
                    })
                    .eq("id", editingId);

                if (error) throw error;
                toast.success("Tenant updated");
            } else {
                // Create
                const { error } = await supabase.from("companies").insert({
                    name: form.name,
                    industry_type: form.industry_type,
                    contact_email: form.contact_email,
                    contact_phone: form.contact_phone,
                    address: form.address,
                    city: form.city,
                    state: form.state,
                    pincode: form.pincode,
                    gst_number: form.gst_number,
                    is_active: true,
                });

                if (error) throw error;
                toast.success("Tenant created");
            }

            setShowModal(false);
            setEditingId(null);
            setForm({ ...EMPTY_FORM });
            loadCompanies();
        } catch (err) {
            console.error("Save error:", err);
            toast.error("Failed to save tenant");
        } finally {
            setSaving(false);
        }
    };

    const openEdit = (company: Company) => {
        setEditingId(company.id);
        setForm({
            name: company.name,
            industry_type: company.industry_type,
            contact_email: company.contact_email,
            contact_phone: company.contact_phone,
            address: company.address,
            city: company.city,
            state: company.state,
            pincode: company.pincode,
            gst_number: company.gst_number,
        });
        setShowModal(true);
        setActionMenuId(null);
    };

    const openCreate = () => {
        setEditingId(null);
        setForm({ ...EMPTY_FORM });
        setShowModal(true);
    };

    const filterPills: { label: string; value: FilterStatus }[] = [
        { label: "All", value: "all" },
        { label: "Active", value: "active" },
        { label: "Suspended", value: "suspended" },
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
                    <h1 className="text-xl font-semibold text-slate-900">Tenants</h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Manage all registered companies on the platform
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    New tenant
                </button>
            </div>

            {/* Search + Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search tenants..."
                        className="w-full h-9 pl-9 pr-4 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
                    />
                </div>
                <div className="flex items-center gap-1">
                    {filterPills.map((pill) => (
                        <button
                            key={pill.value}
                            onClick={() => setFilter(pill.value)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                filter === pill.value
                                    ? "bg-slate-900 text-white"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                        >
                            {pill.label}
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
                                <th className="px-4 py-2.5 text-xs font-medium text-slate-500">
                                    Company
                                </th>
                                <th className="px-4 py-2.5 text-xs font-medium text-slate-500">
                                    Industry
                                </th>
                                <th className="px-4 py-2.5 text-xs font-medium text-slate-500">
                                    Email
                                </th>
                                <th className="px-4 py-2.5 text-xs font-medium text-slate-500">
                                    Phone
                                </th>
                                <th className="px-4 py-2.5 text-xs font-medium text-slate-500">
                                    GST
                                </th>
                                <th className="px-4 py-2.5 text-xs font-medium text-slate-500">
                                    Apps
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
                            {filtered.map((company) => (
                                <>
                                    <tr
                                        key={company.id}
                                        className="hover:bg-slate-50/50 transition-colors group"
                                    >
                                        <td className="px-4 py-2.5">
                                            <button
                                                onClick={() =>
                                                    setExpandedId(
                                                        expandedId === company.id
                                                            ? null
                                                            : company.id
                                                    )
                                                }
                                                className="p-0.5 rounded hover:bg-slate-100 transition-colors"
                                            >
                                                <ChevronRight
                                                    className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                                                        expandedId === company.id
                                                            ? "rotate-90"
                                                            : ""
                                                    }`}
                                                />
                                            </button>
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600 shrink-0">
                                                    {company.name[0]}
                                                </div>
                                                <span className="text-sm font-medium text-slate-900">
                                                    {company.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5 text-sm text-slate-600">
                                            {company.industry_type || "-"}
                                        </td>
                                        <td className="px-4 py-2.5 text-sm text-slate-500">
                                            {company.contact_email || "-"}
                                        </td>
                                        <td className="px-4 py-2.5 text-sm text-slate-500">
                                            {company.contact_phone || "-"}
                                        </td>
                                        <td className="px-4 py-2.5 text-sm text-slate-500 font-mono text-xs">
                                            {company.gst_number || "-"}
                                        </td>
                                        <td className="px-4 py-2.5 text-sm text-slate-600">
                                            {company.apps_count}
                                        </td>
                                        <td className="px-4 py-2.5">
                                            {company.is_active ? (
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
                                            {new Date(company.created_at).toLocaleDateString(
                                                "en-IN",
                                                {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                }
                                            )}
                                        </td>
                                        <td className="px-4 py-2.5 text-right">
                                            <div className="relative inline-block">
                                                <button
                                                    onClick={() =>
                                                        setActionMenuId(
                                                            actionMenuId === company.id
                                                                ? null
                                                                : company.id
                                                        )
                                                    }
                                                    className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                                                >
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>
                                                {actionMenuId === company.id && (
                                                    <div className="absolute right-0 top-8 z-20 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1">
                                                        <button
                                                            onClick={() => {
                                                                setExpandedId(company.id);
                                                                setActionMenuId(null);
                                                            }}
                                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                            View details
                                                        </button>
                                                        <button
                                                            onClick={() => openEdit(company)}
                                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                                        >
                                                            <Building2 className="w-3.5 h-3.5" />
                                                            Edit tenant
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setExpandedId(company.id);
                                                                setActionMenuId(null);
                                                            }}
                                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                                        >
                                                            <LayoutGrid className="w-3.5 h-3.5" />
                                                            Manage apps
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleSwitchToTenant(company)
                                                            }
                                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                                        >
                                                            <ChevronRight className="w-3.5 h-3.5" />
                                                            Switch to tenant
                                                        </button>
                                                        <div className="my-1 border-t border-slate-100" />
                                                        <button
                                                            onClick={() =>
                                                                handleToggleActive(company)
                                                            }
                                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                                        >
                                                            {company.is_active ? (
                                                                <>
                                                                    <Pause className="w-3.5 h-3.5" />
                                                                    Suspend
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Play className="w-3.5 h-3.5" />
                                                                    Activate
                                                                </>
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(company)}
                                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Expanded detail row */}
                                    {expandedId === company.id && (
                                        <tr key={`detail-${company.id}`}>
                                            <td colSpan={10} className="bg-slate-50/80 px-6 py-4">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    {/* Company details */}
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <h3 className="text-sm font-semibold text-slate-900">
                                                                Company details
                                                            </h3>
                                                            <button
                                                                onClick={() => openEdit(company)}
                                                                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                                            >
                                                                Edit
                                                            </button>
                                                        </div>
                                                        <div className="space-y-2 text-sm">
                                                            <DetailRow
                                                                label="Name"
                                                                value={company.name}
                                                            />
                                                            <DetailRow
                                                                label="Industry"
                                                                value={company.industry_type}
                                                            />
                                                            <DetailRow
                                                                label="Email"
                                                                value={company.contact_email}
                                                            />
                                                            <DetailRow
                                                                label="Phone"
                                                                value={company.contact_phone}
                                                            />
                                                            <DetailRow
                                                                label="Address"
                                                                value={
                                                                    [
                                                                        company.address,
                                                                        company.city,
                                                                        company.state,
                                                                        company.pincode,
                                                                    ]
                                                                        .filter(Boolean)
                                                                        .join(", ") || "-"
                                                                }
                                                            />
                                                            <DetailRow
                                                                label="GST"
                                                                value={company.gst_number}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Installed apps */}
                                                    <div className="space-y-3">
                                                        <h3 className="text-sm font-semibold text-slate-900">
                                                            Installed apps ({company.modules.length})
                                                        </h3>
                                                        {company.modules.length > 0 ? (
                                                            <div className="space-y-1.5">
                                                                {company.modules.map((mod, i) => {
                                                                    const endMs = mod.trial_ends_at ? new Date(mod.trial_ends_at).getTime() : null;
                                                                    const onTrial = mod.billing_status === "trial" && endMs !== null && endMs > Date.now();
                                                                    return (
                                                                    <div
                                                                        key={i}
                                                                        className="flex items-center justify-between bg-white border border-slate-200 rounded-md px-3 py-2"
                                                                    >
                                                                        <div className="flex items-center gap-2 min-w-0">
                                                                            <span className="text-base">{mod.module_icon}</span>
                                                                            <span className="text-sm font-medium text-slate-700 truncate">
                                                                                {mod.module_name}
                                                                            </span>
                                                                            {onTrial && (
                                                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                                                                    Trial
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex flex-col items-end gap-0.5 shrink-0">
                                                                            <span className="text-[10px] text-slate-400">
                                                                                Installed{" "}
                                                                                {new Date(mod.installed_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                                                            </span>
                                                                            {mod.trial_ends_at && (
                                                                                <span className={`text-[10px] font-medium ${onTrial ? "text-amber-700" : "text-slate-400"}`}>
                                                                                    Ends{" "}
                                                                                    {new Date(mod.trial_ends_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm text-slate-400">
                                                                No apps installed
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Admin users */}
                                                    <div className="space-y-3">
                                                        <h3 className="text-sm font-semibold text-slate-900">
                                                            Linked users ({company.admins.length})
                                                        </h3>
                                                        {company.admins.length > 0 ? (
                                                            <div className="space-y-1.5">
                                                                {company.admins.map((admin, i) => (
                                                                    <div
                                                                        key={i}
                                                                        className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-md px-3 py-2"
                                                                    >
                                                                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-500">
                                                                            {(admin.full_name || "U")[0]}
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-sm text-slate-700 leading-tight">
                                                                                {admin.full_name || "Unnamed"}
                                                                            </p>
                                                                            <p className="text-xs text-slate-400">
                                                                                {admin.email}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm text-slate-400">
                                                                No users linked
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={10}
                                        className="px-4 py-12 text-center text-sm text-slate-400"
                                    >
                                        {searchTerm
                                            ? "No tenants match your search"
                                            : "No tenants found"}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Click-away for action menu */}
            {actionMenuId !== null && (
                <div
                    className="fixed inset-0 z-10"
                    onClick={() => setActionMenuId(null)}
                />
            )}

            {/* Create / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                            <h2 className="text-base font-semibold text-slate-900">
                                {editingId ? "Edit tenant" : "New tenant"}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setEditingId(null);
                                }}
                                className="p-1 rounded hover:bg-slate-100 text-slate-400"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="px-5 py-4 space-y-4">
                            <FormField
                                label="Company name"
                                value={form.name}
                                onChange={(v) => setForm({ ...form, name: v })}
                                required
                            />
                            <FormField
                                label="Industry"
                                value={form.industry_type}
                                onChange={(v) => setForm({ ...form, industry_type: v })}
                                placeholder="e.g. retail, education, services"
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                    label="Contact email"
                                    value={form.contact_email}
                                    onChange={(v) => setForm({ ...form, contact_email: v })}
                                    type="email"
                                />
                                <FormField
                                    label="Contact phone"
                                    value={form.contact_phone}
                                    onChange={(v) => setForm({ ...form, contact_phone: v })}
                                />
                            </div>
                            <FormField
                                label="Address"
                                value={form.address}
                                onChange={(v) => setForm({ ...form, address: v })}
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <FormField
                                    label="City"
                                    value={form.city}
                                    onChange={(v) => setForm({ ...form, city: v })}
                                />
                                <FormField
                                    label="State"
                                    value={form.state}
                                    onChange={(v) => setForm({ ...form, state: v })}
                                />
                                <FormField
                                    label="Pincode"
                                    value={form.pincode}
                                    onChange={(v) => setForm({ ...form, pincode: v })}
                                />
                            </div>
                            <FormField
                                label="GST number"
                                value={form.gst_number}
                                onChange={(v) => setForm({ ...form, gst_number: v })}
                                placeholder="e.g. 29ABCDE1234F1Z5"
                            />
                        </div>
                        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setEditingId(null);
                                }}
                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleFormSubmit}
                                disabled={saving}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors"
                            >
                                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                {editingId ? "Save changes" : "Create tenant"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper: detail row in expanded panel
function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start gap-2">
            <span className="text-slate-400 w-16 shrink-0">{label}</span>
            <span className="text-slate-700">{value || "-"}</span>
        </div>
    );
}

// Helper: form field
function FormField({
    label,
    value,
    onChange,
    type = "text",
    placeholder,
    required,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    type?: string;
    placeholder?: string;
    required?: boolean;
}) {
    return (
        <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
                {label}
                {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
            />
        </div>
    );
}
