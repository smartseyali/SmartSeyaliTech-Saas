import { useState } from "react";
import { Scale, Plus, Search, Filter, RefreshCw, Save, X, Box, Layers } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

export default function UOMs() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingUOM, setEditingUOM] = useState<any>(null);
    
    const { data: uoms, loading, fetchItems, createItem, updateItem } = useCrud("uoms", "*", { isGlobal: true });

    const uomColumns = [
        { key: "name", label: "Unit Name", className: "font-bold text-slate-900" },
        { 
            key: "category", 
            label: "Category",
            render: (u: any) => (
                <span className="text-[12px] font-medium text-slate-500 uppercase tracking-tighter">
                    {u.category || "General"}
                </span>
            )
        },
        { 
            key: "ratio", 
            label: "Conversion Rate",
            render: (u: any) => (
                <span className="text-[13px] font-bold text-indigo-600">
                    {u.ratio || "1.000"}
                </span>
            )
        },
        { 
            key: "is_active", 
            label: "Status",
            render: (u: any) => <StatusBadge status={u.is_active !== false ? "Active" : "Disabled"} />
        },
        { key: "updated_at", label: "Last Updated" }
    ];

    const uomTabFields = {
        basic: [
            { key: "name", label: "Unit Name *", type: "text" as const, required: true, ph: "e.g. Kilogram (Kg), Liters (L)" },
            { 
                key: "category", label: "Category *", type: "select" as const, 
                options: [
                    { label: "Unit / Count", value: "Unit" },
                    { label: "Weight / Mass", value: "Weight" },
                    { label: "Volume / Capacity", value: "Volume" },
                    { label: "Length / Distance", value: "Length" }
                ]
            },
            { key: "reference_uom", label: "Reference Unit", type: "text" as const, ph: "e.g. Gram for kg" },
            { key: "ratio", label: "Conversion Rate *", type: "number" as const, ph: "1.0000" }
        ],
        config: [
            { key: "is_active", label: "Status", type: "select" as const, options: [{ value: 'true', label: 'Active' }, { value: 'false', label: 'Disabled' }] },
            { key: "precision", label: "Decimals", type: "number" as const, ph: "2" }
        ],
        mapping: [
            { key: "erp_uom_code", label: "ERP Unit Code", type: "text" as const },
            { key: "visibility", label: "Visibility", type: "select" as const, options: [{ value: 'Public', label: 'Public' }, { value: 'Private', label: 'Hidden' }] }
        ]
    };

    const handleSave = async (header: any) => {
        const payload = { ...header, is_active: header.is_active === "true" };
        if (editingUOM) {
            await updateItem(editingUOM.id, payload);
        } else {
            await createItem(payload);
        }
        setView("list");
        setEditingUOM(null);
        fetchItems();
    };

    if (view === "form") {
        return (
            <div className="p-4 bg-slate-50 min-h-screen">
                <ERPEntryForm
                    title={editingUOM ? "Edit Unit" : "Add New Unit"}
                    subtitle="Manage units and conversion rates"
                    tabFields={uomTabFields}
                    onAbort={() => { setView("list"); setEditingUOM(null); }}
                    onSave={handleSave}
                    initialData={editingUOM}
                    showItems={false}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white">
            <ERPListView
                title="UOM Master"
                data={uoms || []}
                columns={uomColumns}
                onNew={() => { setEditingUOM(null); setView("form"); }}
                onRefresh={fetchItems}
                onRowClick={(u) => { setEditingUOM(u); setView("form"); }}
                isLoading={loading}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                primaryKey="id"
            />
        </div>
    );
}
