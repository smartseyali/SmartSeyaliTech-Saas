import { useState } from "react";
import { useCrud } from "@/hooks/useCrud";
import { Layers } from "lucide-react";
import ERPListView from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

export const Collections = () => {
    const { data, loading, createItem, updateItem, fetchItems } = useCrud("collections");
    const [searchTerm, setSearchTerm] = useState("");
    const [view, setView] = useState<"list" | "form">("list");
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
            label: "Collection",
            render: (row: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900 tracking-tight">{row.name}</span>
                    <span className="text-xs text-gray-400 font-bold tracking-widest mt-1 truncate max-w-[200px]">{row.slug || "NO_SLUG"}</span>
                </div>
            )
        },
        { 
            key: "is_active", 
            label: "Status", 
            render: (row: any) => (
                <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold tracking-widest border ${
                    row.is_active ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-500 border-slate-100"
                }`}>
                    {row.is_active ? 'Published' : 'Draft'}
                </div>
            ) 
        }
    ];

    const colFields = [
        { key: "name", label: "Collection Title", required: true, ph: "e.g. Summer Essentials" },
        { key: "slug", label: "Url Slug", ph: "e.g. summer-essentials" },
        { key: "description", label: "Public Description", type: "text" as const },
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

    const filteredData = (data || []).filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (view === "form") {
        return (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <ERPEntryForm
                    title={editingItem ? "Refine Collection Hub" : "Build Collection Entry"}
                    subtitle="Universal Master Catalog"
                    headerFields={colFields}
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
    );
};


