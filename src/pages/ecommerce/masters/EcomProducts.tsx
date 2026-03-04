import { useState } from "react";
import { ModuleListPage } from "@/components/modules/ModuleListPage";
import { DynamicFormDialog, FieldConfig } from "@/components/modules/DynamicFormDialog";
import { useCrud } from "@/hooks/useCrud";
import { useTenant } from "@/contexts/TenantContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Box, Tag, Star, LayoutGrid, Building2, Upload } from "lucide-react";
import { ProductVariantDialog } from "@/components/masters/ProductVariantDialog";

const ecomProductColumns = [
    { key: "image_url", label: "", render: (val: string) => val ? <img src={val} className="w-8 h-8 rounded-lg object-cover" /> : <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center"><Box className="w-4 h-4 text-muted-foreground" /></div> },
    { key: "sku", label: "SKU" },
    { key: "name", label: "Product Name" },
    {
        key: "ecom_categories",
        label: "Category",
        render: (val: any) => val?.name || <span className="text-muted-foreground italic">Uncategorized</span>
    },
    { key: "price", label: "Price", align: "right" as const, render: (val: any) => `₹ ${Number(val || 0).toLocaleString('en-IN')}` },
    { key: "is_featured", label: "Featured", render: (val: boolean) => val ? <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> : <Star className="w-4 h-4 text-muted-foreground/20" /> },
    { key: "status", label: "Status" },
];

export const EcomProducts = () => {
    const { data, loading, createItem, updateItem, deleteItem } = useCrud("products", "*, ecom_categories(id, name)");
    const { data: categories } = useCrud("ecom_categories");
    const { activeCompany } = useTenant();
    const navigate = useNavigate();
    const [formOpen, setFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [variantDialogOpen, setVariantDialogOpen] = useState(false);

    // Dynamic fields with category options
    const ecomProductFields: FieldConfig[] = [
        { key: "image_url", label: "Primary Image", type: "image", folder: "products" },
        { key: "name", label: "Display Name (for Site)", required: true },
        { key: "sku", label: "SKU / Model" },
        {
            key: "category_id",
            label: "Product Category",
            type: "select",
            options: (categories || []).map(c => ({ label: c.name, value: String(c.id) }))
        },
        { key: "rate", label: "Sale Price (MRP)", type: "number" },
        { key: "description", label: "Web Description", type: "textarea" },
        {
            key: "is_featured", label: "Feature on Home Page", type: "select", options: [
                { label: "Hide", value: "false" },
                { label: "Show in Featured section", value: "true" }
            ]
        },
        {
            key: "is_best_seller", label: "Mark as Best Seller", type: "select", options: [
                { label: "No", value: "false" },
                { label: "Yes", value: "true" }
            ]
        },
        { key: "meta_title", label: "SEO Title", ph: "Enter title for Google search" },
        { key: "meta_description", label: "SEO Description", type: "textarea" },
    ];

    // Filter only ecom products if needed, but for now we show all
    const ecomData = data.filter(p => (p as any).is_ecommerce !== false);

    const handleNew = () => {
        setEditingItem(null);
        setFormOpen(true);
    };

    const handleEdit = (item: any) => {
        // Convert category_id to string for the select component
        const editData = {
            ...item,
            category_id: item.category_id ? String(item.category_id) : ""
        };
        setEditingItem(editData);
        setFormOpen(true);
    };

    const handleSubmit = async (formData: any) => {
        const payload = {
            ...formData,
            is_ecommerce: true,
            is_featured: formData.is_featured === "true",
            is_best_seller: formData.is_best_seller === "true",
            // Correct mapping for bigint relation
            category_id: formData.category_id ? parseInt(formData.category_id) : null,
            // Sync legacy field for compatibility
            category: categories.find(c => String(c.id) === formData.category_id)?.name || ""
        };
        if (editingItem) {
            await updateItem(editingItem.id, payload);
        } else {
            await createItem(payload);
        }
    };

    const handleDelete = async (item: any) => {
        if (confirm("Move this product to archive (Remove from E-commerce)?")) {
            await updateItem(item.id, { is_ecommerce: false });
        }
    };

    return (
        <>
            <ModuleListPage
                title="Store Products"
                subtitle="High-performance management of your digital shelf"
                columns={ecomProductColumns}
                data={ecomData}
                loading={loading}
                headerActions={
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/ecommerce/masters/products/import")}
                        className="rounded-xl gap-2 font-bold border-primary/20 hover:bg-primary/5"
                    >
                        <Upload className="w-4 h-4 text-primary" />
                        Bulk Import
                    </Button>
                }
                onNew={handleNew}
                onEdit={handleEdit}
                onDelete={handleDelete}
                actions={(row) => (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 rounded-lg text-xs gap-2 font-bold border-primary/20 hover:bg-primary/5"
                            onClick={() => {
                                setEditingItem(row);
                                setVariantDialogOpen(true);
                            }}
                        >
                            <LayoutGrid className="w-3.5 h-3.5 text-primary" />
                            Variants
                        </Button>
                    </div>
                )}
            />
            <DynamicFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                title={editingItem ? "Refine Product" : "Launch New Product"}
                fields={ecomProductFields}
                initialData={editingItem}
                onSubmit={handleSubmit}
            />
            {editingItem && activeCompany && (
                <ProductVariantDialog
                    open={variantDialogOpen}
                    onOpenChange={setVariantDialogOpen}
                    productId={editingItem.id}
                    companyId={activeCompany.id}
                    productName={editingItem.name}
                />
            )}
        </>
    );
};

