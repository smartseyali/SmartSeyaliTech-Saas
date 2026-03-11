import { useState } from "react";
import { useCrud } from "@/hooks/useCrud";
import { Layers } from "lucide-react";
import ERPListView from "@/components/modules/ERPListView";
import { DynamicFormDialog } from "@/components/modules/DynamicFormDialog";

export const Collections = () => {
    const { data, loading, createItem, updateItem, fetchItems } = useCrud("collections");
    const [searchTerm, setSearchTerm] = useState("");
    const [formOpen, setFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    const colColumns = [
        { 
            key: "image_url", 
            label: "", 
            render: (row: any) => row.image_url ? (
                <img src={row.image_url} className="w-10 h-10 rounded-xl object-cover border border-slate-100 shadow-sm" />
            ) : (
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                    <Layers className="w-4 h-4 text-slate-300" />
                </div>
            )
        },
        { 
            key: "name", 
            label: "Collection Identity",
            render: (row: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900 uppercase italic tracking-tight">{row.name}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 truncate max-w-[200px]">{row.slug || "NO_SLUG"}</span>
                </div>
            )
        },
        { 
            key: "is_active", 
            label: "Registry state", 
            render: (row: any) => (
                <div className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${
                    row.is_active ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
                }`}>
                    {row.is_active ? 'Published' : 'Draft'}
                </div>
            ) 
        }
    ];

    const colFields = [
        { key: "image_url", label: "Cover Image", type: "image" as const, folder: "collections" },
        { key: "name", label: "Collection Title", required: true, ph: "e.g. Summer Essentials" },
        { key: "slug", label: "Url Slug", ph: "e.g. summer-essentials" },
        { key: "description", label: "Public Description", type: "textarea" as const },
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

    const filteredData = (data || []).filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col">
            <ERPListView
                title="Store Collections"
                data={filteredData}
                columns={colColumns}
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
                title={editingItem ? "Refine Collection" : "Build Collection"}
                fields={colFields}
                initialData={editingItem}
                onSubmit={handleSubmit}
            />
        </div>
    );
};

