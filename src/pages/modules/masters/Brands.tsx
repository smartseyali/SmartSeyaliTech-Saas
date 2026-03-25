import { useState } from "react";
import { Tag, Plus, Search, Filter, RefreshCw, Save, X, Globe, Star } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

export default function Brands() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingBrand, setEditingBrand] = useState<any>(null);
    
    // Using ecom_brands for data persistence
    const { data: brands, loading, fetchItems, createItem, updateItem } = useCrud("ecom_brands");

    const brandColumns = [
        { key: "name", label: "Brand Name", className: "font-bold text-slate-900" },
        { 
            key: "manufacturer", 
            label: "Manufacturer",
            render: (b: any) => (
                <span className="text-[12px] font-medium text-slate-500 uppercase tracking-tighter">
                    {b.manufacturer || "General"}
                </span>
            )
        },
        { 
            key: "is_active", 
            label: "Status",
            render: (b: any) => <StatusBadge status={b.is_active !== false ? "Active" : "Disabled"} />
        },
        { key: "created_at", label: "Created Date" },
        { key: "updated_at", label: "Updated Date" }
    ];

    const brandTabFields = {
        basic: [
            { key: "name", label: "Brand Name *", type: "text" as const, required: true, ph: "e.g. Nike / Apple" },
            { key: "sub_brand_name", label: "Sub-Brand Name", type: "text" as const, ph: "e.g. Air Jordan / iPhone" },
            { key: "description", label: "Description", type: "textarea" as any, ph: "Enter brand description..." }
        ],
        config: [
            { key: "is_active", label: "Status", type: "select" as const, options: [{ value: 'true', label: 'Active' }, { value: 'false', label: 'Disabled' }] },
            { key: "priority", label: "Priority", type: "number" as const },
            { key: "seo_keyword", label: "SEO Keywords", type: "text" as const }
        ],
        mapping: [
            { key: "visibility", label: "Visibility", type: "select" as const, options: [{ value: 'Public', label: 'Public' }, { value: 'Private', label: 'Hidden' }] },
            { key: "api_mapping", label: "Store Mapping", type: "text" as const }
        ]
    };

    const handleSave = async (header: any) => {
        const payload = { ...header, is_active: header.is_active === "true" };
        if (editingBrand) {
            await updateItem(editingBrand.id, payload);
        } else {
            await createItem(payload);
        }
        setView("list");
        setEditingBrand(null);
        fetchItems();
    };

    if (view === "form") {
        return (
            <div className="p-4 bg-slate-50 min-h-screen">
                <ERPEntryForm
                    title={editingBrand ? "Edit Brand" : "Add New Brand"}
                    subtitle="Manage brand details and visibility settings"
                    tabFields={brandTabFields}
                    onAbort={() => { setView("list"); setEditingBrand(null); }}
                    onSave={handleSave}
                    initialData={editingBrand}
                    showItems={false}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white">
            <ERPListView
                title="Brand Master"
                data={brands || []}
                columns={brandColumns}
                onNew={() => { setEditingBrand(null); setView("form"); }}
                onRefresh={fetchItems}
                onRowClick={(b) => { setEditingBrand(b); setView("form"); }}
                isLoading={loading}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                primaryKey="id"
            />
        </div>
    );
}
