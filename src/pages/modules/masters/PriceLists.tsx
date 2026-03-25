import { useState } from "react";
import { ListIcon, Plus, Search, Filter, RefreshCw, Save, X, DollarSign, Calendar } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

export default function PriceLists() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingPriceList, setEditingPriceList] = useState<any>(null);
    
    // Using price_lists table if available
    const { data: priceLists, loading, fetchItems, createItem, updateItem } = useCrud("ecom_price_lists");

    const priceListColumns = [
        { key: "name", label: "Price List Name", className: "font-bold text-slate-900" },
        { 
            key: "currency", 
            label: "Currency",
            render: (p: any) => (
                <span className="text-[12px] font-medium text-slate-500 uppercase tracking-tighter">
                    {p.currency || "INR"}
                </span>
            )
        },
        { 
            key: "type", 
            label: "Direction",
            render: (p: any) => (
                <span className={`text-[11px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${p.type === 'Buy' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                    {p.type || "Selling"}
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

    const priceListTabFields = {
        basic: [
            { key: "name", label: "Price List Name *", type: "text" as const, required: true, ph: "e.g. Wholesale / Retail" },
            { 
                key: "currency", label: "Currency", type: "select" as const,
                options: [
                    { label: "Indian Rupee (INR)", value: "INR" },
                    { label: "US Dollar (USD)", value: "USD" },
                    { label: "Euro (EUR)", value: "EUR" }
                ]
            },
            { 
                key: "type", label: "Price Type", type: "select" as const,
                options: [
                    { label: "Selling", value: "Sell" },
                    { label: "Buying", value: "Buy" }
                ]
            }
        ],
        config: [
            { key: "is_active", label: "Status", type: "select" as const, options: [{ value: 'true', label: 'Active' }, { value: 'false', label: 'Disabled' }] },
            { key: "effective_from", label: "Effective From", type: "date" as const },
            { key: "effective_to", label: "Effective To", type: "date" as const }
        ],
        mapping: [
            { key: "erp_mapping_id", label: "ERP ID", type: "text" as const },
            { key: "visibility", label: "Visibility", type: "select" as const, options: [{ value: 'Public', label: 'Public' }, { value: 'Private', label: 'Hidden' }] }
        ]
    };

    const handleSave = async (header: any) => {
        const payload = { ...header, is_active: header.is_active === "true" };
        if (editingPriceList) {
            await updateItem(editingPriceList.id, payload);
        } else {
            await createItem(payload);
        }
        setView("list");
        setEditingPriceList(null);
        fetchItems();
    };

    if (view === "form") {
        return (
            <div className="p-4 bg-slate-50 min-h-screen">
                <ERPEntryForm
                    title={editingPriceList ? "Edit Price List" : "Add New Price List"}
                    subtitle="Manage selling and buying price lists"
                    tabFields={priceListTabFields}
                    onAbort={() => { setView("list"); setEditingPriceList(null); }}
                    onSave={handleSave}
                    initialData={editingPriceList}
                    showItems={false}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white">
            <ERPListView
                title="Price Lists"
                data={priceLists || []}
                columns={priceListColumns}
                onNew={() => { setEditingPriceList(null); setView("form"); }}
                onRefresh={fetchItems}
                onRowClick={(p) => { setEditingPriceList(p); setView("form"); }}
                isLoading={loading}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                primaryKey="id"
            />
        </div>
    );
}
