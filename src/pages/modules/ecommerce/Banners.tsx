import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, ExternalLink, RefreshCw, Layers, ToggleLeft, ToggleRight, Image as ImageIcon } from "lucide-react";
import { MediaUpload } from "@/components/common/MediaUpload";
import { cn } from "@/lib/utils";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

const BANNER_POSITIONS = [
    { key: "hero", label: "Hero Main" },
    { key: "offer", label: "Offer Zone" },
    { key: "shop_header", label: "Shop Header" },
    { key: "sidebar", label: "Sidebar Promo" },
    { key: "footer", label: "Footer Ribbon" },
];

export default function Banners() {
    const { activeCompany } = useTenant();
    const { toast } = useToast();
    const [banners, setBanners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<"list" | "form">("list");
    const [editingItem, setEditingItem] = useState<any | null>(null);

    useEffect(() => { if (activeCompany) load(); }, [activeCompany]);

    const load = async () => {
        if (!activeCompany) return;
        setLoading(true);
        const { data } = await supabase.from("ecom_banners").select("*")
            .eq("company_id", activeCompany.id).order("display_order", { ascending: true });
        setBanners(data || []);
        setLoading(false);
    };

    const handleNew = () => {
        setEditingItem(null);
        setView("form");
    };

    const handleEdit = (b: any) => {
        setEditingItem(b);
        setView("form");
    };

    const handleSubmit = async (formData: any) => {
        if (!activeCompany) return;
        try {
            const payload = {
                company_id: activeCompany.id,
                title: formData.title,
                subtitle: formData.subtitle,
                badge_text: formData.badge_text,
                button_text: formData.button_text,
                button_link: formData.button_link,
                position: formData.position,
                image_url: formData.image_url,
                is_active: formData.is_active,
                display_order: Number(formData.display_order) || 0,
            };

            if (editingItem?.id) {
                await supabase.from("ecom_banners").update(payload).eq("id", editingItem.id);
                toast({ title: "Banner node updated" });
            } else {
                await supabase.from("ecom_banners").insert([payload]);
                toast({ title: "New banner deployed" });
            }
            setView("list");
            load();
        } catch (err: any) {
            toast({ variant: "destructive", title: "Sync failed", description: err.message });
        }
    };

    const toggleActive = async (b: any) => {
        await supabase.from("ecom_banners").update({ is_active: !b.is_active }).eq("id", b.id);
        load();
    };

    const deleteBanner = async (b: any) => {
        if (!confirm("Decommission this banner asset?")) return;
        await supabase.from("ecom_banners").delete().eq("id", b.id);
        toast({ title: "Asset removed" });
        load();
    };

    const bannerFields = [
        { key: "title", label: "Headline Title", required: true, ph: "e.g. Summer Collection 2024" },
        { key: "subtitle", label: "Subtext / Narrative", ph: "e.g. Up to 70% off on all items" },
        { key: "badge_text", label: "Promo Badge", ph: "e.g. NEW ARRIVAL" },
        { 
            key: "position", 
            label: "Display Vector", 
            type: "select" as const, 
            options: BANNER_POSITIONS.map(p => ({ label: p.label, value: p.key }))
        },
        { key: "button_text", label: "CTA Label", ph: "e.g. Shop Now" },
        { key: "button_link", label: "Target URL", ph: "e.g. /category/summer" },
        { key: "display_order", label: "Sequence Priority", type: "number" as const },
        { key: "is_active", label: "Live Deployment", type: "checkbox" as const },
    ];

    if (view === "form") {
        return (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <ERPEntryForm
                    title={editingItem ? "Refine Visual Asset" : "Initialize Banner Deployment"}
                    subtitle="Global Visual Catalog"
                    headerFields={bannerFields}
                    onAbort={() => { setView("list"); setEditingItem(null); }}
                    onSave={handleSubmit}
                    initialData={editingItem}
                    showItems={false}
                    customActions={
                        <div className="mr-4">
                            <MediaUpload
                                value={editingItem?.image_url}
                                onChange={val => setEditingItem((prev: any) => ({ ...prev, image_url: val }))}
                                label="Cover Asset"
                                folder="banners"
                                compact
                            />
                        </div>
                    }
                />
            </div>
        );
    }

    return (
        <div className="space-y-10 p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-100">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-8 bg-indigo-600 rounded-full" />
                        <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Visual Identity</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Banners & Promotions</h1>
                    <p className="text-sm font-medium text-slate-500">Manage storefront visual fragments and hero assets</p>
                </div>
                <Button onClick={handleNew} className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-600/20 transition-all gap-3 active:scale-95 group">
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> Deploy New Asset
                </Button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-6 bg-white rounded-[40px] border border-slate-50 shadow-inner">
                    <RefreshCw className="w-12 h-12 text-indigo-600 animate-spin opacity-20" />
                    <p className="text-[10px] font-bold tracking-widest text-slate-400 animate-pulse">Synchronizing Visual Hub...</p>
                </div>
            ) : banners.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 border-dashed text-center py-32 max-w-3xl mx-auto shadow-sm">
                    <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <Layers className="w-10 h-10 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Visual catalog is empty</h3>
                    <p className="text-sm font-medium text-slate-500 mb-10 max-w-sm mx-auto leading-relaxed">Populate your storefront with high-impact visual banners to drive conversions.</p>
                    <Button className="h-12 px-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-600/20" onClick={handleNew}>
                        <Plus className="w-5 h-5 mr-3" /> Create First Banner
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-12">
                    {BANNER_POSITIONS.map(p => {
                        const sectionBanners = banners.filter(b => b.position === p.key);
                        if (sectionBanners.length === 0) return null;
                        return (
                            <div key={p.key} className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-100 px-4 py-1.5 rounded-full border border-slate-200">
                                        {p.label} Cluster
                                    </h2>
                                    <div className="h-px flex-1 bg-slate-100" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {sectionBanners.map(b => (
                                        <div key={b.id} className={cn(
                                            "group bg-white rounded-[32px] border transition-all duration-300 overflow-hidden flex flex-col shadow-sm hover:shadow-xl",
                                            !b.is_active ? "grayscale-[0.5] opacity-70 border-slate-100" : "border-slate-100 hover:border-indigo-200"
                                        )}>
                                            <div className="h-56 relative overflow-hidden bg-slate-50">
                                                {b.image_url ? (
                                                    <>
                                                        <img src={b.image_url} alt={b.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
                                                    </>
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center opacity-40">
                                                        <ImageIcon className="w-12 h-12 text-slate-300" />
                                                    </div>
                                                )}
                                                <button onClick={() => toggleActive(b)} className="absolute top-4 right-4 group/toggle active:scale-90 transition-transform">
                                                    {b.is_active ? <ToggleRight className="w-10 h-10 text-emerald-500 drop-shadow-md" /> : <ToggleLeft className="w-10 h-10 text-white/50 drop-shadow-md" />}
                                                </button>
                                                <div className="absolute bottom-4 left-6">
                                                   <span className="px-3 py-1 bg-white/90 text-[9px] font-bold uppercase tracking-widest rounded-full shadow-lg text-slate-900">
                                                       Priority {b.display_order}
                                                   </span>
                                                </div>
                                            </div>

                                            <div className="p-8 flex-1 flex flex-col">
                                                <div className="mb-8 space-y-2">
                                                    <h3 className="text-xl font-bold text-slate-950 group-hover:text-indigo-600 transition-colors line-clamp-1">{b.title}</h3>
                                                    {b.subtitle && <p className="text-sm font-medium text-slate-400 line-clamp-2 leading-relaxed">{b.subtitle}</p>}
                                                </div>

                                                <div className="space-y-3 mb-8">
                                                    {b.button_link && (
                                                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 p-3 rounded-2xl border border-slate-100 overflow-hidden">
                                                            <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                                                            <span className="truncate">{b.button_link}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex gap-4 pt-6 border-t border-slate-50">
                                                    <Button className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-600/10 transition-all gap-2 active:scale-95" onClick={() => handleEdit(b)}>
                                                        <Pencil className="w-4 h-4" /> Update
                                                    </Button>
                                                    <button onClick={() => deleteBanner(b)}
                                                        className="w-11 h-11 rounded-xl bg-rose-50 flex items-center justify-center text-rose-400 hover:text-rose-600 hover:bg-white border border-rose-100 transition-all active:scale-95">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
