import { useState } from "react";
import { useCrud } from "@/hooks/useCrud";
import { LayoutGrid, Plus, Search, Filter, RefreshCw, Save, X, Tag } from "lucide-react";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

export default function Categories() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingCategory, setEditingCategory] = useState<any>(null);
    
    // Fetch from ecom_categories (renamed or shared)
    const { data: categories, loading, fetchItems, createItem, updateItem } = useCrud("ecom_categories");

    const categoryFields = [
        { key: "name", label: "Category", required: true, ph: "Electronics / Services..." },
        { 
            key: "is_active", label: "Status", type: "select" as const,
            options: [
                { label: "Active Classification", value: "true" },
                { label: "Archived Asset", value: "false" }
            ]
        },
        { key: "description", label: "Narrative", ph: "Classification details..." }
    ];

    const handleSave = async (header: any) => {
        const payload = { ...header, is_active: header.is_active === "true" };
        if (editingCategory) {
            await updateItem(editingCategory.id, payload);
        } else {
            await createItem(payload);
        }
        setView("list");
        setEditingCategory(null);
    };

    const categoryColumns = [
        { 
            key: "name", 
            label: "Data",
            render: (c: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 group-hover:bg-indigo-900 group-hover:text-white transition-all duration-500">
                        <LayoutGrid className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900   tracking-tight">{c.name}</span>
                        <span className="text-[10px] text-gray-400 font-bold  tracking-widest leading-none mt-1">Registry Classification Node</span>
                    </div>
                </div>
            )
        },
        { 
            key: "is_active", 
            label: "Status",
            render: (c: any) => <StatusBadge status={c.is_active ? "Active" : "Archived"} />
        }
    ];

    const filteredCategories = (categories || []).filter(c =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (view === "form") {
        return (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <ERPEntryForm
                    title={editingCategory ? "Refine Classification node" : "Initialize Category Matrix"}
                    subtitle="Global"
                    headerFields={categoryFields}
                    onAbort={() => { setView("list"); setEditingCategory(null); }}
                    onSave={handleSave}
                    initialData={editingCategory}
                    showItems={false}
                />
            </div>
        );
    }

    return (
        <ERPListView
            title="Category"
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
    );
}
