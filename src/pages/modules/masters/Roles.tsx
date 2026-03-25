import { useState } from "react";
import { ShieldCheck, Plus, Search, RefreshCw, Key, Shield } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

export default function Roles() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingRole, setEditingRole] = useState<any>(null);
    
    const { data: roles, loading, fetchItems, createItem, updateItem } = useCrud("ecom_roles");

    const roleColumns = [
        { key: "name", label: "Security Role Profile", className: "font-bold text-slate-900 uppercase tracking-tighter" },
        { 
            key: "scope", 
            label: "Operational Scope",
            render: (r: any) => (
                <div className="flex gap-1">
                    {(r.scope || "Global").split(',').map((s: string) => (
                        <span key={s} className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest">{s}</span>
                    ))}
                </div>
            )
        },
        { 
            key: "is_active", 
            label: "Policy Status",
            render: (r: any) => <StatusBadge status={r.is_active !== false ? "Active" : "Legacy"} />
        },
        { key: "updated_at", label: "Final Modification" }
    ];

    const roleTabFields = {
        basic: [
            { key: "name", label: "Security Role Profile Name *", type: "text" as const, required: true, ph: "e.g. Finance Controller" },
            { 
                key: "scope", label: "Operational Access Scope", type: "select" as const,
                options: [
                    { label: "Global Enterprise", value: "Global" },
                    { label: "Module Specialized", value: "Module" },
                    { label: "Branch Localized", value: "Branch" },
                    { label: "Departmental Sub-unit", value: "Dept" }
                ]
            },
            { key: "description", label: "Strategic Role Description", type: "text" as any, ph: "Contextualize role responsibilities..." }
        ],
        config: [
            { key: "permission_flags", label: "Access Control Policies", type: "text" as const, ph: "System privilege codes..." },
            { key: "is_active", label: "Activation Status", type: "select" as const, options: [{ value: 'true', label: 'In Force' }, { value: 'false', label: 'Archived' }] }
        ],
        mapping: [
            { key: "external_role_map", label: "Third-party Identity Link", type: "text" as const },
            { key: "group_alias", label: "Security Group Alias", type: "text" as const }
        ]
    };

    const handleSave = async (header: any) => {
        const payload = { ...header, is_active: header.is_active === "true" };
        if (editingRole) {
            await updateItem(editingRole.id, payload);
        } else {
            await createItem(payload);
        }
        setView("list");
        setEditingRole(null);
        fetchItems();
    };

    if (view === "form") {
        return (
            <div className="p-0 bg-slate-50 min-h-screen">
                <ERPEntryForm
                    title={editingRole ? "Modify Authorization Profile" : "Establish New Security Role"}
                    subtitle="Define identity scopes and granular operational permissions"
                    tabFields={roleTabFields}
                    onAbort={() => { setView("list"); setEditingRole(null); }}
                    onSave={handleSave}
                    initialData={editingRole}
                    showItems={false}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white">
            <ERPListView
                title="Access Policy Matrix"
                data={roles || []}
                columns={roleColumns}
                onNew={() => { setEditingRole(null); setView("form"); }}
                onRefresh={fetchItems}
                onRowClick={(r) => { setEditingRole(r); setView("form"); }}
                isLoading={loading}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                primaryKey="id"
            />
        </div>
    );
}
