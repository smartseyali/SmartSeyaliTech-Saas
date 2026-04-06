import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Search, Plus, MoreHorizontal, ShieldCheck, User, Mail, X } from "lucide-react";

type UserRecord = {
    id: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
    is_super_admin: boolean;
    last_login: string | null;
    status: string | null;
    company_users: {
        id: string;
        role: string;
        companies: { name: string } | null;
    }[];
};

type FilterType = "all" | "super_admin" | "admin" | "staff";

export default function PlatformUsers() {
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<FilterType>("all");
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [confirmModal, setConfirmModal] = useState<UserRecord | null>(null);
    const [inviteOpen, setInviteOpen] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        if (!openMenu) return;
        const handler = () => setOpenMenu(null);
        document.addEventListener("click", handler);
        return () => document.removeEventListener("click", handler);
    }, [openMenu]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            // Fetch users first (always succeeds with RLS)
            const { data: usersData, error: usersErr } = await supabase
                .from("users")
                .select("id, full_name, username, avatar_url, is_super_admin, last_login, status")
                .order("created_at", { ascending: false });

            if (usersErr) throw usersErr;

            // Fetch company_users separately (may fail if RLS blocks)
            let companyUsersMap: Record<string, { id: string; role: string; companies: { name: string } | null }[]> = {};
            try {
                const { data: cuData } = await supabase
                    .from("company_users")
                    .select("id, role, user_id, companies ( name )");

                (cuData || []).forEach((cu: any) => {
                    if (!companyUsersMap[cu.user_id]) companyUsersMap[cu.user_id] = [];
                    companyUsersMap[cu.user_id].push({
                        id: cu.id,
                        role: cu.role,
                        companies: cu.companies,
                    });
                });
            } catch {
                // company_users fetch failed (RLS) — proceed without it
                console.warn("Could not load company_users — RLS may be blocking. Run fix_rls_v4_super_admin.sql");
            }

            // Merge
            const merged: UserRecord[] = (usersData || []).map((u: any) => ({
                ...u,
                company_users: companyUsersMap[u.id] || [],
            }));

            setUsers(merged);
        } catch (err) {
            console.error("Failed to load users:", err);
            toast.error("Failed to load users");
        }
        setLoading(false);
    };

    const toggleSuperAdmin = async (user: UserRecord) => {
        const newValue = !user.is_super_admin;
        const { error } = await supabase
            .from("users")
            .update({ is_super_admin: newValue })
            .eq("id", user.id);

        if (error) {
            toast.error("Failed to update role");
        } else {
            toast.success(
                newValue
                    ? `${user.full_name || "User"} is now a Super Admin`
                    : `Super Admin access revoked for ${user.full_name || "User"}`
            );
            setUsers((prev) =>
                prev.map((u) => (u.id === user.id ? { ...u, is_super_admin: newValue } : u))
            );
        }
        setConfirmModal(null);
    };

    // --- Filtering ---
    const getUserRole = (u: UserRecord) => {
        if (u.is_super_admin) return "super_admin";
        const roles = (u.company_users || []).map((cu) => cu.role);
        if (roles.includes("admin") || roles.includes("owner")) return "admin";
        if (roles.length > 0) return "staff";
        return "staff";
    };

    const filtered = users.filter((u) => {
        const matchesSearch =
            !search ||
            (u.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
            (u.username || "").toLowerCase().includes(search.toLowerCase());

        const matchesFilter =
            filter === "all" || getUserRole(u) === filter;

        return matchesSearch && matchesFilter;
    });

    // --- Helpers ---
    const getInitials = (name: string | null) => {
        if (!name) return "?";
        return name
            .split(" ")
            .map((w) => w[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "Never";
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    };

    const filterTabs: { key: FilterType; label: string }[] = [
        { key: "all", label: "All" },
        { key: "super_admin", label: "Super Admins" },
        { key: "admin", label: "Admins" },
        { key: "staff", label: "Staff" },
    ];

    // --- Render ---
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">User Management</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Manage platform users, roles, and company assignments.
                </p>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                {/* Search */}
                <div className="relative flex-1 w-full sm:max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
                    />
                </div>

                {/* Filters */}
                <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                    {filterTabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                                filter === tab.key
                                    ? "bg-white text-slate-900 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Invite */}
                <button
                    onClick={() => setInviteOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    Invite User
                </button>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center p-20">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Companies</th>
                                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Last Login</th>
                                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-16">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.map((u) => {
                                    const companies = (u.company_users || [])
                                        .map((cu) => cu.companies?.name)
                                        .filter(Boolean);
                                    const isActive = u.status !== "inactive";

                                    return (
                                        <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                                            {/* User */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    {u.avatar_url ? (
                                                        <img
                                                            src={u.avatar_url}
                                                            alt=""
                                                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                                                        />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                                            {getInitials(u.full_name)}
                                                        </div>
                                                    )}
                                                    <span className="font-semibold text-slate-800 truncate max-w-[160px]">
                                                        {u.full_name || "Unnamed User"}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Email */}
                                            <td className="px-4 py-3 text-slate-600 truncate max-w-[200px]">
                                                {u.username || "-"}
                                            </td>

                                            {/* Role */}
                                            <td className="px-4 py-3">
                                                {u.is_super_admin ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded-full bg-purple-100 text-purple-700">
                                                        <ShieldCheck className="w-3 h-3" />
                                                        Super Admin
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-600">
                                                        <User className="w-3 h-3" />
                                                        User
                                                    </span>
                                                )}
                                            </td>

                                            {/* Companies */}
                                            <td className="px-4 py-3">
                                                {companies.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {companies.map((name, i) => (
                                                            <span
                                                                key={i}
                                                                className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-100"
                                                            >
                                                                {name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400">None</span>
                                                )}
                                            </td>

                                            {/* Last Login */}
                                            <td className="px-4 py-3 text-slate-500 text-xs">
                                                {formatDate(u.last_login)}
                                            </td>

                                            {/* Status */}
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${
                                                        isActive
                                                            ? "bg-green-50 text-green-700"
                                                            : "bg-red-50 text-red-600"
                                                    }`}
                                                >
                                                    {isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-4 py-3 relative">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenMenu(openMenu === u.id ? null : u.id);
                                                    }}
                                                    className="p-1.5 rounded-md hover:bg-slate-100 transition"
                                                >
                                                    <MoreHorizontal className="w-4 h-4 text-slate-500" />
                                                </button>

                                                {openMenu === u.id && (
                                                    <div className="absolute right-4 top-10 z-50 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1">
                                                        <button
                                                            onClick={() => {
                                                                setOpenMenu(null);
                                                                toast.info("View user - coming soon");
                                                            }}
                                                            className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                                                        >
                                                            View
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setOpenMenu(null);
                                                                toast.info("Edit role - coming soon");
                                                            }}
                                                            className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                                                        >
                                                            Edit Role
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setOpenMenu(null);
                                                                setConfirmModal(u);
                                                            }}
                                                            className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                                                        >
                                                            {u.is_super_admin ? "Revoke Super Admin" : "Grant Super Admin"}
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setOpenMenu(null);
                                                                toast.info("Reset password - coming soon");
                                                            }}
                                                            className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                                                        >
                                                            Reset Password
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}

                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-400">
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="text-xs text-slate-400 text-right">
                {filtered.length} of {users.length} users
            </div>

            {/* Toggle Super Admin Confirmation Modal */}
            {confirmModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900">
                                {confirmModal.is_super_admin ? "Revoke Super Admin" : "Grant Super Admin"}
                            </h3>
                            <button onClick={() => setConfirmModal(null)} className="p-1 hover:bg-slate-100 rounded">
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>

                        <p className="text-sm text-slate-600">
                            {confirmModal.is_super_admin
                                ? `Revoke super admin access from "${confirmModal.full_name || "this user"}"? They will lose platform-wide privileges.`
                                : `Grant super admin access to "${confirmModal.full_name || "this user"}"? They will have full platform-wide access.`}
                        </p>

                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                                onClick={() => setConfirmModal(null)}
                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => toggleSuperAdmin(confirmModal)}
                                className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition ${
                                    confirmModal.is_super_admin
                                        ? "bg-red-600 hover:bg-red-700"
                                        : "bg-purple-600 hover:bg-purple-700"
                                }`}
                            >
                                {confirmModal.is_super_admin ? "Revoke Access" : "Grant Access"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Invite User Modal (placeholder) */}
            {inviteOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900">Invite User</h3>
                            <button onClick={() => setInviteOpen(false)} className="p-1 hover:bg-slate-100 rounded">
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="email"
                                        placeholder="user@example.com"
                                        className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                        disabled
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Role</label>
                                <select
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                    disabled
                                >
                                    <option>User</option>
                                    <option>Admin</option>
                                    <option>Super Admin</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Company</label>
                                <select
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                    disabled
                                >
                                    <option>Select company...</option>
                                </select>
                            </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                            <p className="text-xs font-medium text-amber-700">
                                Coming soon -- User invitations will be available in a future update.
                            </p>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                                onClick={() => setInviteOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
                            >
                                Close
                            </button>
                            <button
                                disabled
                                className="px-4 py-2 text-sm font-semibold text-white bg-blue-400 rounded-lg cursor-not-allowed opacity-60"
                            >
                                Send Invite
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
