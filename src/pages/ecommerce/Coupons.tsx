import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Plus, Tag, Pencil, Trash2, ToggleLeft, ToggleRight, Copy, X } from "lucide-react";

type CouponType = "percentage" | "fixed" | "free_shipping" | "buy_x_get_y";

const TYPE_CONFIG: Record<CouponType, { label: string; color: string }> = {
    percentage: { label: "% Off", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    fixed: { label: "₹ Fixed", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    free_shipping: { label: "Free Ship", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
    buy_x_get_y: { label: "Buy X Get Y", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
};

const EMPTY = {
    code: "", description: "", type: "percentage" as CouponType,
    value: "", min_order_amount: "", max_discount: "",
    usage_limit: "", per_user_limit: "1",
    valid_from: "", valid_until: "", is_active: true,
};

export default function Coupons() {
    const { activeCompany } = useTenant();
    const { toast } = useToast();
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<any | null>(null);
    const [form, setForm] = useState({ ...EMPTY });
    const [saving, setSaving] = useState(false);

    useEffect(() => { if (activeCompany) load(); }, [activeCompany]);

    const load = async () => {
        if (!activeCompany) return;
        setLoading(true);
        const { data } = await supabase.from("coupons").select("*")
            .eq("company_id", activeCompany.id).order("created_at", { ascending: false });
        setCoupons(data || []);
        setLoading(false);
    };

    const openNew = () => { setEditing(null); setForm({ ...EMPTY }); setOpen(true); };
    const openEdit = (c: any) => {
        setEditing(c);
        setForm({
            code: c.code, description: c.description || "", type: c.type,
            value: c.value, min_order_amount: c.min_order_amount || "",
            max_discount: c.max_discount || "", usage_limit: c.usage_limit || "",
            per_user_limit: c.per_user_limit || "1",
            valid_from: c.valid_from || "", valid_until: c.valid_until || "",
            is_active: c.is_active,
        });
        setOpen(true);
    };

    const save = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeCompany) return;
        setSaving(true);
        try {
            const payload = {
                company_id: activeCompany.id,
                code: form.code.toUpperCase().trim(),
                description: form.description,
                type: form.type,
                value: Number(form.value) || 0,
                min_order_amount: Number(form.min_order_amount) || 0,
                max_discount: form.max_discount ? Number(form.max_discount) : null,
                usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
                per_user_limit: Number(form.per_user_limit) || 1,
                valid_from: form.valid_from || null,
                valid_until: form.valid_until || null,
                is_active: form.is_active,
            };
            if (editing) {
                await supabase.from("coupons").update(payload).eq("id", editing.id);
                toast({ title: "Coupon updated" });
            } else {
                await supabase.from("coupons").insert([payload]);
                toast({ title: "Coupon created ✅" });
            }
            setOpen(false);
            load();
        } catch (err: any) {
            toast({ variant: "destructive", title: "Error", description: err.message });
        } finally { setSaving(false); }
    };

    const toggleActive = async (c: any) => {
        await supabase.from("coupons").update({ is_active: !c.is_active }).eq("id", c.id);
        load();
    };

    const deleteCoupon = async (c: any) => {
        if (!confirm(`Delete coupon "${c.code}"?`)) return;
        await supabase.from("coupons").delete().eq("id", c.id);
        toast({ title: "Coupon deleted" });
        load();
    };

    const set = (k: keyof typeof EMPTY, v: any) => setForm(f => ({ ...f, [k]: v }));

    const generateCode = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        const code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
        set("code", code);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Coupons & Promo Codes</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">{coupons.length} codes · {coupons.filter(c => c.is_active).length} active</p>
                </div>
                <Button onClick={openNew} className="rounded-xl gap-2">
                    <Plus className="w-4 h-4" /> New Coupon
                </Button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(TYPE_CONFIG).map(([type, conf]) => (
                    <div key={type} className="bg-card rounded-xl border border-border/50 p-4 shadow-sm">
                        <p className="text-xs text-muted-foreground">{conf.label}</p>
                        <p className="text-2xl font-bold mt-1">{coupons.filter(c => c.type === type).length}</p>
                        <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${conf.color}`}>{type}</span>
                    </div>
                ))}
            </div>

            {/* Coupon Cards */}
            {loading ? (
                <div className="text-center py-16 text-muted-foreground">Loading coupons...</div>
            ) : coupons.length === 0 ? (
                <div className="bg-card rounded-2xl border border-border/50 text-center py-14">
                    <Tag className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-30" />
                    <p className="font-semibold text-sm">No coupons yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Create your first promo code to boost sales</p>
                    <Button className="mt-4 rounded-xl" size="sm" onClick={openNew}>Create Coupon</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {coupons.map(c => {
                        const conf = TYPE_CONFIG[c.type as CouponType] || TYPE_CONFIG.percentage;
                        const isExpired = c.valid_until && new Date(c.valid_until) < new Date();
                        return (
                            <div key={c.id} className={`bg-card rounded-2xl border-2 p-5 shadow-sm transition-all ${!c.is_active || isExpired ? "border-border/30 opacity-60" : "border-border/50 hover:border-primary/30"
                                }`}>
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <code className="text-lg font-bold tracking-widest">{c.code}</code>
                                            <button onClick={() => { navigator.clipboard.writeText(c.code); toast({ title: "Copied!" }); }}
                                                className="text-muted-foreground hover:text-foreground transition-colors">
                                                <Copy className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${conf.color}`}>
                                            {conf.label}
                                        </span>
                                    </div>
                                    <button onClick={() => toggleActive(c)} className="text-muted-foreground hover:text-foreground transition-colors">
                                        {c.is_active ? <ToggleRight className="w-6 h-6 text-green-500" /> : <ToggleLeft className="w-6 h-6" />}
                                    </button>
                                </div>

                                {c.description && <p className="text-xs text-muted-foreground mb-3">{c.description}</p>}

                                <div className="space-y-1 text-xs text-muted-foreground mb-4">
                                    {c.type !== "free_shipping" && (
                                        <div className="flex justify-between">
                                            <span>Discount</span>
                                            <span className="font-semibold text-foreground">
                                                {c.type === "percentage" ? `${c.value}%` : `₹${c.value}`}
                                                {c.max_discount ? ` (max ₹${c.max_discount})` : ""}
                                            </span>
                                        </div>
                                    )}
                                    {Number(c.min_order_amount) > 0 && (
                                        <div className="flex justify-between">
                                            <span>Min Order</span><span>₹{c.min_order_amount}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span>Used / Limit</span>
                                        <span>{c.used_count || 0} / {c.usage_limit || "∞"}</span>
                                    </div>
                                    {c.valid_until && (
                                        <div className="flex justify-between">
                                            <span>Expires</span>
                                            <span className={isExpired ? "text-red-500 font-semibold" : ""}>
                                                {new Date(c.valid_until).toLocaleDateString("en-IN")}
                                                {isExpired && " (Expired)"}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Progress bar */}
                                {c.usage_limit && (
                                    <div className="mb-3">
                                        <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                                            <div className="bg-primary h-1.5 rounded-full transition-all"
                                                style={{ width: `${Math.min(100, ((c.used_count || 0) / c.usage_limit) * 100)}%` }} />
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" className="flex-1 rounded-xl gap-1.5 text-xs" onClick={() => openEdit(c)}>
                                        <Pencil className="w-3 h-3" /> Edit
                                    </Button>
                                    <button onClick={() => deleteCoupon(c)}
                                        className="p-2 rounded-xl border border-border hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-muted-foreground transition-colors">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            {open && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-card w-full max-w-2xl rounded-3xl border border-border/50 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-primary/5 p-6 border-b border-primary/10 flex items-center justify-between">
                            <h2 className="text-xl font-bold tracking-tight">{editing ? "Edit Coupon" : "Create New Coupon"}</h2>
                            <button onClick={() => setOpen(false)} className="p-2 rounded-xl hover:bg-secondary text-muted-foreground transition-colors"><X className="w-5 h-5" /></button>
                        </div>

                        <form onSubmit={save} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                {/* Code */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Coupon Code *</label>
                                    <div className="flex gap-2">
                                        <input value={form.code} onChange={e => set("code", e.target.value.toUpperCase())} required
                                            placeholder="e.g. SAVE20" maxLength={20}
                                            className="flex-1 h-11 px-4 rounded-xl border border-input bg-secondary/30 text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:border-primary/30" />
                                        <Button type="button" variant="outline" className="h-11 rounded-xl shrink-0 px-4 font-bold" onClick={generateCode}>Auto</Button>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Description</label>
                                    <input value={form.description} onChange={e => set("description", e.target.value)}
                                        placeholder="Short label for this coupon"
                                        className="w-full h-11 px-4 rounded-xl border border-input bg-secondary/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:border-primary/30" />
                                </div>

                                {/* Type */}
                                <div className="md:col-span-2 space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Benefit Type *</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {Object.entries(TYPE_CONFIG).map(([type, conf]) => (
                                            <button key={type} type="button" onClick={() => set("type", type)}
                                                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border-2 transition-all ${form.type === type ? "border-primary bg-primary/5 ring-4 ring-primary/5" : "border-border/60 hover:border-primary/30 hover:bg-secondary/10"}`}>
                                                <Tag className={`w-4 h-4 ${form.type === type ? "text-primary" : "text-muted-foreground/60"}`} />
                                                <span className={`text-[10px] font-bold uppercase tracking-tight ${form.type === type ? "text-primary" : "text-muted-foreground"}`}>{conf.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {form.type !== "free_shipping" && (
                                    <>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
                                                {form.type === "percentage" ? "Discount Percentage (%)" : "Flat Discount (₹)"}
                                            </label>
                                            <input type="number" value={form.value} onChange={e => set("value", e.target.value)} required min="0"
                                                className="w-full h-11 px-4 rounded-xl border border-input bg-secondary/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:border-primary/30" />
                                        </div>
                                        {form.type === "percentage" && (
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Max Discount Cap (₹)</label>
                                                <input type="number" value={form.max_discount} onChange={e => set("max_discount", e.target.value)} min="0"
                                                    placeholder="Optional cap"
                                                    className="w-full h-11 px-4 rounded-xl border border-input bg-secondary/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:border-primary/30" />
                                            </div>
                                        )}
                                    </>
                                )}

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Minimum Order (₹)</label>
                                    <input type="number" value={form.min_order_amount} onChange={e => set("min_order_amount", e.target.value)} min="0"
                                        placeholder="0 = no minimum"
                                        className="w-full h-11 px-4 rounded-xl border border-input bg-secondary/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:border-primary/30" />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Overall Usage Limit</label>
                                    <input type="number" value={form.usage_limit} onChange={e => set("usage_limit", e.target.value)} min="1"
                                        placeholder="∞ = unlimited"
                                        className="w-full h-11 px-4 rounded-xl border border-input bg-secondary/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:border-primary/30" />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Start Validity</label>
                                    <input type="date" value={form.valid_from} onChange={e => set("valid_from", e.target.value)}
                                        className="w-full h-11 px-4 rounded-xl border border-input bg-secondary/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:border-primary/30" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Expiry Date</label>
                                    <input type="date" value={form.valid_until} onChange={e => set("valid_until", e.target.value)}
                                        className="w-full h-11 px-4 rounded-xl border border-input bg-secondary/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:border-primary/30" />
                                </div>
                            </div>

                            <div className="pt-2 flex items-center justify-between p-4 rounded-2xl bg-secondary/10 border border-border/50">
                                <div className="space-y-0.5">
                                    <p className="text-sm font-bold">Active Status</p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Allow customers to use this code</p>
                                </div>
                                <label className="relative flex items-center cursor-pointer group">
                                    <div className={`w-12 h-7 rounded-full transition-colors ${form.is_active ? "bg-primary" : "bg-secondary"}`}>
                                        <input type="checkbox" checked={form.is_active} onChange={e => set("is_active", e.target.checked)} className="sr-only" />
                                        <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${form.is_active ? "translate-x-5" : ""}`} />
                                    </div>
                                </label>
                            </div>

                            <div className="flex gap-4 pt-2">
                                <Button type="button" variant="ghost" className="flex-1 rounded-2xl h-12 font-bold" onClick={() => setOpen(false)}>Cancel</Button>
                                <Button type="submit" className="flex-[2] rounded-2xl h-12 font-bold shadow-lg shadow-primary/20" disabled={saving}>
                                    {saving ? "Saving..." : editing ? "Update Coupon" : "Create Coupon"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

