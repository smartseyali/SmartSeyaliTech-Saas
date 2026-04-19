import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Save, ShoppingBag, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MediaUpload } from "@/components/common/MediaUpload";

import { cn } from "@/lib/utils";

interface Variant {
    id?: number;
    sku: string;
    options: Record<string, string>;
    price: number;
    stock: number;
    image_url: string;
    is_default: boolean;
}

const inputStyle = "w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm";
const labelStyle = "text-sm font-semibold text-slate-700 mb-1.5 block";

export function ProductVariantDialog({
    open,
    onOpenChange,
    productId,
    companyId,
    productName,
    isEmbedded = false,
    onSaved
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    productId: number;
    companyId: number;
    productName: string;
    isEmbedded?: boolean;
    onSaved?: () => void;
}) {
    const { toast } = useToast();
    const [variants, setVariants] = useState<Variant[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if ((open || isEmbedded) && productId) {
            setVariants([]);
            loadVariants();
        }
    }, [open, isEmbedded, productId]);

    const mapRow = (row: any): Variant => {
        let opts = { color: "", size: "" };
        try { opts = JSON.parse(row.attributes_summary || '{}'); } catch { }
        return {
            id: row.id,
            sku: row.sku || "",
            options: opts,
            price: row.price || 0,
            stock: row.stock_qty || 0,
            image_url: row.image_url || "",
            is_default: row.is_default || false
        };
    };

    const loadVariants = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from("product_variants")
                .select("id, sku, price, stock_qty, image_url, attributes_summary, is_default")
                .eq("product_id", productId)
                .order("created_at", { ascending: true });
            if (companyId) query = query.eq("company_id", companyId);

            const { data, error } = await query;
            if (error) throw error;
            setVariants((data || []).map(mapRow));
        } catch (err: any) {
            toast({ variant: "destructive", title: "Load failed", description: err.message });
        } finally {
            setLoading(false);
        }
    };

    const addVariant = () => {
        setVariants([...variants, { sku: "", options: { color: "", size: "" }, price: 0, stock: 0, image_url: "", is_default: false }]);
    };

    const removeVariant = async (index: number, id?: number) => {
        if (id) {
            if (!confirm("Delete this variant?")) return;
            const { error } = await supabase.from("product_variants").delete().eq("id", id);
            if (error) {
                toast({ variant: "destructive", title: "Delete failed", description: error.message });
                return;
            }
            onSaved?.();
        }
        setVariants(variants.filter((_, i) => i !== index));
    };

    const toDbRow = (v: Variant, extra: Record<string, any> = {}) => ({
        sku: v.sku,
        price: v.price,
        stock_qty: v.stock,
        image_url: v.image_url,
        is_default: v.is_default,
        attributes_summary: JSON.stringify(v.options),
        name: [v.options.color, v.options.size].filter(Boolean).join(' / ') || v.sku || 'Variant',
        ...extra
    });

    const handleSave = async () => {
        if (!productId) {
            toast({ variant: "destructive", title: "Save failed", description: "Missing product reference." });
            return;
        }
        if (!companyId) {
            toast({ variant: "destructive", title: "Save failed", description: "No active workspace — select a company first." });
            return;
        }
        try {
            setSaving(true);
            const toInsert = variants.filter(v => !v.id);
            const toUpdate = variants.filter(v => v.id);

            let insertedVariants: Variant[] = [];
            if (toInsert.length > 0) {
                const rows = toInsert.map(v => toDbRow(v, { product_id: productId, company_id: companyId }));
                const { data, error } = await supabase
                    .from("product_variants")
                    .insert(rows)
                    .select("id, sku, price, stock_qty, image_url, attributes_summary, is_default");
                if (error) throw error;
                if (!data || data.length !== rows.length) {
                    throw new Error("Variant was written but is not readable back — check RLS policies / company_id.");
                }
                insertedVariants = data.map(mapRow);
            }

            const updatedVariants: Variant[] = [];
            for (const v of toUpdate) {
                const { data, error } = await supabase
                    .from("product_variants")
                    .update(toDbRow(v))
                    .eq("id", v.id)
                    .select("id, sku, price, stock_qty, image_url, attributes_summary, is_default");
                if (error) throw error;
                if (data && data[0]) updatedVariants.push(mapRow(data[0]));
            }

            setVariants([...updatedVariants, ...insertedVariants]);
            toast({ title: "Variants saved successfully" });
            onSaved?.();
            if (!isEmbedded) onOpenChange(false);
        } catch (err: any) {
            toast({ variant: "destructive", title: "Save failed", description: err.message });
        } finally {
            setSaving(false);
        }
    };

    const workbenchContent = (
        <div className={cn("flex flex-col min-h-0 bg-slate-50", isEmbedded ? "p-0 bg-transparent flex-1" : "h-full max-h-[85vh]")}>
            {!isEmbedded && (
                <DialogHeader className="px-6 py-5 border-b border-slate-100 bg-white shrink-0">
                    <DialogTitle className="text-xl font-bold text-slate-800">Product Variants</DialogTitle>
                    <DialogDescription className="text-slate-500 mt-1">
                        Manage inventory details and attributes for <span className="font-semibold text-slate-700">{productName}</span>.
                    </DialogDescription>
                </DialogHeader>
            )}

            {/* Body */}
            <div className={cn("flex-1 p-6 overflow-y-auto space-y-4 scrollbar-thin", isEmbedded ? "bg-transparent p-0" : "bg-slate-50/50")}>
                {loading ? (
                    <div className="flex items-center justify-center h-40 gap-3">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                        <span className="text-sm text-slate-600 font-medium">Loading variants...</span>
                    </div>
                ) : variants.length === 0 ? (
                    <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-[20px] shadow-sm flex flex-col items-center justify-center">
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 mb-4">
                            <ShoppingBag className="w-7 h-7" />
                        </div>
                        <p className="text-base font-bold text-slate-800 mb-1">No variants yet</p>
                        <p className="text-sm text-slate-500 mb-6 max-w-xs px-6">Add variants to define different options like size, color, and pricing.</p>
                        <Button onClick={addVariant} className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-2 shadow-md shadow-blue-600/20">
                            <Plus className="w-4 h-4" /> Add First Variant
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {variants.map((v, i) => (
                            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all relative group">
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Image Upload */}
                                    <div className="shrink-0 w-24">
                                        <MediaUpload
                                            value={v.image_url}
                                            onChange={val => {
                                                const next = [...variants];
                                                next[i].image_url = val;
                                                setVariants(next);
                                            }}
                                            label="Photo"
                                            folder="variants"
                                            className="h-28"
                                        />
                                    </div>

                                    {/* Fields */}
                                    <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4">
                                        <div>
                                            <label className={labelStyle}>SKU</label>
                                            <input value={v.sku} onChange={e => {
                                                const next = [...variants]; next[i].sku = e.target.value; setVariants(next);
                                            }} className={inputStyle} placeholder="SKU-CODE" />
                                        </div>
                                        <div>
                                            <label className={labelStyle}>Color</label>
                                            <input value={v.options.color} onChange={e => {
                                                const next = [...variants]; next[i].options = { ...next[i].options, color: e.target.value }; setVariants(next);
                                            }} className={inputStyle} placeholder="e.g. Slate Blue" />
                                        </div>
                                        <div>
                                            <label className={labelStyle}>Size</label>
                                            <input value={v.options.size} onChange={e => {
                                                const next = [...variants]; next[i].options = { ...next[i].options, size: e.target.value }; setVariants(next);
                                            }} className={inputStyle} placeholder="e.g. XL" />
                                        </div>
                                        <div>
                                            <label className={labelStyle}>Price</label>
                                            <div className="relative">
                                                <input type="number" value={v.price} onChange={e => {
                                                    const next = [...variants]; next[i].price = Number(e.target.value); setVariants(next);
                                                }} className={cn(inputStyle, "pl-8 text-blue-600 font-bold")} />
                                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">₹</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className={labelStyle}>Stock</label>
                                            <input type="number" value={v.stock} onChange={e => {
                                                const next = [...variants]; next[i].stock = Number(e.target.value); setVariants(next);
                                            }} className={inputStyle} />
                                        </div>

                                        {/* Status + Delete row */}
                                        <div className="flex items-end justify-between col-span-2 lg:col-span-3 pt-4 mt-2 border-t border-slate-100">
                                            <div className="flex items-center gap-4">
                                                <span className="text-xs font-medium text-slate-500">
                                                    {v.id ? `ID: ${v.id}` : <span className="text-blue-500 ">Unsaved variant</span>}
                                                </span>
                                                <label className="inline-flex items-center gap-2 cursor-pointer">
                                                    <input type="checkbox" checked={v.is_default} onChange={e => {
                                                        const next = variants.map((vr, vi) => ({ ...vr, is_default: vi === i ? e.target.checked : false }));
                                                        setVariants(next);
                                                    }}
                                                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20 cursor-pointer" />
                                                    <span className={cn("text-xs font-semibold", v.is_default ? "text-blue-600" : "text-slate-500")}>Default</span>
                                                </label>
                                            </div>
                                            <button
                                                onClick={() => removeVariant(i, v.id)}
                                                className="h-8 px-3 flex items-center gap-1.5 rounded-lg text-red-500 hover:bg-red-50 text-sm font-semibold transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" /> Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Add More */}
                        <button
                            onClick={addVariant}
                            className="w-full h-14 border-2 border-dashed border-slate-200 rounded-2xl bg-white hover:border-blue-400 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-3 text-slate-600 hover:text-blue-600"
                        >
                            <Plus className="w-5 h-5" />
                            <span className="text-sm font-semibold">Add New Variant</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className={cn("px-6 py-4 border-t border-slate-100 flex gap-3 shrink-0 bg-white", isEmbedded ? "p-0 pt-6 border-t bg-transparent" : "")}>
                {!isEmbedded && (
                    <Button variant="ghost" className="px-6 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl hidden sm:flex" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                )}
                <Button onClick={handleSave} className={cn("rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-600/20 transition-all gap-2", isEmbedded ? "w-full h-11" : "flex-1 sm:flex-none sm:ml-auto px-8 h-10")} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </div>
    );

    if (isEmbedded) return workbenchContent;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
                className="max-w-4xl h-[90vh] sm:h-[80vh] flex flex-col p-0 border-slate-200 shadow-2xl rounded-2xl bg-white overflow-hidden"
            >
                {workbenchContent}
            </DialogContent>
        </Dialog>
    );
}
