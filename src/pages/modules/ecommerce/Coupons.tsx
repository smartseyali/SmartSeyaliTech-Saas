import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Plus, Tag, Pencil, Trash2, Copy, X, CreditCard, Truck, ShoppingBag, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

type CouponType = "percentage" | "fixed" | "free_shipping" | "buy_x_get_y";

const TYPE_CONFIG: Record<CouponType, { label: string; color: string; icon: any }> = {
    percentage: { label: "% Off", color: "text-blue-600 bg-blue-50 border-blue-100", icon: Tag },
    fixed: { label: "₹ Fixed", color: "text-emerald-600 bg-emerald-50 border-emerald-100", icon: CreditCard },
    free_shipping: { label: "Free Ship", color: "text-purple-600 bg-purple-50 border-purple-100", icon: Truck },
    buy_x_get_y: { label: "Buy X Get Y", color: "text-amber-600 bg-amber-50 border-amber-100", icon: ShoppingBag },
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
        <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-100">
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Marketing</p>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Coupons & Discounts</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage promotional codes and discount rules for your store.</p>
                </div>
                <Button onClick={openNew} className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/20 transition-all gap-2 active:scale-95">
                    <Plus className="w-4 h-4" /> Create Coupon
                </Button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {Object.entries(TYPE_CONFIG).map(([type, conf]) => (
                    <div key={type} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{conf.label}</span>
                            <div className={cn("p-2 rounded-lg border", conf.color)}>
                                <conf.icon className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold tracking-tight text-slate-900 mb-0.5">{coupons.filter(c => c.type === type).length}</p>
                        <p className="text-xs font-medium text-slate-400 capitalize">{type.replace(/_/g, ' ')}</p>
                    </div>
                ))}
            </div>

            {/* Content Section */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-6 bg-white rounded-[40px] border border-slate-50 shadow-inner">
                    <div className="relative">
                        <RefreshCw className="w-10 h-10 text-blue-500 animate-spin opacity-20" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Tag className="w-4 h-4 text-blue-600 animate-pulse" />
                        </div>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Syncing Coupon Registry...</p>
                </div>
            ) : coupons.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 text-center py-20">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                        <Tag className="w-8 h-8 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">No coupons yet</h3>
                    <p className="text-sm text-slate-400 mb-6 max-w-xs mx-auto">Create discount codes to reward customers and boost conversions.</p>
                    <Button className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-2" onClick={openNew}>
                        <Plus className="w-4 h-4" /> Create First Coupon
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {coupons.map(c => {
                        const conf = TYPE_CONFIG[c.type as CouponType] || TYPE_CONFIG.percentage;
                        const isExpired = c.valid_until && new Date(c.valid_until) < new Date();
                        return (
                            <div key={c.id} className={cn(
                                "group bg-white rounded-2xl border transition-all p-6 flex flex-col justify-between hover:shadow-lg",
                                !c.is_active || isExpired ? "opacity-60 border-slate-100" : "border-slate-200 shadow-sm hover:border-blue-200"
                            )}>
                                <div className="space-y-5">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("p-2.5 rounded-xl border", conf.color)}>
                                                <conf.icon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <code className="text-lg font-bold tracking-widest text-slate-900 uppercase block">{c.code}</code>
                                                <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase border mt-0.5", conf.color)}>{conf.label}</span>
                                            </div>
                                        </div>
                                        <button onClick={() => toggleActive(c)}
                                            className={cn("relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none", c.is_active ? "bg-blue-600" : "bg-slate-200")}>
                                            <div className={cn("absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300", c.is_active ? "translate-x-5" : "")} />
                                        </button>
                                    </div>

                                    {c.description && <p className="text-sm text-slate-400 leading-relaxed">{c.description}</p>}

                                    <div className="space-y-2.5 py-4 border-y border-slate-100 text-xs">
                                        {c.type !== "free_shipping" && (
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold text-slate-400">Discount</span>
                                                <span className="font-bold text-slate-800 px-2.5 py-1 bg-slate-50 rounded-lg">
                                                    {c.type === "percentage" ? `${c.value}%` : `₹${c.value}`}{c.max_discount ? ` (max ₹${c.max_discount})` : ""}
                                                </span>
                                            </div>
                                        )}
                                        {Number(c.min_order_amount) > 0 && (
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold text-slate-400">Min. Order</span>
                                                <span className="font-semibold text-slate-600">₹{c.min_order_amount}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold text-slate-400">Used</span>
                                            <span className="font-bold text-slate-800">{c.used_count || 0} / {c.usage_limit || "∞"}</span>
                                        </div>
                                        {c.valid_until && (
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold text-slate-400">Expires</span>
                                                <span className={cn("font-semibold", isExpired ? "text-rose-500" : "text-slate-500")}>{new Date(c.valid_until).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' })}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-5 flex gap-2">
                                    <Button className="flex-1 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-2 transition-all" onClick={() => openEdit(c)}>
                                        <Pencil className="w-3.5 h-3.5" /> Edit
                                    </Button>
                                    <button onClick={() => { navigator.clipboard.writeText(c.code); toast({ title: "Copied!" }); }}
                                        className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-blue-600 border border-slate-100 transition-all">
                                        <Copy className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => deleteCoupon(c)}
                                        className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all border border-slate-100">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            {open && (
                <div className="fixed inset-0 bg-slate-900/60 z-[9999] flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-3xl rounded-[28px] border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white">
                            <div>
                                <h2 className="text-xl font-bold tracking-tight text-slate-900">{editing ? "Edit Coupon" : "Create Coupon"}</h2>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Discount Configuration</p>
                            </div>
                            <button onClick={() => setOpen(false)} className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={save} className="p-12 space-y-12 max-h-[60vh] overflow-y-auto custom-scrollbar bg-white">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {/* Code */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Unique Token Code</label>
                                    <div className="flex gap-3">
                                        <input value={form.code} onChange={e => set("code", e.target.value.toUpperCase())} required
                                            placeholder="SAVE20" maxLength={20}
                                            className="flex-1 h-14 px-6 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-bold tracking-widest focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all uppercase placeholder:opacity-30" />
                                        <Button type="button" variant="outline" className="h-14 px-6 rounded-2xl font-bold border-slate-200 text-blue-600 hover:bg-blue-50" onClick={generateCode}>
                                            <RefreshCw className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Internal Reference</label>
                                    <input value={form.description} onChange={e => set("description", e.target.value)}
                                        placeholder="Spring Sale 2024"
                                        className="w-full h-14 px-6 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-bold focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all placeholder:opacity-30" />
                                </div>

                                {/* Type */}
                                <div className="md:col-span-2 space-y-6">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1 text-center block">Entitlement Logic Selection</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {Object.entries(TYPE_CONFIG).map(([type, conf]) => (
                                            <button key={type} type="button" onClick={() => set("type", type)}
                                                className={cn(
                                                    "flex flex-col items-center justify-center gap-4 p-6 rounded-2xl border-2 transition-all group",
                                                    form.type === type ? "border-blue-600 bg-blue-50 text-blue-600 shadow-lg shadow-blue-600/5" : "border-slate-100 bg-white hover:border-blue-200 text-slate-300"
                                                )}>
                                                <div className={cn("p-4 rounded-xl border transition-all", form.type === type ? "bg-white shadow-inner" : "bg-slate-50 group-hover:scale-110")}>
                                                    <conf.icon className="w-6 h-6" />
                                                </div>
                                                <span className="text-[9px] font-bold uppercase tracking-widest">{conf.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {form.type !== "free_shipping" && (
                                    <>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">
                                                {form.type === "percentage" ? "Benefit Percentage (%)" : "Flat Benefit Value (₹)"}
                                            </label>
                                            <input type="number" value={form.value} onChange={e => set("value", e.target.value)} required min="0"
                                                className="w-full h-14 px-6 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-bold focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all" />
                                        </div>
                                        {form.type === "percentage" && (
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Entitlement Ceiling (₹)</label>
                                                <input type="number" value={form.max_discount} onChange={e => set("max_discount", e.target.value)} min="0"
                                                    placeholder="∞"
                                                    className="w-full h-14 px-6 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-bold focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all placeholder:opacity-30" />
                                            </div>
                                        )}
                                    </>
                                )}

                                <div className="space-y-4">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Order Entry Threshold (₹)</label>
                                    <input type="number" value={form.min_order_amount} onChange={e => set("min_order_amount", e.target.value)} min="0"
                                        placeholder="0"
                                        className="w-full h-14 px-6 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-bold focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all placeholder:opacity-30" />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Global Redemption Limit</label>
                                    <input type="number" value={form.usage_limit} onChange={e => set("usage_limit", e.target.value)} min="1"
                                        placeholder="∞"
                                        className="w-full h-14 px-6 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-bold focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all placeholder:opacity-30" />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Lifecycle Activation</label>
                                    <input type="date" value={form.valid_from} onChange={e => set("valid_from", e.target.value)}
                                        className="w-full h-14 px-6 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-bold focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all" />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Lifecycle Termination</label>
                                    <input type="date" value={form.valid_until} onChange={e => set("valid_until", e.target.value)}
                                        className="w-full h-14 px-6 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-bold focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all" />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">Active on Storefront</p>
                                    <p className="text-xs text-slate-400 mt-0.5">Allow customers to use this coupon at checkout</p>
                                </div>
                                <button type="button" onClick={() => set("is_active", !form.is_active)}
                                    className={cn("relative w-12 h-7 rounded-full transition-colors duration-300 focus:outline-none", form.is_active ? "bg-blue-600" : "bg-slate-200")}>
                                    <div className={cn("absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300", form.is_active ? "translate-x-5" : "")} />
                                </button>
                            </div>
                        </form>

                        <div className="p-6 border-t border-slate-100 flex gap-3 bg-slate-50/60">
                            <Button type="button" variant="ghost" className="flex-1 h-12 rounded-xl font-semibold text-slate-500 hover:bg-white" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button type="button" onClick={save} className="flex-[2] h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/20 transition-all gap-2 active:scale-95" disabled={saving}>
                                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                                {saving ? "Saving..." : editing ? "Update Coupon" : "Create Coupon"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
