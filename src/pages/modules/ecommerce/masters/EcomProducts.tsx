import { useState, useMemo } from "react";
import ERPListView from "@/components/modules/ERPListView";
import { DynamicFormDialog } from "@/components/modules/DynamicFormDialog";
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
    const { data: allProducts, loading, createItem, updateItem, fetchItems } = useCrud("products", "*, ecom_categories(id, name)");
    const { data: categories } = useCrud("ecom_categories");
    const { activeCompany } = useTenant();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState("");

    // UI States
    const [formOpen, setFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    // Selected product for detailing (Split View)
    const selectedId = searchParams.get("id");
    const selectedProduct = useMemo(() =>
        selectedId ? allProducts.find(p => String(p.id) === selectedId) : null
        , [allProducts, selectedId]);

    const ecomProductColumns = [
        { 
            key: "image_url", 
            label: "", 
            render: (row: any) => row.image_url ? (
                <img src={row.image_url} className="w-10 h-10 rounded-xl object-cover border border-slate-100 shadow-sm" />
            ) : (
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                    <Box className="w-5 h-5 text-slate-300" />
                </div>
            )
        },
        {
            key: "name",
            label: `Entity Identity`,
            render: (row: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900 uppercase italic tracking-tight">{row.name}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">SKU: {row.sku || 'UNASSIGNED'}</span>
                </div>
            )
        },
        { 
            key: "rate", 
            label: "Ledger Price", 
            render: (row: any) => <span className="font-black text-indigo-600 tracking-tight">₹{Number(row.rate || 0).toLocaleString('en-IN')}</span> 
        },
    ];

    const ecomProductFields = [
        { key: "image_url", label: "Primary Image", type: "image" as const, folder: "products" },
        { key: "name", label: "Product Name", required: true },
        { key: "sku", label: `${t("SKU")} / Model` },
        {
            key: "category_id",
            label: `${t("Product")} ${t("Category")}`,
            type: "select" as const,
            options: (categories || []).map(c => ({ label: c.name, value: String(c.id) }))
        },
        { key: "rate", label: `Price (MRP)`, type: "number" as const },
        { key: "description", label: "Description", type: "textarea" as const },
        {
            key: "is_featured", label: "Visibility", type: "select" as const, options: [
                { label: "Hide from Featured", value: "false" },
                { label: "Show in Featured", value: "true" }
            ]
        },
        { key: "meta_title", label: "SEO Meta Title", ph: "Registry indexing title" },
        { key: "meta_description", label: "SEO Bio", type: "textarea" as const },
    ];

    const ecomData = allProducts.filter(p => (p as any).is_ecommerce !== false && 
        (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
         (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase())))
    );

    const handleNew = () => {
        setEditingItem(null);
        setFormOpen(true);
    };

    const handleEdit = (item: any) => {
        const editData = {
            ...item,
            category_id: item.category_id ? String(item.category_id) : "",
            is_featured: String(item.is_featured)
        };
        setEditingItem(editData);
        setFormOpen(true);
    };

    const handleSubmit = async (formData: any) => {
        const payload = {
            ...formData,
            is_ecommerce: true,
            is_featured: formData.is_featured === "true",
            category_id: formData.category_id ? parseInt(formData.category_id) : null,
        };
        if (editingItem?.id) {
            await updateItem(editingItem.id, payload);
        } else {
            await createItem(payload);
        }
        setFormOpen(false);
        fetchItems();
    };

    const selectProduct = (row: any) => {
        setSearchParams({ id: String(row.id) });
    };

    return (
        <div className="h-full flex flex-col bg-white overflow-hidden">
            <ResizablePanelGroup direction="horizontal" className="flex-1">
                <ResizablePanel defaultSize={selectedProduct ? 40 : 100} minSize={35} className="bg-white">
                    <ERPListView
                        title="Master Catalog"
                        data={ecomData}
                        columns={ecomProductColumns}
                        onNew={handleNew}
                        onRefresh={fetchItems}
                        onRowClick={selectProduct}
                        isLoading={loading}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        primaryKey="id"
                        headerActions={
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate("/apps/ecommerce/masters/products/import")}
                                className="h-8 px-4 rounded-xl gap-2 font-black text-[10px] uppercase tracking-widest border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
                            >
                                <Upload className="w-3.5 h-3.5 text-indigo-600" />
                                Bulk Import
                            </Button>
                        }
                    />
                </ResizablePanel>

                {selectedProduct && (
                    <>
                        <ResizableHandle withHandle className="bg-transparent w-2 -translate-x-1 z-10" />
                        <ResizablePanel defaultSize={60} minSize={40} className="bg-slate-50/50 backdrop-blur-sm border-l border-white shadow-[inset_1px_0_0_0_rgba(255,255,255,0.8)]">
                            <div className="h-full flex flex-col p-8 overflow-hidden">
                                {/* Detail Header */}
                                <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/60">
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
                                                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600/80">Registry Profile</p>
                                            </div>
                                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight italic uppercase">{selectedProduct.name}</h2>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleEdit(selectedProduct)}
                                            className="h-10 w-10 rounded-2xl bg-white border-slate-200 hover:border-indigo-200 hover:text-indigo-600 transition-all shadow-sm"
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
                                    <TabsList className="bg-white/60 p-1.5 rounded-2xl border border-white/60 shadow-sm mb-6 w-fit h-auto flex gap-1">
                                        <TabsTrigger value="inventory" className="rounded-xl h-10 px-6 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all gap-2">
                                            <Database className="w-3.5 h-3.5" /> Variants
                                        </TabsTrigger>
                                        <TabsTrigger value="details" className="rounded-xl h-10 px-6 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all gap-2">
                                            <Info className="w-3.5 h-3.5" /> Specifications
                                        </TabsTrigger>
                                        <TabsTrigger value="media" className="rounded-xl h-10 px-6 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all gap-2">
                                            <Layers className="w-3.5 h-3.5" /> Asset Ledger
                                        </TabsTrigger>
                                    </TabsList>

                                    <div className="flex-1 overflow-hidden">
                                        <TabsContent value="inventory" className="h-full mt-0 focus-visible:ring-0">
                                            <div className="h-full bg-white rounded-[32px] border border-white shadow-sm overflow-hidden flex flex-col">
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

                                        <TabsContent value="details" className="h-full mt-0 focus-visible:ring-0 overflow-y-auto pr-2 scrollbar-none">
                                            <div className="grid grid-cols-2 gap-6 pb-20">
                                                {[
                                                    { label: "Category", value: selectedProduct.ecom_categories?.name || "Global Group", icon: Tag },
                                                    { label: "Unit Value", value: `₹${Number(selectedProduct.rate || 0).toLocaleString()}`, icon: TrendingUp },
                                                    { label: "Ledger Status", value: selectedProduct.status || "Active", icon: CheckCircle2 },
                                                    { label: "SKU", value: selectedProduct.sku || "UNASSIGNED", icon: Box },
                                                ].map(stat => (
                                                    <div key={stat.label} className="bg-white p-6 rounded-[24px] border border-white/60 shadow-sm flex flex-col gap-3 group hover:border-indigo-200 transition-all">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                                <stat.icon className="w-4 h-4" />
                                                            </div>
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
                                                        </div>
                                                        <p className="text-xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
                                                    </div>
                                                ))}
                                                <div className="col-span-2 bg-white p-8 rounded-[32px] border border-white/60 shadow-sm">
                                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                                                        <Info className="w-4 h-4 text-indigo-600" /> Registry Bio
                                                    </h4>
                                                    <p className="text-sm leading-relaxed text-slate-600 font-medium whitespace-pre-wrap">
                                                        {selectedProduct.description || "Historical data for this entity remains unpopulated in the current registry sequence."}
                                                    </p>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="media" className="h-full mt-0 focus-visible:ring-0">
                                            <div className="h-full bg-white rounded-[32px] border border-white/60 shadow-sm flex flex-col items-center justify-center text-center p-12 gap-6">
                                                <div className="w-20 h-20 rounded-[32px] bg-slate-50 flex items-center justify-center text-slate-200 border border-slate-100">
                                                    <Layers className="w-10 h-10" />
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="text-lg font-bold text-slate-900 uppercase italic">Media Asset Vault</h3>
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest max-w-[240px]">Expanded gallery indexing sequence engaged.</p>
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
                title={editingItem ? `Refine ${t("Product")}` : `Register ${t("Product")}`}
                fields={ecomProductFields}
                initialData={editingItem}
                onSubmit={handleSubmit}
            />
        </div>
    );
};

