import { useState, useMemo, useEffect } from "react";
import { ModuleListPage } from "@/components/modules/ModuleListPage";
import { DynamicFormDialog, FieldConfig } from "@/components/modules/DynamicFormDialog";
import { useCrud } from "@/hooks/useCrud";
import { useTenant } from "@/contexts/TenantContext";
import { useDictionary } from "@/hooks/useDictionary";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    Box, Tag, Star, LayoutGrid, Building2, Upload, Search, Package,
    Info, Database, Layers, Settings2, X, TrendingUp, CheckCircle2
} from "lucide-react";
import { ProductVariantDialog } from "@/components/masters/ProductVariantDialog";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export const EcomProducts = () => {
    const { t } = useDictionary();
    const { data: allProducts, loading, createItem, updateItem, deleteItem } = useCrud("products", "*, ecom_categories(id, name)");
    const { data: categories } = useCrud("ecom_categories");
    const { activeCompany } = useTenant();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // UI States
    const [formOpen, setFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [variantDialogOpen, setVariantDialogOpen] = useState(false);

    // Selected product for detailing (Split View)
    const selectedId = searchParams.get("id");
    const selectedProduct = useMemo(() =>
        selectedId ? allProducts.find(p => String(p.id) === selectedId) : null
        , [allProducts, selectedId]);

    const ecomProductColumns = useMemo(() => [
        { key: "image_url", label: "", render: (val: string) => val ? <img src={val} className="w-10 h-10 rounded-xl object-cover shadow-sm" /> : <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200"><Box className="w-5 h-5 text-slate-400" /></div> },
        {
            key: "name",
            label: `${t("Product")} Identity`,
            render: (val: string, row: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-900 leading-tight">{val}</span>
                    <span className="text-[10px] font-bold text-slate-400 font-mono tracking-tighter uppercase">{row.sku || 'NO_SKU'}</span>
                </div>
            )
        },
        { key: "rate", label: t("Price"), align: "right" as const, render: (val: any) => <span className="text-blue-600 font-black">₹{Number(val || 0).toLocaleString('en-IN')}</span> },
    ], [t]);

    const ecomProductFields: FieldConfig[] = [
        { key: "image_url", label: "Primary Image", type: "image", folder: "products" },
        { key: "name", label: "Display Name (for Site)", required: true },
        { key: "sku", label: `${t("SKU")} / Model` },
        {
            key: "category_id",
            label: `${t("Product")} ${t("Category")}`,
            type: "select",
            options: (categories || []).map(c => ({ label: c.name, value: String(c.id) }))
        },
        { key: "rate", label: `Sale ${t("Price")} (MRP)`, type: "number" },
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

    const ecomData = allProducts.filter(p => (p as any).is_ecommerce !== false);

    const handleNew = () => {
        setEditingItem(null);
        setFormOpen(true);
    };

    const handleEdit = (item: any) => {
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
            category_id: formData.category_id ? parseInt(formData.category_id) : null,
            category: categories.find(c => String(c.id) === formData.category_id)?.name || ""
        };
        if (editingItem) {
            await updateItem(editingItem.id, payload);
        } else {
            await createItem(payload);
        }
    };

    const handleDelete = async (item: any) => {
        if (confirm(`Move this ${t("Product").toLowerCase()} to archive (Remove from E-commerce)?`)) {
            await updateItem(item.id, { is_ecommerce: false });
        }
    };

    const selectProduct = (row: any) => {
        setSearchParams({ id: String(row.id) });
    };

    return (
        <div className="h-full flex flex-col bg-white overflow-hidden">
            {/* Split View Workbench */}
            <ResizablePanelGroup direction="horizontal" className="flex-1">
                <ResizablePanel defaultSize={selectedProduct ? 40 : 100} minSize={30} className="bg-white">
                    <ModuleListPage
                        title={selectedProduct ? `Inventory` : `Store ${t("Products")}`}
                        subtitle={selectedProduct ? "Operational Node Management" : "High-performance management of your digital shelf"}
                        columns={ecomProductColumns}
                        data={ecomData}
                        loading={loading}
                        onNew={handleNew}
                        onEdit={(row) => {
                            if (selectedProduct?.id === row.id) {
                                handleEdit(row);
                            } else {
                                selectProduct(row);
                            }
                        }}
                        onDelete={handleDelete}
                        headerActions={
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate("/ecommerce/masters/products/import")}
                                    className="rounded-xl gap-2 font-bold border-slate-200 hover:bg-slate-50 transition-all"
                                >
                                    <Upload className="w-4 h-4 text-blue-600" />
                                    Bulk
                                </Button>
                            </div>
                        }
                        actions={(row) => (
                            <Button
                                variant={selectedProduct?.id === row.id ? "default" : "outline"}
                                size="sm"
                                onClick={() => selectProduct(row)}
                                className={cn(
                                    "h-8 px-4 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all",
                                    selectedProduct?.id === row.id ? "bg-blue-600 shadow-lg shadow-blue-600/20" : "border-slate-200"
                                )}
                            >
                                {selectedProduct?.id === row.id ? "Inspecting" : "Select"}
                            </Button>
                        )}
                    />
                </ResizablePanel>

                {selectedProduct && (
                    <>
                        <ResizableHandle withHandle className="bg-transparent w-2 -translate-x-1 z-10" />
                        <ResizablePanel defaultSize={60} minSize={40} className="bg-slate-50/50 backdrop-blur-sm border-l border-white shadow-[inset_1px_0_0_0_rgba(255,255,255,0.8)]">
                            <div className="h-full flex flex-col p-8 overflow-hidden">
                                {/* Detail Header */}
                                <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200/60">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 rounded-[24px] bg-white shadow-xl flex items-center justify-center border border-slate-100 shrink-0 overflow-hidden">
                                            {selectedProduct.image_url ? (
                                                <img src={selectedProduct.image_url} className="w-full h-full object-cover" />
                                            ) : (
                                                <Package className="w-8 h-8 text-slate-200" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600/80">Entity Workspace</p>
                                            </div>
                                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{selectedProduct.name}</h2>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleEdit(selectedProduct)}
                                            className="h-10 w-10 rounded-2xl bg-white border-slate-200 hover:border-blue-200 hover:text-blue-600 transition-all shadow-sm"
                                        >
                                            <Settings2 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setSearchParams({})}
                                            className="h-10 w-10 rounded-2xl text-slate-400 hover:text-slate-900 transition-all"
                                        >
                                            <X className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>

                                <Tabs defaultValue="inventory" className="flex-1 flex flex-col min-h-0">
                                    <TabsList className="bg-white/60 p-1.5 rounded-2xl border border-slate-200/60 shadow-sm mb-6 w-fit h-auto flex gap-1">
                                        <TabsTrigger value="inventory" className="rounded-xl h-10 px-6 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all gap-2">
                                            <Database className="w-3.5 h-3.5" /> Sku Inventory
                                        </TabsTrigger>
                                        <TabsTrigger value="details" className="rounded-xl h-10 px-6 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all gap-2">
                                            <Info className="w-3.5 h-3.5" /> Specifications
                                        </TabsTrigger>
                                        <TabsTrigger value="media" className="rounded-xl h-10 px-6 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all gap-2">
                                            <Layers className="w-3.5 h-3.5" /> Assets
                                        </TabsTrigger>
                                    </TabsList>

                                    <div className="flex-1 overflow-hidden">
                                        <TabsContent value="inventory" className="h-full mt-0 focus-visible:ring-0">
                                            <div className="h-full bg-white rounded-[32px] border border-slate-200/60 shadow-sm overflow-hidden flex flex-col shadow-inner">
                                                {/* Variants Tab Content */}
                                                <ProductVariantDialog
                                                    open={true}
                                                    onOpenChange={() => { }}
                                                    productId={selectedProduct.id}
                                                    companyId={activeCompany?.id || 0}
                                                    productName={selectedProduct.name}
                                                    isEmbedded={true}
                                                />
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="details" className="h-full mt-0 focus-visible:ring-0 overflow-y-auto pr-2 scrollbar-thin">
                                            <div className="grid grid-cols-2 gap-6 pb-20">
                                                {/* Read-only specification summary or Mini-form */}
                                                {[
                                                    { label: "Category", value: selectedProduct.ecom_categories?.name || "Uncategorized", icon: Tag },
                                                    { label: "Base Price", value: `₹${Number(selectedProduct.rate || 0).toLocaleString()}`, icon: TrendingUp },
                                                    { label: "Market Status", value: selectedProduct.status || "Active", icon: CheckCircle2 },
                                                    { label: "Internal SKU", value: selectedProduct.sku || "N/A", icon: Box },
                                                ].map(stat => (
                                                    <div key={stat.label} className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-sm flex flex-col gap-3 group hover:border-blue-200 transition-all">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                                <stat.icon className="w-4 h-4" />
                                                            </div>
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
                                                        </div>
                                                        <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                                                    </div>
                                                ))}
                                                <div className="col-span-2 bg-white p-8 rounded-[32px] border border-slate-200/60 shadow-sm">
                                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                                                        <Info className="w-4 h-4" /> Product Narrative
                                                    </h4>
                                                    <p className="text-sm leading-relaxed text-slate-600 font-medium whitespace-pre-wrap">
                                                        {selectedProduct.description || "No description provided for this entity."}
                                                    </p>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="media" className="h-full mt-0 focus-visible:ring-0">
                                            <div className="h-full bg-white rounded-[32px] border border-slate-200/60 shadow-sm flex flex-col items-center justify-center text-center p-12 gap-6">
                                                <div className="w-20 h-20 rounded-[32px] bg-slate-50 flex items-center justify-center text-slate-200 border border-slate-100">
                                                    <Layers className="w-10 h-10" />
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="text-lg font-bold text-slate-900">Asset Management</h3>
                                                    <p className="text-xs font-medium text-slate-400 max-w-[240px]">Expanded media gallery for this product is coming in the next update.</p>
                                                </div>
                                            </div>
                                        </TabsContent>
                                    </div>
                                </Tabs>
                            </div>
                        </ResizablePanel>
                    </>
                )}
            </ResizablePanelGroup>

            <DynamicFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                title={editingItem ? `Refine ${t("Product")}` : `Launch New ${t("Product")}`}
                fields={ecomProductFields}
                initialData={editingItem}
                onSubmit={handleSubmit}
            />
        </div>
    );
};

