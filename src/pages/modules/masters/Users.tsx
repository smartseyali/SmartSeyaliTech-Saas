import { useState } from "react";
import { UserPlus, Plus, Search, RefreshCw, Key, Shield } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

export default function Users() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingUser, setEditingUser] = useState<any>(null);
    
    // Using ecom_users or similar hub
    const { data: users, loading, fetchItems, createItem, updateItem } = useCrud("ecom_users");

    const userColumns = [
        { key: "full_name", label: "Legal Name", className: "font-bold text-slate-900" },
        { key: "email", label: "Corporate Email", className: "text-blue-600 font-medium" },
        { key: "role", label: "System Role", className: "text-slate-500 font-bold uppercase text-[11px] tracking-widest" },
        { 
            key: "is_active", 
            label: "Authorization Status",
            render: (u: any) => <StatusBadge status={u.is_active !== false ? "Active" : "Disabled"} />
        },
        { key: "last_login", label: "Last Session Access" }
    ];

    const userTabFields = {
        basic: [
            { key: "full_name", label: "Full Legal Name *", type: "text" as const, required: true, ph: "e.g. Johnathan Doe" },
            { key: "email", label: "Corporate Email Address *", type: "text" as const, required: true, ph: "john.doe@enterprise.com" },
            { key: "phone", label: "Communication Phone", type: "text" as const, ph: "+91 ..." },
            { 
                key: "role", label: "Access Privilege Level *", type: "select" as const,
                options: [
                    { label: "Administrative Control", value: "SuperAdmin" },
                    { label: "Operational Management", value: "Manager" },
                    { label: "Standard Operator", value: "Operator" },
                    { label: "Restricted Viewer", value: "Viewer" }
                ]
            }
        ],
        config: [
            { key: "password", label: "Secret Access Token (Password)", type: "text" as const, ph: "System credential..." },
            { key: "is_active", label: "Lifecycle Status", type: "select" as const, options: [{ value: 'true', label: 'Authorized' }, { value: 'false', label: 'Suspended' }] },
            { key: "mfa_enabled", label: "Multi-Factor Authentication (MFA)", type: "select" as const, options: [{ value: 'true', label: 'Mandatory' }, { value: 'false', label: 'Optional' }] }
        ],
        mapping: [
            { key: "department_id", label: "Primary Department Alias", type: "text" as const },
            { key: "erp_user_ref", label: "External ERP Reference ID", type: "text" as const }
        ]
    };

    const handleSave = async (header: any) => {
        const payload = { ...header, is_active: header.is_active === "true" };
        if (editingUser) {
            await updateItem(editingUser.id, payload);
        } else {
            await createItem(payload);
        }
        setView("list");
        setEditingUser(null);
        fetchItems();
    };

    if (view === "form") {
        return (
            <div className="p-0 bg-slate-50 min-h-screen">
                <ERPEntryForm
                    title={editingUser ? "Edit User Profile" : "Create Enterprise User"}
                    subtitle="Manage identity credentials and security access levels"
                    tabFields={userTabFields}
                    onAbort={() => { setView("list"); setEditingUser(null); }}
                    onSave={handleSave}
                    initialData={editingUser}
                    showItems={false}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white">
            <ERPListView
                title="User Directory"
                data={users || []}
                columns={userColumns}
                onNew={() => { setEditingUser(null); setView("form"); }}
                onRefresh={fetchItems}
                onRowClick={(u) => { setEditingUser(u); setView("form"); }}
                isLoading={loading}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                primaryKey="id"
            />
        </div>
    );
}
