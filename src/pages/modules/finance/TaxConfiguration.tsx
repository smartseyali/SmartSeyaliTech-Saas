import { useState } from "react";
import { useCrud } from "@/hooks/useCrud";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";
import { toast } from "sonner";

export default function TaxConfiguration() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingItem, setEditingItem] = useState<any>(null);

    const { data: items, loading, fetchItems, createItem, updateItem } = useCrud("master_taxes");

    const fields = [
        { key: "tax_name", label: "Tax Rule Name", required: true, ph: "e.g. GST 18%" },
        {
            key: "tax_type", label: "GST / Tax Type", type: "select" as const, options: [
                { label: "GST (Unified)", value: "gst" },
                { label: "IGST (Integrated)", value: "igst" },
                { label: "CGST (Central)", value: "cgst" },
                { label: "SGST (State)", value: "sgst" },
                { label: "Cess", value: "cess" },
                { label: "TDS / TCS", value: "withholding" },
                { label: "Exempt", value: "exempt" },
            ], required: true
        },
        { key: "rate", label: "Tax Rate (%)", type: "number" as const, required: true },
        {
            key: "applies_to", label: "Module Applicability", type: "select" as const, options: [
                { label: "Sales Transactions", value: "sales" },
                { label: "Purchase Transactions", value: "purchase" },
                { label: "All Transactions", value: "both" },
            ]
        },
        { key: "account_code", label: "GL Ledger Account", ph: "e.g. Duties & Taxes" },
        { key: "hsn_sac", label: "HSN / SAC Code Range", ph: "e.g. 8471" },
        { key: "description", label: "Notes / Description", type: "text" as const },
        {
            key: "status", label: "Activation Status", type: "select" as const, options: [
                { label: "Active", value: "active" },
                { label: "Deprioritized", value: "inactive" },
            ]
        },
    ];

    const handleSave = async (data: any) => {
        if (editingItem) {
            await updateItem(editingItem.id, data);
            toast.success("Tax configuration updated");
        } else {
            await createItem({ ...data, status: "active" });
            toast.success("Tax configuration created");
        }
        setView("list");
        setEditingItem(null);
    };

    const columns = [
        {
            key: "tax_name", label: "Tax Rule Name",
            render: (i: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-900 text-xs leading-none">{i.tax_name || "—"}</span>
                    <span className="text-xs text-slate-400 font-medium mt-0.5 uppercase tracking-tighter">{i.tax_type}</span>
                </div>
            )
        },
        {
            key: "rate", label: "GST Rate",
            render: (i: any) => (
                <span className="font-extrabold text-blue-700 font-mono text-sm">{i.rate || 0}%</span>
            )
        },
        { key: "applies_to", label: "Applicability", render: (i: any) => <span className="capitalize text-xs font-bold text-slate-600">{i.applies_to || "—"}</span> },
        { key: "account_code", label: "GL Ledger", render: (i: any) => <span className="font-mono text-xs text-slate-500">{i.account_code || "—"}</span> },
        { key: "hsn_sac", label: "HSN/SAC", render: (i: any) => <span className="font-mono text-xs text-slate-500">{i.hsn_sac || "—"}</span> },
        { key: "status", label: "Status", render: (i: any) => <StatusBadge status={i.status || "active"} /> },
    ];

    const filteredItems = (items || []).filter((i: any) =>
        (i.tax_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (i.tax_type || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (view === "form") {
        return (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <ERPEntryForm
                    title={editingItem ? "Edit Tax Configuration" : "New GST / Tax Registry"}
                    subtitle="Compliance & Ledger Mapping"
                    headerFields={fields}
                    onAbort={() => { setView("list"); setEditingItem(null); }}
                    onSave={handleSave}
                    initialData={editingItem}
                />
            </div>
        );
    }

    return (
        <ERPListView
            title="GST & Tax Configurations"
            data={filteredItems}
            columns={columns}
            onNew={() => { setEditingItem(null); setView("form"); }}
            onRefresh={fetchItems}
            onRowClick={(i) => { setEditingItem(i); setView("form"); }}
            isLoading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
        />
    );
}
