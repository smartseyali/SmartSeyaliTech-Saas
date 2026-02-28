import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Plus, Zap, Flame, Gift, ShoppingBag, Pencil, Trash2, Clock, ToggleLeft, ToggleRight, X, Image as ImageIcon } from "lucide-react";
import { MediaUpload } from "@/components/common/MediaUpload";

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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Offers & Promotions</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {offers.filter(isLive).length} live · {offers.filter(o => !o.is_active).length} inactive
                    </p>
                </div>
                <Button onClick={openNew} className="rounded-xl gap-2">
                    <Plus className="w-4 h-4" /> New Offer
                </Button>
            </div>

            {/* Type Filter */}
            <div className="flex gap-2 flex-wrap">
                <button onClick={() => setFilterType("all")}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${filterType === "all" ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card"}`}>
                    All ({offers.length})
                </button>
                {OFFER_TYPES.map(t => (
                    <button key={t.key} onClick={() => setFilterType(t.key)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${filterType === t.key ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card"}`}>
                        {t.label} ({offers.filter(o => o.type === t.key).length})
                    </button>
                ))}
            </div>

            {/* Offer Cards */}
            {loading ? (
                <div className="text-center py-16 text-muted-foreground">Loading offers...</div>
            ) : filtered.length === 0 ? (
                <div className="bg-card rounded-2xl border border-border/50 text-center py-14">
                    <Zap className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-30" />
                    <p className="font-semibold text-sm">No offers yet</p>
                    <Button className="mt-4 rounded-xl" size="sm" onClick={openNew}>Create First Offer</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map(o => {
                        const typeConf = OFFER_TYPES.find(t => t.key === o.type) || OFFER_TYPES[0];
                        const live = isLive(o);
                        const upcoming = o.is_active && o.starts_at && new Date(o.starts_at) > now;
                        return (
                            <div key={o.id} className={`bg-card rounded-2xl border-2 p-5 shadow-sm transition-all ${typeConf.border} ${!o.is_active ? "opacity-50" : ""}`}>
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${typeConf.color}`}>
                                            <typeConf.icon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${typeConf.color}`}>
                                                {typeConf.label}
                                            </span>
                                            {live && <span className="ml-1.5 relative flex">
                                                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75" />
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 mt-0.5" />
                                            </span>}
                                        </div>
                                    </div>
                                    <button onClick={() => toggleActive(o)}>
                                        {o.is_active ? <ToggleRight className="w-6 h-6 text-green-500" /> : <ToggleLeft className="w-6 h-6 text-muted-foreground" />}
                                    </button>
                                </div>

                                <h3 className="font-bold text-base mb-1">{o.title}</h3>
                                {o.description && <p className="text-xs text-muted-foreground mb-3">{o.description}</p>}

                                <div className="space-y-1 text-xs text-muted-foreground mb-4">
                                    {o.discount_value > 0 && (
                                        <div className="flex justify-between">
                                            <span>Discount</span>
                                            <span className={`font-bold text-sm ${typeConf.color.split(" ")[1]}`}>
                                                {o.discount_type === "percentage" ? `${o.discount_value}% OFF` : `₹${o.discount_value} OFF`}
                                            </span>
                                        </div>
                                    )}
                                    {o.badge_label && (
                                        <div className="flex justify-between">
                                            <span>Badge</span>
                                            <span className="font-semibold text-foreground bg-primary/10 text-primary px-2 rounded-full">{o.badge_label}</span>
                                        </div>
                                    )}
                                    {o.starts_at && (
                                        <div className="flex justify-between">
                                            <span>Starts</span><span>{new Date(o.starts_at).toLocaleString("en-IN")}</span>
                                        </div>
                                    )}
                                    {o.ends_at && (
                                        <div className="flex justify-between items-center">
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Ends in</span>
                                            {live ? <Countdown endsAt={o.ends_at} /> : <span>{new Date(o.ends_at).toLocaleString("en-IN")}</span>}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-1 mb-3">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${live ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                        : upcoming ? "bg-blue-100 text-blue-700"
                                            : "bg-secondary text-muted-foreground"
                                        }`}>
                                        {live ? "● LIVE" : upcoming ? "Upcoming" : o.is_active ? "Active" : "Inactive"}
                                    </span>
                                </div>

                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" className="flex-1 rounded-xl gap-1.5 text-xs" onClick={() => openEdit(o)}>
                                        <Pencil className="w-3 h-3" /> Edit
                                    </Button>
                                    <button onClick={() => deleteOffer(o)}
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
                    <div className="bg-card w-full max-w-3xl rounded-3xl border border-border/50 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-primary/5 p-6 border-b border-primary/10 flex items-center justify-between">
                            <h2 className="text-xl font-bold tracking-tight">{editing ? "Edit Offer" : "Create New Offer"}</h2>
                            <button onClick={() => setOpen(false)} className="p-2 rounded-xl hover:bg-secondary text-muted-foreground transition-colors"><X className="w-5 h-5" /></button>
                        </div>

                        <form onSubmit={save} className="p-6 space-y-6">
                            <MediaUpload
                                value={form.image_url}
                                onChange={val => set("image_url", val)}
                                label="Offer Campaign Banner"
                                folder="offers"
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Offer Title *</label>
                                    <input value={form.title} onChange={e => set("title", e.target.value)} required
                                        placeholder="e.g. Mega Monday Sale"
                                        className="w-full h-11 px-4 rounded-xl border border-input bg-secondary/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:border-primary/30" />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Badge Label</label>
                                    <input value={form.badge_label} onChange={e => set("badge_label", e.target.value)}
                                        placeholder="e.g. 50% OFF | FLASH SALE"
                                        className="w-full h-11 px-4 rounded-xl border border-input bg-secondary/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:border-primary/30" />
                                </div>

                                <div className="md:col-span-2 space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Description</label>
                                    <textarea value={form.description} onChange={e => set("description", e.target.value)}
                                        placeholder="Describe the offer highlights..."
                                        className="w-full h-20 px-4 py-3 rounded-xl border border-input bg-secondary/30 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:border-primary/30" />
                                </div>

                                <div className="md:col-span-2 space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Offer Category Type *</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                                        {OFFER_TYPES.map(t => (
                                            <button key={t.key} type="button" onClick={() => set("type", t.key)}
                                                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border-2 transition-all ${form.type === t.key ? "border-primary bg-primary/5 ring-4 ring-primary/5" : "border-border/60 hover:border-primary/30 hover:bg-secondary/10"}`}>
                                                <t.icon className={`w-4 h-4 ${form.type === t.key ? "text-primary" : "text-muted-foreground/60"}`} />
                                                <span className={`text-[10px] font-bold uppercase tracking-tight text-center ${form.type === t.key ? "text-primary" : "text-muted-foreground"}`}>{t.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Discount Calculation</label>
                                    <select value={form.discount_type} onChange={e => set("discount_type", e.target.value)}
                                        className="w-full h-11 px-4 rounded-xl border border-input bg-secondary/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[right_1rem_center] bg-no-repeat">
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount (₹)</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Discount Value</label>
                                    <input type="number" value={form.discount_value} onChange={e => set("discount_value", e.target.value)} min="0"
                                        className="w-full h-11 px-4 rounded-xl border border-input bg-secondary/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:border-primary/30" />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Campaign Start</label>
                                    <input type="datetime-local" value={form.starts_at} onChange={e => set("starts_at", e.target.value)}
                                        className="w-full h-11 px-4 rounded-xl border border-input bg-secondary/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:border-primary/30" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Campaign End</label>
                                    <input type="datetime-local" value={form.ends_at} onChange={e => set("ends_at", e.target.value)}
                                        className="w-full h-11 px-4 rounded-xl border border-input bg-secondary/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:border-primary/30" />
                                </div>
                            </div>

                            <div className="pt-2 flex items-center justify-between p-4 rounded-2xl bg-secondary/10 border border-border/50">
                                <div className="space-y-0.5">
                                    <p className="text-sm font-bold">Campaign Status</p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Enable this offer for customers</p>
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
                                    {saving ? "Saving..." : editing ? "Update Offer" : "Create Offer"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

