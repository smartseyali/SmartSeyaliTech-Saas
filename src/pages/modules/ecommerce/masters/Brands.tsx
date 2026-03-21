import { useState } from "react";
import { useCrud } from "@/hooks/useCrud";
import { Award } from "lucide-react";
import ERPListView from "@/components/modules/ERPListView";
import { DynamicFormDialog } from "@/components/modules/DynamicFormDialog";

export const Brands = () => {
    const { data, loading, createItem, updateItem, fetchItems } = useCrud("brands");
    const [searchTerm, setSearchTerm] = useState("");
    const [formOpen, setFormOpen] = useState(false);
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
                    <span className="font-bold text-gray-900 uppercase italic tracking-tight">{row.name}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 truncate max-w-[200px]">{row.description || "Vendor Registry Bio"}</span>
                </div>
            )
        },
        { 
            key: "is_active", 
            label: "Ledger", 
            render: (row: any) => (
                <div className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${
                    row.is_active ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
                }`}>
                    {row.is_active ? 'Live' : 'Hidden'}
                </div>
            ) 
        }
    ];

    const brandFields = [
        { key: "logo_url", label: "Brand Logo", type: "image" as const, folder: "brands" },
        { key: "name", label: "Brand Name", required: true },
        { key: "description", label: "Short History/Bio", type: "textarea" as const },
    ];

    const handleNew = () => {
        setEditingItem(null);
        setFormOpen(true);
    };

    const handleEdit = (item: any) => {
        setEditingItem(item);
        setFormOpen(true);
    };

    const handleSubmit = async (formData: any) => {
        if (editingItem?.id) {
            await updateItem(editingItem.id, formData);
        } else {
            await createItem(formData);
        }
        setFormOpen(false);
        fetchItems();
    };

    const filteredData = (data || []).filter(b => 
        b.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col">
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
            <DynamicFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                title={editingItem ? "Edit Brand Details" : "Register Brand"}
                fields={brandFields}
                initialData={editingItem}
                onSubmit={handleSubmit}
            />
        </div>
    );
};

