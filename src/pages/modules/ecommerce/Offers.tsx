import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Plus, Zap, Flame, Gift, ShoppingBag, Pencil, Trash2, Clock, ToggleLeft, ToggleRight, X, Image as ImageIcon, RefreshCw, Tag } from "lucide-react";
import { MediaUpload } from "@/components/common/MediaUpload";
import { cn } from "@/lib/utils";

const OFFER_TYPES = [
    { key: "flash_sale", label: "Flash Sale", icon: Flame, color: "bg-red-500/10 text-red-600", border: "border-red-200 dark:border-red-800/50" },
    { key: "bundle", label: "Bundle Deal", icon: ShoppingBag, color: "bg-blue-500/10 text-blue-600", border: "border-blue-200 dark:border-blue-800/50" },
    { key: "flat_off", label: "Flat Off", icon: Zap, color: "bg-green-500/10 text-green-600", border: "border-green-200 dark:border-green-800/50" },
    { key: "buy_x_get_y", label: "Buy X Get Y", icon: Gift, color: "bg-purple-500/10 text-purple-600", border: "border-purple-200 dark:border-purple-800/50" },
    { key: "category_deal", label: "Category Deal", icon: Zap, color: "bg-orange-500/10 text-orange-600", border: "border-orange-200 dark:border-orange-800/50" },
];

const EMPTY = {
    title: "", description: "", type: "flash_sale",
    discount_type: "percentage", discount_value: "",
    badge_label: "", starts_at: "", ends_at: "", is_active: true,
    image_url: "",
};

function Countdown({ endsAt }: { endsAt: string }) {
    const [remaining, setRemaining] = useState("");
    useEffect(() => {
        const tick = () => {
            const diff = new Date(endsAt).getTime() - Date.now();
            if (diff <= 0) { setRemaining("Ended"); return; }
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setRemaining(`${h}h ${m}m ${s}s`);
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [endsAt]);
    return <span className="text-xs font-mono text-orange-500">{remaining}</span>;
}

export default function Offers() {
    const { activeCompany } = useTenant();
    const { toast } = useToast();
    const [offers, setOffers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<any | null>(null);
    const [form, setForm] = useState({ ...EMPTY });
    const [saving, setSaving] = useState(false);
    const [filterType, setFilterType] = useState("all");

    useEffect(() => { if (activeCompany) load(); }, [activeCompany]);

    const load = async () => {
        if (!activeCompany) return;
        setLoading(true);
        const { data } = await supabase.from("offers").select("*")
            .eq("company_id", activeCompany.id).order("created_at", { ascending: false });
        setOffers(data || []);
        setLoading(false);
    };

    const openNew = () => { setEditing(null); setForm({ ...EMPTY }); setOpen(true); };
    const openEdit = (o: any) => {
        setEditing(o);
        setForm({
            title: o.title, description: o.description || "", type: o.type,
            discount_type: o.discount_type || "percentage",
            discount_value: o.discount_value || "",
            badge_label: o.badge_label || "",
            starts_at: o.starts_at?.slice(0, 16) || "",
            ends_at: o.ends_at?.slice(0, 16) || "",
            is_active: o.is_active,
            image_url: o.image_url || "",
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
                title: form.title,
                description: form.description,
                type: form.type,
                discount_type: form.discount_type,
                discount_value: Number(form.discount_value) || 0,
                badge_label: form.badge_label,
                starts_at: form.starts_at || null,
                ends_at: form.ends_at || null,
                is_active: form.is_active,
                image_url: form.image_url || null,
            };
            if (editing) {
                const { error } = await supabase.from("offers").update(payload).eq("id", editing.id);
                if (error) throw error;
                toast({ title: "Offer updated" });
            } else {
                const { error } = await supabase.from("offers").insert([payload]);
                if (error) throw error;
                toast({ title: "Offer created 🎉" });
            }
            setOpen(false);
            load();
        } catch (err: any) {
            console.error("Offer save error:", err);
            toast({ variant: "destructive", title: "Save failed", description: err?.message || "Could not save offer" });
        } finally { setSaving(false); }
    };

    const toggleActive = async (o: any) => {
        await supabase.from("offers").update({ is_active: !o.is_active }).eq("id", o.id);
        load();
    };

    const deleteOffer = async (o: any) => {
        if (!confirm(`Delete "${o.title}"?`)) return;
        await supabase.from("offers").delete().eq("id", o.id);
        toast({ title: "Offer deleted" });
        load();
    };

    const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

    const now = new Date();
    const filtered = filterType === "all" ? offers : offers.filter(o => o.type === filterType);

    const isLive = (o: any) => o.is_active &&
        (!o.starts_at || new Date(o.starts_at) <= now) &&
        (!o.ends_at || new Date(o.ends_at) >= now);

    return (
        <div className="space-y-10 p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-100">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-8 bg-blue-600 rounded-full" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Marketing & Growth</span>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Campaigns & Offers</h1>
                    <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        {offers.filter(isLive).length} Active Campaigns · {offers.length} Total
                    </p>
                </div>
                <Button onClick={openNew} className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/20 transition-all gap-3 active:scale-95 group">
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> Launch Campaign
                </Button>
            </div>

            {/* Type Filter */}
            <div className="flex gap-2 flex-wrap items-center bg-slate-50 p-2 rounded-2xl border border-slate-100 w-fit">
                <button onClick={() => setFilterType("all")}
                    className={cn(
                        "px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                        filterType === "all" ? "bg-white text-blue-600 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"
                    )}>
                    All Clusters ({offers.length})
                </button>
                {OFFER_TYPES.map(t => (
                    <button key={t.key} onClick={() => setFilterType(t.key)}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2",
                            filterType === t.key ? "bg-white text-blue-600 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"
                        )}>
                        <t.icon className="w-3.5 h-3.5" /> {t.label}
                    </button>
                ))}
            </div>

            {/* Offer Cards */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-6">
                    <RefreshCw className="w-12 h-12 text-blue-600 animate-spin opacity-20" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 animate-pulse">Synchronizing Campaigns...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 border-dashed text-center py-32 max-w-3xl mx-auto shadow-sm">
                    <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <Zap className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No active campaigns in this vector</h3>
                    <p className="text-sm font-medium text-slate-500 mb-10 max-w-sm mx-auto leading-relaxed">Drive customer engagement by launching time-sensitive deals and flash sales today.</p>
                    <Button className="h-12 px-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/20 active:scale-95" onClick={openNew}>
                        <Plus className="w-5 h-5 mr-3" /> Start First Campaign
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filtered.map(o => {
                        const typeConf = OFFER_TYPES.find(t => t.key === o.type) || OFFER_TYPES[0];
                        const live = isLive(o);
                        const upcoming = o.is_active && o.starts_at && new Date(o.starts_at) > now;
                        return (
                            <div key={o.id} className={cn(
                                "group bg-white rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col shadow-sm hover:shadow-xl",
                                !o.is_active ? "grayscale-[0.5] opacity-70 border-slate-100" : "border-slate-100 hover:border-blue-200"
                            )}>
                                <div className="h-48 relative overflow-hidden bg-slate-50">
                                    {o.image_url ? (
                                        <>
                                            <img src={o.image_url} alt={o.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center opacity-40">
                                            <ImageIcon className="w-12 h-12 text-slate-300" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4 flex gap-2">
                                        <div className={cn("px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border shadow-lg backdrop-blur-md", typeConf.color, typeConf.border)}>
                                            {typeConf.label}
                                        </div>
                                        {o.badge_label && (
                                            <div className="px-3 py-1 bg-white/90 text-slate-950 text-[9px] font-bold uppercase tracking-widest rounded-full shadow-lg border border-white">
                                                {o.badge_label}
                                            </div>
                                        )}
                                    </div>
                                    <button onClick={() => toggleActive(o)} className="absolute top-4 right-4 group/toggle active:scale-90 transition-transform">
                                        {o.is_active ? <ToggleRight className="w-10 h-10 text-emerald-500 drop-shadow-md" /> : <ToggleLeft className="w-10 h-10 text-white/50 drop-shadow-md" />}
                                    </button>
                                </div>

                                <div className="p-8 flex-1 flex flex-col">
                                    <div className="mb-6 space-y-2">
                                        <h3 className="text-xl font-bold text-slate-950 group-hover:text-blue-600 transition-colors line-clamp-1">{o.title}</h3>
                                        {o.description && <p className="text-sm font-medium text-slate-400 line-clamp-2 leading-relaxed">{o.description}</p>}
                                    </div>

                                    <div className="space-y-4 mb-8 flex-1">
                                        <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Offer Depth</span>
                                                <span className="text-sm font-extrabold text-slate-900">
                                                    {o.discount_type === "percentage" ? `${o.discount_value}% Markoff` : `₹${o.discount_value} Final Off`}
                                                </span>
                                            </div>
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-slate-100">
                                                <Tag className="w-5 h-5" />
                                            </div>
                                        </div>
                                        {o.ends_at && (
                                            <div className="flex justify-between items-center text-[11px] px-2">
                                                <div className="flex items-center gap-2 font-bold text-slate-400 uppercase tracking-widest">
                                                    <Clock className="w-4 h-4" />
                                                    {live ? "Time Remaining" : "Status"}
                                                </div>
                                                <div className="font-bold">
                                                    {live ? <Countdown endsAt={o.ends_at} /> : <span className="text-slate-300">Closed</span>}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-4 pt-6 border-t border-slate-50">
                                        <Button className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/10 transition-all gap-2 active:scale-95" onClick={() => openEdit(o)}>
                                            <Pencil className="w-4 h-4" /> Update
                                        </Button>
                                        <button onClick={() => deleteOffer(o)}
                                            className="w-11 h-11 rounded-xl bg-rose-50 flex items-center justify-center text-rose-400 hover:text-rose-600 hover:bg-white border border-rose-100 transition-all active:scale-95">
                                            <Trash2 className="w-4 h-4" />
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
                    <div className="bg-white w-full max-w-2xl rounded-[32px] border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight text-slate-950">{editing ? "Refine Campaign" : "New Campaign"}</h2>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Growth Marketing Engine</p>
                            </div>
                            <button onClick={() => setOpen(false)} className="w-12 h-12 rounded-2xl hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-950 transition-all border border-transparent hover:border-slate-100 active:scale-95">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={save} className="flex-1 overflow-y-auto p-10 space-y-10 bg-white">
                            <div className="space-y-4">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Campaign Visual Assets</label>
                                <div className="rounded-3xl overflow-hidden border-2 border-dashed border-slate-100 bg-slate-50 p-4 hover:border-blue-200 transition-all">
                                    <MediaUpload
                                        value={form.image_url}
                                        onChange={val => set("image_url", val)}
                                        label="Select high-resolution horizontal banner"
                                        folder="offers"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-900 ml-1">Campaign Title <span className="text-rose-500">*</span></label>
                                    <input value={form.title} onChange={e => set("title", e.target.value)} required
                                        placeholder="e.g. Midnight Summer Flash Sales"
                                        className="w-full h-14 px-6 rounded-2xl border border-slate-100 bg-white text-sm font-bold focus:border-blue-600 focus:ring-[12px] focus:ring-blue-600/5 outline-none transition-all shadow-sm" />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-900 ml-1">Promotional Badge</label>
                                    <input value={form.badge_label} onChange={e => set("badge_label", e.target.value)}
                                        placeholder="e.g. 50% OFF | FLASH SALE"
                                        className="w-full h-14 px-6 rounded-2xl border border-slate-100 bg-white text-sm font-bold tracking-widest uppercase focus:border-blue-600 focus:ring-[12px] focus:ring-blue-600/5 outline-none transition-all shadow-sm" />
                                </div>

                                <div className="md:col-span-2 space-y-3">
                                    <label className="text-sm font-bold text-slate-900 ml-1">Campaign Narrative</label>
                                    <textarea value={form.description} onChange={e => set("description", e.target.value)}
                                        placeholder="Storyline and highlights of this campaign..."
                                        rows={3}
                                        className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-white text-sm font-bold focus:border-blue-600 focus:ring-[12px] focus:ring-blue-600/5 outline-none transition-all resize-none shadow-sm" />
                                </div>

                                <div className="md:col-span-2 space-y-5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Offer Architecture</label>
                                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                                        {OFFER_TYPES.map(t => (
                                            <button key={t.key} type="button" onClick={() => set("type", t.key)}
                                                className={cn(
                                                    "flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border transition-all",
                                                    form.type === t.key ? "border-blue-600 bg-blue-50 text-blue-600 ring-8 ring-blue-600/5" : "border-slate-100 bg-white hover:border-slate-200 text-slate-400"
                                                )}>
                                                <t.icon className={cn("w-5 h-5", form.type === t.key ? "text-blue-600" : "text-slate-300")} />
                                                <span className="text-[9px] font-extrabold uppercase tracking-tight text-center">{t.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-900 ml-1">Yield Configuration</label>
                                    <select value={form.discount_type} onChange={e => set("discount_type", e.target.value)}
                                        className="w-full h-14 px-6 rounded-2xl border border-slate-100 bg-white text-sm font-bold focus:border-blue-600 focus:ring-[12px] focus:ring-blue-600/5 outline-none transition-all appearance-none shadow-sm">
                                        <option value="percentage">Percentage Allocation (%)</option>
                                        <option value="fixed">Flat Allocation (₹)</option>
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-900 ml-1">Yield Value</label>
                                    <input type="number" value={form.discount_value} onChange={e => set("discount_value", e.target.value)} min="0"
                                        className="w-full h-14 px-6 rounded-2xl border border-slate-100 bg-white text-sm font-bold focus:border-blue-600 focus:ring-[12px] focus:ring-blue-600/5 outline-none transition-all shadow-sm" />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-900 ml-1">Launch Sequence</label>
                                    <input type="datetime-local" value={form.starts_at} onChange={e => set("starts_at", e.target.value)}
                                        className="w-full h-14 px-6 rounded-2xl border border-slate-100 bg-white text-sm font-bold focus:border-blue-600 focus:ring-[12px] focus:ring-blue-600/5 outline-none transition-all shadow-sm" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-900 ml-1">Termination Window</label>
                                    <input type="datetime-local" value={form.ends_at} onChange={e => set("ends_at", e.target.value)}
                                        className="w-full h-14 px-6 rounded-2xl border border-slate-100 bg-white text-sm font-bold focus:border-blue-600 focus:ring-[12px] focus:ring-blue-600/5 outline-none transition-all shadow-sm" />
                                </div>
                            </div>

                            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-between transition-colors hover:bg-white hover:border-blue-100">
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-slate-950">Campaign Visibility</p>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Instantly activate this offer on storefront</p>
                                </div>
                                <label className="relative flex items-center cursor-pointer group">
                                    <div className={cn("w-14 h-8 rounded-full transition-all duration-300", form.is_active ? "bg-blue-600" : "bg-slate-200")}>
                                        <input type="checkbox" checked={form.is_active} onChange={e => set("is_active", e.target.checked)} className="sr-only" />
                                        <div className={cn("absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform shadow-md", form.is_active ? "translate-x-6" : "")} />
                                    </div>
                                </label>
                            </div>
                        </form>

                        <div className="p-8 border-t border-slate-100 flex gap-4 bg-slate-50/50">
                            <Button type="button" variant="ghost" className="flex-1 h-14 rounded-2xl font-bold text-slate-500 hover:bg-white hover:text-slate-900 transition-all uppercase tracking-widest text-[10px]" onClick={() => setOpen(false)}>Discard</Button>
                            <Button type="button" onClick={save} className="flex-[2] h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xl shadow-blue-600/20 active:scale-95 transition-all" disabled={saving}>
                                {saving ? "Synchronizing..." : editing ? "Refine Campaign" : "Finalize Campaign"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

