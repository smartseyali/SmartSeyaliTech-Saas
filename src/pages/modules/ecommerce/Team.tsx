import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";
import { ModuleListPage } from "@/components/modules/ModuleListPage";
import ERPEntryForm from "@/components/modules/ERPEntryForm";
import { useCrud } from "@/hooks/useCrud";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";
import {
    Users,
    Shield,
    UserPlus,
    Lock,
    Mail,
    Key,
    CheckCircle2,
    Calendar,
    ArrowRight,
    X
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Permission Resources defined in the system
const RESOURCES = [
    { id: "products", label: "Product Catalog" },
    { id: "orders", label: "Orders & Sales" },
    { id: "customers", label: "Customer Data" },
    { id: "marketing", label: "Marketing & Coupons" },
    { id: "analytics", label: "Analytics & Reports" },
    { id: "settings", label: "System Settings" },
    { id: "team", label: "Team Management" }
];

const teamColumns = [
    {
        key: "user_id",
        label: "Team Member",
        render: (val: any, row: any) => (
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100 shadow-sm">
                    <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                    <p className="font-bold text-sm text-slate-900">{row.users?.full_name || row.users?.username?.split('@')[0] || 'System User'}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-500" />
                        <p className="text-xs font-medium text-slate-500">{row.users?.username}</p>
                    </div>
                </div>
            </div>
        )
    },
    {
        key: "role",
        label: "Role",
        render: (val: string) => {
            const isOwner = val === 'owner';
            const isAdmin = val === 'admin';
            return (
                <div className={cn(
                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold tracking-wider",
                    isOwner ? "bg-purple-50 text-purple-700 border-purple-200" :
                        isAdmin ? "bg-blue-50 text-blue-700 border-blue-200" :
                            "bg-slate-50 text-slate-700 border-slate-200"
                )}>
                    {isOwner ? <Lock className="w-3" /> : <Shield className="w-3" />}
                    {val}
                </div>
            );
        }
    },
    {
        key: "created_at",
        label: "Member Since",
        render: (val: string) => {
            const d = val ? new Date(val) : null;
            return (
                <div className="flex items-center gap-2 text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold">
                        {d && !isNaN(d.getTime()) ? d.toLocaleDateString() : 'Active Member'}
                    </span>
                </div>
            );
        }
    }
];

const getTeamFields = (isEdit: boolean) => [
    { key: "full_name", label: "Full Name", ph: "John Doe", required: true },
    { key: "username", label: "Email Address", ph: "john.doe@example.com", required: true },
    {
        key: "password",
        label: isEdit ? "Update Password (Leave blank to keep current)" : "Password",
        ph: isEdit ? "Only fill to change" : "Minimum 6 characters",
        required: !isEdit,
        type: "text" as const
    },
    {
        key: "role",
        label: "Account Role",
        type: "select" as const,
        options: [
            { label: "Administrator (Full Access)", value: "admin" },
            { label: "Staff Member (Limited Access)", value: "staff" }
        ],
        required: true
    },
];

export default function Team() {
    const { data: team, loading, createItem, updateItem, deleteItem, fetchItems } = useCrud("company_users", "*, users!user_id(*)");
    const { activeCompany } = useTenant();
    const { toast } = useToast();
    const [view, setView] = useState<"list" | "form">("list");
    const [permissionOpen, setPermissionOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [memberPermissions, setMemberPermissions] = useState<string[]>([]);
    const [savingPerms, setSavingPerms] = useState(false);

    const handleNew = () => {
        setEditingItem(null);
        setView("form");
    };

    const handleEdit = (item: any) => {
        const mappedItem = {
            ...item,
            full_name: item.users?.full_name,
            username: item.users?.username,
            password: "",
        };
        setEditingItem(mappedItem);
        setView("form");
    };

    const handleSaveUser = async (formData: any) => {
        if (!activeCompany) return;

        try {
            if (editingItem) {
                const userUpdate: any = {
                    full_name: formData.full_name,
                    username: formData.username
                };
                const { error: uErr } = await supabase
                    .from('users')
                    .update(userUpdate)
                    .eq('id', editingItem.user_id);

                if (uErr) throw uErr;
                await updateItem(editingItem.id, { role: formData.role });
                toast({ title: "Personnel Re-calibrated", description: `${formData.full_name}'s profile has been updated.` });
            } else {
                setSavingPerms(true);
                const tempClient = createClient(
                    import.meta.env.VITE_SUPABASE_URL,
                    import.meta.env.VITE_SUPABASE_ANON_KEY,
                    { auth: { persistSession: false } }
                );
                const { data: authData, error: aErr } = await tempClient.auth.signUp({
                    email: formData.username,
                    password: formData.password,
                    options: {
                        data: { full_name: formData.full_name }
                    }
                });

                if (aErr) throw aErr;
                if (!authData.user) throw new Error("Security creation failed. Verify connectivity.");

                const { data: userData, error: uErr } = await supabase.from('users').upsert({
                    id: authData.user.id,
                    username: formData.username,
                    full_name: formData.full_name,
                    company_id: activeCompany.id
                }).select().single();

                if (uErr) throw uErr;
                await supabase.from('company_users').insert({
                    company_id: activeCompany.id,
                    user_id: userData.id,
                    role: formData.role
                });

                toast({
                    title: "Personnel Deployed",
                    description: `${formData.full_name} has been integrated.`
                });
            }

            setView("list");
            fetchItems();
        } catch (err: any) {
            toast({ variant: "destructive", title: "Operation Failed", description: err.message });
        } finally {
            setSavingPerms(false);
        }
    };

    const handleOpenPermissions = async (row: any) => {
        setSelectedUser(row);
        setMemberPermissions([]);
        setPermissionOpen(true);
        try {
            const { data } = await supabase
                .from('user_permissions')
                .select('resource')
                .eq('company_user_id', row.id);
            if (data) setMemberPermissions(data.map(d => d.resource));
        } catch (err) {
            console.error("Failed to load permissions", err);
        }
    };

    const togglePermission = (resId: string) => {
        setMemberPermissions(prev =>
            prev.includes(resId) ? prev.filter(p => p !== resId) : [...prev, resId]
        );
    };

    const savePermissions = async () => {
        if (!selectedUser) return;
        setSavingPerms(true);
        try {
            await supabase.from('user_permissions').delete().eq('company_user_id', selectedUser.id);
            if (memberPermissions.length > 0) {
                const rows = memberPermissions.map(p => ({
                    company_user_id: selectedUser.id,
                    resource: p,
                    action: 'manage'
                }));
                await supabase.from('user_permissions').insert(rows);
            }
            toast({ title: "Authorization Updated", description: "Team member permissions have been re-calibrated." });
            setPermissionOpen(false);
        } catch (err: any) {
            toast({ variant: "destructive", title: "Sync Failed", description: err.message });
        } finally {
            setSavingPerms(false);
        }
    };

    if (view === "form") {
        return (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <ERPEntryForm
                    title={editingItem ? "Re-calibrate Personnel" : "Integrate Personnel"}
                    subtitle="Human Resources Hub"
                    headerFields={getTeamFields(!!editingItem)}
                    onAbort={() => { setView("list"); setEditingItem(null); }}
                    onSave={handleSaveUser}
                    initialData={editingItem}
                    showItems={false}
                />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-10 w-full animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-blue-600" />
                        <span className="text-xs font-bold tracking-widest text-slate-500">Team Management</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Personnel & Staff</h1>
                    <p className="text-sm font-medium text-slate-500">Manage your team members and their access levels</p>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-slate-500 tracking-wider">Total Members</span>
                        <span className="text-2xl font-bold text-slate-900">{team?.length || 0}</span>
                    </div>
                    <Button
                        onClick={handleNew}
                        className="h-11 px-6 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-bold shadow-md shadow-blue-600/10 transition-all active:scale-95"
                    >
                        <UserPlus className="w-4 h-4 mr-2" /> Add Member
                    </Button>
                </div>
            </div>

            {/* Main Table */}
            <ModuleListPage
                title="Staff Directory"
                subtitle="Manage user permissions and account roles"
                columns={teamColumns}
                data={team}
                loading={loading}
                hideHeader
                actions={(row) => (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenPermissions(row)}
                        className="h-9 px-4 rounded-lg border-slate-200 hover:bg-slate-50 font-bold text-xs gap-2"
                    >
                        <Shield className="w-3.5 h-3.5 text-blue-600" />
                        Permissions
                    </Button>
                )}
                onEdit={handleEdit}
                onDelete={(item) => {
                    if (item.role === 'owner') {
                        toast({ variant: "destructive", title: "Access Denied", description: "The strategic owner cannot be terminated." });
                        return;
                    }
                    if (confirm("Revoke all operational authorizations for this member?")) {
                        deleteItem(item.id);
                    }
                }}
            />

            {/* Permission Manager Dialog */}
            <Dialog open={permissionOpen} onOpenChange={setPermissionOpen}>
                <DialogContent className="sm:max-w-xl p-0 overflow-hidden border-slate-200 shadow-2xl rounded-xl bg-white">
                    <div className="bg-slate-50 p-8 border-b border-slate-100">
                        <DialogHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-blue-600" />
                                </div>
                                <span className="text-xs font-bold tracking-widest text-slate-500">Permission Access</span>
                            </div>
                            <DialogTitle className="text-xl font-bold tracking-tight text-slate-900">Access Control</DialogTitle>
                            <DialogDescription className="text-sm font-medium text-slate-500 mt-1">
                                Define which areas <span className="text-slate-900 font-bold">{selectedUser?.users?.full_name || 'this member'}</span> can access.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {RESOURCES.map((res) => (
                                <div
                                    key={res.id}
                                    onClick={() => togglePermission(res.id)}
                                    className={cn(
                                        "flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer group",
                                        memberPermissions.includes(res.id)
                                            ? "border-blue-600 bg-blue-50/50 shadow-sm"
                                            : "border-slate-100 bg-white hover:border-slate-200"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                                            memberPermissions.includes(res.id) ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                                        )}>
                                            <CheckCircle2 className={cn("w-4 h-4", !memberPermissions.includes(res.id) && "opacity-20")} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-900">{res.label}</span>
                                            <span className="text-xs font-medium text-slate-500">Access Granted</span>
                                        </div>
                                    </div>
                                    <ArrowRight className={cn(
                                        "w-4 h-4 transition-all opacity-0 group-hover:opacity-100 group-hover:translate-x-1",
                                        memberPermissions.includes(res.id) ? "text-blue-600" : "text-slate-200"
                                    )} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 flex justify-end gap-3 border-t border-slate-100">
                        <Button variant="ghost" onClick={() => setPermissionOpen(false)} className="rounded-lg font-bold text-xs h-10 px-6">
                            Cancel
                        </Button>
                        <Button
                            onClick={savePermissions}
                            disabled={savingPerms}
                            className="rounded-lg bg-blue-600 text-white font-bold text-xs h-10 px-8 shadow-md shadow-blue-600/10 active:scale-95 transition-all"
                        >
                            {savingPerms ? "Saving..." : "Update Permissions"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

