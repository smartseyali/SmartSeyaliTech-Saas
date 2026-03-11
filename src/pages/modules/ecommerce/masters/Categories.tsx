import { useState } from "react";
import { useCrud } from "@/hooks/useCrud";
import { LayoutGrid } from "lucide-react";
import { useDictionary } from "@/hooks/useDictionary";
import ERPListView from "@/components/modules/ERPListView";
import { DynamicFormDialog } from "@/components/modules/DynamicFormDialog";

export const Categories = () => {
    const { t } = useDictionary();
    const { data, loading, createItem, updateItem, fetchItems } = useCrud("ecom_categories");
    const [searchTerm, setSearchTerm] = useState("");
    const [formOpen, setFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    const categoryColumns = [
        { 
            key: "image_url", 
            label: "", 
            render: (row: any) => row.image_url ? (
                <img src={row.image_url} className="w-10 h-10 rounded-xl object-cover border border-slate-100 shadow-sm" />
            ) : (
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                    <LayoutGrid className="w-4 h-4 text-slate-300" />
                </div>
            )
        },
        { 
            key: "name", 
            label: `${t("Category")} Identity`,
            render: (row: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900 uppercase italic tracking-tight">{row.name}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 truncate max-w-[200px]">{row.description || "No Registry Note"}</span>
                </div>
            )
        },
        { 
            key: "is_active", 
            label: "Ledger State", 
            render: (row: any) => (
                <div className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${
                    row.is_active ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
                }`}>
                    {row.is_active ? 'Live' : 'Hidden'}
                </div>
            ) 
        }
    ];

    const categoryFields = [
        { key: "image_url", label: `${t("Category")} Image`, type: "image" as const, folder: "categories" },
        { key: "name", label: `${t("Category")} Name`, required: true },
        { key: "description", label: "Description", type: "textarea" as const },
        {
            key: "is_active", label: "Registry Status", type: "select" as const, 
            options: [
                { label: "Public Discovery", value: "true" },
                { label: "Internal Draft", value: "false" }
            ]
        }
    ];

    const handleNew = () => {
        setEditingItem(null);
        setFormOpen(true);
    };

    const handleEdit = (item: any) => {
        setEditingItem({
            ...item,
            is_active: String(item.is_active)
        });
        setFormOpen(true);
    };

    const handleSubmit = async (formData: any) => {
        const payload = {
            ...formData,
            is_active: formData.is_active === "true"
        };
        if (editingItem?.id) {
            await updateItem(editingItem.id, payload);
        } else {
            await createItem(payload);
        }
        setFormOpen(false);
        fetchItems();
    };

    const filteredData = (data || []).filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col">
            <ERPListView
                title={t("Categories")}
                data={filteredData}
                columns={categoryColumns}
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
                title={editingItem ? `Edit ${t("Category")}` : `Build New ${t("Category")}`}
                fields={categoryFields}
                initialData={editingItem}
                onSubmit={handleSubmit}
            />
        </div>
    );
};
