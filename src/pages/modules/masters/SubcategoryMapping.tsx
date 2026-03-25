import { useState } from "react";
import { ListTree, Plus, Search, Filter, RefreshCw, Save, X, Network, Share2 } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

export default function SubcategoryMapping() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingSub, setEditingSub] = useState<any>(null);
    
    // Using ecom_subcategories or similar
    const { data: subcategories, loading, fetchItems, createItem, updateItem } = useCrud("ecom_subcategories");

    const subColumns = [
        { key: "name", label: "Subcategory Name", className: "font-bold text-slate-900" },
        { 
            key: "parent_category", 
            label: "Parent Category",
            render: (s: any) => (
                <span className="text-[12px] font-medium text-slate-500 uppercase tracking-tighter">
                    {s.parent_category || "General"}
                </span>
            )
        },
        { 
            key: "is_active", 
            label: "Status",
            render: (s: any) => <StatusBadge status={s.is_active !== false ? "Active" : "Disabled"} />
        },
        { key: "updated_at", label: "Last Updated" }
    ];

    const subTabFields = {
        basic: [
            { key: "name", label: "Subcategory Name *", type: "text" as const, required: true, ph: "e.g. Smartphones" },
            { key: "parent_category", label: "Parent Category", type: "text" as const },
            { key: "description", label: "Description", type: "text" as any, ph: "Enter details..." }
        ],
        config: [
            { key: "is_active", label: "Status", type: "select" as const, options: [{ value: 'true', label: 'Active' }, { value: 'false', label: 'Disabled' }] },
            { key: "mapping_logic", label: "Mapping Logic", type: "text" as const, ph: "e.g. Auto-link to parent" }
        ],
        mapping: [
            { key: "storefront_url_key", label: "SEO URL Key", type: "text" as const },
            { key: "api_mapping", label: "API Mapping", type: "text" as const },
            { key: "saas_id", label: "Operational ID", type: "text" as const }
        ]
    };

    const handleSave = async (header: any) => {
        const payload = { ...header, is_active: header.is_active === "true" };
        if (editingSub) {
            await updateItem(editingSub.id, payload);
        } else {
            await createItem(payload);
        }
        setView("list");
        setEditingSub(null);
        fetchItems();
    };

    if (view === "form") {
        return (
            <div className="p-4 bg-slate-50 min-h-screen">
                <ERPEntryForm
                    title={editingSub ? "Edit Subcategory" : "Add New Subcategory"}
                    subtitle="Manage subcategories and hierarchy settings"
                    tabFields={subTabFields}
                    onAbort={() => { setView("list"); setEditingSub(null); }}
                    onSave={handleSave}
                    initialData={editingSub}
                    showItems={false}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white">
            <ERPListView
                title="Subcategory Mapping"
                data={subcategories || []}
                columns={subColumns}
                onNew={() => { setEditingSub(null); setView("form"); }}
                onRefresh={fetchItems}
                onRowClick={(s) => { setEditingSub(s); setView("form"); }}
                isLoading={loading}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                primaryKey="id"
            />
        </div>
    );
}
