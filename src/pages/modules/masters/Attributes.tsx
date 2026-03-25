import { useState } from "react";
import { Layers, Plus, Search, Filter, RefreshCw, Save, X, Binary, ListFilter } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

export default function Attributes() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingAttribute, setEditingAttribute] = useState<any>(null);
    
    // Using ecom_product_attributes for data persistence
    const { data: attributes, loading, fetchItems, createItem, updateItem } = useCrud("ecom_product_attributes");

    const attributeColumns = [
        { key: "name", label: "Attribute Name", className: "font-bold text-slate-900" },
        { 
            key: "type", 
            label: "Input Type",
            render: (a: any) => (
                <span className="text-[12px] font-medium text-slate-500 uppercase tracking-tighter">
                    {a.type || "Select"}
                </span>
            )
        },
        { 
            key: "is_filterable", 
            label: "Filterable",
            render: (a: any) => (
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${a.is_filterable ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                    {a.is_filterable ? 'YES' : 'NO'}
                </span>
            )
        },
        { 
            key: "is_active", 
            label: "Status",
            render: (a: any) => <StatusBadge status={a.is_active !== false ? "Active" : "Disabled"} />
        },
        { key: "updated_at", label: "Last Updated" }
    ];

    const attributeTabFields = {
        basic: [
            { key: "name", label: "Attribute Name *", type: "text" as const, required: true, ph: "e.g. Color / Size" },
            { 
                key: "type", label: "Input Type", type: "select" as const,
                options: [
                    { label: "Dropdown", value: "Select" },
                    { label: "Multi-select", value: "Multi-select" },
                    { label: "Text", value: "Text" },
                    { label: "Color Swatch", value: "Swatch" }
                ]
            },
            { key: "unit", label: "Unit", type: "text" as const, ph: "e.g. cm, kg" },
            { key: "description", label: "Description", type: "text" as any, ph: "Enter details..." }
        ],
        config: [
            { key: "is_filterable", label: "Show in Filters", type: "select" as const, options: [{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }] },
            { key: "is_required", label: "Required?", type: "select" as const, options: [{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }] },
            { 
                key: "display_type", label: "Display Style", type: "select" as const,
                options: [
                    { label: "Dropdown Menu", value: "Dropdown" },
                    { label: "Checkbox Grid", value: "Checkbox" },
                    { label: "Radio Buttons", value: "Radio" }
                ]
            }
        ],
        mapping: [
            { key: "erp_mapping_id", label: "ERP ID", type: "text" as const },
            { key: "visibility", label: "Visibility", type: "select" as const, options: [{ value: 'Public', label: 'Public' }, { value: 'Private', label: 'Hidden' }] }
        ]
    };

    const handleSave = async (header: any) => {
        const payload = { ...header, is_active: header.is_active === "true", is_filterable: header.is_filterable === "true", is_required: header.is_required === "true" };
        if (editingAttribute) {
            await updateItem(editingAttribute.id, payload);
        } else {
            await createItem(payload);
        }
        setView("list");
        setEditingAttribute(null);
        fetchItems();
    };

    if (view === "form") {
        return (
            <div className="p-4 bg-slate-50 min-h-screen">
                <ERPEntryForm
                    title={editingAttribute ? "Edit Attribute" : "Add New Attribute"}
                    subtitle="Manage product attributes and variations"
                    tabFields={attributeTabFields}
                    onAbort={() => { setView("list"); setEditingAttribute(null); }}
                    onSave={handleSave}
                    initialData={editingAttribute}
                    showItems={false}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white">
            <ERPListView
                title="Attributes"
                data={attributes || []}
                columns={attributeColumns}
                onNew={() => { setEditingAttribute(null); setView("form"); }}
                onRefresh={fetchItems}
                onRowClick={(a) => { setEditingAttribute(a); setView("form"); }}
                isLoading={loading}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                primaryKey="id"
            />
        </div>
    );
}
