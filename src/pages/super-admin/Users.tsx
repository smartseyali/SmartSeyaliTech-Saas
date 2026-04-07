import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
    Search, Plus, MoreHorizontal, ShieldCheck, User, Mail, X,
    Pencil, Building2, Loader2, Trash2, UserCog
} from "lucide-react";

type UserRecord = {
    id: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
    is_super_admin: boolean;
    created_at: string | null;
    company_users: {
        id: string;
        role: string;
        company_id: number;
        companies: { name: string } | null;
    }[];
};

type FilterType = "all" | "super_admin" | "admin" | "staff";

interface CompanyOption {
    id: number;
    name: string;
}

export default function PlatformUsers() {
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<FilterType>("all");
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [confirmModal, setConfirmModal] = useState<UserRecord | null>(null);
    const [inviteOpen, setInviteOpen] = useState(false);

    // Edit modal
    const [editUser, setEditUser] = useState<UserRecord | null>(null);
    const [editForm, setEditForm] = useState({ full_name: "", is_super_admin: false });
    const [editRoles, setEditRoles] = useState<{ company_id: number; role: string; cu_id: string | null }[]>([]);
    const [saving, setSaving] = useState(false);
    const [companies, setCompanies] = useState<CompanyOption[]>([]);

    // Invite modal
    const [inviteForm, setInviteForm] = useState({ email: "", full_name: "", company_id: "", role: "staff" });
    const [inviting, setInviting] = useState(false);

    useEffect(() => {
        loadUsers();
        loadCompanies();
    }, []);

    useEffect(() => {
        if (!openMenu) return;
        const handler = () => setOpenMenu(null);
        document.addEventListener("click", handler);
        return () => document.removeEventListener("click", handler);
    }, [openMenu]);

    const loadCompanies = async () => {
        const { data } = await supabase.from("companies").select("id, name").order("name");
        if (data) setCompanies(data);
    };

    const loadUsers = async () => {
        setLoading(true);
        try {
            const { data: usersData, error: usersErr } = await supabase
                .from("users")
                .select("id, full_name, username, avatar_url, is_super_admin, created_at")
                .order("created_at", { ascending: false });

            if (usersErr) throw usersErr;

            let companyUsersMap: Record<string, { id: string; role: string; company_id: number; companies: { name: string } | null }[]> = {};
            try {
                const { data: cuData } = await supabase
                    .from("company_users")
                    .select("id, role, user_id, company_id, companies ( name )");

                (cuData || []).forEach((cu: any) => {
                    if (!companyUsersMap[cu.user_id]) companyUsersMap[cu.user_id] = [];
                    companyUsersMap[cu.user_id].push({
                        id: cu.id,
                        role: cu.role,
                        company_id: cu.company_id,
                        companies: cu.companies,
                    });
                });
            } catch {
                console.warn("Could not load company_users — RLS may be blocking");
            }

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

    /* ── Super Admin Toggle ───────────────────────────────────────────── */

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

    /* ── Edit User ────────────────────────────────────────────────────── */

    const openEdit = (user: UserRecord) => {
        setEditUser(user);
        setEditForm({
            full_name: user.full_name || "",
            is_super_admin: user.is_super_admin,
        });
        setEditRoles(
            user.company_users.map((cu) => ({
                company_id: cu.company_id,
                role: cu.role,
                cu_id: cu.id,
            }))
        );
        setOpenMenu(null);
    };

    const handleAddCompanyRole = () => {
        // Find first company not already assigned
        const assignedIds = new Set(editRoles.map((r) => r.company_id));
        const available = companies.find((c) => !assignedIds.has(c.id));
        if (available) {
            setEditRoles([...editRoles, { company_id: available.id, role: "staff", cu_id: null }]);
        } else {
            toast.info("User is already assigned to all companies");
        }
    };

    const handleRemoveCompanyRole = (index: number) => {
        setEditRoles(editRoles.filter((_, i) => i !== index));
    };

    const handleSaveUser = async () => {
        if (!editUser) return;
        setSaving(true);
        try {
            // 1. Update user profile
            const { error: userErr } = await supabase
                .from("users")
                .update({
                    full_name: editForm.full_name,
                    is_super_admin: editForm.is_super_admin,
                })
                .eq("id", editUser.id);
            if (userErr) throw userErr;

            // 2. Sync company_users — delete removed, update existing, insert new
            const existingIds = new Set(editUser.company_users.map((cu) => cu.id));
            const newRoleIds = new Set(editRoles.filter((r) => r.cu_id).map((r) => r.cu_id!));

            // Delete removed assignments
            for (const cu of editUser.company_users) {
                if (!newRoleIds.has(cu.id)) {
                    await supabase.from("company_users").delete().eq("id", cu.id);
                }
            }

            // Update existing / insert new
            for (const role of editRoles) {
                if (role.cu_id && existingIds.has(role.cu_id)) {
                    // Update role
                    await supabase
                        .from("company_users")
                        .update({ role: role.role })
                        .eq("id", role.cu_id);
                } else {
                    // New assignment
                    await supabase.from("company_users").insert({
                        user_id: editUser.id,
                        company_id: role.company_id,
                        role: role.role,
                    });
                }
            }

            toast.success(`User "${editForm.full_name}" updated`);
            setEditUser(null);
            loadUsers();
        } catch (err: any) {
            toast.error(err.message || "Failed to save user");
        } finally {
            setSaving(false);
        }
    };

    /* ── Delete User ──────────────────────────────────────────────────── */

    const handleDeleteUser = async (user: UserRecord) => {
        if (!confirm(`Remove "${user.full_name || user.username}" from the platform? This removes their profile and company assignments.`)) return;
        setOpenMenu(null);

        // Delete from company_users first, then users profile
        for (const cu of user.company_users) {
            await supabase.from("company_users").delete().eq("id", cu.id);
        }
        const { error } = await supabase.from("users").delete().eq("id", user.id);
        if (error) {
            toast.error("Failed to delete user");
        } else {
            toast.success(`${user.full_name || "User"} removed`);
            setUsers((prev) => prev.filter((u) => u.id !== user.id));
        }
    };

    /* ── Filtering ────────────────────────────────────────────────────── */

    const getUserRole = (u: UserRecord) => {
        if (u.is_super_admin) return "super_admin";
        const roles = (u.company_users || []).map((cu) => cu.role);
        if (roles.includes("admin") || roles.includes("owner")) return "admin";
        return "staff";
    };

    const filtered = users.filter((u) => {
        const matchesSearch =
            !search ||
            (u.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
            (u.username || "").toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === "all" || getUserRole(u) === filter;
        return matchesSearch && matchesFilter;
    });

    /* ── Helpers ───────────────────────────────────────────────────────── */

    const getInitials = (name: string | null) => {
        if (!name) return "?";
        return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    };

    const getCompanyName = (id: number) => companies.find((c) => c.id === id)?.name || `Company #${id}`;

    const filterTabs: { key: FilterType; label: string }[] = [
        { key: "all", label: "All" },
        { key: "super_admin", label: "Super Admins" },
        { key: "admin", label: "Admins" },
        { key: "staff", label: "Staff" },
    ];

    /* ── Render ────────────────────────────────────────────────────────── */

    return (
        <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-semibold text-slate-900">User Management</h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Manage platform users, roles, and company assignments
                    </p>
                </div>
                <button
                    onClick={() => setInviteOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add User
                </button>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-9 pl-9 pr-4 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
                    />
                </div>
                <div className="flex items-center gap-1">
                    {filterTabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                filter === tab.key
                                    ? "bg-slate-900 text-white"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center p-20">
                        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="bg-slate-50/60 border-b border-slate-100">
                                    <th className="px-4 py-2.5 text-xs font-medium text-slate-500">User</th>
                                    <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Email</th>
                                    <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Role</th>
                                    <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Companies</th>
                                    <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Joined</th>
                                    <th className="px-4 py-2.5 text-xs font-medium text-slate-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.map((u) => {
                                    const userCompanies = (u.company_users || [])
                                        .map((cu) => cu.companies?.name)
                                        .filter(Boolean);
                                    const roleLabel = u.is_super_admin ? "super_admin" : getUserRole(u);

                                    return (
                                        <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-2.5">
                                                <div className="flex items-center gap-2.5">
                                                    {u.avatar_url ? (
                                                        <img src={u.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover border border-slate-200" />
                                                    ) : (
                                                        <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                                            {getInitials(u.full_name)}
                                                        </div>
                                                    )}
                                                    <span className="text-sm font-medium text-slate-900 truncate max-w-[160px]">
                                                        {u.full_name || "Unnamed User"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2.5 text-sm text-slate-500 truncate max-w-[200px]">
                                                {u.username || "-"}
                                            </td>
                                            <td className="px-4 py-2.5">
                                                {u.is_super_admin ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                                                        <ShieldCheck className="w-3 h-3" />
                                                        Super Admin
                                                    </span>
                                                ) : roleLabel === "admin" ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                                                        <UserCog className="w-3 h-3" />
                                                        Admin
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-600">
                                                        <User className="w-3 h-3" />
                                                        Staff
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2.5">
                                                {userCompanies.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {userCompanies.map((name, i) => (
                                                            <span key={i} className="inline-block px-1.5 py-0.5 text-[11px] font-medium rounded bg-slate-100 text-slate-700">
                                                                {name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400">None</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2.5 text-xs text-slate-500">
                                                {formatDate(u.created_at)}
                                            </td>
                                            <td className="px-4 py-2.5 text-right">
                                                <div className="relative inline-block">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setOpenMenu(openMenu === u.id ? null : u.id);
                                                        }}
                                                        className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                                                    >
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </button>
                                                    {openMenu === u.id && (
                                                        <div className="absolute right-0 top-8 z-50 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1">
                                                            <button
                                                                onClick={() => openEdit(u)}
                                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                                            >
                                                                <Pencil className="w-3.5 h-3.5" />
                                                                Edit User
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setOpenMenu(null);
                                                                    setConfirmModal(u);
                                                                }}
                                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                                            >
                                                                <ShieldCheck className="w-3.5 h-3.5" />
                                                                {u.is_super_admin ? "Revoke Super Admin" : "Grant Super Admin"}
                                                            </button>
                                                            <div className="my-1 border-t border-slate-100" />
                                                            <button
                                                                onClick={() => handleDeleteUser(u)}
                                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                                Remove User
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-400">
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

            {/* Click-away for action menu */}
            {openMenu !== null && (
                <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
            )}

            {/* ── Edit User Modal ─────────────────────────────────────────── */}
            {editUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                            <div>
                                <h2 className="text-base font-semibold text-slate-900">Edit User</h2>
                                <p className="text-xs text-slate-500 mt-0.5">{editUser.username}</p>
                            </div>
                            <button onClick={() => setEditUser(null)} className="p-1 rounded hover:bg-slate-100 text-slate-400">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="px-5 py-4 space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1.5">Full Name</label>
                                <input
                                    type="text"
                                    value={editForm.full_name}
                                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                                    className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                />
                            </div>

                            {/* Super Admin Toggle */}
                            <div className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3">
                                <div>
                                    <p className="text-sm font-medium text-slate-700">Super Admin</p>
                                    <p className="text-xs text-slate-400">Full platform-wide access</p>
                                </div>
                                <button
                                    onClick={() => setEditForm({ ...editForm, is_super_admin: !editForm.is_super_admin })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        editForm.is_super_admin ? "bg-purple-600" : "bg-slate-300"
                                    }`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        editForm.is_super_admin ? "translate-x-6" : "translate-x-1"
                                    }`} />
                                </button>
                            </div>

                            {/* Company Assignments */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-medium text-slate-600">Company Assignments</label>
                                    <button
                                        onClick={handleAddCompanyRole}
                                        className="text-xs text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                                    >
                                        <Plus className="w-3 h-3" />
                                        Add Company
                                    </button>
                                </div>
                                {editRoles.length > 0 ? (
                                    <div className="space-y-2">
                                        {editRoles.map((role, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <select
                                                    value={role.company_id}
                                                    onChange={(e) => {
                                                        const updated = [...editRoles];
                                                        updated[i] = { ...updated[i], company_id: Number(e.target.value), cu_id: null };
                                                        setEditRoles(updated);
                                                    }}
                                                    className="flex-1 h-9 px-3 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                                >
                                                    {companies.map((c) => (
                                                        <option key={c.id} value={c.id}>{c.name}</option>
                                                    ))}
                                                </select>
                                                <select
                                                    value={role.role}
                                                    onChange={(e) => {
                                                        const updated = [...editRoles];
                                                        updated[i] = { ...updated[i], role: e.target.value };
                                                        setEditRoles(updated);
                                                    }}
                                                    className="w-28 h-9 px-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                                >
                                                    <option value="owner">Owner</option>
                                                    <option value="admin">Admin</option>
                                                    <option value="staff">Staff</option>
                                                </select>
                                                <button
                                                    onClick={() => handleRemoveCompanyRole(i)}
                                                    className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-slate-50 rounded-lg px-4 py-6 text-center">
                                        <Building2 className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                                        <p className="text-xs text-slate-400">No company assigned</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100">
                            <button
                                onClick={() => setEditUser(null)}
                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveUser}
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

            {/* ── Super Admin Confirm Modal ────────────────────────────────── */}
            {confirmModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-semibold text-slate-900">
                                {confirmModal.is_super_admin ? "Revoke Super Admin" : "Grant Super Admin"}
                            </h3>
                            <button onClick={() => setConfirmModal(null)} className="p-1 rounded hover:bg-slate-100 text-slate-400">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-sm text-slate-600">
                            {confirmModal.is_super_admin
                                ? `Revoke super admin access from "${confirmModal.full_name || "this user"}"?`
                                : `Grant super admin access to "${confirmModal.full_name || "this user"}"? They will have full platform-wide access.`}
                        </p>
                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button onClick={() => setConfirmModal(null)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition">
                                Cancel
                            </button>
                            <button
                                onClick={() => toggleSuperAdmin(confirmModal)}
                                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition ${
                                    confirmModal.is_super_admin ? "bg-red-600 hover:bg-red-700" : "bg-purple-600 hover:bg-purple-700"
                                }`}
                            >
                                {confirmModal.is_super_admin ? "Revoke Access" : "Grant Access"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Add User Modal ───────────────────────────────────────────── */}
            {inviteOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                            <h2 className="text-base font-semibold text-slate-900">Add User</h2>
                            <button onClick={() => setInviteOpen(false)} className="p-1 rounded hover:bg-slate-100 text-slate-400">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="px-5 py-4 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1.5">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="email"
                                        placeholder="user@example.com"
                                        value={inviteForm.email}
                                        onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                                        className="w-full h-9 pl-9 pr-4 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1.5">Full Name</label>
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    value={inviteForm.full_name}
                                    onChange={(e) => setInviteForm({ ...inviteForm, full_name: e.target.value })}
                                    className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Company</label>
                                    <select
                                        value={inviteForm.company_id}
                                        onChange={(e) => setInviteForm({ ...inviteForm, company_id: e.target.value })}
                                        className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                    >
                                        <option value="">Select...</option>
                                        {companies.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Role</label>
                                    <select
                                        value={inviteForm.role}
                                        onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                                        className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                    >
                                        <option value="staff">Staff</option>
                                        <option value="admin">Admin</option>
                                        <option value="owner">Owner</option>
                                    </select>
                                </div>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                                <p className="text-xs text-amber-700">
                                    Note: The user must already have a Supabase Auth account. This creates their platform profile and company assignment.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100">
                            <button onClick={() => setInviteOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors">
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    if (!inviteForm.email) { toast.error("Email is required"); return; }
                                    setInviting(true);
                                    try {
                                        // Check if user already exists in public.users
                                        const { data: existingUser } = await supabase
                                            .from("users")
                                            .select("id")
                                            .ilike("username", inviteForm.email)
                                            .maybeSingle();

                                        let userId = existingUser?.id;

                                        if (!userId) {
                                            // Create profile (requires the user to exist in auth.users first)
                                            toast.error("User must sign up first. No auth account found for this email.");
                                            setInviting(false);
                                            return;
                                        }

                                        // Update name if provided
                                        if (inviteForm.full_name) {
                                            await supabase.from("users").update({ full_name: inviteForm.full_name }).eq("id", userId);
                                        }

                                        // Assign to company if selected
                                        if (inviteForm.company_id) {
                                            await supabase.from("company_users").upsert({
                                                user_id: userId,
                                                company_id: Number(inviteForm.company_id),
                                                role: inviteForm.role,
                                            }, { onConflict: "company_id,user_id" });
                                        }

                                        toast.success("User added successfully");
                                        setInviteOpen(false);
                                        setInviteForm({ email: "", full_name: "", company_id: "", role: "staff" });
                                        loadUsers();
                                    } catch (err: any) {
                                        toast.error(err.message || "Failed to add user");
                                    } finally {
                                        setInviting(false);
                                    }
                                }}
                                disabled={inviting}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors"
                            >
                                {inviting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                Add User
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
