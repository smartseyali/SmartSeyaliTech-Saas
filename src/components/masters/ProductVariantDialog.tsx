import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Save, ShoppingBag } from "lucide-react";
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
            <DialogContent className="max-w-4xl h-[85vh] flex flex-col overflow-hidden p-0 rounded-3xl border-none shadow-2xl">
                <div className="bg-primary/5 p-6 border-b border-primary/10 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5 text-primary" />
                            Manage Product Variants
                        </h2>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-0.5">Product: {productName}</p>
                    </div>
                </div>

                <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar min-h-0">
                    {variants.length === 0 && (
                        <div className="text-center py-12 border-2 border-dashed border-border/60 rounded-3xl bg-secondary/5">
                            <ShoppingBag className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                            <p className="text-sm font-semibold text-muted-foreground">No variants configured for this product.</p>
                            <Button variant="outline" size="sm" onClick={addVariant} className="mt-4 rounded-xl font-bold px-5">
                                <Plus className="w-4 h-4 mr-1" /> Add Initial Variant
                            </Button>
                        </div>
                    )}

                    {variants.map((v, i) => (
                        <div key={i} className="group grid grid-cols-12 gap-x-4 gap-y-3 p-5 bg-card hover:bg-secondary/10 rounded-2xl border border-border/80 transition-all relative">
                            {/* Variant Image */}
                            <div className="col-span-12 md:col-span-2">
                                <MediaUpload
                                    value={v.image_url}
                                    onChange={val => {
                                        const next = [...variants];
                                        next[i].image_url = val;
                                        setVariants(next);
                                    }}
                                    label="Image"
                                    folder="variants"
                                    className="scale-90 origin-top-left -ml-1 -mt-1"
                                />
                            </div>

                            <div className="col-span-12 md:col-span-10 grid grid-cols-10 gap-4">
                                <div className="col-span-10 md:col-span-3 space-y-1.5">
                                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">SKU Code</Label>
                                    <input value={v.sku} onChange={e => {
                                        const next = [...variants];
                                        next[i].sku = e.target.value;
                                        setVariants(next);
                                    }} className="w-full h-10 px-3 rounded-xl border border-input bg-secondary/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="e.g. SPRO-RED-L" />
                                </div>
                                <div className="col-span-5 md:col-span-2 space-y-1.5">
                                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Color</Label>
                                    <input value={v.options.color} onChange={e => {
                                        const next = [...variants];
                                        next[i].options = { ...next[i].options, color: e.target.value };
                                        setVariants(next);
                                    }} className="w-full h-10 px-3 rounded-xl border border-input bg-secondary/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="Red" />
                                </div>
                                <div className="col-span-5 md:col-span-2 space-y-1.5">
                                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Size</Label>
                                    <input value={v.options.size} onChange={e => {
                                        const next = [...variants];
                                        next[i].options = { ...next[i].options, size: e.target.value };
                                        setVariants(next);
                                    }} className="w-full h-10 px-3 rounded-xl border border-input bg-secondary/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="XL" />
                                </div>
                                <div className="col-span-5 md:col-span-1.5 space-y-1.5">
                                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Price</Label>
                                    <input type="number" value={v.price} onChange={e => {
                                        const next = [...variants];
                                        next[i].price = Number(e.target.value);
                                        setVariants(next);
                                    }} className="w-full h-10 px-3 rounded-xl border border-input bg-secondary/30 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                                </div>
                                <div className="col-span-5 md:col-span-1.5 space-y-1.5">
                                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Stock</Label>
                                    <input type="number" value={v.stock} onChange={e => {
                                        const next = [...variants];
                                        next[i].stock = Number(e.target.value);
                                        setVariants(next);
                                    }} className="w-full h-10 px-3 rounded-xl border border-input bg-secondary/30 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                                </div>
                                <div className="col-span-10 flex items-center justify-between mt-2 pt-2 border-t border-border/40">
                                    <div className="flex items-center gap-2">
                                        <div className="px-3 py-1 rounded-lg bg-secondary/20 border border-border/50 text-[10px] font-bold text-muted-foreground uppercase">
                                            {v.id ? `ID: ${v.id}` : "UNSAVED VARIANT"}
                                        </div>
                                    </div>
                                    <button onClick={() => removeVariant(i, v.id)}
                                        className="h-8 px-4 flex items-center gap-2 rounded-lg border border-border hover:bg-red-50 hover:border-red-200 text-muted-foreground hover:text-red-500 transition-all text-[10px] font-bold">
                                        <Trash2 className="w-3.5 h-3.5" /> Remove Variant
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    <Button variant="outline" onClick={addVariant} className="w-full h-14 border-2 border-dashed rounded-2xl font-bold text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/5 transition-all">
                        <Plus className="w-5 h-5 mr-2" /> Add Another Variant
                    </Button>
                </div>

                <div className="bg-secondary/40 p-5 border-t border-border flex gap-3">
                    <Button variant="ghost" className="flex-1 h-12 rounded-2xl font-bold" onClick={() => onOpenChange(false)}>Discard Changes</Button>
                    <Button onClick={handleSave} className="flex-[2] h-12 rounded-2xl font-bold shadow-lg shadow-primary/20" disabled={saving}>
                        {saving ? "Saving..." : "Save All Variants"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

