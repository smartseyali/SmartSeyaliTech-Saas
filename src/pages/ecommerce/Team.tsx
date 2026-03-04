import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";
import { ModuleListPage } from "@/components/modules/ModuleListPage";
import { DynamicFormDialog, FieldConfig } from "@/components/modules/DynamicFormDialog";
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
    ArrowRight
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

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
        label: "Operational Profile",
        render: (val: any, row: any) => (
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                    <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <p className="font-black text-sm text-foreground uppercase tracking-tight">{row.users?.full_name || row.users?.username?.split('@')[0] || 'System User'}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                        <Mail className="w-3 h-3 text-muted-foreground/60" />
                        <p className="text-[10px] font-bold text-muted-foreground tracking-wider">{row.users?.username}</p>
                    </div>
                </div>
            </div>
        )
    },
    {
        key: "role",
        label: "Authority Tier",
        render: (val: string) => {
            const isOwner = val === 'owner';
            const isAdmin = val === 'admin';
            return (
                <div className={cn(
                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest",
                    isOwner ? "bg-purple-50 text-purple-700 border-purple-200 shadow-sm" :
                        isAdmin ? "bg-orange-50 text-orange-700 border-orange-200 shadow-sm" :
                            "bg-slate-50 text-slate-700 border-slate-200"
                )}>
                    {isOwner ? <Lock className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                    {val}
                </div>
            );
        }
    },
    {
        key: "created_at",
        label: "Onboarded",
        render: (val: string) => {
            const d = val ? new Date(val) : null;
            return (
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-bold">
                        {d && !isNaN(d.getTime()) ? d.toLocaleDateString() : 'Strategic Onboarding'}
                    </span>
                </div>
            );
        }
    }
];

const getTeamFields = (isEdit: boolean): FieldConfig[] => [
    { key: "full_name", label: "Member Legal Name", ph: "John Doe", required: true },
    { key: "username", label: "Login ID / Email", ph: "john.doe@example.com", required: true },
    {
        key: "password",
        label: isEdit ? "Update Access Pin (Leave blank to keep current)" : "Initial Access Pin",
        ph: isEdit ? "Only fill to change" : "Minimum 6 characters",
        required: !isEdit
    },
    {
        key: "role",
        label: "Workspace Role",
        type: "select",
        options: [
            { label: "Administrator (Strategic Access)", value: "admin" },
            { label: "Operational Staff (Tactical Access)", value: "staff" }
        ],
        required: true
    },
];

import { cn } from "@/lib/utils";

export default function Team() {
    const { data: team, loading, createItem, updateItem, deleteItem, fetchItems } = useCrud("company_users", "*, users!user_id(*)");
    const { activeCompany } = useTenant();
    const { toast } = useToast();
    const [formOpen, setFormOpen] = useState(false);
    const [permissionOpen, setPermissionOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [memberPermissions, setMemberPermissions] = useState<string[]>([]);
    const [savingPerms, setSavingPerms] = useState(false);

    const handleNew = () => {
        setEditingItem(null);
        setFormOpen(true);
    };

    const handleEdit = (item: any) => {
        // Map the flattened data for the form
        const mappedItem = {
            ...item,
            full_name: item.users?.full_name,
            username: item.users?.username,
            password: "", // Don't pre-fill password
        };
        setEditingItem(mappedItem);
        setFormOpen(true);
    };

    const handleSaveUser = async (formData: any) => {
        if (!activeCompany) return;

        try {
            if (editingItem) {
                // UPDATE LOGIC
                // 1. Update the user entry
                const userUpdate: any = {
                    full_name: formData.full_name,
                    username: formData.username
                };

                // If password provided, it would need Auth service update, but here we just update profile
                // In this system, profile 'username' serves as ID

                const { error: uErr } = await supabase
                    .from('users')
                    .update(userUpdate)
                    .eq('id', editingItem.user_id);

                if (uErr) throw uErr;

                // 2. Update company_user role
                await updateItem(editingItem.id, { role: formData.role });

                toast({ title: "Personnel Re-calibrated", description: `${formData.full_name}'s profile has been updated.` });
            } else {
                // CREATE LOGIC: Real Auth Integration
                setSavingPerms(true);

                // 1. Initialize a secondary client to avoid logging out the current merchant session
                const tempClient = createClient(
                    import.meta.env.VITE_SUPABASE_URL,
                    import.meta.env.VITE_SUPABASE_ANON_KEY,
                    { auth: { persistSession: false } }
                );

                // 2. Create the Auth user
                const { data: authData, error: aErr } = await tempClient.auth.signUp({
                    email: formData.username,
                    password: formData.password,
                    options: {
                        data: { full_name: formData.full_name }
                    }
                });

                if (aErr) throw aErr;
                if (!authData.user) throw new Error("Security creation failed. Verify connectivity.");

                // 3. Create/Link the User Profile
                // Note: The public.users record might already exist if they once registered elsewhere
                const { data: userData, error: uErr } = await supabase.from('users').upsert({
                    id: authData.user.id,
                    username: formData.username,
                    full_name: formData.full_name,
                    company_id: activeCompany.id
                }).select().single();

                if (uErr) throw uErr;

                // 4. Create the mapping in company_users
                await supabase.from('company_users').insert({
                    company_id: activeCompany.id,
                    user_id: userData.id,
                    role: formData.role
                });

                toast({
                    title: "Personnel Deployed",
                    description: `${formData.full_name} has been integrated. Note: If email confirmation is enabled, they must verify their inbox.`
                });
            }

            setFormOpen(false);
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

        // Fetch existing permissions
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
            // Standard approach: delete all and re-insert
            await supabase.from('user_permissions').delete().eq('company_user_id', selectedUser.id);

            if (memberPermissions.length > 0) {
                const rows = memberPermissions.map(p => ({
                    company_user_id: selectedUser.id,
                    resource: p,
                    action: 'manage' // default to broad access for now
                }));
                await supabase.from('user_permissions').insert(rows);
            }

            toast({ title: "Authorization Matrix Updated", description: "Team member permissions have been re-calibrated." });
            setPermissionOpen(false);
        } catch (err: any) {
            toast({ variant: "destructive", title: "Sync Failed", description: err.message });
        } finally {
            setSavingPerms(false);
        }
    };

    return (
        <div className="p-8 space-y-12 w-full animate-in fade-in duration-700">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-12 border-b border-divider">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Lock className="w-5 h-5 text-orange-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">Personnel & Security</span>
                    </div>
                    <h1 className="text-5xl font-black italic tracking-tighter uppercase text-foreground">Strategic <br /><span className="text-muted-foreground/20">Operations</span></h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end mr-4">
                        <span className="text-[10px] font-black uppercase text-muted-foreground opacity-40">Active Force</span>
                        <span className="text-2xl font-black text-foreground tracking-tighter">{team?.length || 0} Members</span>
                    </div>
                    <Button
                        onClick={handleNew}
                        className="h-16 px-10 rounded-2xl bg-foreground text-background hover:bg-foreground/90 font-black uppercase tracking-widest text-[10px] shadow-2xl transition-all active:scale-95"
                    >
                        <UserPlus className="w-4 h-4 mr-3" /> Integrate Unit
                    </Button>
                </div>
            </div>

            {/* Main Table */}
            <ModuleListPage
                title="Infrastructure Force"
                subtitle="Calibrate operational authority tiers and member assignments"
                columns={teamColumns}
                data={team}
                loading={loading}
                hideHeader
                actions={(row) => (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenPermissions(row)}
                        className="h-9 px-4 rounded-xl border-divider hover:bg-muted font-bold text-[11px] gap-2"
                    >
                        <Shield className="w-3.5 h-3.5 text-primary" />
                        Authorization
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
                <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-3xl rounded-[32px] bg-background">
                    <div className="bg-muted/30 p-8 border-b border-divider">
                        <DialogHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-primary" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Authorization Calibrator</span>
                            </div>
                            <DialogTitle className="text-2xl font-black uppercase tracking-tight">Access Control</DialogTitle>
                            <DialogDescription className="text-sm font-medium text-muted-foreground mt-1 tracking-tight">
                                Define the operational boundaries for <span className="text-foreground font-bold">{selectedUser?.users?.full_name || 'this member'}</span>.
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
                                        "flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer group",
                                        memberPermissions.includes(res.id)
                                            ? "border-primary bg-primary/5 shadow-sm"
                                            : "border-divider/50 bg-white hover:border-divider"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                                            memberPermissions.includes(res.id) ? "bg-primary text-white" : "bg-muted text-muted-foreground/40"
                                        )}>
                                            <CheckCircle2 className={cn("w-4 h-4", !memberPermissions.includes(res.id) && "opacity-20")} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-black uppercase tracking-tight text-foreground">{res.label}</span>
                                            <span className="text-[10px] font-medium text-muted-foreground/60 tracking-tight">Full Strategic Access</span>
                                        </div>
                                    </div>
                                    <ArrowRight className={cn(
                                        "w-4 h-4 transition-all opacity-0 group-hover:opacity-100 group-hover:translate-x-1",
                                        memberPermissions.includes(res.id) ? "text-primary" : "text-muted-foreground/20"
                                    )} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-muted/30 p-6 flex justify-end gap-3 border-t border-divider">
                        <Button variant="ghost" onClick={() => setPermissionOpen(false)} className="rounded-2xl font-black uppercase text-[10px] tracking-widest h-12 px-6">
                            Abort
                        </Button>
                        <Button
                            onClick={savePermissions}
                            disabled={savingPerms}
                            className="rounded-2xl bg-foreground text-background font-black uppercase text-[10px] tracking-widest h-12 px-8 shadow-xl active:scale-95 transition-all"
                        >
                            {savingPerms ? "Synchronizing..." : "Update Authorization"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Invite Form */}
            <DynamicFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                title={editingItem ? "Re-calibrate Personnel" : "Integrate Personnel"}
                fields={getTeamFields(!!editingItem)}
                onSubmit={handleSaveUser}
                initialData={editingItem}
            />
        </div>
    );
}
