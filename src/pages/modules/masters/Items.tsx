import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Package, Plus, Search, Filter, RefreshCw, Save, X, Settings2, Trash2, Tag, Upload, FileDown, TrendingUp, ImageIcon } from "lucide-react";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";
import { Button } from "@/components/ui/button";
import { useCrud } from "@/hooks/useCrud";

export default function Items() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingItem, setEditingItem] = useState<any>(null);
    
    const { data: products, loading, fetchItems, createItem, updateItem } = useCrud("ecom_products");

    const itemColumns = [
        { key: "sku", label: "Code", className: "font-bold text-slate-900" },
        { key: "name", label: "Product Name" },
        { 
            key: "item_type", 
            label: "Type",
            render: (item: any) => (
                <span className="text-[12px] font-medium text-slate-500 capitalize">{item.item_type || "Stock"}</span>
            )
        },
        { 
            key: "status", 
            label: "Status",
            render: (item: any) => <StatusBadge status={item.status || "Active"} />
        },
        { key: "created_at", label: "Created Date" },
        { key: "updated_at", label: "Updated Date" }
    ];

    const productTabFields = {
        basic: [
            { key: 'name', label: 'Product Name *', type: 'text' as const, required: true, ph: 'Enter product name' },
            { key: 'sku', label: 'SKU Code *', type: 'text' as const, required: true, ph: 'PROD-001' },
            { key: 'barcode', label: 'Barcode', type: 'text' as const, ph: 'UPC/EAN' },
            { key: 'category_id', label: 'Category *', type: 'select' as const, options: [{ value: '1', label: 'Electronics' }] },
            { key: 'subcategory_id', label: 'Sub Category *', type: 'select' as const, options: [{ value: '1', label: 'Mobiles' }] },
            { key: 'brand_id', label: 'Brand *', type: 'select' as const, options: [{ value: '1', label: 'Apple' }] },
            { key: 'sub_brand_id', label: 'Sub Brand', type: 'select' as const, options: [{ value: '1', label: 'iPhone' }] },
            { key: 'uom_id', label: 'UOM *', type: 'select' as const, options: [{ value: '1', label: 'Pcs' }] }
        ],
        config: [
            { key: 'cost_price', label: 'Cost Price', type: 'number' as const, ph: '0.00' },
            { key: 'selling_price', label: 'Selling Price', type: 'number' as const, ph: '0.00' },
            { key: 'tax_id', label: 'Tax *', type: 'select' as const, options: [{ value: '1', label: 'GST 18%' }] },
            { key: 'hsn_code', label: 'HSN Code', type: 'text' as const, ph: 'HSN/SAC' },
            { key: 'status', label: 'Status', type: 'select' as const, options: [{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }] }
        ],
        mapping: [
            { key: 'online_sync', label: 'E-commerce Sync', type: 'select' as const, options: [{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }] },
            { key: 'seo_title', label: 'SEO Title', type: 'text' as const },
            { key: 'meta_description', label: 'Meta Description', type: 'textarea' as any }
        ]
    };

    const variantFields = [
        { key: 'variant_name', label: 'Variant Name', type: 'text' as const, ph: 'e.g. Red / 128GB' },
        { key: 'size', label: 'Size', type: 'text' as const, ph: 'XL, 32, etc' },
        { key: 'color', label: 'Color', type: 'text' as const, ph: 'Red, Blue' },
        { key: 'sku', label: 'SKU', type: 'text' as const, ph: 'SKU-001' },
        { key: 'price', label: 'Price', type: 'number' as const, ph: '0.00' },
        { key: 'stock_qty', label: 'Stock Qty', type: 'number' as const, ph: '0' }
    ];

    const handleSave = async (header: any, items: any[]) => {
        try {
            console.log("Saving product with variants:", { header, items });
            if (editingItem) {
                await updateItem(editingItem.id, header);
            } else {
                await createItem(header);
            }
            setView("list");
            setEditingItem(null);
            fetchItems();
        } catch (err) {
            console.error("Save failed:", err);
        }
    };

    if (view === "form") {
        return (
            <div className="p-4 bg-slate-50 min-h-screen">
                <ERPEntryForm
                    title={editingItem ? "Edit Product" : "Add New Product"}
                    subtitle="Manage product details and inventory settings"
                    tabFields={productTabFields}
                    itemFields={variantFields}
                    itemTitle="Variants / Attributes"
                    onSave={handleSave}
                    onAbort={() => {
                        setView("list");
                        setEditingItem(null);
                    }}
                    initialData={editingItem}
                    showItems={true}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white">
            <ERPListView
                title="Product Master"
                data={products || []}
                columns={itemColumns}
                onNew={() => {
                    setEditingItem(null);
                    setView("form");
                }}
                onRefresh={fetchItems}
                onRowClick={(item) => {
                    setEditingItem(item);
                    setView("form");
                }}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                isLoading={loading}
                primaryKey="id"
            />
        </div>
    );
}
