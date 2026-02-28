import { useState } from "react";
import { ModuleListPage } from "@/components/modules/ModuleListPage";
import { DynamicFormDialog, FieldConfig } from "@/components/modules/DynamicFormDialog";
import { useCrud } from "@/hooks/useCrud";
import { Layers } from "lucide-react";

const colColumns = [
    { key: "image_url", label: "", render: (val: string) => val ? <img src={val} className="w-8 h-8 rounded-lg object-cover" /> : <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center"><Layers className="w-4 h-4 text-muted-foreground" /></div> },
    { key: "name", label: "Collection Title" },
    { key: "slug", label: "Handle / Slug" },
    { key: "is_active", label: "Public", render: (val: boolean) => val ? 'Published' : 'Draft' },
];

const colFields: FieldConfig[] = [
    { key: "image_url", label: "Cover Image", type: "image", folder: "collections" },
    { key: "name", label: "Collection Title", required: true, ph: "e.g. Summer Essentials" },
    { key: "slug", label: "Url Slug", ph: "e.g. summer-essentials" },
    { key: "description", label: "Public Description", type: "textarea" },
];

export const Collections = () => {
    const { data, loading, createItem, updateItem, deleteItem } = useCrud("collections");
    const [formOpen, setFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    const handleNew = () => {
        setEditingItem(null);
        setFormOpen(true);
    };

    const handleEdit = (item: any) => {
        setEditingItem(item);
        setFormOpen(true);
    };

    const handleSubmit = async (formData: any) => {
        if (editingItem) {
            await updateItem(editingItem.id, formData);
        } else {
            await createItem(formData);
        }
    };

    const handleDelete = async (item: any) => {
        if (confirm("Delete this collection? Linked products will remain in the catalog.")) {
            await deleteItem(item.id);
        }
    };

    return (
        <>
            <ModuleListPage
                title="Collections"
                subtitle="Group products by themes, trends or seasonal launches"
                columns={colColumns}
                data={data}
                loading={loading}
                onNew={handleNew}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
            <DynamicFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                title={editingItem ? "Refine Collection" : "Build Collection"}
                fields={colFields}
                initialData={editingItem}
                onSubmit={handleSubmit}
            />
        </>
    );
};

