import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
    Package, AlertTriangle, Search, RefreshCw, ChevronDown, ChevronRight,
    Edit2, Check, X, TrendingDown, Boxes,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Variant {
    id: string;
    variant_name: string;
    attributes_summary: string | null;
    stock_qty: number | null;
    sku: string | null;
}

interface Product {
    id: string;
    name: string;
    slug: string;
    sku: string | null;
    stock_qty: number | null;
    in_stock: boolean;
    image_url: string | null;
    has_variants: boolean;
    variants?: Variant[];
    expanded?: boolean;
}

const LOW_STOCK_THRESHOLD = 10;

function StockBadge({ qty }: { qty: number | null }) {
    if (qty === null || qty === undefined) return <span className="text-xs text-slate-400">—</span>;
    if (qty === 0) return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">Out of stock</span>;
    if (qty <= LOW_STOCK_THRESHOLD) return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">{qty} left</span>;
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">{qty} in stock</span>;
}

function InlineAdjust({
    current,
    onSave,
    onCancel,
}: { current: number | null; onSave: (v: number) => void; onCancel: () => void }) {
    const [val, setVal] = useState(String(current ?? 0));
    return (
        <div className="flex items-center gap-1">
            <input
                type="number"
                min="0"
                value={val}
                onChange={(e) => setVal(e.target.value)}
                className="w-20 h-7 px-2 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                autoFocus
                onKeyDown={(e) => { if (e.key === "Enter") onSave(Number(val)); if (e.key === "Escape") onCancel(); }}
            />
            <button onClick={() => onSave(Number(val))} className="p-1 text-emerald-600 hover:text-emerald-700"><Check className="w-4 h-4" /></button>
            <button onClick={onCancel} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
        </div>
    );
}

export default function Inventory() {
    const { activeCompany } = useTenant();
    const { toast } = useToast();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all" | "low" | "out">("all");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [savingId, setSavingId] = useState<string | null>(null);

    useEffect(() => { if (activeCompany) load(); }, [activeCompany?.id]);

    const load = async () => {
        if (!activeCompany) return;
        setLoading(true);
        const { data: prods } = await supabase
            .from("ecom_products")
            .select("id, name, slug, sku, stock_qty, in_stock, image_url, has_variants")
            .eq("company_id", activeCompany.id)
            .eq("is_active", true)
            .order("name");

        if (!prods) { setLoading(false); return; }

        const variantProductIds = prods.filter((p) => p.has_variants).map((p) => p.id);
        let variantsMap: Record<string, Variant[]> = {};

        if (variantProductIds.length > 0) {
            const { data: vars } = await supabase
                .from("product_variants")
                .select("id, product_id, variant_name, attributes_summary, stock_qty, sku")
                .in("product_id", variantProductIds)
                .order("sort_order");
            (vars || []).forEach((v: Variant & { product_id: string }) => {
                if (!variantsMap[v.product_id]) variantsMap[v.product_id] = [];
                variantsMap[v.product_id].push(v);
            });
        }

        setProducts(prods.map((p) => ({ ...p, variants: variantsMap[p.id] ?? [], expanded: false })));
        setLoading(false);
    };

    const updateProductStock = async (productId: string, qty: number) => {
        setSavingId(productId);
        const { error } = await supabase
            .from("ecom_products")
            .update({ stock_qty: qty, in_stock: qty > 0 })
            .eq("id", productId)
            .eq("company_id", activeCompany!.id);
        if (error) {
            toast({ title: "Error updating stock", description: error.message, variant: "destructive" });
        } else {
            setProducts((prev) => prev.map((p) => p.id === productId ? { ...p, stock_qty: qty, in_stock: qty > 0 } : p));
            toast({ title: "Stock updated" });
        }
        setSavingId(null);
        setEditingId(null);
    };

    const updateVariantStock = async (variantId: string, productId: string, qty: number) => {
        const key = `v_${variantId}`;
        setSavingId(key);
        const { error } = await supabase
            .from("product_variants")
            .update({ stock_qty: qty })
            .eq("id", variantId);
        if (error) {
            toast({ title: "Error updating variant stock", description: error.message, variant: "destructive" });
        } else {
            setProducts((prev) => prev.map((p) => {
                if (p.id !== productId) return p;
                return {
                    ...p,
                    variants: p.variants?.map((v) => v.id === variantId ? { ...v, stock_qty: qty } : v),
                };
            }));
            toast({ title: "Variant stock updated" });
        }
        setSavingId(null);
        setEditingId(null);
    };

    const toggleExpand = (id: string) => {
        setProducts((prev) => prev.map((p) => p.id === id ? { ...p, expanded: !p.expanded } : p));
    };

    const filtered = useMemo(() => {
        return products.filter((p) => {
            const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase());
            const qty = p.stock_qty ?? 0;
            const matchFilter =
                filter === "all" ? true :
                filter === "low" ? qty > 0 && qty <= LOW_STOCK_THRESHOLD :
                qty === 0;
            return matchSearch && matchFilter;
        });
    }, [products, search, filter]);

    const lowStockCount = products.filter((p) => {
        const qty = p.stock_qty ?? 0;
        return qty > 0 && qty <= LOW_STOCK_THRESHOLD;
    }).length;
    const outOfStockCount = products.filter((p) => (p.stock_qty ?? 0) === 0).length;

    return (
        <div className="p-8 pb-20 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-100">
                <div>
                    <p className="text-xs font-bold tracking-widest text-slate-500 mb-1">E-Commerce</p>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inventory</h1>
                    <p className="text-sm text-slate-500 mt-1">Track and adjust stock levels across products and variants.</p>
                </div>
                <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-2 self-start">
                    <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                    Refresh
                </Button>
            </div>

            {/* Alert cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                            <Boxes className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold tracking-widest text-slate-500">TOTAL PRODUCTS</p>
                            <p className="text-2xl font-bold text-slate-900">{products.length}</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setFilter(filter === "low" ? "all" : "low")}
                    className={cn("bg-white border rounded-2xl p-5 shadow-sm text-left transition-all", filter === "low" ? "border-amber-400 ring-1 ring-amber-200" : "border-slate-200 hover:border-amber-300")}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-xs font-bold tracking-widest text-slate-500">LOW STOCK</p>
                            <p className="text-2xl font-bold text-amber-600">{lowStockCount}</p>
                        </div>
                    </div>
                </button>
                <button
                    onClick={() => setFilter(filter === "out" ? "all" : "out")}
                    className={cn("bg-white border rounded-2xl p-5 shadow-sm text-left transition-all", filter === "out" ? "border-red-400 ring-1 ring-red-200" : "border-slate-200 hover:border-red-300")}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                            <TrendingDown className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                            <p className="text-xs font-bold tracking-widest text-slate-500">OUT OF STOCK</p>
                            <p className="text-2xl font-bold text-red-600">{outOfStockCount}</p>
                        </div>
                    </div>
                </button>
            </div>

            {/* Search + filter bar */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="search"
                            placeholder="Search products, SKU…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 h-9 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="flex gap-2">
                        {(["all", "low", "out"] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={cn("h-8 px-3 rounded-lg text-xs font-bold transition-all", filter === f ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}
                            >
                                {f === "all" ? "All" : f === "low" ? "Low Stock" : "Out of Stock"}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16 gap-3">
                        <RefreshCw className="w-5 h-5 animate-spin text-blue-500 opacity-40" />
                        <span className="text-sm text-slate-400 font-medium">Loading inventory…</span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-2">
                        <Package className="w-10 h-10 text-slate-200" />
                        <p className="text-sm text-slate-400">No products match your filters.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-xs font-bold tracking-widest">
                                <th className="px-5 py-3 text-left w-8"></th>
                                <th className="px-5 py-3 text-left">PRODUCT</th>
                                <th className="px-4 py-3 text-left">SKU</th>
                                <th className="px-4 py-3 text-left">STOCK QTY</th>
                                <th className="px-4 py-3 text-left">STATUS</th>
                                <th className="px-4 py-3 text-left">ADJUST</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filtered.map((product) => (
                                <>
                                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-5 py-3">
                                            {product.has_variants && (product.variants?.length ?? 0) > 0 && (
                                                <button onClick={() => toggleExpand(product.id)} className="text-slate-400 hover:text-slate-700 transition-colors">
                                                    {product.expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                {product.image_url ? (
                                                    <img src={product.image_url} alt="" className="w-9 h-9 rounded-lg object-cover border border-slate-100 bg-slate-50" />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                                                        <Package className="w-4 h-4 text-slate-400" />
                                                    </div>
                                                )}
                                                <span className="font-semibold text-slate-900 line-clamp-1">{product.name}</span>
                                                {product.has_variants && (
                                                    <span className="text-xs text-slate-400 font-medium">{product.variants?.length} variants</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-500 font-mono text-xs">{product.sku || "—"}</td>
                                        <td className="px-4 py-3">
                                            {editingId === product.id ? (
                                                <InlineAdjust
                                                    current={product.stock_qty}
                                                    onSave={(v) => updateProductStock(product.id, v)}
                                                    onCancel={() => setEditingId(null)}
                                                />
                                            ) : (
                                                <span className="font-bold text-slate-800">{product.has_variants ? "—" : (product.stock_qty ?? 0)}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {!product.has_variants && <StockBadge qty={product.stock_qty} />}
                                        </td>
                                        <td className="px-4 py-3">
                                            {!product.has_variants && editingId !== product.id && (
                                                <button
                                                    onClick={() => setEditingId(product.id)}
                                                    className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium"
                                                    disabled={savingId === product.id}
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                    Adjust
                                                </button>
                                            )}
                                        </td>
                                    </tr>

                                    {/* Variant rows */}
                                    {product.expanded && product.variants?.map((variant) => {
                                        const vKey = `v_${variant.id}`;
                                        return (
                                            <tr key={variant.id} className="bg-slate-50/60 hover:bg-blue-50/30 transition-colors">
                                                <td className="px-5 py-2.5"></td>
                                                <td className="px-5 py-2.5 pl-14">
                                                    <div className="flex items-center gap-2 text-slate-600">
                                                        <span className="text-xs font-medium">
                                                            {variant.variant_name}
                                                            {variant.attributes_summary && (
                                                                <span className="ml-1 text-slate-400">· {typeof variant.attributes_summary === "string"
                                                                    ? Object.values(JSON.parse(variant.attributes_summary)).join(" / ")
                                                                    : ""}</span>
                                                            )}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2.5 text-slate-400 font-mono text-xs">{variant.sku || "—"}</td>
                                                <td className="px-4 py-2.5">
                                                    {editingId === vKey ? (
                                                        <InlineAdjust
                                                            current={variant.stock_qty}
                                                            onSave={(v) => updateVariantStock(variant.id, product.id, v)}
                                                            onCancel={() => setEditingId(null)}
                                                        />
                                                    ) : (
                                                        <span className="font-bold text-slate-700 text-sm">{variant.stock_qty ?? 0}</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2.5"><StockBadge qty={variant.stock_qty} /></td>
                                                <td className="px-4 py-2.5">
                                                    {editingId !== vKey && (
                                                        <button
                                                            onClick={() => setEditingId(vKey)}
                                                            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium"
                                                            disabled={savingId === vKey}
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                            Adjust
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
