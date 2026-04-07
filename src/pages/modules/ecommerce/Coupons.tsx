import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Plus, Tag, Pencil, Trash2, Copy, X, CreditCard, Truck, ShoppingBag, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

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
    const [view, setView] = useState<"list" | "form">("list");
    const [editingItem, setEditingItem] = useState<any | null>(null);

    useEffect(() => { if (activeCompany) load(); }, [activeCompany]);

    const load = async () => {
        if (!activeCompany) return;
        setLoading(true);
        const { data } = await supabase.from("coupons").select("*")
            .eq("company_id", activeCompany.id).order("created_at", { ascending: false });
        setCoupons(data || []);
        setLoading(false);
    };

    const handleNew = () => {
        setEditingItem(null);
        setView("form");
    };

    const handleEdit = (c: any) => {
        setEditingItem({
            ...c,
            code: c.code,
            description: c.description || "",
            type: c.type,
            value: String(c.value),
            min_order_amount: String(c.min_order_amount || ""),
            max_discount: String(c.max_discount || ""),
            usage_limit: String(c.usage_limit || ""),
            per_user_limit: String(c.per_user_limit || "1"),
            valid_from: c.valid_from || "",
            valid_until: c.valid_until || "",
            is_active: c.is_active,
        });
        setView("form");
    };

    const handleSubmit = async (formData: any) => {
        if (!activeCompany) return;
        try {
            const payload = {
                company_id: activeCompany.id,
                code: (formData.code || "").toUpperCase().trim(),
                description: formData.description,
                type: formData.type,
                value: Number(formData.value) || 0,
                min_order_amount: Number(formData.min_order_amount) || 0,
                max_discount: formData.max_discount ? Number(formData.max_discount) : null,
                usage_limit: formData.usage_limit ? Number(formData.usage_limit) : null,
                per_user_limit: Number(formData.per_user_limit) || 1,
                valid_from: formData.valid_from || null,
                valid_until: formData.valid_until || null,
                is_active: formData.is_active,
            };
            if (editingItem?.id) {
                await supabase.from("coupons").update(payload).eq("id", editingItem.id);
                toast({ title: "Coupon updated" });
            } else {
                await supabase.from("coupons").insert([payload]);
                toast({ title: "Coupon created ✅" });
            }
            setView("list");
            load();
        } catch (err: any) {
            toast({ variant: "destructive", title: "Error", description: err.message });
        }
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

    const couponFields = [
        { key: "code", label: "Coupon Code", required: true, ph: "e.g. SAVE20" },
        { key: "description", label: "Internal Reference", ph: "e.g. Spring Sale 2024" },
        {
            key: "type",
            label: "Entitlement Type",
            type: "select" as const,
            options: Object.entries(TYPE_CONFIG).map(([key, val]) => ({ label: val.label, value: key }))
        },
        { key: "value", label: "Benefit Value", type: "number" as const },
        { key: "min_order_amount", label: "Min Order (₹)", type: "number" as const },
        { key: "usage_limit", label: "Redemption Limit", type: "number" as const },
        { key: "valid_from", label: "Activation Date", type: "date" as const },
        { key: "valid_until", label: "Termination Date", type: "date" as const },
        { key: "is_active", label: "Active on Storefront", type: "checkbox" as const },
    ];

    if (view === "form") {
        return (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <ERPEntryForm
                    title={editingItem ? "Refine Coupon Entity" : "Initialize Coupon Registry"}
                    subtitle="Universal Marketing Catalog"
                    headerFields={couponFields}
                    onAbort={() => { setView("list"); setEditingItem(null); }}
                    onSave={handleSubmit}
                    initialData={editingItem}
                    showItems={false}
                />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-100">
                <div>
                    <p className="text-xs font-bold tracking-widest text-slate-500 mb-1">Marketing</p>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Coupons & Discounts</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage promotional codes and discount rules for your store.</p>
                </div>
                <Button onClick={handleNew} className="h-10 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20 transition-all gap-2 active:scale-95">
                    <Plus className="w-4 h-4" /> Create Coupon
                </Button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {Object.entries(TYPE_CONFIG).map(([type, conf]) => (
                    <div key={type} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold tracking-widest text-slate-500">{conf.label}</span>
                            <div className={cn("p-2 rounded-lg border", conf.color)}>
                                <conf.icon className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold tracking-tight text-slate-900 mb-0.5">{coupons.filter(c => c.type === type).length}</p>
                        <p className="text-xs font-medium text-slate-500 capitalize">{type.replace(/_/g, ' ')}</p>
                    </div>
                ))}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-6 bg-white rounded-[40px] border border-slate-50 shadow-inner">
                    <div className="relative">
                        <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin opacity-20" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Tag className="w-4 h-4 text-indigo-600 animate-pulse" />
                        </div>
                    </div>
                    <p className="text-xs font-bold tracking-widest text-slate-500">Syncing Coupon Registry...</p>
                </div>
            ) : coupons.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 text-center py-20">
                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                        <Tag className="w-8 h-8 text-indigo-500" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">No coupons yet</h3>
                    <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto">Create discount codes to reward customers and boost conversions.</p>
                    <Button className="h-10 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-2" onClick={handleNew}>
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
                                !c.is_active || isExpired ? "opacity-60 border-slate-100" : "border-slate-200 shadow-sm hover:border-indigo-200"
                            )}>
                                <div className="space-y-5">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("p-2.5 rounded-xl border", conf.color)}>
                                                <conf.icon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <code className="text-lg font-bold tracking-widest text-slate-900 block">{c.code}</code>
                                                <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-[13px] font-bold border mt-0.5", conf.color)}>{conf.label}</span>
                                            </div>
                                        </div>
                                        <button onClick={() => toggleActive(c)}
                                            className={cn("relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none", c.is_active ? "bg-indigo-600" : "bg-slate-200")}>
                                            <div className={cn("absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300", c.is_active ? "translate-x-5" : "")} />
                                        </button>
                                    </div>

                                    {c.description && <p className="text-sm text-slate-500 leading-relaxed font-medium">{c.description}</p>}

                                    <div className="space-y-2.5 py-4 border-y border-slate-100 text-xs">
                                        {c.type !== "free_shipping" && (
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-slate-500 tracking-widest text-[13px]">BENEFIT</span>
                                                <span className="font-bold text-indigo-600 px-2.5 py-1 bg-slate-50 rounded-lg">
                                                    {c.type === "percentage" ? `${c.value}%` : `₹${c.value}`}{c.max_discount ? ` (max ₹${c.max_discount})` : ""}
                                                </span>
                                            </div>
                                        )}
                                        {Number(c.min_order_amount) > 0 && (
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-slate-500 tracking-widest text-[13px]">MIN ORDER</span>
                                                <span className="font-bold text-slate-800">₹{c.min_order_amount}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-slate-500 tracking-widest text-[13px]">USAGE</span>
                                            <span className="font-bold text-slate-800">{c.usage_count || 0} / {c.usage_limit || "∞"}</span>
                                        </div>
                                        {c.valid_until && (
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-slate-500 tracking-widest text-[13px]">EXPIRY</span>
                                                <span className={cn("font-bold", isExpired ? "text-rose-500" : "text-slate-500")}>{new Date(c.valid_until).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' })}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-5 flex gap-2">
                                    <Button className="flex-1 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2 transition-all" onClick={() => handleEdit(c)}>
                                        <Pencil className="w-3.5 h-3.5" /> Edit
                                    </Button>
                                    <button onClick={() => { navigator.clipboard.writeText(c.code); toast({ title: "Copied!" }); }}
                                        className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100 transition-all">
                                        <Copy className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => deleteCoupon(c)}
                                        className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all border border-slate-100">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

