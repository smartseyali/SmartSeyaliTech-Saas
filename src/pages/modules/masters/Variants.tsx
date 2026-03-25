import { useState } from "react";
import { Layers, Plus, Search, RefreshCw } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

export default function Variants() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingVariant, setEditingVariant] = useState<any>(null);
    
    const { data: variants, loading, fetchItems, createItem, updateItem } = useCrud("ecom_product_variants");

    const variantColumns = [
        { key: "name", label: "Variant Name", className: "font-bold text-slate-900" },
        { key: "sku", label: "SKU", className: "font-mono text-blue-600" },
        { 
            key: "is_active", 
            label: "Status",
            render: (v: any) => <StatusBadge status={v.is_active !== false ? "Active" : "Disabled"} />
        },
        { key: "updated_at", label: "Last Updated" }
    ];

    const variantTabFields = {
        basic: [
            { key: "name", label: "Variant Name *", type: "text" as const, required: true, ph: "e.g. Red / XL" },
            { key: "sku", label: "SKU", type: "text" as const },
            { key: "barcode", label: "Barcode", type: "text" as const },
            { key: "description", label: "Description", type: "text" as any }
        ],
        config: [
            { key: "price_adjustment", label: "Price Adjustment", type: "number" as const, ph: "0.00" },
            { key: "is_active", label: "Status", type: "select" as const, options: [{ value: 'true', label: 'Active' }, { value: 'false', label: 'Disabled' }] }
        ],
        mapping: [
            { key: "erp_variant_id", label: "ERP ID", type: "text" as const },
            { key: "visibility", label: "Visibility", type: "select" as const, options: [{ value: 'Public', label: 'Public' }, { value: 'Private', label: 'Hidden' }] }
        ]
    };

    const handleSave = async (header: any) => {
        const payload = { ...header, is_active: header.is_active === "true" };
        if (editingVariant) {
            await updateItem(editingVariant.id, payload);
        } else {
            await createItem(payload);
        }
        setView("list");
        setEditingVariant(null);
        fetchItems();
    };

    if (view === "form") {
        return (
            <div className="p-4 bg-slate-50 min-h-screen">
                <ERPEntryForm
                    title={editingVariant ? "Edit Variant" : "Add New Variant"}
                    subtitle="Manage product variations and attributes"
                    tabFields={variantTabFields}
                    onAbort={() => { setView("list"); setEditingVariant(null); }}
                    onSave={handleSave}
                    initialData={editingVariant}
                    showItems={false}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white">
            <ERPListView
                title="Variants"
                data={variants || []}
                columns={variantColumns}
                onNew={() => { setEditingVariant(null); setView("form"); }}
                onRefresh={fetchItems}
                onRowClick={(v) => { setEditingVariant(v); setView("form"); }}
                isLoading={loading}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                primaryKey="id"
            />
        </div>
    );
}
