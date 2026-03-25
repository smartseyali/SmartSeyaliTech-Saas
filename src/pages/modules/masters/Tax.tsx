import { useState } from "react";
import { Receipt, Percent, Plus, Search, Filter, RefreshCw, Save, X, Calculator } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

export default function Tax() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingTax, setEditingTax] = useState<any>(null);
    
    // Using a generic taxes table for data persistence
    const { data: taxes, loading, fetchItems, createItem, updateItem } = useCrud("ecom_tax_rules");

    const taxColumns = [
        { key: "name", label: "Tax Name", className: "font-bold text-slate-900" },
        { 
            key: "type", 
            label: "Tax Type",
            render: (t: any) => (
                <span className="text-[12px] font-medium text-slate-500 uppercase tracking-tighter">
                    {t.type || "GST"}
                </span>
            )
        },
        { 
            key: "rate", 
            label: "Rate %",
            render: (t: any) => (
                <span className="text-[13px] font-bold text-indigo-600">
                    {t.rate || "0.00"}%
                </span>
            )
        },
        { 
            key: "is_active", 
            label: "Status",
            render: (t: any) => <StatusBadge status={t.is_active !== false ? "Active" : "Disabled"} />
        },
        { key: "updated_at", label: "Updated Date" }
    ];

    const taxTabFields = {
        basic: [
            { key: "name", label: "Tax Name *", type: "text" as const, required: true, ph: "e.g. GST 18%" },
            { 
                key: "type", label: "Tax Type", type: "select" as const,
                options: [
                    { label: "GST", value: "GST" },
                    { label: "VAT", value: "VAT" },
                    { label: "Service Tax", value: "Service" }
                ]
            },
            { key: "rate", label: "Rate (%) *", type: "number" as const, ph: "18.00" },
            { key: "description", label: "Description", type: "text" as any, ph: "Enter details..." }
        ],
        config: [
            { key: "is_inclusive", label: "Price includes tax?", type: "select" as const, options: [{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }] },
            { key: "is_active", label: "Status", type: "select" as const, options: [{ value: 'true', label: 'Active' }, { value: 'false', label: 'Disabled' }] }
        ],
        mapping: [
            { key: "erp_tax_code", label: "ERP Code", type: "text" as const },
            { key: "visibility", label: "Visibility", type: "select" as const, options: [{ value: 'Public', label: 'Public' }, { value: 'Private', label: 'Hidden' }] }
        ]
    };

    const handleSave = async (header: any) => {
        const payload = { ...header, is_active: header.is_active === "true" };
        if (editingTax) {
            await updateItem(editingTax.id, payload);
        } else {
            await createItem(payload);
        }
        setView("list");
        setEditingTax(null);
        fetchItems();
    };

    if (view === "form") {
        return (
            <div className="p-4 bg-slate-50 min-h-screen">
                <ERPEntryForm
                    title={editingTax ? "Edit Tax Rule" : "Add New Tax Rule"}
                    subtitle="Manage tax rates and compliance settings"
                    tabFields={taxTabFields}
                    onAbort={() => { setView("list"); setEditingTax(null); }}
                    onSave={handleSave}
                    initialData={editingTax}
                    showItems={false}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white">
            <ERPListView
                title="Tax Master"
                data={taxes || []}
                columns={taxColumns}
                onNew={() => { setEditingTax(null); setView("form"); }}
                onRefresh={fetchItems}
                onRowClick={(t) => { setEditingTax(t); setView("form"); }}
                isLoading={loading}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                primaryKey="id"
            />
        </div>
    );
}
