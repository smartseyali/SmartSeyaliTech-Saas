import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
    Image as ImageIcon, Plus, Pencil, Trash2,
    MoveUp, MoveDown, Clock, X, Link as LinkIcon, RefreshCw, Save,
    ShieldCheck, Leaf, Layout
} from "lucide-react";
import { MediaUpload } from "@/components/common/MediaUpload";
import { cn } from "@/lib/utils";

const BANNER_POSITIONS = [
    // Home Page
    { key: "hero", label: "🏠 Home — Hero / Full Width", desc: "Main hero carousel at top of homepage" },
    { key: "offer", label: "🏠 Home — Offer Zone", desc: "Offer cards below hero section" },
    { key: "bottom", label: "🏠 Home — Scrollable Bottom", desc: "Horizontal scrollable banner row" },
    // Shop / Categories
    { key: "shop_header", label: "🛒 Shop — Page Header", desc: "Full-width banner at top of categories page" },
    { key: "shop_mid", label: "🛒 Shop — Sidebar Promo", desc: "Small promo in shop sidebar" },
    // Product Page
    { key: "product_top", label: "📦 Product — Top Banner", desc: "Banner above the product details" },
    { key: "product_bottom", label: "📦 Product — Bottom Banner", desc: "Banner below product description" },
    // Cart
    { key: "cart_top", label: "🛍 Cart — Top Banner", desc: "Promo banner at top of cart page" },
    // Checkout
    { key: "checkout_top", label: "💳 Checkout — Top Banner", desc: "Trust banner at checkout" },
    // Payment Success
    { key: "payment_top", label: "✅ Order Success — Banner", desc: "Upsell after successful payment" },
    // Other
    { key: "popup", label: "🔔 Popup / Interstitial", desc: "Appears as overlay popup" },
    { key: "sidebar", label: "📌 Sidebar", desc: "Side panel placement" },
];

const EMPTY_BANNER = {
    title: "", subtitle: "", image_url: "", button_text: "", button_link: "",
    position: "hero", display_order: 0, overlay_opacity: 40,
    text_color: "white", badge_text: "", is_active: true, starts_at: "", ends_at: "",
};

export default function Banners() {
    const { activeCompany } = useTenant();
    const { toast } = useToast();
    const [banners, setBanners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<any | null>(null);
    const [form, setForm] = useState({ ...EMPTY_BANNER });
    const [saving, setSaving] = useState(false);

    useEffect(() => { if (activeCompany) load(); }, [activeCompany]);

    const load = async () => {
        if (!activeCompany) return;
        setLoading(true);
        const { data } = await supabase.from("ecom_banners").select("*")
            .eq("company_id", activeCompany.id).order("display_order").order("created_at", { ascending: false });
        setBanners(data || []);
        setLoading(false);
    };

    const openNew = () => { setEditing(null); setForm({ ...EMPTY_BANNER }); setOpen(true); };
    const openEdit = (b: any) => {
        setEditing(b);
        setForm({
            title: b.title || "", subtitle: b.subtitle || "", image_url: b.image_url,
            button_text: b.button_text || "", button_link: b.button_link || "",
            position: b.position, display_order: b.display_order, overlay_opacity: b.overlay_opacity ?? 40,
            text_color: b.text_color || "white", badge_text: b.badge_text || "",
            is_active: b.is_active, starts_at: b.starts_at?.slice(0, 16) || "", ends_at: b.ends_at?.slice(0, 16) || "",
        });
        setOpen(true);
    };

    const save = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.image_url) { toast({ variant: "destructive", title: "Image required", description: "Please upload a banner image first." }); return; }
        if (!activeCompany?.id) { toast({ variant: "destructive", title: "No company selected" }); return; }
        setSaving(true);
        try {
            const payload = {
                company_id: activeCompany.id,
                title: form.title || null,
                subtitle: form.subtitle || null,
                image_url: form.image_url,
                badge_text: form.badge_text || null,
                position: form.position,
                display_order: Number(form.display_order),
                is_active: form.is_active
            };

            if (editing) {
                const { error } = await supabase.from("ecom_banners").update(payload).eq("id", editing.id).eq("company_id", activeCompany.id);
                if (error) throw error;
                toast({ title: "Banner updated ✅" });
            } else {
                const { error } = await supabase.from("ecom_banners").insert([payload]);
                if (error) throw error;
                toast({ title: "Banner launched ✅" });
            }
            setOpen(false);
            load();
        } catch (err: any) {
            console.error("Banner save error:", err);
            toast({
                variant: "destructive",
                title: "Save failed",
                description: err?.message || "Could not save banner. Check console for details."
            });
        } finally {
            setSaving(false);
        }
    };

    const toggle = async (b: any) => { await supabase.from("ecom_banners").update({ is_active: !b.is_active }).eq("id", b.id); load(); };
    const reorder = async (b: any, dir: -1 | 1) => { await supabase.from("ecom_banners").update({ display_order: b.display_order + dir }).eq("id", b.id); load(); };
    const remove = async (b: any) => { if (!confirm("Delete this marketing asset?")) return; await supabase.from("ecom_banners").delete().eq("id", b.id); load(); };
    const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

    const posConf = (key: string) => BANNER_POSITIONS.find(p => p.key === key) || BANNER_POSITIONS[0];

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-100">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-8 bg-blue-600 rounded-full" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Merchandising & Assets</span>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Storefront Banners</h1>
                    <p className="text-sm font-medium text-slate-500">
                        {banners.length} Creative Assets · {banners.filter(b => b.is_active).length} Active Banners
                    </p>
                </div>
                <Button onClick={openNew} className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/20 transition-all gap-3 active:scale-95 group">
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> Create Banner
                </Button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-6">
                    <RefreshCw className="w-12 h-12 text-blue-600 animate-spin opacity-20" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 animate-pulse">Loading Assets...</p>
                </div>
            ) : banners.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 border-dashed text-center py-32 max-w-3xl mx-auto shadow-sm">
                    <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <Layout className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No active banners</h3>
                    <p className="text-sm font-medium text-slate-500 mb-10 max-w-sm mx-auto leading-relaxed">Promote your collections with high-impact visual banners across your storefront.</p>
                    <Button className="h-12 px-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/20 active:scale-95" onClick={openNew}>
                        <Plus className="w-5 h-5 mr-3" /> Design First Banner
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-10">
                    {banners.map(b => {
                        const pos = posConf(b.position);
                        const isExpired = b.ends_at && new Date(b.ends_at) < new Date();
                        return (
                            <div key={b.id} className={cn(
                                "group bg-white rounded-[32px] border transition-all duration-300 overflow-hidden flex flex-col lg:flex-row shadow-sm hover:shadow-xl",
                                !b.is_active || isExpired ? "grayscale-[0.5] opacity-70 border-slate-100" : "border-slate-100 hover:border-blue-200"
                            )}>
                                <div className="w-full lg:w-[480px] h-[300px] relative overflow-hidden bg-slate-50 shrink-0">
                                    <img src={b.image_url} alt={b.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent p-10 flex flex-col justify-end">
                                        {b.badge_text && (
                                            <div className="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full w-fit mb-4 shadow-xl">
                                                {b.badge_text}
                                            </div>
                                        )}
                                        <h3 className="text-white text-3xl font-extrabold tracking-tight leading-none uppercase">{b.title}</h3>
                                    </div>
                                    <div className="absolute top-6 right-6 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                        <button onClick={() => reorder(b, -1)} className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-md shadow-lg flex items-center justify-center text-slate-900 hover:bg-blue-600 hover:text-white transition-all active:scale-90">
                                            <MoveUp className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => reorder(b, 1)} className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-md shadow-lg flex items-center justify-center text-slate-900 hover:bg-blue-600 hover:text-white transition-all active:scale-90">
                                            <MoveDown className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-10 flex-1 flex flex-col">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">{pos.label}</p>
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none">Display Order: {b.display_order}</p>
                                        </div>
                                        <button onClick={() => toggle(b)}
                                            className={cn("relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none", b.is_active ? "bg-blue-600" : "bg-slate-200")}>
                                            <div className={cn("absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300", b.is_active ? "translate-x-5" : "")} />
                                        </button>
                                    </div>

                                    {b.subtitle && <p className="text-lg font-medium text-slate-500 italic mb-8 leading-relaxed">"{b.subtitle}"</p>}

                                    <div className="flex flex-wrap gap-4 mb-10">
                                        {b.button_text && (
                                            <div className="px-5 py-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4 hover:bg-white hover:border-blue-100 transition-colors">
                                                <LinkIcon className="w-4 h-4 text-blue-600" />
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Call to Action</span>
                                                    <span className="text-xs font-extrabold text-slate-900">{b.button_text}</span>
                                                </div>
                                            </div>
                                        )}
                                        <div className="px-5 py-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4 hover:bg-white hover:border-blue-100 transition-colors">
                                            <Layout className="w-4 h-4 text-blue-600" />
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Overlay Style</span>
                                                <span className="text-xs font-extrabold text-slate-900 capitalize">{b.text_color} Context</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-6 border-t border-slate-50 mt-auto">
                                        <Button className="flex-1 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-600/10 transition-all gap-2 active:scale-95" onClick={() => openEdit(b)}>
                                            <Pencil className="w-4 h-4" /> Edit Banner
                                        </Button>
                                        <button onClick={() => remove(b)}
                                            className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-400 hover:text-rose-600 hover:bg-white border border-rose-100 transition-all active:scale-95">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            {open && (
                <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-3xl rounded-[32px] border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold tracking-tight text-slate-950">{editing ? "Edit Banner" : "Create Banner"}</h2>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Banner Configuration</p>
                            </div>
                            <button onClick={() => setOpen(false)} className="w-12 h-12 rounded-2xl hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-950 transition-all border border-transparent hover:border-slate-100 active:scale-95">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={save} className="flex-1 overflow-y-auto p-10 space-y-10 bg-white">
                            <div className="space-y-4">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Creative Master Asset *</label>
                                <div className="rounded-3xl overflow-hidden border-2 border-dashed border-slate-100 bg-slate-50 p-4 hover:border-blue-200 transition-all">
                                    <MediaUpload
                                        value={form.image_url}
                                        onChange={val => set("image_url", val)}
                                        label="Select high-resolution horizontal banner (16:9 recommended)"
                                        folder="banners"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-900 ml-1">Banner Heading</label>
                                    <input value={form.title} onChange={e => set("title", e.target.value)}
                                        placeholder="e.g. Autumn Collections 2024"
                                        className="w-full h-14 px-6 rounded-2xl border border-slate-100 bg-white text-sm font-bold focus:border-blue-600 focus:ring-[12px] focus:ring-blue-600/5 outline-none transition-all shadow-sm" />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-900 ml-1">Promotional Badge</label>
                                    <input value={form.badge_text} onChange={e => set("badge_text", e.target.value)}
                                        placeholder="e.g. NEW ARRIVAL | 40% OFF"
                                        className="w-full h-14 px-6 rounded-2xl border border-slate-100 bg-white text-sm font-bold shadow-sm focus:border-blue-600 focus:ring-[12px] focus:ring-blue-600/5 outline-none transition-all uppercase tracking-widest" />
                                </div>

                                <div className="md:col-span-2 space-y-3">
                                    <label className="text-sm font-bold text-slate-900 ml-1">Supportive Subtext</label>
                                    <textarea value={form.subtitle} onChange={e => set("subtitle", e.target.value)}
                                        placeholder="A brief catchy description for this banner..."
                                        rows={3}
                                        className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-white text-sm font-bold focus:border-blue-600 focus:ring-[12px] focus:ring-blue-600/5 outline-none transition-all resize-none shadow-sm" />
                                </div>

                                <div className="md:col-span-2 space-y-5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">System Placement Strategy</label>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                        {BANNER_POSITIONS.slice(0, 12).map(p => (
                                            <button key={p.key} type="button" onClick={() => set("position", p.key)}
                                                className={cn(
                                                    "flex flex-col items-center justify-center p-5 rounded-2xl border transition-all duration-300",
                                                    form.position === p.key ? "border-blue-600 bg-blue-50 text-blue-600 ring-8 ring-blue-600/5" : "border-slate-100 bg-white hover:border-slate-200 text-slate-400"
                                                )}>
                                                <span className="text-[10px] font-extrabold uppercase tracking-widest text-center italic">{p.label.split('—')[1] || p.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-900 ml-1">CTA Button Text</label>
                                    <input value={form.button_text} onChange={e => set("button_text", e.target.value)}
                                        placeholder="e.g. Shop Now"
                                        className="w-full h-14 px-6 rounded-2xl border border-slate-100 bg-white text-sm font-bold focus:border-blue-600 focus:ring-[12px] focus:ring-blue-600/5 outline-none transition-all shadow-sm" />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-900 ml-1">Target Link URL</label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                        <input value={form.button_link} onChange={e => set("button_link", e.target.value)}
                                            placeholder="/category/electronics"
                                            className="w-full h-14 pl-12 pr-6 rounded-2xl border border-slate-100 bg-white text-sm font-bold focus:border-blue-600 focus:ring-[12px] focus:ring-blue-600/5 outline-none transition-all shadow-sm" />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-900 ml-1">Overlay Depth ({form.overlay_opacity}%)</label>
                                    <div className="flex items-center gap-6 h-14 px-6 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                                        <input type="range" min={0} max={90} value={form.overlay_opacity} onChange={e => set("overlay_opacity", Number(e.target.value))}
                                            className="flex-1 accent-blue-600" />
                                        <span className="text-sm font-bold font-mono text-slate-600">{form.overlay_opacity}%</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-900 ml-1">Display Order</label>
                                    <input type="number" value={form.display_order} onChange={e => set("display_order", e.target.value)}
                                        className="w-full h-14 px-6 rounded-2xl border border-slate-100 bg-white text-sm font-bold focus:border-blue-600 focus:ring-[12px] focus:ring-blue-600/5 outline-none transition-all shadow-sm" />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">Active on Storefront</p>
                                    <p className="text-xs text-slate-400 mt-0.5">Instantly show this banner on your store</p>
                                </div>
                                <label className="relative flex items-center cursor-pointer group/toggle">
                                    <div className={cn("w-14 h-8 rounded-full transition-all duration-300", form.is_active ? "bg-blue-600" : "bg-slate-200")}>
                                        <input type="checkbox" checked={form.is_active} onChange={e => set("is_active", e.target.checked)} className="sr-only" />
                                        <div className={cn("absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-xl", form.is_active ? "translate-x-6" : "")} />
                                    </div>
                                </label>
                            </div>
                        </form>

                        <div className="p-6 border-t border-slate-100 flex gap-3 bg-slate-50/50">
                            <Button type="button" variant="ghost" className="flex-1 h-12 rounded-xl font-semibold text-slate-500 hover:bg-white" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button type="button" onClick={save} className="flex-[2] h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xl shadow-blue-600/20 active:scale-95 transition-all" disabled={saving}>
                                {saving ? "Saving..." : editing ? "Update Banner" : "Create Banner"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
