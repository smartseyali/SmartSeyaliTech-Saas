import { useState, useMemo } from "react";
import { useCrud } from "@/hooks/useCrud";
import { 
    Package, ShoppingCart, Tag, Star, 
    Layers, LayoutGrid, Building2, Upload, 
    Search, Info, Database, Settings2, 
    X, TrendingUp, CheckCircle2, Image as ImageIcon,
    ExternalLink, Globe, Boxes, Ruler, 
    DollarSign, Percent, ShieldCheck
} from "lucide-react";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function UnifiedItems() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingItem, setEditingItem] = useState<any>(null);
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Fetch all products with unified schema
    const { data: products, loading, fetchItems, createItem, updateItem } = useCrud("products", "*, ecom_categories(id, name)");
    const { data: categories } = useCrud("ecom_categories");

    const selectedId = searchParams.get("id");
    const selectedProduct = useMemo(() =>
        selectedId ? products.find(p => String(p.id) === selectedId) : null
        , [products, selectedId]);

    const itemHeaderFields = [
        // --- Core Identity ---
        { key: "name", label: "Product Name / Identifier", required: true, ph: "Enterprise Logic Pro..." },
        { key: "sku", label: "SKU / Model Identity", ph: "ELP-2026-00X" },
        
        // --- Commercial Node ---
        { key: "rate", label: "Standard Cost Rate (₹)", type: "number" as const, ph: "0.00" },
        { key: "price", label: "Standard Selling Price (₹)", type: "number" as const, ph: "0.00" },
        
        // --- E-Commerce Extension ---
        { 
            key: "is_ecommerce", label: "E-Commerce Dispatch", type: "select" as const,
            options: [
                { label: "Online Store Enabled", value: "true" },
                { label: "Internal Asset Only", value: "false" }
            ]
        },
        {
            key: "category_id",
            label: "Category Hub",
            type: "select" as const,
            options: (categories || []).map(c => ({ label: c.name, value: String(c.id) }))
        },
        { key: "image_url", label: "Primary Visual URL", ph: "https://cdn.platform.com/product.png" },
        
        // --- System State ---
        { 
            key: "status", label: "Lifecycle Status", type: "select" as const, 
            options: [
                { label: "Active Operations", value: "active" },
                { label: "Dormant / Archived", value: "inactive" }
            ]
        },
        { key: "description", label: "Market Narrative / Tech Specs", ph: "Comprehensive entity details..." }
    ];

    const handleSave = async (header: any) => {
        const payload = {
            ...header,
            is_ecommerce: header.is_ecommerce === "true",
            category_id: header.category_id ? parseInt(header.category_id) : null,
        };
        if (editingItem) {
            await updateItem(editingItem.id, payload);
        } else {
            await createItem(payload);
        }
        setView("list");
        setEditingItem(null);
    };

    const itemColumns = [
        { 
            key: "identity", 
            label: "Entity Matrix",
            render: (item: any) => (
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm overflow-hidden group-hover:bg-slate-900 transition-all duration-500">
                        {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:opacity-80" />
                        ) : (
                            <Package className="w-6 h-6 text-slate-300 group-hover:text-white" />
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 tracking-tight text-[13px]">{item.name}</span>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-gray-400 font-bold tracking-widest leading-none border-r pr-2 border-slate-200">
                                {item.sku || "UNASSIGNED"}
                            </span>
                            {item.is_ecommerce ? (
                                <span className="flex items-center gap-1 text-[9px] text-emerald-600 font-bold tracking-widest uppercase">
                                    <Globe size={10} /> Online
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-[9px] text-slate-400 font-bold tracking-widest uppercase">
                                    <Database size={10} /> Local
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )
        },
        { 
            key: "valuation", 
            label: "Fiscal Valuation",
            render: (item: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-900 tracking-tight text-[13px]">₹{Number(item.price || 0).toLocaleString()}</span>
                    <span className="text-[9px] font-bold text-slate-400 tracking-widest leading-none mt-1 uppercase">Selling Unit Price</span>
                </div>
            ),
        },
        { 
            key: "state", 
            label: "Control Node",
            render: (item: any) => <StatusBadge status={item.status || "active"} />
        }
    ];

    const handleEdit = (item: any) => {
        setEditingItem({
            ...item,
            is_ecommerce: String(item.is_ecommerce !== false),
            category_id: String(item.category_id || "")
        });
        setView("form");
    };

    if (view === "form") {
        return (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <ERPEntryForm
                    title={editingItem ? "Refine Entity Identity" : "Initialize Resource Entry"}
                    subtitle="Global Master Hub Catalog"
                    headerFields={itemHeaderFields}
                    onAbort={() => { setView("list"); setEditingItem(null); }}
                    onSave={handleSave}
                    initialData={editingItem}
                    showItems={false}
                />
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-white overflow-hidden -m-8">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={selectedProduct ? 40 : 100} minSize={30}>
                    <ERPListView
                        title="Universal Catalogue"
                        data={products || []}
                        columns={itemColumns}
                        onNew={() => { setEditingItem(null); setView("form"); }}
                        onRefresh={fetchItems}
                        onRowClick={(item) => setSearchParams({ id: String(item.id) })}
                        isLoading={loading}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        primaryKey="id"
                        headerActions={
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" className="h-8 px-4 rounded-xl font-bold text-[10px] tracking-widest gap-2">
                                    <Upload size={14} className="text-indigo-600" /> Bulk Synchronization
                                </Button>
                            </div>
                        }
                    />
                </ResizablePanel>

                {selectedProduct && (
                    <>
                        <ResizableHandle withHandle className="bg-slate-100" />
                        <ResizablePanel defaultSize={60} className="bg-slate-50/30">
                            <div className="h-full flex flex-col p-8 overflow-hidden">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-[2rem] bg-white shadow-xl border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                                            {selectedProduct.image_url ? (
                                                <img src={selectedProduct.image_url} className="w-full h-full object-cover" />
                                            ) : (
                                                <Package className="w-8 h-8 text-slate-100" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                                                <p className="text-[10px] font-bold tracking-widest text-indigo-600 uppercase">Product Profile Alpha</p>
                                            </div>
                                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{selectedProduct.name}</h2>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Button 
                                            variant="outline" size="icon" 
                                            onClick={() => handleEdit(selectedProduct)}
                                            className="h-10 w-10 rounded-2xl bg-white border-slate-200 hover:border-indigo-200 hover:text-indigo-600 shadow-sm"
                                        >
                                            <Settings2 size={18} />
                                        </Button>
                                        <Button 
                                            variant="ghost" size="icon" 
                                            onClick={() => setSearchParams({})}
                                            className="h-10 w-10 rounded-2xl text-slate-400 hover:text-slate-900"
                                        >
                                            <X size={20} />
                                        </Button>
                                    </div>
                                </div>

                                <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0">
                                    <TabsList className="bg-white/60 p-1.5 rounded-2xl border border-white/60 shadow-sm mb-8 w-fit shrink-0">
                                        <TabsTrigger value="overview" className="rounded-xl h-10 px-8 font-bold text-[10px] tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white">OVERVIEW</TabsTrigger>
                                        <TabsTrigger value="ecommerce" className="rounded-xl h-10 px-8 font-bold text-[10px] tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white">COMMERCE</TabsTrigger>
                                        <TabsTrigger value="inventory" className="rounded-xl h-10 px-8 font-bold text-[10px] tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white">LOGISTICS</TabsTrigger>
                                    </TabsList>

                                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                        <TabsContent value="overview" className="space-y-6 mt-0">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-white p-6 rounded-[2rem] border border-white shadow-sm">
                                                    <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase block mb-1">HSN / SKU</span>
                                                    <p className="text-lg font-bold text-slate-900">{selectedProduct.sku || "N/A"}</p>
                                                </div>
                                                <div className="bg-white p-6 rounded-[2rem] border border-white shadow-sm">
                                                    <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase block mb-1">Standard Cost</span>
                                                    <p className="text-lg font-bold text-emerald-600">₹{Number(selectedProduct.rate || 0).toLocaleString()}</p>
                                                </div>
                                                <div className="col-span-2 bg-white p-6 rounded-[2rem] border border-white shadow-sm">
                                                    <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase block mb-1">Catalog Narrative</span>
                                                    <p className="text-sm text-slate-600 font-medium leading-relaxed">{selectedProduct.description || "No narrative available for this entity."}</p>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="ecommerce" className="space-y-6 mt-0">
                                            <div className="bg-white p-8 rounded-[3rem] border border-white shadow-sm">
                                                <div className="flex items-center justify-between mb-8">
                                                    <div>
                                                        <h4 className="font-bold text-slate-900">Online Store Visibility</h4>
                                                        <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">E-Commerce Deployment Node</p>
                                                    </div>
                                                    <StatusBadge status={selectedProduct.is_ecommerce ? "Online" : "Internal"} />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                                                        <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1">Display Category</p>
                                                        <p className="font-bold text-slate-900">{selectedProduct.ecom_categories?.name || "Global"}</p>
                                                    </div>
                                                    <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                                                        <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1">Featured Weight</p>
                                                        <p className="font-bold text-slate-900">{selectedProduct.is_featured ? "High Priority" : "Normal"}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="inventory" className="space-y-6 mt-0">
                                            <div className="bg-white p-12 rounded-[3rem] border border-dashed border-slate-200 flex flex-col items-center text-center gap-6">
                                                <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-200">
                                                    <TrendingUp size={32} />
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="font-bold text-slate-900">Logistics Sequence Initializing</h3>
                                                    <p className="text-xs text-slate-400 font-bold tracking-widest max-w-[240px]">Real-time stock velocity and warehouse tracking node is being synchronized.</p>
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
        </div>
    );
}
