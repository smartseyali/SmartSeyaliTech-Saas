import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Plus, Zap, Flame, Gift, ShoppingBag, Pencil, Trash2, Clock, ToggleLeft, ToggleRight, X, Image as ImageIcon, RefreshCw, Tag } from "lucide-react";
import { MediaUpload } from "@/components/common/MediaUpload";
import { cn } from "@/lib/utils";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

const OFFER_TYPES = [
    { key: "flash_sale", label: "Flash Sale", icon: Flame, color: "bg-red-500/10 text-red-600", border: "border-red-200" },
    { key: "bundle", label: "Bundle Deal", icon: ShoppingBag, color: "bg-blue-500/10 text-blue-600", border: "border-blue-200" },
    { key: "flat_off", label: "Flat Off", icon: Zap, color: "bg-green-500/10 text-green-600", border: "border-green-200" },
    { key: "buy_x_get_y", label: "Buy X Get Y", icon: Gift, color: "bg-purple-500/10 text-purple-600", border: "border-purple-200" },
    { key: "category_deal", label: "Category Deal", icon: Zap, color: "bg-orange-500/10 text-orange-600", border: "border-orange-200" },
];

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
    const [view, setView] = useState<"list" | "form">("list");
    const [editingItem, setEditingItem] = useState<any | null>(null);
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

    const handleNew = () => {
        setEditingItem(null);
        setView("form");
    };

    const handleEdit = (o: any) => {
        setEditingItem({
            ...o,
            starts_at: o.starts_at?.slice(0, 16) || "",
            ends_at: o.ends_at?.slice(0, 16) || "",
            discount_value: String(o.discount_value || ""),
        });
        setView("form");
    };

    const handleSubmit = async (formData: any) => {
        if (!activeCompany) return;
        try {
            const payload = {
                company_id: activeCompany.id,
                title: formData.title,
                description: formData.description,
                type: formData.type,
                discount_type: formData.discount_type,
                discount_value: Number(formData.discount_value) || 0,
                badge_label: formData.badge_label,
                starts_at: formData.starts_at || null,
                ends_at: formData.ends_at || null,
                is_active: formData.is_active,
                image_url: formData.image_url || null,
            };
            if (editingItem?.id) {
                await supabase.from("offers").update(payload).eq("id", editingItem.id);
                toast({ title: "Offer updated" });
            } else {
                await supabase.from("offers").insert([payload]);
                toast({ title: "Offer created 🎉" });
            }
            setView("list");
            load();
        } catch (err: any) {
            toast({ variant: "destructive", title: "Save failed", description: err.message });
        }
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

    const offerFields = [
        { key: "title", label: "Campaign Title", required: true, ph: "e.g. Midnight Flash Sale" },
        { key: "badge_label", label: "Promo Badge", ph: "e.g. 50% OFF" },
        { key: "description", label: "Campaign Narrative", type: "text" as const },
        {
            key: "type",
            label: "Offer Architecture",
            type: "select" as const,
            options: OFFER_TYPES.map(t => ({ label: t.label, value: t.key }))
        },
        {
            key: "discount_type",
            label: "Yield Logic",
            type: "select" as const,
            options: [
                { label: "Percentage %", value: "percentage" },
                { label: "Fixed ₹", value: "fixed" }
            ]
        },
        { key: "discount_value", label: "Yield Value", type: "number" as const },
        { key: "starts_at", label: "Launch Sequence", type: "datetime-local" as const },
        { key: "ends_at", label: "Termination Window", type: "datetime-local" as const },
        { key: "is_active", label: "Live Deployment", type: "checkbox" as const },
    ];

    if (view === "form") {
        return (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <ERPEntryForm
                    title={editingItem ? "Refine Campaign Node" : "Initialize Growth Campaign"}
                    subtitle="Universal Marketing Catalog"
                    headerFields={offerFields}
                    onAbort={() => { setView("list"); setEditingItem(null); }}
                    onSave={handleSubmit}
                    initialData={editingItem}
                    showItems={false}
                    customActions={
                        <div className="mr-4">
                             <MediaUpload
                                value={editingItem?.image_url}
                                onChange={val => setEditingItem((prev: any) => ({ ...prev, image_url: val }))}
                                label="Campaign Visual"
                                folder="offers"
                                compact
                            />
                        </div>
                    }
                />
            </div>
        );
    }

    const now = new Date();
    const filtered = filterType === "all" ? offers : offers.filter(o => o.type === filterType);
    const isLive = (o: any) => o.is_active && (!o.starts_at || new Date(o.starts_at) <= now) && (!o.ends_at || new Date(o.ends_at) >= now);

    return (
        <div className="space-y-10 p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-100">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-8 bg-indigo-600 rounded-full" />
                        <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Marketing & Growth</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Campaigns & Offers</h1>
                    <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        {offers.filter(isLive).length} Active Campaigns · {offers.length} Total
                    </p>
                </div>
                <Button onClick={handleNew} className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-600/20 transition-all gap-3 active:scale-95 group">
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> Launch Campaign
                </Button>
            </div>

            <div className="flex gap-2 flex-wrap items-center bg-slate-50 p-2 rounded-2xl border border-slate-100 w-fit">
                <button onClick={() => setFilterType("all")}
                    className={cn(
                        "px-6 py-2.5 rounded-xl text-[10px] font-bold tracking-widest transition-all",
                        filterType === "all" ? "bg-white text-indigo-600 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"
                    )}>
                    All Clusters ({offers.length})
                </button>
                {OFFER_TYPES.map(t => (
                    <button key={t.key} onClick={() => setFilterType(t.key)}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-[10px] font-bold tracking-widest transition-all flex items-center gap-2",
                            filterType === t.key ? "bg-white text-indigo-600 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"
                        )}>
                        <t.icon className="w-3.5 h-3.5" /> {t.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-6 bg-white rounded-[40px] border border-slate-50 shadow-inner">
                    <RefreshCw className="w-12 h-12 text-indigo-600 animate-spin opacity-20" />
                    <p className="text-[10px] font-bold tracking-widest text-slate-400 animate-pulse">Synchronizing Campaigns...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 border-dashed text-center py-32 max-w-3xl mx-auto shadow-sm">
                    <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <Zap className="w-10 h-10 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No active campaigns in this vector</h3>
                    <p className="text-sm font-medium text-slate-500 mb-10 max-w-sm mx-auto leading-relaxed">Drive customer engagement by launching time-sensitive deals and flash sales today.</p>
                    <Button className="h-12 px-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-600/20 active:scale-95" onClick={handleNew}>
                        <Plus className="w-5 h-5 mr-3" /> Start First Campaign
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filtered.map(o => {
                        const typeConf = OFFER_TYPES.find(t => t.key === o.type) || OFFER_TYPES[0];
                        const live = isLive(o);
                        return (
                            <div key={o.id} className={cn(
                                "group bg-white rounded-[32px] border transition-all duration-300 overflow-hidden flex flex-col shadow-sm hover:shadow-xl",
                                !o.is_active ? "grayscale-[0.5] opacity-70 border-slate-100" : "border-slate-100 hover:border-indigo-200"
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
                                        <div className={cn("px-3 py-1 rounded-full text-[9px] font-bold tracking-widest border shadow-lg backdrop-blur-md", typeConf.color, typeConf.border)}>
                                            {typeConf.label}
                                        </div>
                                        {o.badge_label && (
                                            <div className="px-3 py-1 bg-white/90 text-slate-950 text-[9px] font-bold tracking-widest rounded-full shadow-lg border border-white">
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
                                        <h3 className="text-xl font-bold text-slate-950 group-hover:text-indigo-600 transition-colors line-clamp-1">{o.title}</h3>
                                        {o.description && <p className="text-sm font-medium text-slate-400 line-clamp-2 leading-relaxed">{o.description}</p>}
                                    </div>

                                    <div className="space-y-4 mb-8 flex-1">
                                        <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-bold text-slate-400 tracking-widest leading-none mb-1.5 uppercase">Offer Depth</span>
                                                <span className="text-sm font-bold text-slate-900">
                                                    {o.discount_type === "percentage" ? `${o.discount_value}% Markoff` : `₹${o.discount_value} Final Off`}
                                                </span>
                                            </div>
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-slate-100">
                                                <Tag className="w-5 h-5" />
                                            </div>
                                        </div>
                                        {o.ends_at && (
                                            <div className="flex justify-between items-center text-[11px] px-2">
                                                <div className="flex items-center gap-2 font-bold text-slate-400 tracking-widest uppercase">
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
                                        <Button className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-600/10 transition-all gap-2 active:scale-95" onClick={() => handleEdit(o)}>
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
        </div>
    );
}


