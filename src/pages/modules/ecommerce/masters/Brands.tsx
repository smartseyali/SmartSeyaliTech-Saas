import { useState } from "react";
import { ModuleListPage } from "@/components/modules/ModuleListPage";
import { DynamicFormDialog, FieldConfig } from "@/components/modules/DynamicFormDialog";
import { useCrud } from "@/hooks/useCrud";
import { Award, Image as ImageIcon } from "lucide-react";

const brandColumns = [
    { key: "logo_url", label: "", render: (val: string) => val ? <img src={val} className="w-8 h-8 rounded-lg object-contain bg-secondary/30" /> : <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center"><Award className="w-4 h-4 text-muted-foreground" /></div> },
    { key: "name", label: "Brand Name" },
    { key: "description", label: "Overview" },
    { key: "is_active", label: "Status", render: (val: boolean) => val ? 'Live' : 'Hidden' },
];

const brandFields: FieldConfig[] = [
    { key: "logo_url", label: "Brand Logo", type: "image", folder: "brands" },
    { key: "name", label: "Brand Name", required: true },
    { key: "description", label: "Short History/Bio", type: "textarea" },
];

export const Brands = () => {
    const { data, loading, createItem, updateItem, deleteItem } = useCrud("brands");
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
        if (confirm("Permanently delete this brand? This will affect products linked to it.")) {
            await deleteItem(item.id);
        }
    };

    return (
        <>
            <ModuleListPage
                title="Brands"
                subtitle="Manage brand identities for your marketplace"
                columns={brandColumns}
                data={data}
                loading={loading}
                onNew={handleNew}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
            <DynamicFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                title={editingItem ? "Edit Brand Details" : "Register Brand"}
                fields={brandFields}
                initialData={editingItem}
                onSubmit={handleSubmit}
            />
        </>
    );
};

