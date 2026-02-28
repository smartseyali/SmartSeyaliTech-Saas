import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
    Image as ImageIcon, Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
    MoveUp, MoveDown, Clock, X, Link as LinkIcon, RefreshCw, Save,
    ShieldCheck, Leaf, Layout
} from "lucide-react";
import { MediaUpload } from "@/components/common/MediaUpload";

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
        <div className="p-8 space-y-12 w-full">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-100 pb-12">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <ImageIcon className="w-6 h-6 text-[#f97316]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#14532d]/40">Visual Merchandising</span>
                    </div>
                    <h1 className="text-5xl font-black italic tracking-tighter uppercase text-[#14532d]">Hero <br /><span className="text-slate-200">Banners</span></h1>
                </div>
                <Button
                    onClick={openNew}
                    className="h-16 px-10 rounded-2xl bg-[#14532d] hover:bg-[#14532d]/90 text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-[#14532d]/20"
                >
                    <Plus className="w-4 h-4 mr-3" /> Initialize New Banner
                </Button>
            </div>

            {loading ? (
                <div className="text-center py-40 animate-pulse text-slate-300 italic font-medium uppercase tracking-[0.2em]">Synchronizing Creative Assets...</div>
            ) : banners.length === 0 ? (
                <div className="bg-white rounded-[48px] border border-dashed border-slate-200 p-32 text-center group hover:border-[#14532d]/20 transition-all">
                    <Layout className="w-16 h-16 mx-auto mb-6 text-slate-100 group-hover:text-[#14532d]/10 transition-colors" />
                    <p className="text-2xl font-black text-[#14532d] uppercase tracking-tight">Archives Empty</p>
                    <p className="text-slate-400 font-medium italic mt-2">Launch your first promotional slide to engage visitors.</p>
                    <Button onClick={openNew} variant="outline" className="mt-10 rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px]">Start Creation</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {banners.map(b => {
                        const pos = posConf(b.position);
                        const isExpired = b.ends_at && new Date(b.ends_at) < new Date();
                        return (
                            <div key={b.id} className={`bg-white rounded-[32px] border transition-all overflow-hidden shadow-sm hover:shadow-xl hover:translate-y-[-2px] ${b.is_active && !isExpired ? "border-slate-50" : "border-slate-100 opacity-60"}`}>
                                <div className="flex flex-col lg:flex-row">
                                    <div className="w-full lg:w-[400px] h-[240px] relative overflow-hidden bg-slate-50 shrink-0">
                                        <img src={b.image_url} alt={b.title} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                                        <div className="absolute inset-0 flex flex-col justify-end p-8" style={{ background: `rgba(0,0,0,${(b.overlay_opacity || 40) / 100})` }}>
                                            {b.badge_text && <span className="px-3 py-1 bg-[#f97316] text-white text-[9px] font-black uppercase tracking-widest rounded-lg w-fit mb-3">{b.badge_text}</span>}
                                            <h3 className="text-white text-xl font-black uppercase tracking-tighter leading-none line-clamp-2">{b.title}</h3>
                                        </div>
                                    </div>
                                    <div className="flex-1 p-10 flex flex-col justify-between">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4">
                                                <span className="px-3 py-1 bg-[#14532d]/5 text-[#14532d] text-[10px] font-black uppercase tracking-widest rounded-full">{pos.label}</span>
                                                {isExpired && <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-full">Expired Asset</span>}
                                            </div>
                                            <p className="text-slate-500 font-medium italic">{b.subtitle || "Nurturing brand awareness through visual excellence."}</p>
                                            <div className="flex gap-4 pt-2">
                                                {b.button_text && <span className="text-[10px] font-black uppercase tracking-widest text-[#14532d]/40 flex items-center gap-2"><LinkIcon className="w-4 h-4" /> {b.button_text}</span>}
                                                <span className="text-[10px] font-black uppercase tracking-widest text-[#14532d]/40 flex items-center gap-2"><Layout className="w-4 h-4" /> Sequence: {b.display_order}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pt-8 border-t border-slate-50 mt-8">
                                            <div className="flex gap-2">
                                                <Button size="icon" variant="ghost" onClick={() => reorder(b, -1)} className="rounded-xl border border-slate-50"><MoveUp className="w-4 h-4 text-slate-400" /></Button>
                                                <Button size="icon" variant="ghost" onClick={() => reorder(b, 1)} className="rounded-xl border border-slate-50"><MoveDown className="w-4 h-4 text-slate-400" /></Button>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <button onClick={() => toggle(b)} className="transition-all">
                                                    {b.is_active ? <ToggleRight className="w-10 h-10 text-emerald-500" /> : <ToggleLeft className="w-10 h-10 text-slate-200" />}
                                                </button>
                                                <Button variant="ghost" size="icon" onClick={() => openEdit(b)} className="rounded-xl hover:bg-slate-50"><Pencil className="w-4 h-4 text-slate-400" /></Button>
                                                <Button variant="ghost" size="icon" onClick={() => remove(b)} className="rounded-xl hover:bg-rose-50 hover:text-rose-600"><Trash2 className="w-4 h-4" /></Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal - The Editor */}
            {open && (
                <div className="fixed inset-0 bg-[#0a2e18]/80 z-50 flex items-center justify-center p-6 backdrop-blur-md overflow-hidden">
                    <div className="bg-white w-full max-w-4xl rounded-[48px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in duration-300">
                        <div className="p-10 border-b border-slate-50 flex items-center justify-between shrink-0">
                            <div>
                                <h2 className="text-3xl font-black italic tracking-tighter uppercase text-[#14532d]">{editing ? "Refine" : "Launch"} Asset</h2>
                                <p className="text-xs font-medium text-slate-400 italic">Configure the visual manifestation of your promotional node.</p>
                            </div>
                            <button onClick={() => setOpen(false)} className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"><X className="w-6 h-6" /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-10 py-10 space-y-12">
                            <form onSubmit={save} className="space-y-12">
                                <div className="space-y-6">
                                    <MediaUpload
                                        value={form.image_url}
                                        onChange={val => set("image_url", val)}
                                        label="Creative Canvas (16:9 recommended) *"
                                        folder="banners"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#14532d]/50">Heading Manifest</label>
                                        <input value={form.title} onChange={e => set("title", e.target.value)}
                                            className="w-full h-16 px-6 rounded-2xl bg-slate-50 border-none font-black uppercase tracking-tight text-[#14532d] placeholder:text-slate-200" placeholder="e.g. Summer Harvest" />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#14532d]/50">Visual Badge</label>
                                        <input value={form.badge_text} onChange={e => set("badge_text", e.target.value)}
                                            className="w-full h-16 px-6 rounded-2xl bg-slate-50 border-none font-black uppercase tracking-tight text-[#14532d] placeholder:text-slate-200" placeholder="e.g. 50% Selected" />
                                    </div>
                                    <div className="md:col-span-2 space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#14532d]/50">Subtext Projection</label>
                                        <textarea value={form.subtitle} onChange={e => set("subtitle", e.target.value)}
                                            className="w-full h-32 px-6 py-6 rounded-[32px] bg-slate-50 border-none font-medium text-slate-500 italic placeholder:text-slate-200 resize-none" placeholder="Elaborate on the seasonal essence..." />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#14532d]/50">Strategic Placement</label>
                                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                                        {BANNER_POSITIONS.map(p => (
                                            <button key={p.key} type="button" onClick={() => set("position", p.key)}
                                                className={`p-6 rounded-2xl border-2 text-left transition-all ${form.position === p.key ? "border-[#14532d] bg-[#14532d] text-white" : "border-slate-50 bg-slate-50 text-slate-400"}`}>
                                                <p className="font-black uppercase text-[10px] tracking-widest">{p.label}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#14532d]/50">Overlay Opacity ({form.overlay_opacity}%)</label>
                                        <input type="range" min={0} max={90} value={form.overlay_opacity} onChange={e => set("overlay_opacity", Number(e.target.value))}
                                            className="w-full accent-[#14532d]" />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#14532d]/50">Sequence Order</label>
                                        <input type="number" value={form.display_order} onChange={e => set("display_order", e.target.value)}
                                            className="w-full h-16 px-6 rounded-2xl bg-slate-50 border-none font-black text-[#14532d]" />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#14532d]/50">Interaction Theme</label>
                                        <select value={form.text_color} onChange={e => set("text_color", e.target.value)}
                                            className="w-full h-16 px-6 rounded-2xl bg-slate-50 border-none font-black uppercase text-[#14532d]">
                                            <option value="white">Light Prism</option>
                                            <option value="black">Dark Soul</option>
                                        </select>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-10 bg-slate-50/50 border-t border-slate-50 flex gap-6 shrink-0">
                            <Button variant="ghost" className="flex-1 h-16 rounded-[24px] font-black uppercase tracking-widest text-[10px]" onClick={() => setOpen(false)}>Discard</Button>
                            <Button onClick={save} disabled={saving} className="flex-1 h-16 rounded-[24px] bg-[#14532d] text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-[#14532d]/20">
                                <Save className="w-4 h-4 mr-3" /> {saving ? "Synchronizing..." : editing ? "Update Manifest" : "Launch Protocol"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
