import { useState } from "react";
import { ModuleListPage } from "@/components/modules/ModuleListPage";
import { DynamicFormDialog, FieldConfig } from "@/components/modules/DynamicFormDialog";
import { useCrud } from "@/hooks/useCrud";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";
import { Users, Mail, Shield, UserPlus } from "lucide-react";

const teamColumns = [
    {
        key: "user_id",
        label: "Team Member",
        render: (val: any, row: any) => (
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-4 h-4 text-primary" />
                </div>
                <div>
                    <p className="font-bold text-sm">{row.users?.full_name || 'System User'}</p>
                    <p className="text-[10px] text-muted-foreground">{row.users?.username}</p>
                </div>
            </div>
        )
    },
    {
        key: "role",
        label: "Access Role",
        render: (val: string) => (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${val === 'owner' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                val === 'admin' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                    'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                <Shield className="w-3 h-3" /> {val}
            </div>
        )
    },
];

const teamFields: FieldConfig[] = [
    { key: "email", label: "Invite by Email", ph: "colleague@company.com", required: true },
    {
        key: "role",
        label: "Authorization Tier",
        type: "select",
        options: [
            { label: "Admin (Full Access)", value: "admin" },
            { label: "Staff (Restricted)", value: "staff" }
        ],
        required: true
    },
];

export default function Team() {
    // We use a custom select to join with users table
    const { data, loading, createItem, updateItem, deleteItem } = useCrud("company_users", "*, users(*)");
    const { activeCompany } = useTenant();
    const { toast } = useToast();
    const [formOpen, setFormOpen] = useState(false);

    const handleNew = () => {
        setFormOpen(true);
    };

    const handleSubmit = async (formData: any) => {
        // In a real app, we would search for the user by email or send an invite.
        // For this demo, we'll try to find an existing user or creator a placeholder.
        toast({ title: "Invitation Sent", description: "Invite system ready. In production, this sends a secure invitation link." });
        setFormOpen(false);
    };

    return (
        <div className="animate-in fade-in duration-700">
            <ModuleListPage
                title="Internal Infrastructure"
                subtitle="Manage authorization tiers and team access"
                columns={teamColumns}
                data={data}
                loading={loading}
                onNew={handleNew}
                onEdit={(item) => toast({ title: "Administrative Constraint", description: "To change roles, please contact system administrator." })}
                onDelete={(item) => {
                    if (item.role === 'owner') {
                        toast({ variant: "destructive", title: "Action Denied", description: "The workspace owner cannot be removed." });
                        return;
                    }
                    if (confirm("Revoke access for this user?")) {
                        deleteItem(item.id);
                    }
                }}
            />

            <DynamicFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                title="Integrate Team Member"
                fields={teamFields}
                onSubmit={handleSubmit}
            />
        </div>
    );
}
