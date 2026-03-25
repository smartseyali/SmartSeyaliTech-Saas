import { useState } from "react";
import { useCrud } from "@/hooks/useCrud";
import { LayoutGrid, Plus, Search, Filter, RefreshCw, Save, X, Tag } from "lucide-react";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

export default function Categories() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingCategory, setEditingCategory] = useState<any>(null);
    
    // Using ecom_categories for data persistence
    const { data: categories, loading, fetchItems, createItem, updateItem } = useCrud("ecom_categories");

    const categoryColumns = [
        { key: "name", label: "Category Name", className: "font-bold text-slate-900" },
        { 
            key: "parent_id", 
            label: "Parent Category",
            render: (c: any) => (
                <span className="text-[12px] font-medium text-slate-500 uppercase tracking-tighter">
                    {c.parent_id || "None"}
                </span>
            )
        },
        { 
            key: "is_active", 
            label: "Status",
            render: (c: any) => <StatusBadge status={c.is_active ? "Active" : "Disabled"} />
        },
        { key: "created_at", label: "Created Date" },
        { key: "updated_at", label: "Updated Date" }
    ];

    const categoryTabFields = {
        basic: [
            { key: "name", label: "Category Name *", type: "text" as const, required: true, ph: "e.g. Electronics" },
            { 
                key: "type", label: "Type", type: "select" as const,
                options: [
                    { label: "Product", value: "Product" },
                    { label: "Service", value: "Service" }
                ]
            },
            { key: "parent_id", label: "Parent Category", type: "select" as const, options: [{ value: 'none', label: 'None' }] },
            { key: "description", label: "Description", type: "text" as any, ph: "Enter description..." }
        ],
        config: [
            { key: "is_active", label: "Status", type: "select" as const, options: [{ value: 'true', label: 'Active' }, { value: 'false', label: 'Disabled' }] },
            { key: "sort_order", label: "Sort Order", type: "number" as const },
            { key: "url_key", label: "URL Key", type: "text" as const }
        ],
        mapping: [
            { key: "visibility", label: "Visibility", type: "select" as const, options: [{ value: 'Public', label: 'Public' }, { value: 'Private', label: 'Hidden' }] },
            { key: "ecom_mapping", label: "Store Mapping", type: "text" as const }
        ]
    };

    const handleSave = async (header: any) => {
        const payload = { ...header, is_active: header.is_active === "true" };
        if (editingCategory) {
            await updateItem(editingCategory.id, payload);
        } else {
            await createItem(payload);
        }
        setView("list");
        setEditingCategory(null);
        fetchItems();
    };

    const filteredCategories = (categories || []).filter(c =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (view === "form") {
        return (
            <div className="p-4 bg-slate-50 min-h-screen">
                <ERPEntryForm
                    title={editingCategory ? "Edit Category" : "Add Category"}
                    subtitle="Manage category hierarchy and settings"
                    tabFields={categoryTabFields}
                    onAbort={() => { setView("list"); setEditingCategory(null); }}
                    onSave={handleSave}
                    initialData={editingCategory}
                    showItems={false}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white">
            <ERPListView
                title="Category Master"
                data={filteredCategories}
                columns={categoryColumns}
                onNew={() => { setEditingCategory(null); setView("form"); }}
                onRefresh={fetchItems}
                onRowClick={(c) => { setEditingCategory(c); setView("form"); }}
                isLoading={loading}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                primaryKey="id"
            />
        </div>
    );
}
