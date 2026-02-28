import { useState } from "react";
import { ModuleListPage } from "@/components/modules/ModuleListPage";
import { DynamicFormDialog, FieldConfig } from "@/components/modules/DynamicFormDialog";
import { useCrud } from "@/hooks/useCrud";
import { LayoutGrid, Image as ImageIcon } from "lucide-react";

const categoryColumns = [
    { key: "image_url", label: "", render: (val: string) => val ? <img src={val} className="w-8 h-8 rounded-lg object-cover" /> : <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center"><LayoutGrid className="w-4 h-4 text-muted-foreground" /></div> },
    { key: "name", label: "Category Name" },
    { key: "description", label: "Description" },
    { key: "is_active", label: "Status", render: (val: boolean) => val ? 'Live' : 'Hidden' },
];

const categoryFields: FieldConfig[] = [
    { key: "image_url", label: "Category Image", type: "image", folder: "categories" },
    { key: "name", label: "Category Name", required: true },
    { key: "description", label: "Description", type: "textarea" },
    {
        key: "is_active", label: "Status", type: "select", options: [
            { label: "Public", value: "true" },
            { label: "Private", value: "false" }
        ]
    }
];

export const Categories = () => {
    const { data, loading, createItem, updateItem, deleteItem } = useCrud("ecom_categories");
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
        const payload = {
            ...formData,
            is_active: formData.is_active === "true"
        };
        if (editingItem) {
            await updateItem(editingItem.id, payload);
        } else {
            await createItem(payload);
        }
    };

    const handleDelete = async (item: any) => {
        if (confirm("Delete this category? This might affect products using it.")) {
            await deleteItem(item.id);
        }
    };

    return (
        <>
            <ModuleListPage
                title="Product Categories"
                subtitle="Organize your shop's inventory for easy discovery"
                columns={categoryColumns}
                data={data}
                loading={loading}
                onNew={handleNew}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
            <DynamicFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                title={editingItem ? "Edit Category" : "Build New Category"}
                fields={categoryFields}
                initialData={editingItem}
                onSubmit={handleSubmit}
            />
        </>
    );
};
