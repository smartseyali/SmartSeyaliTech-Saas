import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Save, ShoppingBag, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MediaUpload } from "@/components/common/MediaUpload";

interface Variant {
    id?: number;
    sku: string;
    options: Record<string, string>;
    price: number;
    stock: number;
    image_url: string;
}

const inputCls = "w-full h-10 px-4 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/8 outline-none transition-all";
const labelCls = "text-xs font-semibold text-slate-500 uppercase tracking-widest";

export function ProductVariantDialog({
    open,
    onOpenChange,
    productId,
    companyId,
    productName
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    productId: number;
    companyId: number;
    productName: string;
}) {
    const { toast } = useToast();
    const [variants, setVariants] = useState<Variant[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (open && productId) loadVariants();
    }, [open, productId]);

    const loadVariants = async () => {
        setLoading(true);
        try {
            const { data } = await supabase
                .from("product_variants")
                .select("id, sku, price, stock_qty, image_url, attributes_summary")
                .eq("product_id", productId);

            const mapped = (data || []).map((row: any) => {
                let opts = { color: "", size: "" };
                try { opts = JSON.parse(row.attributes_summary || '{}'); } catch { }
                return {
                    id: row.id,
                    sku: row.sku || "",
                    options: opts,
                    price: row.price || 0,
                    stock: row.stock_qty || 0,
                    image_url: row.image_url || ""
                };
            });
            setVariants(mapped);
        } catch (err: any) {
            console.warn("loadVariants error:", err.message);
        } finally {
            setLoading(false);
        }
    };

    const addVariant = () => {
        setVariants([...variants, { sku: "", options: { color: "", size: "" }, price: 0, stock: 0, image_url: "" }]);
    };

    const removeVariant = async (index: number, id?: number) => {
        if (id) {
            if (!confirm("Delete this variant?")) return;
            await supabase.from("product_variants").delete().eq("id", id);
        }
        setVariants(variants.filter((_, i) => i !== index));
    };

    const toDbRow = (v: Variant, extra: Record<string, any> = {}) => ({
        sku: v.sku,
        price: v.price,
        stock_qty: v.stock,
        image_url: v.image_url,
        attributes_summary: JSON.stringify(v.options),
        name: [v.options.color, v.options.size].filter(Boolean).join(' / ') || v.sku || 'Variant',
        ...extra
    });

    const handleSave = async () => {
        try {
            setSaving(true);
            const toInsert = variants.filter(v => !v.id);
            const toUpdate = variants.filter(v => v.id);

            if (toInsert.length > 0) {
                const rows = toInsert.map(v => toDbRow(v, { product_id: productId, company_id: companyId }));
                const { error } = await supabase.from("product_variants").insert(rows);
                if (error) throw error;
            }
            for (const v of toUpdate) {
                const { error } = await supabase.from("product_variants").update(toDbRow(v)).eq("id", v.id);
                if (error) throw error;
            }
            toast({ title: "Variants saved successfully" });
            onOpenChange(false);
        } catch (err: any) {
            toast({ variant: "destructive", title: "Save failed", description: err.message });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[88vh] flex flex-col p-0 rounded-2xl border border-slate-200 shadow-2xl bg-white overflow-hidden outline-none">
                {/* Header */}
                <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                            <ShoppingBag className="w-4 h-4" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Product Variants</h2>
                            <p className="text-xs font-medium text-slate-400 mt-0.5">{productName}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => onOpenChange(false)}
                        className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-all"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/40">
                    {loading ? (
                        <div className="flex items-center justify-center h-40 gap-3">
                            <Loader2 className="w-5 h-5 animate-spin text-blue-600 opacity-40" />
                            <span className="text-sm text-slate-400 font-medium">Loading variants...</span>
                        </div>
                    ) : variants.length === 0 ? (
                        <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center">
                            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 mb-4 border border-blue-100">
                                <ShoppingBag className="w-7 h-7" />
                            </div>
                            <p className="text-base font-bold text-slate-800 mb-1">No variants yet</p>
                            <p className="text-sm text-slate-400 mb-6 max-w-xs">Add variants to define different options like size, color, and pricing.</p>
                            <Button onClick={addVariant} className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 shadow-md shadow-blue-600/20">
                                <Plus className="w-4 h-4" /> Add First Variant
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {variants.map((v, i) => (
                                <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex flex-col md:flex-row gap-5">
                                        {/* Image Upload */}
                                        <div className="shrink-0 w-32">
                                            <label className={labelCls + " block mb-2"}>Photo</label>
                                            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                                                <MediaUpload
                                                    value={v.image_url}
                                                    onChange={val => {
                                                        const next = [...variants];
                                                        next[i].image_url = val;
                                                        setVariants(next);
                                                    }}
                                                    label="Variant Image"
                                                    folder="variants"
                                                    className="h-28 rounded-none"
                                                />
                                            </div>
                                        </div>

                                        {/* Fields */}
                                        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4">
                                            <div className="space-y-1.5">
                                                <label className={labelCls}>SKU</label>
                                                <input value={v.sku} onChange={e => {
                                                    const next = [...variants]; next[i].sku = e.target.value; setVariants(next);
                                                }} className={inputCls} placeholder="e.g. RED-SM-001" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className={labelCls}>Color</label>
                                                <input value={v.options.color} onChange={e => {
                                                    const next = [...variants]; next[i].options = { ...next[i].options, color: e.target.value }; setVariants(next);
                                                }} className={inputCls} placeholder="e.g. Red" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className={labelCls}>Size</label>
                                                <input value={v.options.size} onChange={e => {
                                                    const next = [...variants]; next[i].options = { ...next[i].options, size: e.target.value }; setVariants(next);
                                                }} className={inputCls} placeholder="e.g. M, L, XL" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className={labelCls}>Price (₹)</label>
                                                <div className="relative">
                                                    <input type="number" value={v.price} onChange={e => {
                                                        const next = [...variants]; next[i].price = Number(e.target.value); setVariants(next);
                                                    }} className={inputCls + " pl-7"} />
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">₹</span>
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className={labelCls}>Stock</label>
                                                <input type="number" value={v.stock} onChange={e => {
                                                    const next = [...variants]; next[i].stock = Number(e.target.value); setVariants(next);
                                                }} className={inputCls} />
                                            </div>

                                            {/* Status + Delete row */}
                                            <div className="flex items-end justify-between col-span-2 md:col-span-3 pt-2 border-t border-slate-100 mt-1">
                                                <span className="text-xs font-medium text-slate-400">
                                                    {v.id ? `ID: #${v.id}` : <span className="text-blue-500 font-semibold">· New — unsaved</span>}
                                                </span>
                                                <button
                                                    onClick={() => removeVariant(i, v.id)}
                                                    className="h-8 px-4 flex items-center gap-1.5 rounded-lg text-rose-500 hover:bg-rose-50 text-xs font-semibold transition-all border border-transparent hover:border-rose-100"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" /> Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Add More */}
                            <button
                                onClick={addVariant}
                                className="w-full h-14 border-2 border-dashed border-slate-200 rounded-2xl bg-white hover:border-blue-400 hover:bg-blue-50/40 transition-all flex items-center justify-center gap-3 group"
                            >
                                <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center text-slate-400 transition-all">
                                    <Plus className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-semibold text-slate-400 group-hover:text-blue-600 transition-colors">Add Another Variant</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-7 py-5 border-t border-slate-100 flex gap-3 shrink-0 bg-white">
                    <Button variant="ghost" className="flex-1 h-11 rounded-xl font-semibold text-slate-500 hover:bg-slate-50 transition-all" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} className="flex-[2] h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/20 transition-all active:scale-95 gap-2" disabled={saving}>
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? "Saving..." : "Save All Variants"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
