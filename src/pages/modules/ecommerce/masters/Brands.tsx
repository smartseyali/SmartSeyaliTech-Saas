import { useState } from "react";
import { useCrud } from "@/hooks/useCrud";
import { Award } from "lucide-react";
import ERPListView from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

export const Brands = () => {
    const { data, loading, createItem, updateItem, fetchItems } = useCrud("brands");
    const [searchTerm, setSearchTerm] = useState("");
    const [view, setView] = useState<"list" | "form">("list");
    const [editingItem, setEditingItem] = useState<any>(null);

    const brandColumns = [
        { 
            key: "logo_url", 
            label: "", 
            render: (row: any) => row.logo_url ? (
                <img src={row.logo_url} className="w-10 h-10 rounded-xl object-contain bg-slate-50 border border-slate-100 shadow-sm p-1" />
            ) : (
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                    <Award className="w-4 h-4 text-slate-300" />
                </div>
            )
        },
        { 
            key: "name", 
            label: "Brand",
            render: (row: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900 tracking-tight">{row.name}</span>
                    <span className="text-[10px] text-gray-400 font-bold tracking-widest mt-1 truncate max-w-[200px]">{row.description || "Vendor Registry Bio"}</span>
                </div>
            )
        },
        { 
            key: "is_active", 
            label: "Ledger", 
            render: (row: any) => (
                <div className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-widest border ${
                    row.is_active ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
                }`}>
                    {row.is_active ? 'Live' : 'Hidden'}
                </div>
            ) 
        }
    ];

    const brandFields = [
        { key: "name", label: "Brand Name", required: true },
        { key: "description", label: "Short History/Bio", type: "text" as const },
    ];

    const handleNew = () => {
        setEditingItem(null);
        setView("form");
    };

    const handleEdit = (item: any) => {
        setEditingItem(item);
        setView("form");
    };

    const handleSubmit = async (formData: any) => {
        if (editingItem?.id) {
            await updateItem(editingItem.id, formData);
        } else {
            await createItem(formData);
        }
        setView("list");
        fetchItems();
    };

    const filteredData = (data || []).filter(b => 
        b.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (view === "form") {
        return (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <ERPEntryForm
                    title={editingItem ? "Refine Brand Identity" : "Initialize Brand Entry"}
                    subtitle="Global Master Matrix"
                    headerFields={brandFields}
                    onAbort={() => { setView("list"); setEditingItem(null); }}
                    onSave={handleSubmit}
                    initialData={editingItem}
                    showItems={false}
                />
            </div>
        );
    }

    return (
        <ERPListView
            title="Store Brands"
            data={filteredData}
            columns={brandColumns}
            onNew={handleNew}
            onRefresh={fetchItems}
            onRowClick={handleEdit}
            isLoading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            primaryKey="id"
        />
    );
};


