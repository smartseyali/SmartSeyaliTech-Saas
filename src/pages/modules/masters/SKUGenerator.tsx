import { useState } from "react";
import { Binary, Plus, Search, Filter, RefreshCw, Save, X, Hash, Code } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

export default function SKUGenerator() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingPattern, setEditingPattern] = useState<any>(null);
    
    // Using sku_patterns if available
    const { data: patterns, loading, fetchItems, createItem, updateItem } = useCrud("ecom_sku_patterns");

    const patternColumns = [
        { key: "name", label: "Pattern Name", className: "font-bold text-slate-900" },
        { 
            key: "prefix", 
            label: "Format",
            render: (p: any) => (
                <span className="text-[12px] font-bold text-indigo-600 uppercase">
                    {p.prefix}{p.separator === 'Hyphen' ? '-' : p.separator === 'Underscore' ? '_' : ''}{'X'.repeat(p.digits || 4)}
                </span>
            )
        },
        { 
            key: "is_active", 
            label: "Status",
            render: (p: any) => <StatusBadge status={p.is_active !== false ? "Active" : "Disabled"} />
        },
        { key: "updated_at", label: "Last Updated" }
    ];

    const patternTabFields = {
        basic: [
            { key: "name", label: "Pattern Name *", type: "text" as const, required: true, ph: "e.g. Electronics Pattern" },
            { key: "prefix", label: "Prefix", type: "text" as const, ph: "ELE" },
            { key: "suffix", label: "Suffix", type: "text" as const, ph: "NY" },
            { key: "counter_start", label: "Start Number", type: "number" as const, ph: "0001" }
        ],
        config: [
            { key: "digits", label: "Digits", type: "number" as const, ph: "4" },
            { 
                key: "separator", label: "Separator", type: "select" as const,
                options: [
                    { label: "Hyphen (-)", value: "Hyphen" },
                    { label: "Underscore (_)", value: "Underscore" },
                    { label: "None", value: "None" }
                ]
            },
            { key: "is_active", label: "Status", type: "select" as const, options: [{ value: 'true', label: 'Active' }, { value: 'false', label: 'Disabled' }] }
        ],
        mapping: [
            { key: "erp_mapping_id", label: "ERP Mapping", type: "text" as const },
            { key: "visibility", label: "Visibility", type: "select" as const, options: [{ value: 'Public', label: 'Public' }, { value: 'Private', label: 'Hidden' }] }
        ]
    };

    const handleSave = async (header: any) => {
        const payload = { ...header, is_active: header.is_active === "true" };
        if (editingPattern) {
            await updateItem(editingPattern.id, payload);
        } else {
            await createItem(payload);
        }
        setView("list");
        setEditingPattern(null);
        fetchItems();
    };

    if (view === "form") {
        return (
            <div className="p-4 bg-slate-50 min-h-screen">
                <ERPEntryForm
                    title={editingPattern ? "Edit Pattern" : "Add New Pattern"}
                    subtitle="Manage SKU generation patterns and serialization"
                    tabFields={patternTabFields}
                    onAbort={() => { setView("list"); setEditingPattern(null); }}
                    onSave={handleSave}
                    initialData={editingPattern}
                    showItems={false}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white">
            <ERPListView
                title="SKU Generator"
                data={patterns || []}
                columns={patternColumns}
                onNew={() => { setEditingPattern(null); setView("form"); }}
                onRefresh={fetchItems}
                onRowClick={(p) => { setEditingPattern(p); setView("form"); }}
                isLoading={loading}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                primaryKey="id"
            />
        </div>
    );
}
