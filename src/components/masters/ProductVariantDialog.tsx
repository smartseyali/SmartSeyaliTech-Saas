import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Save, ShoppingBag, X } from "lucide-react";
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
    const [loading, setLoading] = useState(false);   // fetching existing variants
    const [saving, setSaving] = useState(false);   // saving/inserting variants

    useEffect(() => {
        if (open && productId) {
            loadVariants();
        }
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
            setLoading(false);  // ← always resets regardless of success/error
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

    // Map UI Variant shape → DB product_variants columns
    const toDbRow = (v: Variant, extra: Record<string, any> = {}) => ({
        sku: v.sku,
        price: v.price,
        stock_qty: v.stock,           // stock → stock_qty
        image_url: v.image_url,
        attributes_summary: JSON.stringify(v.options), // options → attributes_summary (JSON string)
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
                const { error } = await supabase
                    .from("product_variants")
                    .update(toDbRow(v))
                    .eq("id", v.id);
                if (error) throw error;
            }

            toast({ title: "Variants saved successfully ✅" });
            onOpenChange(false);
        } catch (err: any) {
            toast({ variant: "destructive", title: "Save failed", description: err.message });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 rounded-[48px] border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] bg-white overflow-hidden outline-none">
                <div className="bg-white p-10 border-b border-slate-50 relative flex items-center justify-between shrink-0">
                    <div className="absolute top-0 left-0 w-32 h-1.5 bg-blue-600 rounded-full ml-10" />
                    <div className="space-y-3">
                        <h2 className="text-3xl font-black tracking-tighter text-slate-950 uppercase italic leading-none flex items-center gap-4">
                            <ShoppingBag className="w-8 h-8 text-blue-600" />
                            Refine Variants
                        </h2>
                        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-blue-600/60">Product Manifest: {productName}</p>
                    </div>
                    <button onClick={() => onOpenChange(false)} className="w-14 h-14 rounded-[20px] hover:bg-slate-50 flex items-center justify-center text-slate-300 hover:text-slate-900 transition-all border border-transparent hover:border-slate-100 active:scale-90"><X className="w-6 h-6" /></button>
                </div>

                <div className="flex-1 p-10 overflow-y-auto space-y-8 custom-scrollbar bg-slate-50/30">
                    {variants.length === 0 && (
                        <div className="text-center py-20 bg-white border border-slate-100 rounded-[40px] shadow-sm flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
                            <div className="w-24 h-24 rounded-[32px] bg-slate-50 flex items-center justify-center text-slate-200 mb-8 border border-slate-50">
                                <ShoppingBag className="w-12 h-12" />
                            </div>
                            <p className="text-xl font-bold text-slate-900 uppercase tracking-tight">Empty Inventory Manifest</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 max-w-[240px]">Initialize your digital reach by creating the first product configuration.</p>
                            <Button onClick={addVariant} className="mt-10 h-14 px-10 rounded-2xl bg-blue-600 hover:bg-black text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-blue-600/20 transition-all">
                                <Plus className="w-5 h-5 mr-3" /> Initialize Configuration
                            </Button>
                        </div>
                    )}

                    <div className="space-y-6">
                        {variants.map((v, i) => (
                            <div key={i} className="group bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-blue-200 transition-all duration-500 relative flex flex-col md:flex-row gap-10">
                                <div className="shrink-0">
                                    <div className="w-44 space-y-4">
                                        <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Asset Cover</label>
                                        <MediaUpload
                                            value={v.image_url}
                                            onChange={val => {
                                                const next = [...variants];
                                                next[i].image_url = val;
                                                setVariants(next);
                                            }}
                                            label="Variant Frame"
                                            folder="variants"
                                            className="h-44 rounded-3xl overflow-hidden border-2 border-slate-50 group-hover:border-blue-100 transition-colors shadow-inner"
                                        />
                                    </div>
                                </div>

                                <div className="flex-1 space-y-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        <div className="space-y-4 group/field">
                                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1 group-focus-within/field:text-blue-600 transition-colors">Configuration Identifier (SKU)</label>
                                            <input value={v.sku} onChange={e => {
                                                const next = [...variants];
                                                next[i].sku = e.target.value;
                                                setVariants(next);
                                            }} className="w-full h-14 px-6 rounded-2xl border border-slate-100 bg-slate-50/50 text-sm font-black uppercase tracking-tight focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-500 transition-all shadow-inner placeholder:opacity-30" placeholder="e.g. CORE-RED-SMALL" />
                                        </div>
                                        <div className="space-y-4 group/field">
                                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1 group-focus-within/field:text-blue-600 transition-colors">Spectral Value (Color)</label>
                                            <input value={v.options.color} onChange={e => {
                                                const next = [...variants];
                                                next[i].options = { ...next[i].options, color: e.target.value };
                                                setVariants(next);
                                            }} className="w-full h-14 px-6 rounded-2xl border border-slate-100 bg-slate-50/50 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-500 transition-all shadow-inner" placeholder="Cosmic Black" />
                                        </div>
                                        <div className="space-y-4 group/field">
                                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1 group-focus-within/field:text-blue-600 transition-colors">Scale Protocol (Size)</label>
                                            <input value={v.options.size} onChange={e => {
                                                const next = [...variants];
                                                next[i].options = { ...next[i].options, size: e.target.value };
                                                setVariants(next);
                                            }} className="w-full h-14 px-6 rounded-2xl border border-slate-100 bg-slate-50/50 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-500 transition-all shadow-inner" placeholder="Dimensions / Magnitude" />
                                        </div>
                                        <div className="space-y-4 group/field">
                                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1 group-focus-within/field:text-blue-600 transition-colors">Economic Value (₹)</label>
                                            <div className="relative">
                                                <input type="number" value={v.price} onChange={e => {
                                                    const next = [...variants];
                                                    next[i].price = Number(e.target.value);
                                                    setVariants(next);
                                                }} className="w-full h-14 pl-12 pr-6 rounded-2xl border border-slate-100 bg-slate-50/50 text-sm font-black focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-500 transition-all shadow-inner" />
                                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 font-bold">₹</span>
                                            </div>
                                        </div>
                                        <div className="space-y-4 group/field">
                                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1 group-focus-within/field:text-blue-600 transition-colors">Quantifiable Reserve</label>
                                            <input type="number" value={v.stock} onChange={e => {
                                                const next = [...variants];
                                                next[i].stock = Number(e.target.value);
                                                setVariants(next);
                                            }} className="w-full h-14 px-6 rounded-2xl border border-slate-100 bg-slate-50/50 text-sm font-black focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-500 transition-all shadow-inner" />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                                        <div className="flex items-center gap-4">
                                            <div className="px-4 py-2 rounded-xl bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-100">
                                                {v.id ? `SIG: ${v.id.toString().padStart(6, '0')}` : "UNSYNCED_SIGNAL"}
                                            </div>
                                            {!v.id && <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />}
                                        </div>
                                        <button onClick={() => removeVariant(i, v.id)}
                                            className="h-12 px-6 flex items-center gap-3 rounded-[16px] bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.2em] active:scale-95">
                                            <Trash2 className="w-4 h-4" /> Purge Configuration
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button onClick={addVariant} className="w-full h-24 border-2 border-dashed border-slate-200 rounded-[40px] bg-white group hover:border-blue-600 hover:bg-blue-50 transition-all duration-500 flex items-center justify-center gap-4 active:scale-[0.98]">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center text-slate-400 transition-all duration-500">
                            <Plus className="w-6 h-6" />
                        </div>
                        <span className="text-xl font-black text-slate-300 group-hover:text-blue-600 uppercase tracking-tighter transition-all duration-500 italic">Expand Configuration Pipeline</span>
                    </button>
                </div>

                <div className="bg-white p-10 border-t border-slate-100 flex gap-6 shrink-0 relative z-20">
                    <Button variant="ghost" className="flex-1 h-16 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all" onClick={() => onOpenChange(false)}>Discard Manifesto</Button>
                    <Button onClick={handleSave} className="flex-[2] h-16 rounded-2xl bg-blue-600 hover:bg-black text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-blue-600/20 transition-all active:scale-95" disabled={saving}>
                        {saving ? "Writing Protocol..." : "Commit All Integrity"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

